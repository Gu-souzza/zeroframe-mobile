# Atualização do banco: estoque e procedures

## O que foi recebido

Em 20/11/2026 foi analisado o arquivo `Triggerseproduce.sql` enviado pela equipe. Ele é um complemento SQL, não um backup nem um banco completo. Inclui uma tabela de histórico, uma trigger de auditoria e três procedures. O arquivo original está em [`origem/Triggerseproduce.sql`](origem/Triggerseproduce.sql) para referência; **não execute esse original na base da aplicação**.

A versão compatível está em [`rotinas/estoque-e-pedidos.sql`](rotinas/estoque-e-pedidos.sql) e é instalada automaticamente pela migration **AuditoriaEstoqueERotinas**. Não é necessário executar as rotinas separadamente.

## O que muda

| Recurso | Comportamento |
| --- | --- |
| `HistoricoEstoque` | Guarda a variação, quantidade anterior, quantidade nova e data UTC da mudança. |
| `trg_AuditoriaEstoque` | Registra mudanças reais de estoque, inclusive compras/cancelamentos feitos pela API. Funciona com várias linhas na mesma atualização e respeita rollback. |
| `sp_CancelarPedido` | Cancela pedidos permitidos, devolve estoque uma única vez e atualiza entrega/pagamento. Não cancela pedidos entregues. |
| `sp_FinalizarPedidoAPartirDoCarrinho` | Converte o carrinho inteiro em pedido, valida usuário/endereço/estoque, usa preço atual com desconto, inclui frete e inativa o carrinho. |
| `sp_ObterCategoriasComContagem` | Lista categorias com a quantidade de produtos ativos, incluindo categorias sem produtos. |

A auditoria começa na instalação: ela não reconstrói alterações antigas. Seguindo a relação do SQL recebido, apagar fisicamente uma variação também remove seu histórico; portanto esse registro não é um histórico imutável de conformidade.

## Correções necessárias no material recebido

- **Status:** `pedidos.Status` é texto no banco (`Pendente`, `Entregue`, `Cancelado`), pois o Entity Framework converte o enum para string. O original usava inteiros e tratava `3` como cancelado; no enum da API, `3` é entregue e `4` é cancelado.
- **Compra:** foram acrescentadas as validações de conta ativa, endereço ativo pertencente à conta e produto ativo. O preço vem do catálogo atual, com desconto, em vez de confiar no preço antigo do carrinho. O total inclui a regra de frete da API.
- **Concorrência:** as procedures usam transação e bloqueio por usuário, com o mesmo nome de recurso usado na sincronização da API. O cancelamento também bloqueia o pedido. Compras/cancelamentos repetidos não devem duplicar a baixa ou a devolução.
- **Itens repetidos:** as quantidades da mesma variação são somadas antes de alterar o estoque.
- **Erros:** o tratamento desfaz a transação e preserva o erro SQL. As procedures de compra e cancelamento devem ser executadas fora de outra transação.
- **Entity Framework:** a tabela de variações foi configurada para aceitar a trigger sem usar `OUTPUT` direto. [Referência Microsoft](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/misc).
- **Reaplicação:** foi corrigida a verificação de coluna legada na migration anterior para permitir reaplicar o script idempotente após sua remoção.

## Como atualizar pelo Visual Studio

1. Atualize sua cópia do repositório. Quem baixou ZIP deve baixar a versão nova, preservando a configuração local.
2. Pare a API com **Shift + F5**.
3. Confira `API/ZeroFrame.API/appsettings.Development.local.json`: a conexão precisa apontar para o banco que você pretende atualizar. Em uma base com dados importantes, faça backup antes da atualização.
4. Selecione **Preparar banco** e clique no **Play**. A rotina aplica migrations, cria o catálogo somente se estiver vazio e verifica a estrutura.
5. A mensagem final deve informar **15 tabelas e 97 colunas**, além da trigger habilitada e das três procedures instaladas.
6. Inicie novamente no perfil **https** ou **https-celular**, conforme o [README](../README.md).

A atualização não substitui contas, endereços, carrinhos nem pedidos. Nenhum dado da instalação particular dos desenvolvedores é distribuído no repositório.

**Se o SQL original já foi executado manualmente:** não apague `HistoricoEstoque` nem marque a migration como aplicada para contornar erros. A migration normal cria essa tabela e pode parar se ela já existir. Compare o esquema e preserve seus registros antes de conciliar a instalação manual com o histórico de migrations. O original permite `DataAlteracao` nula; o modelo adaptado exige uma data. Esse cenário precisa de revisão específica, não foi migrado automaticamente.

## Relação entre API e procedures

O site e o aplicativo continuam chamando os serviços C# da API. O checkout C# mantém a seleção parcial de itens e as validações já existentes. **A API não chama as procedures de compra/cancelamento depois de executar a mesma operação em C#**: isso duplicaria efeitos.

A trigger, por sua vez, roda automaticamente quando a API muda o estoque. As procedures ficam disponíveis para uso administrativo direto no SQL Server, sem substituir a autenticação e autorização da API. Não dê acesso SQL a usuários da loja; não há identificação JWT nem conferência de propriedade do pedido dentro da procedure de cancelamento. Seu uso depende de permissões administrativas no banco.

Para consultar o histórico pelo Swagger, há um endpoint somente de administrador:

```http
GET /api/variacoes/{variacaoId}/historico-estoque?pageNumber=1&pageSize=10
Authorization: Bearer TOKEN_DO_ADMINISTRADOR
```

Retorna a lista paginada, do registro mais recente ao mais antigo. Sem login retorna 401; cliente comum recebe 403; variação inexistente retorna 404. Não foi criada uma tela nova para esse histórico.

## Testes realizados

Em uma base LocalDB isolada, foram verificados:

- Instalação das migrations desde uma base vazia e conferência de 15 tabelas/97 colunas.
- Atualização de uma base na versão anterior, preservando conta, carrinho, item e catálogo fictícios.
- Reaplicação do script idempotente duas vezes.
- Auditoria em múltiplas variações, ausência de registro quando o valor não muda e rollback do histórico.
- Checkout pela API, carrinho entre duas sessões, favoritos, endereços e permissões existentes.
- Procedures com endereço de outro usuário, falta de estoque, preço atual, frete e agrupamento de itens repetidos.
- Rejeição de cancelamento de pedido entregue, cancelamento repetido e atualização do pagamento.
- Duas compras simultâneas do mesmo carrinho e dois cancelamentos simultâneos do mesmo pedido.
- Histórico pela API com autenticação, papel de administrador, paginação e variação inexistente.

Para repetir os testes SQL, use **somente uma base descartável** com nome `ZeroFrame_Rotinas_*`, preparada com o catálogo demo original (produto de R$ 90). Os testes deixam contas e pedidos fictícios nessa base e alteram estoque. Não execute na base usada pela equipe.

No CMD, com SQLCMD instalado:

```cmd
sqlcmd -S "(localdb)\MSSQLLocalDB" -d ZeroFrame_Rotinas_Testes -E -b -f 65001 -i tests/rotinas-banco.sql
```

Com a API ligada a essa mesma base isolada:

```cmd
set ZEROFRAME_TEST_API=http://127.0.0.1:5155/api
set ZEROFRAME_TEST_DATABASE=ZeroFrame_Rotinas_Testes
node --test tests/integracao.test.mjs tests/navegacao.test.mjs tests/historico-estoque.test.mjs
```

A URL é a da instância de teste; ajuste a porta ao perfil usado. O teste de histórico usa SQLCMD e LocalDB. Não é preciso rodar esses testes para usar as telas normalmente.
