package br.edu.ifba.ms_catalogo.controller;

import br.edu.ifba.ms_catalogo.dto.BaixaEstoqueDTO;
import br.edu.ifba.ms_catalogo.model.Produto;
import br.edu.ifba.ms_catalogo.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@Valid @RequestBody Produto produto) {
        Produto criado = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PostMapping("/{id}/decrementar-estoque")
    public ResponseEntity<Produto> decrementarEstoque(
            @PathVariable Long id,
            @Valid @RequestBody BaixaEstoqueDTO dto) {
        Produto atualizado = produtoService.decrementarEstoque(id, dto.getQuantidade());
        return ResponseEntity.ok(atualizado);
    }
}
