import { useCallback, useRef } from 'react';
import { obterToken } from '../services/sessao';

/** Serializa leituras e escritas do contexto durante a mesma sessão. */
export function useFilaDaSessao(token: string | null) {
  const fila = useRef<Promise<void>>(Promise.resolve());

  return useCallback(function enfileirar<T>(operacao: () => Promise<T>) {
    const executar = async () => {
      if (!token || obterToken() !== token) throw new Error('Entre na sua conta para continuar.');
      return operacao();
    };
    const resultado = fila.current.then(executar);
    fila.current = resultado.then(() => undefined, () => undefined);
    return resultado;
  }, [token]);
}
