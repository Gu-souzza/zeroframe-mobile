using Microsoft.EntityFrameworkCore;
using ZeroFrame.Domain.Entidades;
using ZeroFrame.Infra.Data.Context;

namespace ZeroFrame.API.Setup;

public static class CatalogoDemo
{
    public static async Task CarregarAsync(ApplicationDbContext banco)
    {
        if (await banco.produtos.AnyAsync())
        {
            Console.WriteLine("O catálogo já contém produtos. Importação ignorada.");
            return;
        }
        var categoria = await banco.categorias.FirstOrDefaultAsync(item => item.Nome == "Camisas");
        categoria ??= new Categoria { Nome = "Camisas", Descricao = "Catálogo de demonstração" };
        var produtos = new[]
        {
            new Produto { Nome = "Camisa Oversized Preta", Descricao = "Produto de demonstração do Zero Frame",
                Preco = 90, PrecoCusto = 45, Marca = "Zero Frame", Origem = "Originais", Genero = "Unissex",
                Categoria = categoria, ImagemUrl = "/catalogo-demo/camisa-oversized-preta.png", Ativo = true },
            new Produto { Nome = "Camisa Multimarcas", Descricao = "Produto de demonstração do Zero Frame",
                Preco = 120, PrecoCusto = 60, Marca = "Multimarcas", Origem = "Multimarcas", Genero = "Unissex",
                Categoria = categoria, ImagemUrl = "/catalogo-demo/camisa-baw-oversized.jpg", Ativo = true }
        };
        foreach (var produto in produtos)
        {
            produto.VariacoesProdutos =
            [
                new VariacaoProdutos { Tamanho = "M", Cor = "Preto", Estoque = 50 },
                new VariacaoProdutos { Tamanho = "G", Cor = "Preto", Estoque = 50 }
            ];
        }
        banco.produtos.AddRange(produtos);
        await banco.SaveChangesAsync();
        Console.WriteLine("Catálogo de demonstração criado.");
    }
}
