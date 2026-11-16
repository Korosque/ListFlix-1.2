# ListFlix

Aplicação para descobrir filmes e manter uma lista pessoal de títulos para assistir. O catálogo público vem das APIs Studio Ghibli e SampleAPIs; a **Minha lista** é um CRUD próprio (Fastify + MySQL) com validação, busca e paginação.

## Integrantes

- João Pedro de Paula Gomes
- Kaio Dias
- Igor Mazorque

## Arquitetura escolhida

**Backend: arquitetura em camadas** (rotas → controller → service → repository). **Frontend: pastas por tipo** (`pages`, `components`, `context`, `hooks`, `services`).

**Justificativa.** O sistema tem uma entidade central (filme da lista) com regras simples. Camadas deixam claro onde cada coisa vive sem a cerimônia de módulos por funcionalidade, e a mesma estrutura é replicável para novas entidades (basta criar os cinco arquivos `*.routes/controller/service/repository/schema`).

| Camada | Responsabilidade | Não faz |
|---|---|---|
| `routes` | Declara endpoints e liga cada um ao seu schema e controller | Lógica |
| `schemas` | JSON Schema (Fastify) de headers, params, body e querystring | — |
| `controllers` | Lê a requisição, chama o service, devolve o status HTTP | SQL e regra de negócio |
| `services` | Regras: limpeza dos campos, cálculo de `offset`/`totalPages`, "não encontrado" (404) | HTTP e SQL |
| `repositories` | Único lugar com SQL parametrizado (`?`) e mapeamento coluna → objeto | Regras |
| `database` / `config` | Pool MySQL, variáveis de ambiente, `schema.sql` | — |

`server.ts` apenas cria o app, configura CORS e registra as rotas.

## Estrutura de pastas

```text
.
├── backend/src/
│   ├── config/env.ts                    # variáveis de ambiente (.env)
│   ├── database/
│   │   ├── connection.ts                # Pool mysql2
│   │   ├── schema.sql                   # banco + tabela movies
│   │   └── setup.ts                     # executa o schema.sql
│   ├── routes/movies.routes.ts
│   ├── schemas/movies.schema.ts
│   ├── controllers/movies.controller.ts
│   ├── services/movies.service.ts
│   ├── repositories/movies.repository.ts
│   ├── types/movie.ts
│   └── server.ts
├── src/                                 # React + Vite
│   ├── pages/                           # telas (Login, Home, Catalog, Details, Watchlist)
│   ├── components/                      # Layout, PosterCard, MovieForm, Pagination, StateCard…
│   ├── context/                         # Auth (sessão), Catalog (API pública), Watchlist (lista salva)
│   ├── hooks/useWatchlistPage.ts        # busca + paginação da Minha lista
│   ├── services/                        # apiClient, watchlist (API própria), catalog (APIs públicas)
│   ├── utils/ · types/ · data/
│   └── App.tsx · main.tsx · styles.css
├── .env.example
└── package.json
```

**Onde escrever o quê:** nova rota → `routes` + `schemas`; regra de negócio → `services`; consulta SQL → `repositories`; chamada HTTP no React → `src/services`; tela → `pages`; peça reutilizável de interface → `components`.

## Fluxo de uma requisição

Busca na Minha lista (`/minha-lista`):

```text
Digitar no campo de busca (Watchlist.tsx)
  → useWatchlistPage (espera 350 ms e controla a página)
  → services/watchlist.ts → apiClient (GET /movies/paginated?page&limit&search)
  → routes (valida headers e querystring com JSON Schema → 400 se inválido)
  → controller.listPage
  → service.listPage (offset = (page-1)*limit; totalPages)
  → repository.findPage (SELECT … LIKE ? … LIMIT ? OFFSET ? + COUNT(*)) → MySQL
  → JSON { data, total, page, limit, totalPages }
  → React renderiza cards, "Página X de Y" e Anterior/Próxima
```

## Como executar

Requisitos: Node.js 20.19+ (ou 22.12+), npm e MySQL 8.

```bash
npm install
cp .env.example .env      # ajuste DB_USER / DB_PASSWORD
npm run db:setup          # cria o banco listflix e a tabela movies
npm run dev:all           # front (http://localhost:5173) + API (http://localhost:3001)
```

Scripts úteis: `npm run dev` (só front), `npm run dev:api` (só API), `npm run build` / `npm run build:api`.

A sessão de login é demonstrativa (qualquer e-mail válido e senha com 4+ caracteres). O e-mail vai no header `x-user-email` e separa a lista de cada conta.

## API

Todas as rotas exigem o header `x-user-email`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/movies` | Lista completa (contador do menu e botões "Quero assistir") |
| GET | `/movies/paginated` | **Lista paginada com busca** |
| GET | `/movies/:id` | Detalhe |
| POST | `/movies` | Cria (`title` e `posterURL` obrigatórios) |
| PUT | `/movies/:id` | Atualiza |
| DELETE | `/movies/:id` | Remove (204) |
| GET | `/health` | Verificação do servidor |

### Paginação: `GET /movies/paginated`

`page` (inteiro ≥ 1, padrão 1), `limit` (1 a 50, padrão 10), `search` (texto até 100 caracteres, filtra por título). Resposta:

```json
{ "data": [ { "id": 1, "title": "Up", "posterURL": "https://…" } ], "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
```

Exemplos:

```bash
# 1) primeira página, 5 por página
curl -H "x-user-email: ana@email.com" "http://localhost:3001/movies/paginated?page=1&limit=5"

# 2) busca por "ghibli" na página 2, 10 por página
curl -H "x-user-email: ana@email.com" "http://localhost:3001/movies/paginated?page=2&limit=10&search=ghibli"
```

### Validação (exemplos que retornam 400)

```bash
curl -H "x-user-email: ana@email.com" "http://localhost:3001/movies/paginated?limit=100"   # limit > 50
curl -X POST -H "x-user-email: ana@email.com" -H "Content-Type: application/json" \
     -d '{"title":"","posterURL":"x"}' http://localhost:3001/movies                      # título vazio e URL inválida
```

## Testes manuais sugeridos

1. Cadastrar, editar e remover um filme em **Minha lista** e conferir no MySQL: `SELECT * FROM movies;`.
2. Cadastrar mais de 12 filmes, navegar com Anterior/Próxima e buscar por parte do título.
3. Abrir o DevTools → Network e conferir `GET /movies/paginated?page=…&limit=12&search=…` e os metadados.
4. Reiniciar a API e confirmar que os filmes continuam na lista.
5. Derrubar a API e conferir a mensagem de erro com "Tentar novamente".
