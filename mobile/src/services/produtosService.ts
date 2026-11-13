import { logoZeroFrame } from '../theme/icones';
import type { Categoria, FiltrosBusca, Genero, Produto, VariacaoProduto } from '../types';
import { enviar, obterOuNulo, requisicao } from './api';
import { API_URL } from './sessao';

export type SecaoProdutos = 'recomendados' | 'zero-frame' | 'multimarcas';
interface ProdutoApi {
  id: number; nome: string; categoriaId: number; categoriaNome: string; marca: string;
  origem: string; genero: string; precoFinal: number; precoOriginal?: number;
  imagemUrl: string; variacoes: VariacaoProduto[];
}
interface CategoriaApi { id: number; nome: string }
interface Pagina<T> { items: T[]; hasNextPage: boolean }

export async function todasPaginas<T>(rota: string) {
  const itens: T[] = [];
  for (let page = 1; ; page++) {
    const resposta = await requisicao<Pagina<T>>(rota + '?pageSize=50&pageNumber=' + page);
    itens.push(...resposta.items);
    if (!resposta.hasNextPage) return itens;
  }
}

export function imagemProduto(url?: string) {
  if (!url) return logoZeroFrame;
  return { uri: new URL(url, new URL(API_URL).origin + '/').href };
}

const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const unicos = (valores: string[]) => [...new Set(valores.filter(Boolean))];

function mapearProduto(dados: ProdutoApi): Produto {
  const genero = normalizar(dados.genero);
  const variacoes = dados.variacoes ?? [];
  return {
    id: String(dados.id), nome: dados.nome, categoria: dados.categoriaNome + ' - ' + dados.marca,
    categoriaId: String(dados.categoriaId), marca: dados.marca, origem: dados.origem,
    genero: genero === 'masculino' || genero === 'feminino' ? genero : 'unissex',
    preco: dados.precoFinal, precoOriginal: dados.precoOriginal ?? undefined,
    parcelas: 10, nota: 0, imagem: imagemProduto(dados.imagemUrl), variacoes,
    tamanhos: unicos(variacoes.map((v) => v.tamanho)), cores: unicos(variacoes.map((v) => v.cor)),
  };
}

let carregandoCatalogo: Promise<Produto[]> | undefined;
function catalogo() {
  carregandoCatalogo ??= todasPaginas<ProdutoApi>('/produtos')
    .then((lista) => lista.map(mapearProduto))
    .finally(() => { carregandoCatalogo = undefined; });
  return carregandoCatalogo;
}

export async function listarProdutos(secao: SecaoProdutos, limite = 8) {
  const lista = await catalogo();
  if (secao === 'recomendados') return lista.slice(0, limite);
  return lista.filter((p) => {
    const origem = normalizar(p.origem ?? '');
    const original = origem ? ['original', 'originais', 'zero frame'].includes(origem) : normalizar(p.marca) === 'zero frame';
    return secao === 'zero-frame' ? original : !original;
  }).slice(0, limite);
}

export async function obterProduto(id: string) {
  const produto = await obterOuNulo<ProdutoApi>('/produtos/' + encodeURIComponent(id));
  if (!produto) return null;
  const resumo = await requisicao<{ mediaAvaliacoes: number }>('/produtos/' + encodeURIComponent(id) + '/avaliacoes/resumo');
  return { ...mapearProduto(produto), nota: resumo.mediaAvaliacoes };
}

export async function obterProdutos(ids: string[]) {
  if (!ids.length) return [];
  const lista = new Map((await catalogo()).map((produto) => [produto.id, produto]));
  return ids.map((id) => lista.get(id)).filter((produto): produto is Produto => produto !== undefined);
}

export async function listarRecomendados(id: string, limite = 8) {
  return (await catalogo()).filter((produto) => produto.id !== id).slice(0, limite);
}

export async function listarCategorias(): Promise<Categoria[]> {
  const [categorias, produtos] = await Promise.all([todasPaginas<CategoriaApi>('/categorias'), catalogo()]);
  return categorias.map(({ id, nome }) => ({
    id: String(id), nome, imagem: produtos.find((produto) => produto.categoriaId === String(id))?.imagem ?? logoZeroFrame,
  }));
}

export const FILTROS_VAZIOS: FiltrosBusca = {
  faixasPreco: [], generos: [], categorias: [], tamanhos: [], cores: [], marcas: [],
};
export interface OpcaoFiltro { valor: string; rotulo: string }
export type OpcoesFiltros = Record<keyof FiltrosBusca, OpcaoFiltro[]>;

const faixas = [
  { valor: 'ate-100', rotulo: 'Até R$100', min: 0, max: 100 },
  { valor: '100-500', rotulo: 'R$100 a R$500', min: 100, max: 500 },
  { valor: 'acima-500', rotulo: 'Acima de R$500', min: 500, max: Infinity },
];

export async function listarOpcoesFiltros(): Promise<OpcoesFiltros> {
  const [produtos, categorias] = await Promise.all([catalogo(), listarCategorias()]);
  const opcoes = (valores: string[]) => unicos(valores).map((valor) => ({ valor, rotulo: valor }));
  const generos: Record<Genero, string> = { masculino: 'Masculino', feminino: 'Feminino', unissex: 'Unissex' };
  return {
    faixasPreco: faixas.map(({ valor, rotulo }) => ({ valor, rotulo })),
    generos: Object.entries(generos).map(([valor, rotulo]) => ({ valor, rotulo })),
    categorias: categorias.map(({ id, nome }) => ({ valor: id, rotulo: nome })),
    tamanhos: opcoes(produtos.flatMap((produto) => produto.tamanhos)),
    cores: opcoes(produtos.flatMap((produto) => produto.cores)),
    marcas: opcoes(produtos.map((produto) => produto.marca)),
  };
}

export async function buscarProdutos(termo: string, filtros: FiltrosBusca = FILTROS_VAZIOS) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean)
    .map((palavra) => palavra.length > 3 && palavra.endsWith('s') ? palavra.slice(0, -1) : palavra);
  const inclui = (selecionados: string[], opcoes: string[]) =>
    !selecionados.length || selecionados.some((valor) => opcoes.includes(valor));
  return (await catalogo()).filter((produto) => {
    const texto = normalizar([produto.nome, produto.categoria, produto.origem, produto.marca].join(' '));
    return palavras.every((palavra) => texto.includes(palavra)) &&
      (!filtros.faixasPreco.length || faixas.some((faixa) => filtros.faixasPreco.includes(faixa.valor) &&
        produto.preco >= faixa.min && produto.preco <= faixa.max)) &&
      (produto.genero === 'unissex' || inclui(filtros.generos, [produto.genero])) &&
      inclui(filtros.categorias, [produto.categoriaId]) && inclui(filtros.marcas, [produto.marca]) &&
      inclui(filtros.tamanhos, produto.tamanhos) && inclui(filtros.cores, produto.cores);
  });
}

const buscas = '/usuarios/me/buscas-recentes';
export const listarBuscasRecentes = () => requisicao<string[]>(buscas);
export const registrarBuscaRecente = (termo: string) => enviar<string[]>(buscas, 'POST', { termo });
export const removerBuscaRecente = (termo: string) =>
  requisicao<string[]>(buscas + '?termo=' + encodeURIComponent(termo), { method: 'DELETE' });
