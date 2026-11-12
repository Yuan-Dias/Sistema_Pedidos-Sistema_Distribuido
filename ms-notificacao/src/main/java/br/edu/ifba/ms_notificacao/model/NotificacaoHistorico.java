package br.edu.ifba.ms_notificacao.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes_historico")
public class NotificacaoHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long pedidoId;

    @Column(nullable = false, length = 1000)
    private String mensagem;

    @Column(nullable = false)
    private LocalDateTime dataProcessamento;

    @Column(nullable = false, length = 50)
    private String status;

    public NotificacaoHistorico() {
        this.dataProcessamento = LocalDateTime.now();
        this.status = "PROCESSADO";
    }

    public NotificacaoHistorico(Long id, Long pedidoId, String mensagem, LocalDateTime dataProcessamento, String status) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.mensagem = mensagem;
        this.dataProcessamento = dataProcessamento != null ? dataProcessamento : LocalDateTime.now();
        this.status = status != null ? status : "PROCESSADO";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public LocalDateTime getDataProcessamento() {
        return dataProcessamento;
    }

    public void setDataProcessamento(LocalDateTime dataProcessamento) {
        this.dataProcessamento = dataProcessamento;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
