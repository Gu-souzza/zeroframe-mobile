-- Complemento adaptado de Triggerseproduce.sql. A instalação normal é feita por migration.
-- A tabela HistoricoEstoque é criada pela migration antes destas rotinas.
CREATE OR ALTER TRIGGER dbo.trg_AuditoriaEstoque
ON dbo.variacaoprodutos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Estoque)
        INSERT INTO dbo.HistoricoEstoque
            (VariacaoProdutoId, QuantidadeAnterior, QuantidadeNova, DataAlteracao)
        SELECT i.Id, d.Estoque, i.Estoque, GETUTCDATE()
        FROM inserted i INNER JOIN deleted d ON i.Id = d.Id
        WHERE i.Estoque <> d.Estoque;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_CancelarPedido
    @PedidoId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @@TRANCOUNT <> 0 THROW 51001, 'Execute esta procedure fora de outra transação.', 1;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @UsuarioId INT, @Status NVARCHAR(30), @Recurso NVARCHAR(255), @Bloqueio INT;
        SELECT @UsuarioId = UsuarioId FROM dbo.pedidos WHERE Id = @PedidoId;
        IF @UsuarioId IS NULL THROW 51001, 'Pedido não encontrado.', 1;
        SET @Recurso = CONCAT('ZeroFrame.Carrinho.', @UsuarioId);
        EXEC @Bloqueio = sys.sp_getapplock @Resource=@Recurso, @LockOwner='Transaction',
            @LockMode='Exclusive', @LockTimeout=10000;
        IF @Bloqueio < 0 THROW 51001, 'Pedido sendo atualizado. Tente novamente.', 1;
        SELECT @Status = Status FROM dbo.pedidos WITH (UPDLOCK, HOLDLOCK) WHERE Id = @PedidoId;
        -- Idempotente: repetir a chamada não devolve estoque duas vezes.
        IF @Status = N'Cancelado' BEGIN COMMIT; RETURN; END;
        IF @Status NOT IN (N'Pendente', N'PreparandoParaSaida', N'SaiuParaEntrega')
            THROW 51001, 'Não é permitido cancelar um pedido entregue ou com status inválido.', 1;
        ;WITH Quantidades AS (
            SELECT VariacaoProdutoId, SUM(Quantidade) Quantidade
            FROM dbo.itemPedidos WHERE PedidoId = @PedidoId GROUP BY VariacaoProdutoId
        )
        UPDATE vp SET Estoque = vp.Estoque + q.Quantidade
        FROM dbo.variacaoprodutos vp JOIN Quantidades q ON q.VariacaoProdutoId = vp.Id;
        UPDATE dbo.pedidos SET Status=N'Cancelado', StatusEntrega=N'Cancelado' WHERE Id=@PedidoId;
        UPDATE dbo.Pagamentos SET Status=N'Cancelado' WHERE PedidoId=@PedidoId;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_FinalizarPedidoAPartirDoCarrinho
    @UsuarioId INT,
    @EnderecoId INT,
    @NovoPedidoId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @NovoPedidoId = NULL;
    IF @@TRANCOUNT <> 0 THROW 51001, 'Execute esta procedure fora de outra transação.', 1;
    BEGIN TRY
        BEGIN TRANSACTION;
        DECLARE @Recurso NVARCHAR(255)=CONCAT('ZeroFrame.Carrinho.', @UsuarioId), @Bloqueio INT;
        EXEC @Bloqueio = sys.sp_getapplock @Resource=@Recurso, @LockOwner='Transaction',
            @LockMode='Exclusive', @LockTimeout=10000;
        IF @Bloqueio < 0 THROW 51001, 'Carrinho sendo atualizado. Tente novamente.', 1;
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WITH (HOLDLOCK) WHERE Id=@UsuarioId AND Ativo=1)
            THROW 51001, 'Usuário ativo não encontrado.', 1;
        IF NOT EXISTS (SELECT 1 FROM dbo.enderecos WITH (HOLDLOCK) WHERE Id=@EnderecoId AND UsuarioId=@UsuarioId AND Ativo=1)
            THROW 51001, 'Endereço ativo não pertence ao usuário.', 1;
        DECLARE @CarrinhoId INT;
        IF (SELECT COUNT(*) FROM dbo.carrinhos WITH (UPDLOCK,HOLDLOCK) WHERE UsuarioId=@UsuarioId AND Ativo=1) <> 1
            THROW 51001, 'É necessário exatamente um carrinho ativo.', 1;
        SELECT @CarrinhoId=Id FROM dbo.carrinhos WHERE UsuarioId=@UsuarioId AND Ativo=1;
        DECLARE @Itens TABLE (VariacaoProdutoId INT PRIMARY KEY, Quantidade INT, PrecoUnitario DECIMAL(18,4), PrecoCustoUnitario DECIMAL(18,2));
        INSERT INTO @Itens
        SELECT vp.Id, SUM(ic.Quantidade),
            CASE LOWER(LTRIM(RTRIM(p.TipoDesconto)))
                WHEN 'porcentagem' THEN p.Preco - p.Preco * p.Desconto / 100
                WHEN 'fixo' THEN p.Preco - p.Desconto ELSE p.Preco END,
            p.PrecoCusto
        FROM dbo.item_Carrinhos ic WITH (UPDLOCK,HOLDLOCK)
        JOIN dbo.variacaoprodutos vp WITH (UPDLOCK,HOLDLOCK) ON vp.Id=ic.VariacaoProdutoId
        JOIN dbo.produtos p WITH (HOLDLOCK) ON p.Id=vp.ProdutoId
        WHERE ic.CarrinhoId=@CarrinhoId
        GROUP BY vp.Id,p.TipoDesconto,p.Preco,p.Desconto,p.PrecoCusto;
        IF NOT EXISTS (SELECT 1 FROM @Itens) THROW 51001, 'O carrinho está vazio.', 1;
        IF EXISTS (SELECT 1 FROM dbo.item_Carrinhos WHERE CarrinhoId=@CarrinhoId AND Quantidade<=0)
            THROW 51001, 'Quantidade inválida no carrinho.', 1;
        IF EXISTS (SELECT 1 FROM @Itens i JOIN dbo.variacaoprodutos vp ON vp.Id=i.VariacaoProdutoId
                   JOIN dbo.produtos p ON p.Id=vp.ProdutoId WHERE p.Ativo=0 OR vp.Estoque<i.Quantidade)
            THROW 51001, 'Produto inativo ou estoque insuficiente.', 1;
        DECLARE @Subtotal DECIMAL(18,4), @Frete DECIMAL(18,2);
        SELECT @Subtotal=SUM(Quantidade*PrecoUnitario) FROM @Itens;
        SET @Frete=ROUND(@Subtotal * CASE WHEN @Subtotal<=0 THEN 0 WHEN @Subtotal<=50 THEN 0.30
                         WHEN @Subtotal<=100 THEN 0.25 WHEN @Subtotal<=150 THEN 0.20 ELSE 0 END,2);
        INSERT INTO dbo.pedidos (UsuarioId,EnderecoId,DataPedido,Status,StatusEntrega,ValorTotal)
        VALUES (@UsuarioId,@EnderecoId,GETUTCDATE(),N'Pendente',N'Pendente',@Subtotal+@Frete);
        SET @NovoPedidoId=CONVERT(INT,SCOPE_IDENTITY());
        INSERT INTO dbo.itemPedidos (PedidoId,VariacaoProdutoId,Quantidade,PrecoUnitario,PrecoCustoUnitario)
        SELECT @NovoPedidoId,VariacaoProdutoId,Quantidade,PrecoUnitario,PrecoCustoUnitario FROM @Itens;
        UPDATE vp SET Estoque=vp.Estoque-i.Quantidade
        FROM dbo.variacaoprodutos vp JOIN @Itens i ON i.VariacaoProdutoId=vp.Id;
        UPDATE dbo.carrinhos SET Ativo=0 WHERE Id=@CarrinhoId;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET @NovoPedidoId=NULL;
        THROW;
    END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ObterCategoriasComContagem
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.Id,c.Nome,c.Descricao,COUNT(p.Id) AS QuantidadeProdutos
    FROM dbo.categorias c
    LEFT JOIN dbo.produtos p ON p.CategoriaId=c.Id AND p.Ativo=1
    GROUP BY c.Id,c.Nome,c.Descricao
    ORDER BY c.Nome,c.Id;
END;
GO
