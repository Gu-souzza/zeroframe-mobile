# Análise da API e do banco

Análise realizada em 13/11/2026 com os arquivos publicados e uma instalação SQL Server LocalDB de validação. A versão publicada na main do desktop continuava em `512cfa5`. A estrutura nova foi comparada com as migrations e testada em uma base isolada.

## Material disponível

O terceiro semestre fornece entidades, configurações Entity Framework, controllers, serviços, repositórios e seis migrations originais. A conexão SQL Server já era implementada. O repositório do frontend mobile fornece telas, tipos e dados simulados.

Os bancos locais encontrados foram `LojaVirtual` e a base `ZeroFrame_Compartilhado_Validacao` criada anteriormente nesta conversa. A análise do Zero Frame usa a base de validação e uma nova base de publicação. Não foi fornecido um backup, MDF ou script independente do banco atualizado pela equipe no quarto semestre. Portanto, alterações existentes exclusivamente nas máquinas dos colegas precisam de comparação adicional quando forem disponibilizadas.

## Estrutura do modelo

| Tabelas | Relação com a API |
| --- | --- |
| Usuarios | Login, registro, dados da conta, perfil e conta ativa |
| categorias, produtos | Catálogo, origem, marca, preço, desconto e vitrine |
| variacaoprodutos | Tamanho, cor e estoque por produto |
| carrinhos, item_Carrinhos | Carrinho ativo vinculado ao usuário e à variação |
| enderecos | Endereços vinculados ao usuário, endereço ativo e principal |
| pedidos, itemPedidos | Histórico, status e preços registrados na compra |
| Pagamentos | Registro de pagamento do pedido |
| AvaliacoesProdutos | Notas e comentários dos produtos |
| Favoritos, BuscasRecentes | Dados acrescentados para compartilhar as funções do mobile |
| MensagensSuporte | Mensagens gravadas no SQL Server com protocolo |

## Lacunas encontradas e tratamento

| Situação encontrada | Tratamento |
| --- | --- |
| Contrato do mobile diferente do contrato ASP.NET | Serviços do app adaptados para IDs numéricos, paginação, JWT e respostas reais |
| Favoritos do site apenas no navegador | Tabela e endpoints por conta, com importação explícita pelo site |
| Buscas recentes apenas na memória do app | Tabela e endpoints por usuário, com limite de cinco termos |
| Sem consulta dos próprios dados por um cliente | Endpoint autenticado `GET /api/usuarios/me` |
| Mobile escolhia só tamanho | Seleção de tamanho e cor pelo ID real da variação |
| Checkout com itens selecionados | Validação e compra parcial na transação, preservando itens restantes |
| Endereço usado em pedido removido fisicamente | Exclusão lógica para preservar o histórico |
| Conta excluída no app | Desativação e recusa dos tokens de contas inativas |
| Atualização de outro usuário acessível por regra antiga de papel | Rota administrativa restrita a administrador |
| Troca de e-mail podia ser enviada sem senha | Verificação da senha atual ao trocar o e-mail |
| Protocolo do suporte sem registro | Mensagem gravada no banco e identificador exclusivo |
| Coluna legada enderecos.EnderecoId na migration inicial ausente no modelo atual | Migration corretiva remove a relação acidental da tabela com ela mesma, após verificar que a coluna está vazia |
| Frete de pedido antigo recalculado ao consultar | Total persistido preservado e frete derivado desse total |
| Nota do produto fixa no app | Detalhe do app consulta o resumo real de avaliações |
| Paginação de produtos e categorias sem ordenação | Ordenação por ID para manter as páginas consistentes |
| Site servido junto da API dependia da porta fixa | Site usa a origem atual quando aberto em /desktop |
| Dois dispositivos alterando o carrinho da mesma conta | Operações de carrinho e pedido serializadas por conta com bloqueio no SQL Server |
| Configuração de conexão dependia da máquina original | Configuração local gerada com chave JWT particular e exemplo de LocalDB |

## Verificação reproduzível

`--verificar-banco` verifica a conexão, a ausência de mudanças de modelo sem migration, as migrations pendentes e as tabelas/colunas reais em `INFORMATION_SCHEMA.COLUMNS`. Compara nome, tipo SQL e nulabilidade das colunas com o modelo Entity Framework. Se houver diferença, o processo termina com erro e lista as diferenças.

Essa verificação cobre o esquema e a comunicação com o banco. Ela não certifica os dados pessoais, backups nem bancos particulares dos outros integrantes.

## Migrations

A sequência original é preservada. `DadosCompartilhados` acrescenta favoritos, buscas recentes e o campo principal do endereço. `PersistirSuporte` acrescenta o registro de mensagens. `CorrigirEnderecoLegado` remove a coluna e a chave estrangeira sem uso em endereços. Se houver valores nessa coluna, a atualização para e pede revisão antes da remoção.

Para conferir antes de atualizar uma instalação existente:

```powershell
dotnet ef migrations list --project API/ZeroFrame.Infra.Data --startup-project API/ZeroFrame.API
dotnet ef migrations script --idempotent --project API/ZeroFrame.Infra.Data --startup-project API/ZeroFrame.API --output atualizacao.sql
```

Faça backup da base existente e revise o SQL gerado com o responsável pelo banco. Use `ConnectionStrings__DefaultConnection` para selecionar a instalação correta.

## Frete

O cálculo atual usa o subtotal da compra. Até R$ 50 aplica 30%, até R$ 100 aplica 25%, até R$ 150 aplica 20% e acima de R$ 150 aplica frete grátis. Essa regra vem do projeto desktop. Uma cotação de transportadora por CEP exige definir provedor, origem, peso, medidas e credenciais.

## Resultado das verificações

O banco preparado para esta publicação apresentou 14 tabelas e 92 colunas compatíveis com o modelo. A instalação desde uma base vazia e a atualização da base de teste foram executadas. O teste HTTP passou com duas sessões da mesma conta e outra conta para conferir as permissões. A mensagem de suporte foi conferida diretamente no SQL Server.

Na interface do app, foram verificados cadastro, catálogo, seleção de variação e adição ao carrinho com frete calculado pela API. As verificações TypeScript e ESLint passaram. O teste em aparelho físico com esta revisão deve seguir o roteiro da equipe.
