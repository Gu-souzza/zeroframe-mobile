using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZeroFrame.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class PersistirSuporte : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MensagensSuporte",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Assunto = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Mensagem = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensagensSuporte", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensagensSuporte_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MensagensSuporte_UsuarioId",
                table: "MensagensSuporte",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MensagensSuporte");
        }
    }
}
