package br.edu.ifba.ms_pedidos.client;

import br.edu.ifba.ms_pedidos.dto.BaixaEstoqueDTO;
import br.edu.ifba.ms_pedidos.dto.ProdutoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * R2 - Comunicação Síncrona via OpenFeign:
 * Aponta diretamente para o ms-catalogo sem necessidade de Service Discovery.
 */
@FeignClient(name = "catalogoClient", url = "http://localhost:8082/produtos")
public interface CatalogoClient {

    @GetMapping("/{id}")
    ProdutoDTO buscarPorId(@PathVariable("id") Long id);

    @PostMapping("/{id}/decrementar-estoque")
    ProdutoDTO decrementarEstoque(
            @PathVariable("id") Long id,
            @RequestBody BaixaEstoqueDTO dto
    );
}
