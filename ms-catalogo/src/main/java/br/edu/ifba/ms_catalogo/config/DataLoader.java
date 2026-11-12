package br.edu.ifba.ms_catalogo.config;

import br.edu.ifba.ms_catalogo.model.Produto;
import br.edu.ifba.ms_catalogo.repository.ProdutoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner carregarDadosIniciais(ProdutoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Produto p1 = new Produto(null, "Bolo de Cenoura com Brigadeiro", "Fatia de bolo artesanal com cobertura crocante de chocolate", new BigDecimal("12.50"), 10);
                Produto p2 = new Produto(null, "Coxinha de Frango com Catupiry", "Salgado frito na hora com recheio cremoso", new BigDecimal("8.00"), 20);
                // Produto com estoque = 1 para demonstrar R6 (Lock de concorrência / último item)
                Produto p3 = new Produto(null, "Torta Holandesa Edição Especial", "Última unidade disponível do dia", new BigDecimal("18.00"), 1);

                repository.saveAll(List.of(p1, p2, p3));
                System.out.println(">>> [ms-catalogo] Dados iniciais carregados com sucesso!");
            }
        };
    }
}
