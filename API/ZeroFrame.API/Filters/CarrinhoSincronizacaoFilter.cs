using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using ZeroFrame.Infra.Data.Context;

namespace ZeroFrame.API.Filters;

// Serializa operações do carrinho da mesma conta entre processos e dispositivos.
public class CarrinhoSincronizacaoFilter(ApplicationDbContext banco) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var usuario = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (usuario is null) { await next(); return; }

        await banco.Database.OpenConnectionAsync(context.HttpContext.RequestAborted);
        var bloqueado = false;
        try
        {
            var resultado = await ExecutarAsync("sp_getapplock", usuario);
            if (resultado < 0)
            {
                context.Result = new ConflictObjectResult(new { mensagem = "O carrinho está sendo atualizado. Tente novamente." });
                return;
            }
            bloqueado = true;
            await next();
        }
        finally
        {
            try
            {
                if (bloqueado) await ExecutarAsync("sp_releaseapplock", usuario);
            }
            finally { await banco.Database.CloseConnectionAsync(); }
        }
    }

    private async Task<int> ExecutarAsync(string procedimento, string usuario)
    {
        await using var comando = banco.Database.GetDbConnection().CreateCommand();
        comando.CommandText = procedimento == "sp_getapplock"
            ? "DECLARE @resultado int; EXEC @resultado = sp_getapplock @Resource = @recurso, @LockOwner = 'Session', @LockMode = 'Exclusive', @LockTimeout = 10000; SELECT @resultado;"
            : "DECLARE @resultado int; EXEC @resultado = sp_releaseapplock @Resource = @recurso, @LockOwner = 'Session'; SELECT @resultado;";
        var parametro = comando.CreateParameter();
        parametro.ParameterName = "@recurso";
        parametro.Value = "ZeroFrame.Carrinho." + usuario;
        comando.Parameters.Add(parametro);
        return Convert.ToInt32(await comando.ExecuteScalarAsync());
    }
}
