/**
 * Atalhos de navegação usados por várias telas.
 */
import { router, type Href } from 'expo-router';

import { registrarBuscaRecente } from '../services/produtosService';
import type { Pedido, Produto } from '../types';
import { avisar } from './avisos';

/**
 * Abre a tela de resultados para um termo, como se ele tivesse sido
 * digitado no campo de busca (também registra nas buscas recentes).
 * Usada pelo campo de busca, pelas pílulas de buscas recentes, pelos cards
 * de categoria e pelo "Ver todos" do carrossel da tela inicial.
 */
export function abrirResultados(termo: string) {
  const limpo = termo.trim();
  if (!limpo) return;
  registrarBuscaRecente(limpo)
    .catch((erro: Error) => avisar('Não foi possível salvar a busca recente', erro.message));
  router.push({ pathname: '/resultados', params: { termo: limpo } });
}

/**
 * Botão voltar das telas internas: volta para a tela anterior; se não houver
 * histórico (tela aberta direto pela URL, na web), vai para `destino`.
 */
export function voltarOu(destino: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(destino);
}

/** Abre a tela de detalhes de um pedido ("Meus pedidos" → card). */
export function abrirPedido(pedido: Pick<Pedido, 'id'>) {
  router.push({ pathname: '/pedido/[id]', params: { id: pedido.id } });
}

/** Abre a tela de detalhes de um produto. */
export function abrirProduto(produto: Pick<Produto, 'id'>) {
  router.push({ pathname: '/produto/[id]', params: { id: produto.id } });
}
