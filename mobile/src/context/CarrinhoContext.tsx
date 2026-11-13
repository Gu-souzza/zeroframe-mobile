import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  adicionarItem, alterarItem, limparCarrinho, listarCarrinho, removerItem, type ItemCarrinho,
} from '../services/carrinhoService';
import { criarPedido } from '../services/pedidosService';
import { useToken } from '../services/sessao';
import { avisar } from '../utils/avisos';
import { useFilaDaSessao } from './useFilaDaSessao';

export type { ItemCarrinho } from '../services/carrinhoService';
export const QUANTIDADE_MAXIMA = 10;

interface ValorCarrinho {
  itens: ItemCarrinho[];
  totalItens: number;
  adicionar: (variacaoId: number) => Promise<void>;
  alterarQuantidade: (item: ItemCarrinho, quantidade: number) => Promise<void>;
  recarregar: () => Promise<void>;
  remover: (id: string) => Promise<void>;
  limpar: () => Promise<void>;
  alternarSelecao: (id: string) => void;
  selecionarTodos: (selecionar: boolean) => void;
  finalizar: (selecionados: ItemCarrinho[]) => Promise<void>;
}

const CarrinhoContext = createContext<ValorCarrinho | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const token = useToken();
  const executar = useFilaDaSessao(token);
  const atualizarItens = useCallback(async () => {
    const lista = await listarCarrinho();
    setItens((atuais) => {
      const selecionados = new Map(atuais.map(({ id, selecionado }) => [id, selecionado]));
      return lista.map((item) => ({ ...item, selecionado: selecionados.get(item.id) ?? true }));
    });
  }, []);
  const recarregar = useCallback(() => executar(atualizarItens), [executar, atualizarItens]);

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    recarregar().catch((erro: Error) => {
      if (ativo) avisar('Não foi possível carregar o carrinho', erro.message);
    });
    return () => { ativo = false; };
  }, [recarregar, token]);

  const valor: ValorCarrinho = {
    itens,
    recarregar,
    totalItens: itens.reduce((total, item) => total + item.quantidade, 0),
    adicionar: (variacaoId) => executar(async () => {
      const salvo = await adicionarItem(variacaoId);
      setItens((atuais) => atuais.some((item) => item.id === salvo.id)
        ? atuais.map((item) => item.id === salvo.id ? { ...salvo, selecionado: item.selecionado } : item)
        : [...atuais, salvo]);
    }),
    alterarQuantidade: (item, quantidade) => executar(async () => {
      await alterarItem(item, quantidade);
      setItens((atuais) => atuais.map((atual) => atual.id === item.id ? { ...atual, quantidade } : atual));
    }),
    remover: (id) => executar(async () => {
      await removerItem(id);
      setItens((atuais) => atuais.filter((item) => item.id !== id));
    }),
    limpar: () => executar(async () => {
      await limparCarrinho();
      setItens([]);
    }),
    alternarSelecao: (id) => setItens((atuais) => atuais.map((item) =>
      item.id === id ? { ...item, selecionado: !item.selecionado } : item)),
    selecionarTodos: (selecionado) => setItens((atuais) => atuais.map((item) => ({ ...item, selecionado }))),
    finalizar: (selecionados) => executar(async () => {
      try {
        await criarPedido(selecionados);
      } catch (erro) {
        await atualizarItens().catch(() => undefined);
        throw erro;
      }
      const comprados = new Set(selecionados.map(({ id }) => id));
      setItens((atuais) => atuais.filter((item) => !comprados.has(item.id)));
    }),
  };

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) throw new Error('useCarrinho() precisa do CarrinhoProvider.');
  return contexto;
}

/** Prévia com os preços recebidos da API. O pedido é recalculado pelo servidor. */
export function calcularResumo(itens: ItemCarrinho[]) {
  const selecionados = itens.filter((item) => item.selecionado);
  const totalItens = selecionados.reduce((soma, item) => soma + Math.round((item.precoOriginal ?? item.preco) * 100) * item.quantidade, 0);
  const subtotal = selecionados.reduce((soma, item) => soma + Math.round(item.preco * 100) * item.quantidade, 0);
  return {
    quantidadeSelecionada: selecionados.reduce((soma, item) => soma + item.quantidade, 0),
    totalItens: totalItens / 100,
    desconto: (totalItens - subtotal) / 100,
    subtotal: subtotal / 100,
  };
}
