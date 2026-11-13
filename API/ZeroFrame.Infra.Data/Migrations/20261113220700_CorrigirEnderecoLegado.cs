using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZeroFrame.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class CorrigirEnderecoLegado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM enderecos WHERE EnderecoId IS NOT NULL)
                    THROW 51000, 'A coluna legada EnderecoId contém valores. Revise esses vínculos antes de atualizar.', 1;
                """);
            migrationBuilder.DropForeignKey("FK_enderecos_enderecos_EnderecoId", "enderecos");
            migrationBuilder.DropIndex("IX_enderecos_EnderecoId", "enderecos");
            migrationBuilder.DropColumn("EnderecoId", "enderecos");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>("EnderecoId", "enderecos", type: "int", nullable: true);
            migrationBuilder.CreateIndex("IX_enderecos_EnderecoId", "enderecos", "EnderecoId");
            migrationBuilder.AddForeignKey(
                "FK_enderecos_enderecos_EnderecoId", "enderecos", "EnderecoId", "enderecos",
                principalColumn: "Id");

        }
    }
}
