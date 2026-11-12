package br.edu.ifba.ms_pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CriarPedidoDTO {

    @NotEmpty(message = "O pedido deve conter pelo menos um item")
    @Valid
    private List<ItemPedidoRequestDTO> itens;

    public CriarPedidoDTO() {
    }

    public CriarPedidoDTO(List<ItemPedidoRequestDTO> itens) {
        this.itens = itens;
    }

    public List<ItemPedidoRequestDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoRequestDTO> itens) {
        this.itens = itens;
    }
}
