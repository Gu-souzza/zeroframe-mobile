# Contrato da API compartilhada

Base local `http://localhost:5140/api`. O Swagger completo fica em `http://localhost:5140/swagger` no ambiente Development. Envie JSON nas operações de conta, endereço, carrinho e pedido. Para cadastrar/editar produtos como administrador, use multipart/form-data conforme o Swagger.

## Conta e autenticação

| Método e rota | Corpo ou resposta |
| --- | --- |
| GET /health | Confere a conexão com o SQL Server |
| POST /usuarios | `{ nome, email, telefone, senha }` retorna conta e token |
| POST /usuarios/login | `{ email, senha }` retorna usuarioId, nome, email, telefone, perfil e token |
| GET /usuarios/me | Dados da conta autenticada |
| PUT /usuarios/meus-dados | Nome, e-mail, telefone e senhaAtual/novaSenha opcionais |
| DELETE /usuarios/me | Desativa a própria conta e preserva os pedidos |

Nas rotas privadas, envie `Authorization: Bearer TOKEN`. Os tokens JWT expiram em uma hora. Logout remove a sessão no dispositivo. A API verifica se a conta continua ativa.

## Catálogo e dados da conta

| Método e rota | Uso |
| --- | --- |
| GET /produtos | Lista paginada com busca/filtros conforme Swagger |
| GET /produtos/{id} | Produto, preços e variações com estoque |
| GET /categorias | Lista paginada de categorias |
| GET /produtos/{id}/avaliacoes/resumo | Média e distribuição das avaliações |
| GET /usuarios/me/enderecos | Endereços ativos com o principal primeiro |
| POST /usuarios/{id}/endereco | Cadastra endereço com usuarioId |
| PUT /usuarios/{id}/endereco/{enderecoId} | Atualiza endereço com id e usuarioId |
| DELETE /usuarios/{id}/endereco/{enderecoId} | Desativa o endereço |
| PUT /usuarios/me/enderecos/{id}/principal | Define endereço principal |
| GET /usuarios/me/favoritos | IDs dos produtos favoritos |
| PUT /usuarios/me/favoritos/{produtoId} | Salva favorito de forma repetível |
| DELETE /usuarios/me/favoritos/{produtoId} | Remove favorito |
| GET, POST, DELETE /usuarios/me/buscas-recentes | Lista, salva `{ termo }` e remove com query `?termo=...` |

As listas paginadas retornam `items`, `totalItems`, `pageNumber`, `pageSize`, `totalPages` e `hasNextPage`. O app percorre todas as páginas. A API mantém o limite de três endereços ativos por usuário.

## Carrinho e pedidos

| Método e rota | Uso |
| --- | --- |
| GET /usuarios/{id}/carrinho | Resumo do carrinho ativo |
| GET /usuarios/{id}/carrinho/itens | Itens com produto, variação, preço e quantidade |
| POST /usuarios/{id}/carrinho/itens | `{ variacaoProdutoId, quantidade }` |
| PUT /usuarios/{id}/carrinho/itens/{itemId} | `{ variacaoProdutoId, quantidade }` |
| DELETE /usuarios/{id}/carrinho/itens/{itemId} | Remove um item |
| DELETE /usuarios/{id}/carrinho/itens | Limpa o carrinho ativo |
| GET /frete?subtotal=90 | Frete segundo a regra existente |
| GET /usuarios/{id}/pedidos | Pedidos paginados do usuário |
| GET /pedidos/{id} | Detalhes de um pedido da conta |
| POST /usuarios/{id}/pedidos | Checkout usando o endereço e o carrinho |
| POST /suporte | Nome, e-mail, categoria, assunto e mensagem com sessão autenticada |

O mobile envia `{ enderecoId, itensSelecionados: [{ id, quantidade }] }` para comprar apenas os itens marcados. O formato anterior do desktop, `{ enderecoId }`, continua comprando o carrinho inteiro.

Se os itens selecionados não corresponderem ao carrinho atual, a API rejeita o checkout para que o cliente revise os dados. Preço, frete e estoque são calculados no servidor. Os pedidos começam pendentes.

Erros são exibidos no app a partir da mensagem retornada pela API. O projeto herdado possui respostas em texto, validações padrão ASP.NET e objetos de erro próprios, tratados no serviço HTTP do app.

## Configuração

| Chave | Uso |
| --- | --- |
| ConnectionStrings__DefaultConnection | Conexão SQL Server |
| Jwt__SecretKey | Chave particular para assinar tokens |
| Jwt__Issuer / Jwt__Audience | Emissor e audiência dos tokens |
| Cors__AllowedOrigins__0 | Origem adicional de um navegador |
| EXPO_PUBLIC_API_URL | URL da API no app, incluindo /api |

O arquivo `appsettings.Development.local.json` é local e ignorado pelo Git. Variáveis de ambiente têm prioridade sobre ele.
