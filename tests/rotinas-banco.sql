-- Usar somente em base isolada com catálogo demo. Deixa registros fictícios para inspeção.
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF DB_NAME() NOT LIKE 'ZeroFrame[_]Rotinas[_]%'
    THROW 51000, 'Teste permitido somente em banco ZeroFrame_Rotinas_*. Nunca use na base real.', 1;
DECLARE @V INT=(SELECT MIN(Id) FROM dbo.variacaoprodutos), @V2 INT, @U INT, @U2 INT, @E INT, @E2 INT,
        @C INT, @P INT, @Antes INT, @Hist INT, @Contagem INT, @Erro BIT;
SELECT @V2=MIN(Id) FROM dbo.variacaoprodutos WHERE Id>@V;
IF @V IS NULL OR @V2 IS NULL THROW 51000,'Prepare o catálogo demo antes do teste.',1;
-- Trigger multirregistro e nenhuma auditoria para UPDATE sem mudança real.
SELECT @Hist=COUNT(*) FROM dbo.HistoricoEstoque;
UPDATE dbo.variacaoprodutos SET Estoque=Estoque+10 WHERE Id IN (@V,@V2);
IF (SELECT COUNT(*) FROM dbo.HistoricoEstoque)<>@Hist+2 THROW 51000,'Falhou auditoria multirregistro.',1;
UPDATE dbo.variacaoprodutos SET Estoque=Estoque WHERE Id IN (@V,@V2);
IF (SELECT COUNT(*) FROM dbo.HistoricoEstoque)<>@Hist+2 THROW 51000,'UPDATE sem mudança gerou histórico.',1;
-- Histórico deve acompanhar o rollback.
BEGIN TRANSACTION;
UPDATE dbo.variacaoprodutos SET Estoque=Estoque-1 WHERE Id=@V;
ROLLBACK;
IF (SELECT COUNT(*) FROM dbo.HistoricoEstoque)<>@Hist+2 THROW 51000,'Histórico não respeitou rollback.',1;
INSERT INTO dbo.Usuarios(Nome,Email,Senha,Telefone,Perfil,Ativo)
VALUES(N'Teste SQL',CONCAT(NEWID(),'@example.com'),'nao-utilizavel','11999999999','Cliente',1);
SET @U=SCOPE_IDENTITY();
INSERT INTO dbo.Usuarios(Nome,Email,Senha,Telefone,Perfil,Ativo)
VALUES(N'Outro Teste SQL',CONCAT(NEWID(),'@example.com'),'nao-utilizavel','11999999999','Cliente',1);
SET @U2=SCOPE_IDENTITY();
INSERT INTO dbo.enderecos(Rua,Numero,Bairro,Cidade,Estado,CEP,Ativo,Principal,UsuarioId)
VALUES('Rua Teste','1','Centro','Sao Paulo','SP','01001000',1,1,@U);
SET @E=SCOPE_IDENTITY();
INSERT INTO dbo.enderecos(Rua,Numero,Bairro,Cidade,Estado,CEP,Ativo,Principal,UsuarioId)
VALUES('Rua Teste','2','Centro','Sao Paulo','SP','01001000',1,1,@U2);
SET @E2=SCOPE_IDENTITY();
INSERT INTO dbo.carrinhos(UsuarioId,Ativo) VALUES(@U,1);
SET @C=SCOPE_IDENTITY();
-- Duas linhas da mesma variação: a baixa e a devolução devem usar a soma.
INSERT INTO dbo.item_Carrinhos(CarrinhoId,VariacaoProdutoId,Quantidade,PrecoUnitario)
VALUES(@C,@V,1,0.01),(@C,@V,1,0.01);
SELECT @Antes=Estoque FROM dbo.variacaoprodutos WHERE Id=@V;
SELECT @Contagem=COUNT(*) FROM dbo.pedidos;
SET @Erro=0;
BEGIN TRY EXEC dbo.sp_FinalizarPedidoAPartirDoCarrinho @U,@E2,@P OUTPUT; END TRY
BEGIN CATCH IF ERROR_NUMBER()=51001 SET @Erro=1; ELSE THROW; END CATCH;
IF @Erro=0 OR @P IS NOT NULL THROW 51000,'Endereço de outro usuário foi aceito.',1;
IF (SELECT COUNT(*) FROM dbo.pedidos)<>@Contagem THROW 51000,'Falha não reverteu pedido.',1;
EXEC dbo.sp_FinalizarPedidoAPartirDoCarrinho @U,@E,@P OUTPUT;
IF @P IS NULL THROW 51000,'Pedido não criado.',1;
IF (SELECT Estoque FROM dbo.variacaoprodutos WHERE Id=@V)<>@Antes-2 THROW 51000,'Baixa agregada incorreta.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.pedidos WHERE Id=@P AND Status='Pendente' AND ValorTotal=180)
    THROW 51000,'Status textual ou preço atual incorreto; prepare catálogo demo a R$90.',1;
IF (SELECT Ativo FROM dbo.carrinhos WHERE Id=@C)<>0 THROW 51000,'Carrinho não foi inativado.',1;
INSERT INTO dbo.Pagamentos(Metodo,Status,PedidoId) VALUES('Teste','Pendente',@P);
-- Entregue não pode voltar a cancelado.
UPDATE dbo.pedidos SET Status='Entregue',StatusEntrega='Entregue' WHERE Id=@P;
SET @Erro=0;
BEGIN TRY EXEC dbo.sp_CancelarPedido @P; END TRY
BEGIN CATCH IF ERROR_NUMBER()=51001 SET @Erro=1; ELSE THROW; END CATCH;
IF @Erro=0 THROW 51000,'Pedido entregue foi cancelado.',1;
UPDATE dbo.pedidos SET Status='Pendente',StatusEntrega='Pendente' WHERE Id=@P;
EXEC dbo.sp_CancelarPedido @P;
EXEC dbo.sp_CancelarPedido @P;
IF (SELECT Estoque FROM dbo.variacaoprodutos WHERE Id=@V)<>@Antes THROW 51000,'Cancelamento repetido duplicou estoque.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.pedidos WHERE Id=@P AND Status='Cancelado' AND StatusEntrega='Cancelado')
    THROW 51000,'Status do cancelamento incorreto.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.Pagamentos WHERE PedidoId=@P AND Status='Cancelado') THROW 51000,'Pagamento não cancelado.',1;
-- Novo carrinho: estoque insuficiente deve desfazer tudo.
INSERT INTO dbo.carrinhos(UsuarioId,Ativo) VALUES(@U,1);
SET @C=SCOPE_IDENTITY();
INSERT INTO dbo.item_Carrinhos(CarrinhoId,VariacaoProdutoId,Quantidade,PrecoUnitario)
VALUES(@C,@V,@Antes+100,0.01);
SELECT @Contagem=COUNT(*) FROM dbo.pedidos;
SELECT @Hist=COUNT(*) FROM dbo.HistoricoEstoque;
SET @Erro=0;
BEGIN TRY EXEC dbo.sp_FinalizarPedidoAPartirDoCarrinho @U,@E,@P OUTPUT; END TRY
BEGIN CATCH IF ERROR_NUMBER()=51001 SET @Erro=1; ELSE THROW; END CATCH;
IF @Erro=0 OR (SELECT COUNT(*) FROM dbo.pedidos)<>@Contagem OR (SELECT COUNT(*) FROM dbo.HistoricoEstoque)<>@Hist
    THROW 51000,'Compra sem estoque não foi revertida.',1;
-- Frete deve usar o preço atual, mesmo que o preço do carrinho esteja desatualizado.
UPDATE dbo.item_Carrinhos SET Quantidade=1 WHERE CarrinhoId=@C;
EXEC dbo.sp_FinalizarPedidoAPartirDoCarrinho @U,@E,@P OUTPUT;
IF NOT EXISTS(SELECT 1 FROM dbo.pedidos WHERE Id=@P AND ValorTotal=112.50) THROW 51000,'Frete incorreto.',1;
DECLARE @Categorias TABLE(Id INT,Nome NVARCHAR(100),Descricao NVARCHAR(300),QuantidadeProdutos INT);
INSERT INTO @Categorias EXEC dbo.sp_ObterCategoriasComContagem;
IF NOT EXISTS(SELECT 1 FROM @Categorias WHERE QuantidadeProdutos>=2) THROW 51000,'Contagem de categorias incorreta.',1;
PRINT 'OK: trigger multirregistro, ausência de mudança, rollback, propriedade do endereço, baixa agregada, status textual, preço atual, frete, cancelamento idempotente, pagamento e categorias.';
