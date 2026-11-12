import urllib.request
import urllib.error
import json
from concurrent.futures import ThreadPoolExecutor

# ==============================================================================
# PROVA DE CONCORRÊNCIA E INTEGRIDADE (REQUISITO R6 - IFBA)
# Alvo: ms-pedidos na porta 8083
# ==============================================================================

URL = "http://localhost:8083/pedidos"
PAYLOAD = json.dumps({"itens": [{"produtoId": 3, "quantidade": 1}]}).encode("utf-8")

def enviar_pedido(thread_name):
    req = urllib.request.Request(URL, data=PAYLOAD, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return (thread_name, response.getcode(), response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return (thread_name, e.code, e.read().decode("utf-8"))
    except Exception as e:
        return (thread_name, 0, str(e))

def main():
    print("=" * 70)
    print(" [TESTE DE CONCORRÊNCIA R6] Disparando 2 requisições simultâneas...")
    print(f" Alvo: POST {URL} (Produto ID: 3, Quantidade: 1)")
    print("=" * 70)

    # Dispara as duas requisições rigorosamente ao mesmo tempo
    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(enviar_pedido, "Thread 1")
        f2 = executor.submit(enviar_pedido, "Thread 2")
        resultados = [f1.result(), f2.result()]

    sucesso = 0
    conflito = 0

    print("\n" + "-" * 70)
    for nome, status, body in resultados:
        if status == 201:
            sucesso += 1
            print(f"[{nome}] Status: {status} Created (SUCESSO)")
            print(f"Payload: {body}")
        elif status == 409:
            conflito += 1
            print(f"[{nome}] Status: {status} Conflict (CONFLITO - ESTOQUE INSUFICIENTE)")
            print(f"Payload: {body}")
        else:
            print(f"[{nome}] Status: {status} (INESPERADO)")
            print(f"Payload: {body}")
        print("-" * 70)

    print("\n" + "=" * 25 + " VEREDITO DO TESTE " + "=" * 25)
    if sucesso == 1 and conflito == 1:
        print("[SUCESSO ABSOLUTO] Requisito R6 validado com perfeição!")
        print(" -> 1 requisição adquiriu o lock pessimista e efetuou a compra (HTTP 201).")
        print(" -> 1 requisição foi rejeitada por falta de estoque (HTTP 409).")
        print(" -> O último item não foi vendido em duplicidade.")
    else:
        print("[ATENÇÃO] Verifique se os microsserviços estão ativos e o Produto 3 possui estoque = 1.")
    print("=" * 70)

if __name__ == "__main__":
    main()