package br.edu.ifba.ms_pedidos.service;

import br.edu.ifba.ms_pedidos.client.CatalogoClient;
import br.edu.ifba.ms_pedidos.dto.BaixaEstoqueDTO;
import br.edu.ifba.ms_pedidos.dto.CriarPedidoDTO;
import br.edu.ifba.ms_pedidos.dto.ItemPedidoRequestDTO;
import br.edu.ifba.ms_pedidos.dto.ProdutoDTO;
import br.edu.ifba.ms_pedidos.event.PedidoCriadoEvent;
import br.edu.ifba.ms_pedidos.exception.ErroIntegracaoCatalogoException;
import br.edu.ifba.ms_pedidos.exception.EstoqueInsuficienteException;
import br.edu.ifba.ms_pedidos.exception.ProdutoNaoEncontradoException;
import br.edu.ifba.ms_pedidos.exception.RecursoNaoEncontradoException;
import br.edu.ifba.ms_pedidos.model.ItemPedido;
import br.edu.ifba.ms_pedidos.model.Pedido;
import br.edu.ifba.ms_pedidos.model.StatusPedido;
import br.edu.ifba.ms_pedidos.publisher.PedidoMessagePublisher;
import br.edu.ifba.ms_pedidos.repository.PedidoRepository;
import feign.FeignException;
import feign.RetryableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private final PedidoRepository pedidoRepository;
    private final CatalogoClient catalogoClient;
    private final PedidoMessagePublisher messagePublisher;

    public PedidoService(PedidoRepository pedidoRepository,
                         CatalogoClient catalogoClient,
                         PedidoMessagePublisher messagePublisher) {
        this.pedidoRepository = pedidoRepository;
        this.catalogoClient = catalogoClient;
        this.messagePublisher = messagePublisher;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado com ID: " + id));
    }

    @Transactional
    public Pedido criarPedido(CriarPedidoDTO dto) {
        log.info("Iniciando checkout de pedido com {} itens", dto.getItens().size());

        Map<Long, ProdutoDTO> produtosConsultados = new HashMap<>();
        for (ItemPedidoRequestDTO itemDto : dto.getItens()) {
            ProdutoDTO produto = consultarProdutoNoCatalogo(itemDto.getProdutoId());
            if (produto.getQuantidadeEstoque() < itemDto.getQuantidade()) {
                throw new EstoqueInsuficienteException(
                        String.format("Estoque insuficiente para o produto '%s' (ID %d). Solicitado: %d, Disponível: %d",
                                produto.getNome(), produto.getId(), itemDto.getQuantidade(), produto.getQuantidadeEstoque())
                );
            }
            produtosConsultados.put(itemDto.getProdutoId(), produto);
        }

        Pedido pedido = new Pedido();
        pedido.setDataCriacao(LocalDateTime.now());
        pedido.setStatus(StatusPedido.CONFIRMADO);

        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemPedidoRequestDTO itemDto : dto.getItens()) {
            decrementarEstoqueNoCatalogo(itemDto.getProdutoId(), itemDto.getQuantidade());

            ProdutoDTO produto = produtosConsultados.get(itemDto.getProdutoId());
            BigDecimal subtotal = produto.getPreco().multiply(BigDecimal.valueOf(itemDto.getQuantidade()));
            valorTotal = valorTotal.add(subtotal);

            ItemPedido item = new ItemPedido();
            item.setProdutoId(itemDto.getProdutoId());
            item.setQuantidade(itemDto.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());

            pedido.adicionarItem(item);
        }

        pedido.setValorTotal(valorTotal);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        PedidoCriadoEvent event = new PedidoCriadoEvent(
                pedidoSalvo.getId(),
                pedidoSalvo.getValorTotal(),
                pedidoSalvo.getDataCriacao(),
                pedidoSalvo.getStatus().name()
        );

        /*
         * R5 - Tolerância a Falhas:
         * O envio assíncrono é sincronizado para ocorrer estritamente após o commit
         * no PostgreSQL (afterCommit), evitando envio prematuro em caso de rollback.
         */
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    messagePublisher.publicarPedidoCriado(event);
                }
            });
        } else {
            messagePublisher.publicarPedidoCriado(event);
        }

        return pedidoSalvo;
    }

    private ProdutoDTO consultarProdutoNoCatalogo(Long produtoId) {
        try {
            return catalogoClient.buscarPorId(produtoId);
        } catch (FeignException.NotFound e) {
            throw new ProdutoNaoEncontradoException(
                    "Produto com ID " + produtoId + " não foi encontrado no catálogo.");
        } catch (RetryableException e) {
            log.error("Conexão recusada ao consultar ms-catalogo: {}", e.getMessage());
            throw new ErroIntegracaoCatalogoException(
                    "O microsserviço de catálogo (ms-catalogo) está fora do ar ou inalcançável na porta 8082.");
        } catch (FeignException e) {
            log.error("Erro na comunicação com ms-catalogo: {}", e.getMessage());
            throw new ErroIntegracaoCatalogoException(
                    "Falha na comunicação com o ms-catalogo ao buscar o produto ID " + produtoId + ": " + e.getMessage());
        }
    }

    private void decrementarEstoqueNoCatalogo(Long produtoId, Integer quantidade) {
        try {
            catalogoClient.decrementarEstoque(produtoId, new BaixaEstoqueDTO(quantidade));
        } catch (FeignException.Conflict e) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente no catálogo para o produto ID " + produtoId + ".");
        } catch (FeignException.NotFound e) {
            throw new ProdutoNaoEncontradoException(
                    "Produto com ID " + produtoId + " não foi encontrado para atualização de estoque.");
        } catch (RetryableException e) {
            log.error("Conexão recusada ao decrementar estoque no ms-catalogo: {}", e.getMessage());
            throw new ErroIntegracaoCatalogoException(
                    "O microsserviço de catálogo (ms-catalogo) está fora do ar ou inalcançável durante a baixa de estoque.");
        } catch (FeignException e) {
            log.error("Erro ao decrementar estoque no ms-catalogo: {}", e.getMessage());
            throw new ErroIntegracaoCatalogoException(
                    "Falha ao decrementar estoque no ms-catalogo para o produto ID " + produtoId + ": " + e.getMessage());
        }
    }
}
