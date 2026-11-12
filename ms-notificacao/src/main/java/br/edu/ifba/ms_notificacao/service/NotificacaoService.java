package br.edu.ifba.ms_notificacao.service;

import br.edu.ifba.ms_notificacao.event.PedidoCriadoEvent;
import br.edu.ifba.ms_notificacao.model.NotificacaoHistorico;
import br.edu.ifba.ms_notificacao.repository.NotificacaoHistoricoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoService.class);

    private final NotificacaoHistoricoRepository repository;

    public NotificacaoService(NotificacaoHistoricoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public NotificacaoHistorico processarNotificacaoPedido(PedidoCriadoEvent event) {
        String mensagemCozinha = String.format(
                "Ficha de preparo: Pedido #%d recebido em %s. Valor: R$ %s. Status: %s",
                event.getPedidoId(),
                event.getDataCriacao() != null ? event.getDataCriacao().toString() : LocalDateTime.now().toString(),
                event.getValorTotal(),
                event.getStatus()
        );

        log.info("Processando ficha de preparo para o pedido #{} no valor de R$ {}",
                event.getPedidoId(), event.getValorTotal());

        NotificacaoHistorico historico = new NotificacaoHistorico(
                null,
                event.getPedidoId(),
                mensagemCozinha,
                LocalDateTime.now(),
                "PROCESSADO"
        );

        return repository.save(historico);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoHistorico> listarTodas() {
        return repository.findAllByOrderByDataProcessamentoDesc();
    }
}
