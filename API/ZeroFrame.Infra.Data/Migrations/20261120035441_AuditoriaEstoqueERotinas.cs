using System;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZeroFrame.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AuditoriaEstoqueERotinas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HistoricoEstoque",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VariacaoProdutoId = table.Column<int>(type: "int", nullable: false),
                    QuantidadeAnterior = table.Column<int>(type: "int", nullable: false),
                    QuantidadeNova = table.Column<int>(type: "int", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricoEstoque", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricoEstoque_variacaoprodutos_VariacaoProdutoId",
                        column: x => x.VariacaoProdutoId,
                        principalTable: "variacaoprodutos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoricoEstoque_VariacaoProdutoId_DataAlteracao",
                table: "HistoricoEstoque",
                columns: new[] { "VariacaoProdutoId", "DataAlteracao" });

            using var stream = typeof(AuditoriaEstoqueERotinas).Assembly
                .GetManifestResourceStream("ZeroFrame.Sql.RotinasEstoque20261120.sql")!;
            using var reader = new System.IO.StreamReader(stream);
            foreach (var batch in Regex.Split(reader.ReadToEnd(), @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(batch))
                    migrationBuilder.Sql("EXEC(N'" + batch.Replace("'", "''") + "');");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS dbo.trg_AuditoriaEstoque;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_CancelarPedido;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_FinalizarPedidoAPartirDoCarrinho;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_ObterCategoriasComContagem;");
            migrationBuilder.DropTable(
                name: "HistoricoEstoque");
        }
    }
}
