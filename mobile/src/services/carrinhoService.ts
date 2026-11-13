import type { Imagem } from '../types';
import { enviar, requisicao } from './api';
import { imagemProduto } from './produtosService';
import { rotaUsuario } from './sessao';

export interface ItemCarrinho {
  id: string;
  produtoId: string;
  variacaoProdutoId: number;
  nome: string;
  imagem: Imagem;
  tamanho: string;
  cor: string;
  quantidade: number;
  preco: number;
  precoOriginal?: number;
  selecionado: boolean;
}

interface ItemApi {
  id: number; produtoId: number; variacaoProdutoId: number; nomeProduto: string; imagemUrl: string;
  tamanho: string; cor: string; quantidade: number; precoUnitario: number; precoOriginalUnitario: number;
}

const rota = () => rotaUsuario() + '/carrinho';
const rotaItens = () => rota() + '/itens';

function mapearItem(item: ItemApi): ItemCarrinho {
  return {
    id: String(item.id), produtoId: String(item.produtoId), variacaoProdutoId: item.variacaoProdutoId,
    nome: item.nomeProduto, imagem: imagemProduto(item.imagemUrl),
    tamanho: item.tamanho, cor: item.cor, quantidade: item.quantidade, preco: item.precoUnitario,
    precoOriginal: item.precoOriginalUnitario > item.precoUnitario ? item.precoOriginalUnitario : undefined,
    selecionado: true,
  };
}

export async function listarCarrinho() {
  return (await requisicao<ItemApi[]>(rotaItens())).map(mapearItem);
}

export async function adicionarItem(variacaoProdutoId: number) {
  return mapearItem(await enviar<ItemApi>(rotaItens(), 'POST', { variacaoProdutoId, quantidade: 1 }));
}

export async function alterarItem(item: ItemCarrinho, quantidade: number) {
  await enviar(rotaItens() + '/' + item.id, 'PUT', { variacaoProdutoId: item.variacaoProdutoId, quantidade });
}

export function removerItem(id: string) {
  return requisicao(rotaItens() + '/' + id, { method: 'DELETE' });
}

export function limparCarrinho() {
  return requisicao(rotaItens(), { method: 'DELETE' });
}

export function cotarFrete(subtotal: number) {
  return requisicao<{ frete: number }>('/frete?subtotal=' + subtotal);
}
