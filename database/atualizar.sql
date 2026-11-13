IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [categorias] (
        [Id] int NOT NULL IDENTITY,
        [Nome] nvarchar(100) NOT NULL,
        [Descricao] nvarchar(300) NOT NULL,
        CONSTRAINT [PK_categorias] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [Usuarios] (
        [Id] int NOT NULL IDENTITY,
        [Nome] nvarchar(50) NOT NULL,
        [Email] nvarchar(100) NOT NULL,
        [Senha] nvarchar(50) NOT NULL,
        [Telefone] nvarchar(20) NOT NULL,
        [Ativo] bit NOT NULL,
        CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [produtos] (
        [Id] int NOT NULL IDENTITY,
        [Nome] nvarchar(100) NOT NULL,
        [Descricao] nvarchar(300) NOT NULL,
        [Preco] decimal(18,2) NOT NULL,
        [CategoriaId] int NOT NULL,
        [Ativo] bit NOT NULL,
        CONSTRAINT [PK_produtos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_produtos_categorias_CategoriaId] FOREIGN KEY ([CategoriaId]) REFERENCES [categorias] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [carrinhos] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [Ativo] bit NOT NULL,
        CONSTRAINT [PK_carrinhos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_carrinhos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [enderecos] (
        [Id] int NOT NULL IDENTITY,
        [Rua] nvarchar(150) NOT NULL,
        [Numero] nvarchar(20) NOT NULL,
        [Cidade] nvarchar(100) NOT NULL,
        [Estado] nvarchar(50) NOT NULL,
        [CEP] nvarchar(10) NOT NULL,
        [Ativo] bit NOT NULL,
        [UsuarioId] int NOT NULL,
        [EnderecoId] int NULL,
        CONSTRAINT [PK_enderecos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_enderecos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_enderecos_enderecos_EnderecoId] FOREIGN KEY ([EnderecoId]) REFERENCES [enderecos] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [pedidos] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [DataPedido] datetime2 NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [ValorTotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_pedidos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_pedidos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [variacaoprodutos] (
        [Id] int NOT NULL IDENTITY,
        [Tamanho] nvarchar(50) NOT NULL,
        [Cor] nvarchar(50) NOT NULL,
        [Estoque] int NOT NULL,
        [ProdutoId] int NOT NULL,
        CONSTRAINT [PK_variacaoprodutos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_variacaoprodutos_produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [produtos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [Pagamentos] (
        [Id] int NOT NULL IDENTITY,
        [Metodo] nvarchar(50) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [PedidoId] int NOT NULL,
        CONSTRAINT [PK_Pagamentos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Pagamentos_pedidos_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [pedidos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [item_Carrinhos] (
        [Id] int NOT NULL IDENTITY,
        [CarrinhoId] int NOT NULL,
        [VariacaoProdutoId] int NOT NULL,
        [Quantidade] int NOT NULL,
        [PrecoUnitario] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_item_Carrinhos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_item_Carrinhos_carrinhos_CarrinhoId] FOREIGN KEY ([CarrinhoId]) REFERENCES [carrinhos] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_item_Carrinhos_variacaoprodutos_VariacaoProdutoId] FOREIGN KEY ([VariacaoProdutoId]) REFERENCES [variacaoprodutos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE TABLE [itemPedidos] (
        [Id] int NOT NULL IDENTITY,
        [PedidoId] int NOT NULL,
        [VariacaoProdutoId] int NOT NULL,
        [Quantidade] int NOT NULL,
        [PrecoUnitario] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_itemPedidos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_itemPedidos_pedidos_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [pedidos] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_itemPedidos_variacaoprodutos_VariacaoProdutoId] FOREIGN KEY ([VariacaoProdutoId]) REFERENCES [variacaoprodutos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_carrinhos_UsuarioId] ON [carrinhos] ([UsuarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_enderecos_EnderecoId] ON [enderecos] ([EnderecoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_enderecos_UsuarioId] ON [enderecos] ([UsuarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_item_Carrinhos_CarrinhoId] ON [item_Carrinhos] ([CarrinhoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_item_Carrinhos_VariacaoProdutoId] ON [item_Carrinhos] ([VariacaoProdutoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_itemPedidos_PedidoId] ON [itemPedidos] ([PedidoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_itemPedidos_VariacaoProdutoId] ON [itemPedidos] ([VariacaoProdutoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Pagamentos_PedidoId] ON [Pagamentos] ([PedidoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_pedidos_UsuarioId] ON [pedidos] ([UsuarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_produtos_CategoriaId] ON [produtos] ([CategoriaId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_variacaoprodutos_ProdutoId] ON [variacaoprodutos] ([ProdutoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260424181536_InitialMigration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260424181536_InitialMigration', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260504152310_AddProdutoCamposVitrine'
)
BEGIN
    ALTER TABLE [produtos] ADD [ImagemUrl] nvarchar(300) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260504152310_AddProdutoCamposVitrine'
)
BEGIN
    ALTER TABLE [produtos] ADD [Marca] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260504152310_AddProdutoCamposVitrine'
)
BEGIN
    ALTER TABLE [produtos] ADD [Origem] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260504152310_AddProdutoCamposVitrine'
)
BEGIN
    ALTER TABLE [produtos] ADD [PrecoOriginal] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260504152310_AddProdutoCamposVitrine'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260504152310_AddProdutoCamposVitrine', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260506222635_AddPerfilUsuario'
)
BEGIN
    ALTER TABLE [Usuarios] ADD [Perfil] nvarchar(20) NOT NULL DEFAULT N'Cliente';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260506222635_AddPerfilUsuario'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260506222635_AddPerfilUsuario', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260506230408_AjustaTamanhoSenhaParaBCrypt'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Usuarios]') AND [c].[name] = N'Senha');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Usuarios] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [Usuarios] ALTER COLUMN [Senha] nvarchar(100) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260506230408_AjustaTamanhoSenhaParaBCrypt'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260506230408_AjustaTamanhoSenhaParaBCrypt', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260511031932_AddUsuarioEmailUnico'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Usuarios_Email] ON [Usuarios] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260511031932_AddUsuarioEmailUnico'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260511031932_AddUsuarioEmailUnico', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [Cor] nvarchar(50) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [Desconto] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [Genero] nvarchar(50) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [PrecoCusto] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [SecaoVitrine] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [TamanhosDisponiveis] nvarchar(300) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [TipoDesconto] nvarchar(20) NOT NULL DEFAULT N'nenhum';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [produtos] ADD [TipoTamanho] nvarchar(50) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [pedidos] ADD [DataEntrega] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [pedidos] ADD [EnderecoId] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [pedidos] ADD [PrevisaoEntrega] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [pedidos] ADD [StatusEntrega] nvarchar(30) NOT NULL DEFAULT N'Pendente';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [itemPedidos] ADD [PrecoCustoUnitario] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [enderecos] ADD [Bairro] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [enderecos] ADD [Complemento] nvarchar(150) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    CREATE TABLE [AvaliacoesProdutos] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [ProdutoId] int NOT NULL,
        [Nota] decimal(2,1) NOT NULL,
        [Comentario] nvarchar(500) NULL,
        [Ativo] bit NOT NULL,
        [DataCriacao] datetime2 NOT NULL,
        [DataAtualizacao] datetime2 NULL,
        CONSTRAINT [PK_AvaliacoesProdutos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AvaliacoesProdutos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AvaliacoesProdutos_produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [produtos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    CREATE INDEX [IX_pedidos_EnderecoId] ON [pedidos] ([EnderecoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    CREATE INDEX [IX_AvaliacoesProdutos_ProdutoId] ON [AvaliacoesProdutos] ([ProdutoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AvaliacoesProdutos_UsuarioId_ProdutoId] ON [AvaliacoesProdutos] ([UsuarioId], [ProdutoId]) WHERE [Ativo] = 1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    ALTER TABLE [pedidos] ADD CONSTRAINT [FK_pedidos_enderecos_EnderecoId] FOREIGN KEY ([EnderecoId]) REFERENCES [enderecos] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523032503_AddAdminDashboardFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260523032503_AddAdminDashboardFields', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261109031034_DadosCompartilhados'
)
BEGIN
    ALTER TABLE [enderecos] ADD [Principal] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261109031034_DadosCompartilhados'
)
BEGIN
    CREATE TABLE [BuscasRecentes] (
        [UsuarioId] int NOT NULL,
        [Chave] nvarchar(120) NOT NULL,
        [Termo] nvarchar(120) NOT NULL,
        [AtualizadaEm] datetime2 NOT NULL,
        CONSTRAINT [PK_BuscasRecentes] PRIMARY KEY ([UsuarioId], [Chave]),
        CONSTRAINT [FK_BuscasRecentes_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261109031034_DadosCompartilhados'
)
BEGIN
    CREATE TABLE [Favoritos] (
        [UsuarioId] int NOT NULL,
        [ProdutoId] int NOT NULL,
        [CriadoEm] datetime2 NOT NULL,
        CONSTRAINT [PK_Favoritos] PRIMARY KEY ([UsuarioId], [ProdutoId]),
        CONSTRAINT [FK_Favoritos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Favoritos_produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [produtos] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261109031034_DadosCompartilhados'
)
BEGIN
    CREATE INDEX [IX_Favoritos_ProdutoId] ON [Favoritos] ([ProdutoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261109031034_DadosCompartilhados'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261109031034_DadosCompartilhados', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220330_PersistirSuporte'
)
BEGIN
    CREATE TABLE [MensagensSuporte] (
        [Id] uniqueidentifier NOT NULL,
        [UsuarioId] int NOT NULL,
        [Categoria] nvarchar(40) NOT NULL,
        [Assunto] nvarchar(120) NOT NULL,
        [Mensagem] nvarchar(max) NOT NULL,
        [CriadaEm] datetime2 NOT NULL,
        CONSTRAINT [PK_MensagensSuporte] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MensagensSuporte_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220330_PersistirSuporte'
)
BEGIN
    CREATE INDEX [IX_MensagensSuporte_UsuarioId] ON [MensagensSuporte] ([UsuarioId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220330_PersistirSuporte'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261113220330_PersistirSuporte', N'10.0.7');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220700_CorrigirEnderecoLegado'
)
BEGIN
    IF EXISTS (SELECT 1 FROM enderecos WHERE EnderecoId IS NOT NULL)
        THROW 51000, 'A coluna legada EnderecoId contém valores. Revise esses vínculos antes de atualizar.', 1;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220700_CorrigirEnderecoLegado'
)
BEGIN
    ALTER TABLE [enderecos] DROP CONSTRAINT [FK_enderecos_enderecos_EnderecoId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220700_CorrigirEnderecoLegado'
)
BEGIN
    DROP INDEX [IX_enderecos_EnderecoId] ON [enderecos];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220700_CorrigirEnderecoLegado'
)
BEGIN
    DECLARE @var1 nvarchar(max);
    SELECT @var1 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[enderecos]') AND [c].[name] = N'EnderecoId');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [enderecos] DROP CONSTRAINT ' + @var1 + ';');
    ALTER TABLE [enderecos] DROP COLUMN [EnderecoId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261113220700_CorrigirEnderecoLegado'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261113220700_CorrigirEnderecoLegado', N'10.0.7');
END;

COMMIT;
GO

