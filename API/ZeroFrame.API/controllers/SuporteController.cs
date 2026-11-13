using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ZeroFrame.Application.DTOS;
using ZeroFrame.Domain.Entidades;
using ZeroFrame.Infra.Data.Context;

namespace ZeroFrame.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/suporte")]
    public class SuporteController(ApplicationDbContext banco) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> EnviarMensagem(SuportePostDto suportePostDto)
        {
            var registro = new MensagemSuporte
            {
                Id = Guid.NewGuid(),
                UsuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
                Categoria = suportePostDto.Categoria.Trim(),
                Assunto = suportePostDto.Assunto.Trim(),
                Mensagem = suportePostDto.Mensagem.Trim(),
                CriadaEm = DateTime.UtcNow
            };
            banco.MensagensSuporte.Add(registro);
            await banco.SaveChangesAsync();
            return Ok(new
            {
                mensagem = "Mensagem de suporte recebida com sucesso.",
                protocolo = registro.Id.ToString()
            });
        }
    }
}
