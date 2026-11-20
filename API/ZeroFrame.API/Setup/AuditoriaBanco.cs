using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using ZeroFrame.Infra.Data.Context;

namespace ZeroFrame.API.Setup;

public static class AuditoriaBanco
{
    public static async Task VerificarAsync(ApplicationDbContext banco)
    {
        if (banco.Database.HasPendingModelChanges())
            throw new InvalidOperationException("O modelo tem alterações sem migration.");
        var pendentes = (await banco.Database.GetPendingMigrationsAsync()).ToArray();
        if (pendentes.Length > 0)
            throw new InvalidOperationException("Migrations pendentes: " + string.Join(", ", pendentes));

        var esperadas = banco.Model.GetEntityTypes().SelectMany(entidade =>
        {
            var tabela = StoreObjectIdentifier.Table(entidade.GetTableName()!, entidade.GetSchema());
            return entidade.GetProperties().Select(propriedade =>
                (Tabela: tabela.Name, Coluna: propriedade.GetColumnName(tabela)!,
                 Tipo: propriedade.GetColumnType()!, Anulavel: propriedade.IsColumnNullable(tabela)));
        }).ToHashSet();

        await banco.Database.OpenConnectionAsync();
        try
        {
            await using var comando = banco.Database.GetDbConnection().CreateCommand();
            comando.CommandText = """
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
                       NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME <> '__EFMigrationsHistory'
                """;
            var encontradas = new HashSet<(string Tabela, string Coluna, string Tipo, bool Anulavel)>();
            await using var leitor = await comando.ExecuteReaderAsync();
            while (await leitor.ReadAsync())
            {
                var tipo = leitor.GetString(2);
                if (tipo is "nvarchar" or "varchar" or "nchar" or "char" or "varbinary")
                {
                    var tamanho = leitor.GetInt32(3);
                    tipo += "(" + (tamanho == -1 ? "max" : tamanho.ToString()) + ")";
                }
                else if (tipo is "decimal" or "numeric")
                    tipo += "(" + leitor.GetByte(4) + "," + leitor.GetInt32(5) + ")";
                encontradas.Add((leitor.GetString(0), leitor.GetString(1), tipo, leitor.GetString(6) == "YES"));
            }
            var faltantes = esperadas.Except(encontradas).ToArray();
            var extras = encontradas.Except(esperadas).ToArray();
            if (faltantes.Length > 0 || extras.Length > 0)
                throw new InvalidOperationException(
                    "Diferenças de estrutura. Modelo: " + string.Join("; ", faltantes) +
                    ". Banco: " + string.Join("; ", extras));
            await leitor.CloseAsync();
            comando.CommandText = """
                SELECT COUNT(*) FROM sys.objects o
                WHERE o.schema_id = SCHEMA_ID('dbo') AND
                    (o.type = 'P' AND o.name IN ('sp_CancelarPedido', 'sp_FinalizarPedidoAPartirDoCarrinho', 'sp_ObterCategoriasComContagem')
                     OR o.type = 'TR' AND o.name = 'trg_AuditoriaEstoque'
                        AND o.parent_object_id = OBJECT_ID('dbo.variacaoprodutos')
                        AND EXISTS (SELECT 1 FROM sys.triggers t WHERE t.object_id = o.object_id AND t.is_disabled = 0))
                """;
            if (Convert.ToInt32(await comando.ExecuteScalarAsync()) != 4)
                throw new InvalidOperationException("A trigger de estoque ou as três procedures estão ausentes/desabilitadas. Revise a atualização do banco.");
            Console.WriteLine($"Banco conectado. {esperadas.Select(item => item.Tabela).Distinct().Count()} tabelas e {esperadas.Count} colunas conferidas com o modelo.");
            Console.WriteLine("Trigger de auditoria habilitada e três procedures instaladas.");
        }
        finally { await banco.Database.CloseConnectionAsync(); }
    }
}
