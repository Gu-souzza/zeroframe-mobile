namespace ZeroFrame.Domain.Entidades;

public class MensagemSuporte
{
    public Guid Id { get; set; }
    public int UsuarioId { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string Assunto { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime CriadaEm { get; set; }
}
