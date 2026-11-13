/**
 * Tipos de dados compartilhados entre telas e serviços.
 *
 * Os serviços usam estes formatos nas respostas da API.
 */
import type { ImageSource } from 'expo-image';

/** Usuário autenticado. */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

/** Dados enviados na tela de login. */
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

/** Dados enviados na tela de registro. */
export interface DadosRegistro {
  nome: string;
  email: string;
  /** Somente dígitos, com DDD. Ex.: "11987654321" */
  telefone: string;
  senha: string;
}

/** Resposta esperada dos endpoints de autenticação. */
export interface RespostaAutenticacao {
  usuario: Usuario;
  /** Token (ex.: JWT) que deverá ir no header Authorization das próximas chamadas. */
  token: string;
}

/** Imagem local (`require`, no mock) ou remota (`{ uri }`, vinda da API). */
export type Imagem = ImageSource | number;

export type Genero = 'masculino' | 'feminino' | 'unissex';

export interface VariacaoProduto {
  id: number;
  tamanho: string;
  cor: string;
  estoque: number;
}

/** Produto exibido nos cards, na busca e na tela de detalhes. */
export interface Produto {
  id: string;
  nome: string;
  /** Texto exibido no card: categoria + marca, ex.: "Calçados - Multimarcas" */
  categoria: string;
  /** Id da categoria (ver `Categoria.id`), usado na busca e nos filtros. Ex.: "calcados" */
  categoriaId: string;
  /** Marca/linha: "Multimarcas" ou "Zero Frame". */
  marca: string;
  origem?: string;
  variacoes: VariacaoProduto[];
  genero: Genero;
  /** Preço atual em reais (número, não string). Ex.: 1100 */
  preco: number;
  /** Preço "de" (riscado) quando o produto está em promoção. */
  precoOriginal?: number;
  /** Quantidade de parcelas sem juros. */
  parcelas: number;
  /** Nota média de avaliação (0 a 5). */
  nota: number;
  /** Tamanhos disponíveis, na ordem de exibição. Ex.: ["P", "M", "G", "GG"] */
  tamanhos: string[];
  /** Cores disponíveis (usadas no filtro "Cor"). */
  cores: string[];
  /**
   * Imagem principal (cards). Hoje é um `require` local (mock); com a API
   * será `{ uri: 'https://...' }` vindo do backend.
   */
  imagem: Imagem;
  /** Galeria da tela do produto. Se ausente, usa só `imagem`. */
  imagens?: Imagem[];
}

/** Categoria exibida no carrossel da tela inicial e nos cards da pesquisa. */
export interface Categoria {
  id: string;
  nome: string;
  imagem: Imagem;
}

/**
 * Status de um pedido (selo colorido do card em "Meus pedidos").
 * - Em andamento: pendente, preparando, saiu_para_entrega
 * - Concluídos:   entregue, concluido, cancelado
 * `concluido` é o status dos pedidos criados pelo botão "finalizar compra"
 * enquanto não existe tela de pagamento (mesmo padrão da versão web).
 */
export type StatusPedido =
  | 'pendente'
  | 'preparando'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'concluido'
  | 'cancelado';

export interface ItemPedido {
  produtoId: string;
  nome: string;
  imagem: Imagem;
  tamanho: string;
  cor?: string;
  quantidade: number;
  /** Preço unitário pago. */
  precoUnitario: number;
  /** Preço unitário sem desconto (se o produto estava em promoção). */
  precoOriginalUnitario?: number;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

/** Endereço cadastrado pelo usuário (tela "Meus endereços"). */
export interface EnderecoSalvo extends Endereco {
  id: string;
  /** Endereço padrão de entrega (selo "Principal"). Só um pode ser principal. */
  principal: boolean;
}

/** Assunto escolhido na tela "Ajuda e suporte". */
export type CategoriaSuporte = 'pedido' | 'produto' | 'entrega' | 'pagamento' | 'conta' | 'outro';

export interface MensagemSuporte {
  categoria: CategoriaSuporte;
  assunto: string;
  mensagem: string;
  /** Pedido relacionado, quando aberto pelo botão "preciso de ajuda com este pedido". */
  pedidoId?: string;
}

/** Datas (ISO) em que o pedido passou por cada etapa da entrega. */
export interface EtapasPedido {
  recebido?: string;
  preparando?: string;
  saiuParaEntrega?: string;
  entregue?: string;
}

export interface Pedido {
  id: string;
  /** Número exibido: "#0005". */
  numero: string;
  status: StatusPedido;
  /** Datas em ISO 8601 (ex.: "2026-10-02T12:00:00.000Z"). */
  criadoEm: string;
  previsaoEntrega?: string;
  /** Data de entrega/conclusão (status entregue ou concluido). */
  finalizadoEm?: string;
  /** Linha do tempo da tela de detalhes. */
  etapas?: EtapasPedido;
  enderecoEntrega?: Endereco;
  itens: ItemPedido[];
  /** Valor do frete (0 = grátis). */
  envio?: number;
  total: number;
}

/**
 * Filtros escolhidos no menu de filtros da tela de resultados.
 * Listas vazias = sem filtro naquele grupo.
 */
export interface FiltrosBusca {
  /** IDs das faixas de preço retornadas pela API. */
  faixasPreco: string[];
  generos: Genero[];
  /** Ids de categoria. */
  categorias: string[];
  tamanhos: string[];
  cores: string[];
  marcas: string[];
}
