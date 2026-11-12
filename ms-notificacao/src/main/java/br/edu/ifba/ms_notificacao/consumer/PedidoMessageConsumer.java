package br.edu.ifba.ms_notificacao.consumer;

import br.edu.ifba.ms_notificacao.event.PedidoCriadoEvent;
import br.edu.ifba.ms_notificacao.service.NotificacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PedidoMessageConsumer {

    private static final Logger log = LoggerFactory.getLogger(PedidoMessageConsumer.class);

    private final NotificacaoService notificacaoService;

    public PedidoMessageConsumer(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    /*
     * R4 e R5: Consumo assíncrono com tolerância a falhas.
     * Mensagens acumuladas durante indisponibilidade do serviço são consumidas na reinicialização.
     */
    @RabbitListener(queues = "${app.rabbitmq.queue:fila.pedidos.notificacao}")
    public void consumirPedidoCriado(PedidoCriadoEvent event) {
        log.info("Mensagem recebida da fila RabbitMQ: {}", event);

        try {
            notificacaoService.processarNotificacaoPedido(event);
        } catch (Exception e) {
            log.error("Erro ao processar notificação do pedido {}: {}", event.getPedidoId(), e.getMessage(), e);
            throw e;
        }
    }
}
