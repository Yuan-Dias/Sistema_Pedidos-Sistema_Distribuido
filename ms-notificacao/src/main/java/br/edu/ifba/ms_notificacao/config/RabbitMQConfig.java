package br.edu.ifba.ms_notificacao.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange:pedido.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.queue:fila.pedidos.notificacao}")
    private String queueName;

    @Value("${app.rabbitmq.routingkey:pedido.criado}")
    private String routingKey;

    @Bean
    public Queue pedidoQueue() {
        // durable = true para que as mensagens não se percam se o broker reiniciar ou o serviço estiver offline (R5)
        return new Queue(queueName, true);
    }

    @Bean
    public DirectExchange pedidoExchange() {
        return new DirectExchange(exchangeName, true, false);
    }

    @Bean
    public Binding binding(Queue pedidoQueue, DirectExchange pedidoExchange) {
        return BindingBuilder.bind(pedidoQueue).to(pedidoExchange).with(routingKey);
    }

    /**
     * R4 - Configura o conversor JSON inferindo o tipo diretamente a partir
     * dos parâmetros do método @RabbitListener, evitando falhas de ClassNotFoundException
     * decorrentes de pacotes Java distintos entre os microsserviços.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.INFERRED);
        typeMapper.setTrustedPackages("*");
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        // Garante que mensagens com erro de processamento possam ser reenfileiradas ou mantidas (R5)
        factory.setDefaultRequeueRejected(true);
        return factory;
    }
}
