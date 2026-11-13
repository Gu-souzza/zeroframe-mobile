import type { Pedido, StatusPedido } from '../types';
import { enviar, obterOuNulo } from './api';
import type { ItemCarrinho } from './carrinhoService';
import { listarEnderecos } from './enderecosService';
import { imagemProduto, todasPaginas } from './produtosService';
import { rotaUsuario } from './sessao';

export const STATUS_EM_ANDAMENTO: StatusPedido[] = ['pendente', 'preparando', 'saiu_para_entrega'];
export type FiltroPedidos = 'todos' | 'em-andamento' | 'entregues' | 'cancelados';
export const FILTROS_PEDIDOS: { id: FiltroPedidos; rotulo: string; status?: StatusPedido[] }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'em-andamento', rotulo: 'Em andamento', status: STATUS_EM_ANDAMENTO },
  { id: 'entregues', rotulo: 'Entregues', status: ['entregue', 'concluido'] },
  { id: 'cancelados', rotulo: 'Cancelados', status: ['cancelado'] },
];

interface PedidoApi {
  id: number; status: string; dataPedido: string; dataEntrega?: string; previsaoEntrega?: string;
  endereco?: Omit<NonNullable<Pedido['enderecoEntrega']>, 'uf'> & { estado: string };
  itens: { produtoId: number; nomeProduto: string; imagemUrl: string; tamanho: string;
    cor: string; quantidade: number; precoUnitario: number }[];
  valorFrete: number; valorTotalComFrete: number;
}

const statusPedido: Record<string, StatusPedido> = {
  Pendente: 'pendente', PreparandoParaSaida: 'preparando',
  SaiuParaEntrega: 'saiu_para_entrega', Entregue: 'entregue', Cancelado: 'cancelado',
};

function mapearPedido(dados: PedidoApi): Pedido {
  return {
    id: String(dados.id), numero: '#' + String(dados.id).padStart(4, '0'),
    status: statusPedido[dados.status] ?? 'pendente',
    criadoEm: dados.dataPedido, previsaoEntrega: dados.previsaoEntrega ?? undefined,
    finalizadoEm: dados.dataEntrega ?? undefined,
    etapas: { recebido: dados.dataPedido, entregue: dados.dataEntrega ?? undefined },
    enderecoEntrega: dados.endereco ? { ...dados.endereco, uf: dados.endereco.estado } : undefined,
    itens: dados.itens.map((item) => ({
      produtoId: String(item.produtoId), nome: item.nomeProduto, imagem: imagemProduto(item.imagemUrl),
      tamanho: item.tamanho, cor: item.cor, quantidade: item.quantidade, precoUnitario: item.precoUnitario,
    })),
    envio: dados.valorFrete, total: dados.valorTotalComFrete,
  };
}

export async function listarPedidos() {
  const pedidos = await todasPaginas<PedidoApi>(rotaUsuario() + '/pedidos');
  return pedidos.map(mapearPedido);
}

export async function obterPedido(id: string) {
  const pedido = await obterOuNulo<PedidoApi>('/pedidos/' + encodeURIComponent(id));
  return pedido ? mapearPedido(pedido) : null;
}

export async function criarPedido(itens: ItemCarrinho[]) {
  const endereco = (await listarEnderecos())[0];
  if (!endereco) throw new Error('Cadastre um endereço no seu perfil antes de finalizar o pedido.');
  return enviar<PedidoApi>(rotaUsuario() + '/pedidos', 'POST', {
    enderecoId: Number(endereco.id),
    itensSelecionados: itens.map(({ id, quantidade }) => ({ id: Number(id), quantidade })),
  });
}
