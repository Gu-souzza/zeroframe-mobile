/**
 * Ícones exportados do Figma (SVG), separados por tema.
 *
 * Cada tema tem sua própria versão do arquivo porque a cor está "gravada"
 * dentro do SVG pelo Figma. Para trocar um ícone, exporte de novo do Figma
 * e substitua o arquivo em assets/icons/<tema>/ mantendo o mesmo nome.
 *
 * Os componentes pegam o conjunto certo com `useTema().icones`.
 */
import type { NomeTema } from './cores';

const claro = {
  botaoVoltar: require('../../assets/icons/claro/botao-voltar.svg'),
  alternarTema: require('../../assets/icons/claro/lua.svg'), // no tema claro mostra a lua (ir p/ escuro)
  usuario: require('../../assets/icons/claro/usuario.svg'),
  olho: require('../../assets/icons/claro/olho.svg'),
  arroba: require('../../assets/icons/claro/arroba.svg'),
  telefone: require('../../assets/icons/claro/telefone.svg'),
  setaVerTudo: require('../../assets/icons/claro/seta-ver-tudo.svg'),
  linhaDivisoria: require('../../assets/icons/claro/linha-divisoria.svg'),
  carrosselDireita: require('../../assets/icons/claro/carrossel-direita.svg'),
  carrosselEsquerda: require('../../assets/icons/claro/carrossel-esquerda.svg'),
  navInicio: require('../../assets/icons/claro/nav-inicio.svg'),
  navBuscar: require('../../assets/icons/claro/nav-buscar.svg'),
  navCarrinho: require('../../assets/icons/claro/nav-carrinho.svg'),
  navPerfil: require('../../assets/icons/claro/nav-perfil.svg'),
  produtoEsquerda: require('../../assets/icons/claro/produto-esquerda.svg'),
  produtoDireita: require('../../assets/icons/claro/produto-direita.svg'),
  /** Etapa concluída da linha do tempo do pedido (círculo com ✓ + linha grossa para a próxima). */
  etapaConcluida: require('../../assets/icons/claro/etapa-concluida.svg'),
  /** Última etapa concluída (círculo com ✓ + linha fina para a etapa pendente). */
  etapaConcluidaUltima: require('../../assets/icons/claro/etapa-concluida-ultima.svg'),
  /** Botão quadrado 42x42 com lixeira vermelha (endereços). */
  botaoExcluir: require('../../assets/icons/claro/botao-excluir.svg'),
  /** Botão redondo 32x32 com coração vermelho (cards da tela Favoritos). */
  botaoFavorito: require('../../assets/icons/claro/botao-favorito.svg'),
  github: require('../../assets/icons/claro/github.svg'),
  linkedin: require('../../assets/icons/claro/linkedin.svg'),
};

export type ConjuntoIcones = typeof claro;

const escuro: ConjuntoIcones = {
  botaoVoltar: require('../../assets/icons/escuro/botao-voltar.svg'),
  alternarTema: require('../../assets/icons/escuro/sol.svg'), // no tema escuro mostra o sol (ir p/ claro)
  usuario: require('../../assets/icons/escuro/usuario.svg'),
  olho: require('../../assets/icons/escuro/olho.svg'),
  arroba: require('../../assets/icons/escuro/arroba.svg'),
  telefone: require('../../assets/icons/escuro/telefone.svg'),
  setaVerTudo: require('../../assets/icons/escuro/seta-ver-tudo.svg'),
  linhaDivisoria: require('../../assets/icons/escuro/linha-divisoria.svg'),
  carrosselDireita: require('../../assets/icons/escuro/carrossel-direita.svg'),
  carrosselEsquerda: require('../../assets/icons/escuro/carrossel-esquerda.svg'),
  navInicio: require('../../assets/icons/escuro/nav-inicio.svg'),
  navBuscar: require('../../assets/icons/escuro/nav-buscar.svg'),
  navCarrinho: require('../../assets/icons/escuro/nav-carrinho.svg'),
  navPerfil: require('../../assets/icons/escuro/nav-perfil.svg'),
  produtoEsquerda: require('../../assets/icons/escuro/produto-esquerda.svg'),
  produtoDireita: require('../../assets/icons/escuro/produto-direita.svg'),
  etapaConcluida: require('../../assets/icons/escuro/etapa-concluida.svg'),
  etapaConcluidaUltima: require('../../assets/icons/escuro/etapa-concluida-ultima.svg'),
  botaoExcluir: require('../../assets/icons/escuro/botao-excluir.svg'),
  botaoFavorito: require('../../assets/icons/escuro/botao-favorito.svg'),
  github: require('../../assets/icons/escuro/github.svg'),
  linkedin: require('../../assets/icons/escuro/linkedin.svg'),
};

export const icones: Record<NomeTema, ConjuntoIcones> = { claro, escuro };

/**
 * Ícones de uma cor só, exportados do Figma na versão clara (cor #201B1B).
 * São pintados na cor do tema com `<Icone tintColor={cores.texto} />`,
 * então um único arquivo serve para claro e escuro.
 */
export const iconesMonocromaticos = {
  lupa: require('../../assets/icons/monocromaticos/lupa.svg'),
  xPilula: require('../../assets/icons/monocromaticos/x-pilula.svg'),
  setaCategoria: require('../../assets/icons/monocromaticos/seta-categoria.svg'),
  fantasma: require('../../assets/icons/monocromaticos/fantasma.svg'),
  chevronBaixo: require('../../assets/icons/monocromaticos/chevron-baixo.svg'),
  fechar: require('../../assets/icons/monocromaticos/fechar.svg'),
  coracaoContorno: require('../../assets/icons/monocromaticos/coracao-contorno.svg'),
  // Carrinho
  menos: require('../../assets/icons/monocromaticos/menos.svg'),
  mais: require('../../assets/icons/monocromaticos/mais.svg'),
  carrinhoVazio: require('../../assets/icons/monocromaticos/carrinho-vazio.svg'),
  // Perfil
  pedidos: require('../../assets/icons/monocromaticos/pedidos.svg'),
  favoritos: require('../../assets/icons/monocromaticos/favoritos.svg'),
  enderecos: require('../../assets/icons/monocromaticos/enderecos.svg'),
  cadeado: require('../../assets/icons/monocromaticos/cadeado.svg'),
  lua: require('../../assets/icons/monocromaticos/lua-perfil.svg'),
  info: require('../../assets/icons/monocromaticos/info.svg'),
  suporte: require('../../assets/icons/monocromaticos/suporte.svg'),
  // Segurança e detalhes do pedido
  envelope: require('../../assets/icons/monocromaticos/envelope.svg'),
  pinoEndereco: require('../../assets/icons/monocromaticos/pino-endereco.svg'),
  // Endereços
  casa: require('../../assets/icons/monocromaticos/casa.svg'),
  lapis: require('../../assets/icons/monocromaticos/lapis.svg'),
  // Ajuda e suporte
  suportePedido: require('../../assets/icons/monocromaticos/suporte-pedido.svg'),
  suporteProduto: require('../../assets/icons/monocromaticos/suporte-produto.svg'),
  suporteEntrega: require('../../assets/icons/monocromaticos/suporte-entrega.svg'),
  suportePagamento: require('../../assets/icons/monocromaticos/suporte-pagamento.svg'),
  suporteConta: require('../../assets/icons/monocromaticos/suporte-conta.svg'),
  suporteOutro: require('../../assets/icons/monocromaticos/suporte-outro.svg'),
  relogio: require('../../assets/icons/monocromaticos/relogio.svg'),
};

/** Ícones com as mesmas cores nos dois temas. */
export const iconesComuns = {
  coracaoCheio: require('../../assets/icons/comum/coracao-cheio.svg'),
  estrela: require('../../assets/icons/comum/estrela.svg'),
  /** Funil do botão flutuante de filtros (creme, sobre o círculo `secundario`). */
  funil: require('../../assets/icons/comum/funil.svg'),
  /** Lixeira vermelha do botão "remover" do carrinho. */
  lixeira: require('../../assets/icons/comum/lixeira.svg'),
  /** "+" creme do botão flutuante de adicionar endereço. */
  mais: require('../../assets/icons/comum/mais.svg'),
  /** Botão azul do VLibras (ícone oficial, vlibras.gov.br) — só no celular. */
  vlibras: require('../../assets/icons/comum/vlibras.svg'),
};

/** Logo da marca — igual nos dois temas. */
export const logoZeroFrame = require('../../assets/images/logo-zero-frame.png');
