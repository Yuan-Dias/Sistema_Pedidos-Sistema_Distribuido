package br.edu.ifba.ms_pedidos.publisher;

import br.edu.ifba.ms_pedidos.event.PedidoCriadoEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PedidoMessagePublisher {

    private static final Logger log = LoggerFactory.getLogger(PedidoMessagePublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange:pedido.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routingkey:pedido.criado}")
    private String routingKey;

    public PedidoMessagePublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarPedidoCriado(PedidoCriadoEvent event) {
        try {
            log.info("Publicando evento de Pedido Criado no RabbitMQ. ID Pedido: {}, Valor: R$ {}",
                    event.getPedidoId(), event.getValorTotal());

            rabbitTemplate.convertAndSend(exchange, routingKey, event);

            log.info("Mensagem enviada com sucesso para a exchange '{}' com routingKey '{}'",
                    exchange, routingKey);
        } catch (Exception e) {
            log.error("Falha ao enviar evento para o RabbitMQ: {}", e.getMessage(), e);
        }
    }
}
