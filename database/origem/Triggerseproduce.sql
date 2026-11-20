--  TABELA DE SUPORTE: Histórico de Auditoria de Estoque
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HistoricoEstoque')
BEGIN
    CREATE TABLE HistoricoEstoque (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        VariacaoProdutoId INT NOT NULL,
        QuantidadeAnterior INT NOT NULL,
        QuantidadeNova INT NOT NULL,
        DataAlteracao DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_HistoricoEstoque_Variacao FOREIGN KEY (VariacaoProdutoId) 
            REFERENCES variacaoprodutos(Id) ON DELETE CASCADE
    );
END;
GO

--  TRIGGER: Auditoria Automática de Estoque (Produtos / Variações)
CREATE OR ALTER TRIGGER trg_AuditoriaEstoque
ON variacaoprodutos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Dispara apenas quando a coluna Estoque for alterada
    IF UPDATE(Estoque)
    BEGIN
        INSERT INTO HistoricoEstoque (VariacaoProdutoId, QuantidadeAnterior, QuantidadeNova, DataAlteracao)
        SELECT 
            inserted.Id, 
            deleted.Estoque, 
            inserted.Estoque, 
            GETDATE()
        FROM inserted
        INNER JOIN deleted ON inserted.Id = deleted.Id
        WHERE inserted.Estoque <> deleted.Estoque;
    END
END;
GO

--  PROCEDURE: Cancelar Pedido e Devolver Estoque (Pedidos)
CREATE OR ALTER PROCEDURE sp_CancelarPedido
    @PedidoId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @StatusAtual INT;
        SELECT @StatusAtual = Status FROM pedidos WHERE Id = @PedidoId;

        IF @StatusAtual IS NULL
        BEGIN
            RAISERROR('Pedido não encontrado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @StatusAtual = 3 -- StatusPedido.Cancelado
        BEGIN
            RAISERROR('Este pedido já está cancelado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Devolve as quantidades dos itens de volta para o estoque das variações
        UPDATE vp
        SET vp.Estoque = vp.Estoque + ip.Quantidade
        FROM variacaoprodutos vp
        INNER JOIN itemPedidos ip ON vp.Id = ip.VariacaoProdutoId
        WHERE ip.PedidoId = @PedidoId;

        -- Atualiza o status do pedido para Cancelado (3)
        UPDATE pedidos
        SET Status = 3
        WHERE Id = @PedidoId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

--  PROCEDURE: Finalizar Pedido a partir do Carrinho (Pedidos / Carrinho)
CREATE OR ALTER PROCEDURE sp_FinalizarPedidoAPartirDoCarrinho
    @UsuarioId INT,
    @EnderecoId INT,
    @NovoPedidoId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        --  Localiza o carrinho ativo do usuário
        DECLARE @CarrinhoId INT;
        SELECT @CarrinhoId = Id FROM carrinhos WHERE UsuarioId = @UsuarioId AND Ativo = 1;

        IF @CarrinhoId IS NULL
        BEGIN
            RAISERROR('Carrinho ativo não encontrado para este usuário.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM item_Carrinhos WHERE CarrinhoId = @CarrinhoId)
        BEGIN
            RAISERROR('O carrinho está vazio.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        --  Valida se há estoque suficiente para todos os itens do carrinho
        IF EXISTS (
            SELECT 1 
            FROM item_Carrinhos ic
            INNER JOIN variacaoprodutos vp ON ic.VariacaoProdutoId = vp.Id
            WHERE ic.CarrinhoId = @CarrinhoId AND vp.Estoque < ic.Quantidade
        )
        BEGIN
            RAISERROR('Estoque insuficiente para um ou mais itens do carrinho.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        --  Calcula o valor total do pedido
        DECLARE @ValorTotal DECIMAL(18,2);
        SELECT @ValorTotal = SUM(ic.Quantidade * ic.PrecoUnitario)
        FROM item_Carrinhos ic
        WHERE ic.CarrinhoId = @CarrinhoId;

        --  Cria o registro na tabela de pedidos
        INSERT INTO pedidos (UsuarioId, EnderecoId, DataPedido, Status, StatusEntrega, ValorTotal)
        VALUES (@UsuarioId, @EnderecoId, GETDATE(), 0, 'Pendente', @ValorTotal);

        SET @NovoPedidoId = SCOPE_IDENTITY();

        --  Copia os itens do carrinho para a tabela itemPedidos
        INSERT INTO itemPedidos (PedidoId, VariacaoProdutoId, Quantidade, PrecoUnitario, PrecoCustoUnitario)
        SELECT 
            @NovoPedidoId, 
            ic.VariacaoProdutoId, 
            ic.Quantidade, 
            ic.PrecoUnitario,
            p.PrecoCusto
        FROM item_Carrinhos ic
        INNER JOIN variacaoprodutos vp ON ic.VariacaoProdutoId = vp.Id
        INNER JOIN produtos p ON vp.ProdutoId = p.Id
        WHERE ic.CarrinhoId = @CarrinhoId;

        --  Abate a quantidade comprada do estoque das variações
        UPDATE vp
        SET vp.Estoque = vp.Estoque - ic.Quantidade
        FROM variacaoprodutos vp
        INNER JOIN item_Carrinhos ic ON vp.Id = ic.VariacaoProdutoId
        WHERE ic.CarrinhoId = @CarrinhoId;

        --  Inativa o carrinho processado
        UPDATE carrinhos SET Ativo = 0 WHERE Id = @CarrinhoId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

--  PROCEDURE: Consulta de Categorias com Contagem de Produtos (Categorias)
CREATE OR ALTER PROCEDURE sp_ObterCategoriasComContagem
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        c.Id,
        c.Nome,
        c.Descricao,
        COUNT(p.Id) AS QuantidadeProdutos
    FROM categorias c
    LEFT JOIN produtos p ON c.Id = p.CategoriaId AND p.Ativo = 1
    GROUP BY c.Id, c.Nome, c.Descricao;
END;
GO