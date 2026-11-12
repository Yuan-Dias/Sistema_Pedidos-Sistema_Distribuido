# Sistema de Pedidos Distribuído - Confeitaria/Lanchonete
> **Trabalho Acadêmico de Sistemas Distribuídos — Instituto Federal da Bahia (IFBA)**

Este projeto implementa uma arquitetura distribuída resiliente, desacoplada e concorrente para gestão de pedidos de uma confeitaria/lanchonete, utilizando **Java 21**, **Spring Boot 3.3.5**, **Spring Cloud OpenFeign**, **PostgreSQL** e mensageria assíncrona com **RabbitMQ**.

---

## 📦 Padrão Zero-Config (Sem necessidade de `.env`)

O projeto foi configurado no padrão **Clone & Run**:
* **Sem arquivos `.env`:** As credenciais de desenvolvimento local (`admin` / `senha123`) já estão pré-configuradas no `docker-compose.yml` e nos arquivos `application.properties` de cada serviço.
* **Sem necessidade de instalar o Maven:** Cada microsserviço já acompanha seus próprios wrappers executáveis (`./mvnw` e `.\mvnw.cmd`).
* **Bancos automáticos:** O script `init-db.sql` cria automaticamente as bases isoladas `db_pedidos` e `db_notificacao` na primeira inicialização do container.

---

## 🏛️ Arquitetura e Mapeamento de Portas

```
                            [ Cliente HTTP / Script de Teste ]
                                            |
                                            v
       +-------------------------------------------------------------------------+
       |                               ms-pedidos                                |
       |                              (Porta 8083)                               |
       |                      Banco Isolado: db_pedidos (R3)                     |
       +-------------------------------------------------------------------------+
                    |                                             |
   (R2: Chamada Síncrona OpenFeign)                 (R4: Publicação de Evento AMQP)
                    |                                             |
                    v                                             v
       +-------------------------+                 +-----------------------------+
       |       ms-catalogo       |                 |     RabbitMQ (Porta 5672)   |
       |      (Porta 8082)       |                 |  Exchange: pedido.exchange  |
       | Banco: db_catalogo (R3) |                 | Fila: fila.pedidos.notificacao
       |  Lock Pessimista (R6)   |                 +-----------------------------+
       +-------------------------+                                |
                                                   (Consumo Assíncrono - R4 / R5)
                                                                  v
                                                   +-----------------------------+
                                                   |       ms-notificacao        |
                                                   |        (Porta 8084)         |
                                                   | Banco: db_notificacao (R3)  |
                                                   +-----------------------------+
```

| Componente | Porta Host | Banco de Dados Isolado | Descrição |
| :--- | :---: | :---: | :--- |
| **PostgreSQL 15** | `5433` | `db_catalogo`, `db_pedidos`, `db_notificacao` | Instância Docker com bases lógicas separadas (R3) |
| **RabbitMQ 3** | `5672` / `15672` | - | Broker AMQP e painel de gestão web |
| **`ms-catalogo`** | `8082` | `db_catalogo` | Dono dos produtos e controle atômico de estoque (R6) |
| **`ms-pedidos`** | `8083` | `db_pedidos` | Orquestrador de checkout via Feign (R2) e produtor (R4/R5) |
| **`ms-notificacao`** | `8084` | `db_notificacao` | Consumidor de fichas de preparo para a cozinha (R4/R5) |

---

## 📋 Requisitos Atendidos (R1 a R6)

* **R1 (Microsserviços Independentes):** Três processos Spring Boot completamente autônomos, com ciclos de vida e builds desacoplados.
* **R2 (Comunicação Síncrona):** `ms-pedidos` integra com `ms-catalogo` via **Spring Cloud OpenFeign** com tratamento semântico de exceções HTTP (404, 409 Conflict por falta de estoque e 503 para indisponibilidade).
* **R3 (Propriedade de Dados):** Cada microsserviço acessa unicamente a sua própria base de dados no PostgreSQL (`db_catalogo`, `db_pedidos` e `db_notificacao`), sem compartilhamento de tabelas.
* **R4 (Comunicação Assíncrona):** Eventos `PedidoCriadoEvent` são publicados pelo `ms-pedidos` na exchange `pedido.exchange` e consumidos pelo `ms-notificacao` através da fila `fila.pedidos.notificacao`, utilizando serialização JSON interoperável.
* **R5 (Tolerância a Falhas e Resiliência):**
  - Fila declarada como **durável** (`durable=true`).
  - Se o `ms-notificacao` estiver fora do ar, o fluxo de checkout continua funcionando com sucesso (HTTP 201 Created). As mensagens ficam retidas no broker e são processadas automaticamente assim que o serviço for religado.
  - Sincronização transacional `afterCommit()` no `ms-pedidos`, assegurando que mensagens só sejam publicadas após a confirmação do commit no PostgreSQL (resolução de Dual-Write).
* **R6 (Concorrência e Integridade):** Bloqueio pessimista via JPA (`@Lock(LockModeType.PESSIMISTIC_WRITE)` gerando `SELECT ... FOR UPDATE` no PostgreSQL) ao decrementar o estoque, impedindo a venda duplicada do último item caso ocorram requisições concorrentes.

---

## 🚀 Como Executar o Projeto

### 1. Clonar o Repositório
```bash
git clone https://github.com/Yuan-Dias/Sistema_Pedidos-Sistema_Distribuido.git
cd Sistema_Pedidos-Sistema_Distribuido
```

### 2. Pré-requisitos
* **Java 21+** instalado.
* **Docker Desktop** (com Docker Compose ativo).

### 3. Subir a Infraestrutura (PostgreSQL + RabbitMQ)
No diretório raiz do projeto:
```bash
docker compose up -d
```
> O script `init-db.sql` criará automaticamente os bancos `db_pedidos` e `db_notificacao`. O banco principal `db_catalogo` é inicializado pelas variáveis de ambiente.

### 4. Iniciar os Microsserviços
Abra três terminais separados:

```bash
# Terminal 1 - Catálogo (Porta 8082)
cd ms-catalogo
./mvnw spring-boot:run
```

```bash
# Terminal 2 - Pedidos (Porta 8083)
cd ms-pedidos
./mvnw spring-boot:run
```

```bash
# Terminal 3 - Notificação (Porta 8084)
cd ms-notificacao
./mvnw spring-boot:run
```
*(No Windows/PowerShell, utilize `.\mvnw.cmd spring-boot:run`)*

---

## 🧪 Roteiro de Testes e Demonstração

### Teste de Concorrência e Lock Pessimista (Requisito R6)
O `ms-catalogo` inicia com uma **Torta Holandesa Edição Especial (ID 3)** com **estoque = 1**.

Para disparar duas requisições rigorosamente simultâneas tentando comprar esta mesma unidade:

```powershell
# PowerShell
.\teste-concorrencia-r6.ps1
```
ou
```bash
# Python
python teste-concorrencia-r6.py
```

**Resultado esperado:**
* **Thread 1:** Recebe `HTTP 201 Created` (Venda confirmada, estoque decrementado para 0).
* **Thread 2:** Recebe `HTTP 409 Conflict` (Bloqueada pelo Lock; estoque insuficiente).

---

### Teste de Resiliência e Tolerância a Falhas (Requisito R5)
1. Pare o `ms-notificacao` (`Ctrl + C` no Terminal 3).
2. Faça um pedido no `ms-pedidos`:
   ```bash
   curl -X POST http://localhost:8083/pedidos \
     -H "Content-Type: application/json" \
     -d '{"itens": [{"produtoId": 2, "quantidade": 1}]}'
   ```
   *Resposta:* `HTTP 201 Created` (venda confirmada com sucesso).
3. Religue o `ms-notificacao`:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Consulte as notificações processadas:
   ```bash
   curl http://localhost:8084/notificacoes
   ```
   *(A ficha de preparo do pedido pendente foi consumida da fila e registrada no banco).*
