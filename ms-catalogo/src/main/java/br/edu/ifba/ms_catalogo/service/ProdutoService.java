package br.edu.ifba.ms_catalogo.service;

import br.edu.ifba.ms_catalogo.exception.EstoqueInsuficienteException;
import br.edu.ifba.ms_catalogo.exception.RecursoNaoEncontradoException;
import br.edu.ifba.ms_catalogo.model.Produto;
import br.edu.ifba.ms_catalogo.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Transactional(readOnly = true)
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com id: " + id));
    }

    @Transactional
    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    /**
     * R6 - Concorrência e Integridade:
     * O lock pessimista emite SELECT ... FOR UPDATE. Transações concorrentes aguardam a liberação
     * do bloqueio para leitura e atualização, impedindo a venda duplicada do último item.
     */
    @Transactional
    public Produto decrementarEstoque(Long id, Integer quantidade) {
        Produto produto = produtoRepository.findByIdWithLock(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com id: " + id));

        if (produto.getQuantidadeEstoque() < quantidade) {
            throw new EstoqueInsuficienteException(
                    String.format("Estoque insuficiente para o produto '%s'. Solicitado: %d, Disponível: %d",
                            produto.getNome(), quantidade, produto.getQuantidadeEstoque())
            );
        }

        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - quantidade);
        return produtoRepository.save(produto);
    }
}
