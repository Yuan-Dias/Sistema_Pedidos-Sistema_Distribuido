package br.edu.ifba.ms_pedidos.dto;

public class BaixaEstoqueDTO {

    private Integer quantidade;

    public BaixaEstoqueDTO() {
    }

    public BaixaEstoqueDTO(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}
