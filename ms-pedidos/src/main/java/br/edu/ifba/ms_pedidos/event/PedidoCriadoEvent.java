package br.edu.ifba.ms_pedidos.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * R4 - Evento assíncrono publicado na fila quando um pedido é confirmado.
 */
public class PedidoCriadoEvent implements Serializable {

    private Long pedidoId;
    private BigDecimal valorTotal;
    private LocalDateTime dataCriacao;
    private String status;

    public PedidoCriadoEvent() {
    }

    public PedidoCriadoEvent(Long pedidoId, BigDecimal valorTotal, LocalDateTime dataCriacao, String status) {
        this.pedidoId = pedidoId;
        this.valorTotal = valorTotal;
        this.dataCriacao = dataCriacao;
        this.status = status;
    }

    public Long getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
