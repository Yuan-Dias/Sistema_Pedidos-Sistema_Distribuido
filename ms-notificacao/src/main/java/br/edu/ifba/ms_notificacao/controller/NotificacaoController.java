package br.edu.ifba.ms_notificacao.controller;

import br.edu.ifba.ms_notificacao.model.NotificacaoHistorico;
import br.edu.ifba.ms_notificacao.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    /**
     * Endpoint para consultar o histórico de notificações/fichas de preparo emitidas.
     * Utilizado durante a demonstração para comprovar o consumo de mensagens
     * após religar o serviço (R5).
     */
    @GetMapping
    public ResponseEntity<List<NotificacaoHistorico>> listarTodas() {
        return ResponseEntity.ok(notificacaoService.listarTodas());
    }
}
