using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeroFrame.Application.DTOS.Common;
using ZeroFrame.Domain.Entidades;
using ZeroFrame.Infra.Data.Context;

namespace ZeroFrame.API.Controllers;

[ApiController]
[Authorize(Roles = "Administrador")]
[Route("api/variacoes/{variacaoId:int}/historico-estoque")]
public class HistoricoEstoqueController(ApplicationDbContext banco) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<HistoricoEstoque>>> Listar(
        int variacaoId, [FromQuery] PaginationParams paginacao, CancellationToken cancellationToken)
    {
        if (!await banco.variacaoprodutos.AnyAsync(item => item.Id == variacaoId, cancellationToken))
            return NotFound(new { mensagem = "Variação não encontrada." });
        var consulta = banco.HistoricoEstoque.AsNoTracking().Where(item => item.VariacaoProdutoId == variacaoId);
        var total = await consulta.CountAsync(cancellationToken);
        var itens = await consulta.OrderByDescending(item => item.Id)
            .Skip(paginacao.Skip).Take(paginacao.PageSize).ToListAsync(cancellationToken);
        return Ok(PagedResponse<HistoricoEstoque>.Create(itens, total, paginacao));
    }
}
