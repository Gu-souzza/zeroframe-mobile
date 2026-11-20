namespace ZeroFrame.Domain.Entidades;

// Preenchido automaticamente pela trigger, na mesma transação da alteração.
public class HistoricoEstoque
{
    public int Id { get; set; }
    public int VariacaoProdutoId { get; set; }
    public int QuantidadeAnterior { get; set; }
    public int QuantidadeNova { get; set; }
    public DateTime DataAlteracao { get; set; }
}
