import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { desfavoritar, favoritar, listarFavoritos } from '../services/favoritosService';
import { useToken } from '../services/sessao';
import { avisar } from '../utils/avisos';
import { useFilaDaSessao } from './useFilaDaSessao';

interface ValorFavoritos {
  ids: string[];
  ehFavorito: (id: string) => boolean;
  alternar: (id: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

const FavoritosContext = createContext<ValorFavoritos | null>(null);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const ultimosIds = useRef<string[]>([]);
  const token = useToken();
  const executar = useFilaDaSessao(token);
  const recarregar = useCallback(() => executar(async () => {
    const lista = await listarFavoritos();
    ultimosIds.current = lista;
    setIds(lista);
  }), [executar]);

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    recarregar().catch((erro: Error) => {
      if (ativo) avisar('Não foi possível carregar os favoritos', erro.message);
    });
    return () => { ativo = false; };
  }, [recarregar, token]);

  const valor: ValorFavoritos = {
    ids,
    recarregar,
    ehFavorito: (id) => ids.includes(id),
    alternar: (id) => executar(async () => {
      const lista = await (ultimosIds.current.includes(id) ? desfavoritar(id) : favoritar(id));
      ultimosIds.current = lista;
      setIds(lista);
    }),
  };

  return <FavoritosContext.Provider value={valor}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const contexto = useContext(FavoritosContext);
  if (!contexto) throw new Error('useFavoritos() precisa do FavoritosProvider.');
  return contexto;
}
