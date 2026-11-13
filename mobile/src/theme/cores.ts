/**
 * Paleta de cores do app Zero Frame.
 *
 * Os nomes seguem as variáveis do Figma (arquivo "PIM"), para que designers
 * e devs falem a mesma língua:
 *   fundo, texto, secundario, card-bg, inputs-e-botões/border,
 *   inputs-e-botões/placeholder, inputs-e-botões/texto-botão-colorido, nav/destaque
 *
 * Sempre use as cores via `useTema()` (src/theme/TemaContext.tsx) em vez de
 * escrever hexadecimais direto nos componentes — assim a troca claro/escuro
 * funciona automaticamente.
 */

export type NomeTema = 'claro' | 'escuro';

export interface PaletaCores {
  /** Cor de fundo das telas. Figma: `fundo` */
  fundo: string;
  /** Cor principal de textos. Figma: `texto` */
  texto: string;
  /** Cor de destaque da marca (botões redondos, nav bar, carrossel). Figma: `secundario` */
  secundario: string;
  /** Fundo de cards e inputs. Figma: `card-bg` */
  cardFundo: string;
  /** Borda de inputs, botões e cards. Figma: `inputs-e-botões/border` */
  borda: string;
  /** Texto de placeholder dos inputs. Figma: `inputs-e-botões/placeholder` */
  placeholder: string;
  /** Fundo do botão de ação principal ("entrar na conta", "criar conta"). */
  botaoPrimarioFundo: string;
  /** Texto do botão de ação principal. */
  botaoPrimarioTexto: string;
  /** Títulos das seções da tela inicial ("PRODUTOS RECOMENDADOS", ...). */
  tituloSecao: string;
  /** Legenda "Já possui uma conta?" da tela de registro. */
  legendaRegistro: string;
  /** Fundo do item ativo da barra de navegação. Figma: `nav/destaque` */
  navDestaque: string;
  /** Texto dos itens inativos da barra de navegação. */
  navTexto: string;
  /** Título do card central do carrossel de categorias. */
  tituloCategoria: string;
  /** Preço promocional (produto com desconto). */
  precoPromocional: string;
  /** Mensagens de erro de validação dos formulários. */
  erro: string;
  /** Texto sobre fundo `secundario` (pílula de gênero/filtro selecionada). */
  textoSobreSecundario: string;
  /** Fundo das pílulas de "Buscas recentes". */
  pilulaFundo: string;
  /** Texto e "x" das pílulas de "Buscas recentes". */
  pilulaTexto: string;
  /** Tamanho selecionado na tela do produto (fundo / texto). */
  tamanhoSelecionadoFundo: string;
  tamanhoSelecionadoTexto: string;
  /** Película escura atrás do menu de filtros. */
  sobreposicao: string;
  /** Vermelho de destaque (Figma: `accents/red`): preço promocional no carrinho, "sair da conta". */
  vermelho: string;
  /** Títulos de seção pequenos ("CONTA", "PEDIDOS EM ANDAMENTO"). Figma: `titulo-de-seção` */
  tituloSecaoSuave: string;
}

export const cores: Record<NomeTema, PaletaCores> = {
  claro: {
    fundo: '#F5EBE0',
    texto: '#201B1B',
    secundario: '#8C5A3C',
    cardFundo: '#F6F6F6',
    borda: 'rgba(0, 0, 0, 0.25)',
    placeholder: 'rgba(32, 27, 27, 0.8)',
    botaoPrimarioFundo: '#8C5A3C',
    botaoPrimarioTexto: '#F5EBE0',
    tituloSecao: '#000000',
    legendaRegistro: '#8C5A3C',
    navDestaque: '#F5EBE0',
    navTexto: '#F5EBE0',
    tituloCategoria: '#F6F6F6',
    precoPromocional: '#FD3737',
    erro: '#D32F2F',
    textoSobreSecundario: '#F5EBE0',
    pilulaFundo: 'rgba(32, 27, 27, 0.11)',
    pilulaTexto: 'rgba(32, 27, 27, 0.9)',
    tamanhoSelecionadoFundo: '#8C5A3C',
    tamanhoSelecionadoTexto: '#F5EBE0',
    sobreposicao: 'rgba(0, 0, 0, 0.4)',
    vermelho: '#FF383C',
    tituloSecaoSuave: 'rgba(32, 27, 27, 0.8)',
  },
  escuro: {
    fundo: '#201B1B',
    texto: '#F5EBE0',
    secundario: '#48312E',
    cardFundo: '#332626',
    borda: 'rgba(255, 255, 255, 0.25)',
    placeholder: 'rgba(245, 235, 224, 0.8)',
    // No tema escuro o botão principal "inverte": fundo claro e texto escuro.
    botaoPrimarioFundo: '#F5EBE0',
    botaoPrimarioTexto: '#201B1B',
    tituloSecao: '#F5EBE0',
    legendaRegistro: '#F5EBE0',
    navDestaque: '#F5EBE0',
    navTexto: '#F5EBE0',
    tituloCategoria: '#FFFFFF',
    precoPromocional: '#FD3737',
    erro: '#FF6B6B',
    textoSobreSecundario: '#F5EBE0',
    pilulaFundo: 'rgba(245, 235, 224, 0.11)',
    pilulaTexto: 'rgba(245, 235, 224, 0.9)',
    // No escuro o tamanho selecionado fica creme com texto escuro (Figma 538:1481).
    tamanhoSelecionadoFundo: '#F5EBE0',
    tamanhoSelecionadoTexto: '#201B1B',
    sobreposicao: 'rgba(0, 0, 0, 0.6)',
    vermelho: '#FF383C',
    tituloSecaoSuave: 'rgba(245, 235, 224, 0.8)',
  },
};
