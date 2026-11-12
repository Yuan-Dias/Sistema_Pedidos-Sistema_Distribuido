package br.edu.ifba.ms_notificacao.repository;

import br.edu.ifba.ms_notificacao.model.NotificacaoHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoHistoricoRepository extends JpaRepository<NotificacaoHistorico, Long> {
    List<NotificacaoHistorico> findAllByOrderByDataProcessamentoDesc();
}
