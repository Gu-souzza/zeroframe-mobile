/**
 * VLibras (tradução de Português para Libras) em todo o app.
 *
 * Como funciona em cada plataforma:
 *
 * - WEB: carrega o widget oficial do governo (vlibras.gov.br), igual à versão
 *   web da Zero Frame. Ele cria o botão azul na lateral e, quando aberto,
 *   traduz qualquer texto em que o usuário clicar. Não depende deste contexto.
 *
 * - ANDROID/iOS: o widget oficial só funciona em páginas web, então ele roda
 *   dentro de uma WebView (src/components/vlibras/WidgetVLibras.tsx), com um
 *   botão flutuante igual ao do site. Com o painel aberto (`ativo`), tocar em
 *   qualquer texto do app envia esse texto para o avatar traduzir. Quem faz
 *   isso é o componente `Text` de src/components/Texto.tsx, usado no lugar do
 *   `Text` do react-native em todas as telas.
 *
 * O VLibras é um serviço externo: precisa de internet, mas não tem relação com
 * a API da Zero Frame (não há TODO(API) aqui).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { WidgetVLibras } from '../components/vlibras/WidgetVLibras';

interface ValorLibras {
  /** true quando o painel do VLibras está aberto no celular (toques em textos traduzem). */
  ativo: boolean;
  /** Envia um texto para o avatar sinalizar. */
  traduzir: (texto: string) => void;
}

const LibrasContext = createContext<ValorLibras>({ ativo: false, traduzir: () => {} });

export function LibrasProvider({ children }: { children: ReactNode }) {
  const [ativo, setAtivo] = useState(false);
  // O widget registra aqui a função que manda o texto para a WebView.
  const refTradutor = useRef<((texto: string) => void) | null>(null);
  const registrarTradutor = useCallback((tradutor: ((texto: string) => void) | null) => {
    refTradutor.current = tradutor;
  }, []);

  const traduzir = useCallback((texto: string) => {
    const limpo = texto.replace(/\s+/g, ' ').trim();
    if (limpo) refTradutor.current?.(limpo);
  }, []);

  const valor = useMemo(() => ({ ativo, traduzir }), [ativo, traduzir]);

  return (
    <LibrasContext.Provider value={valor}>
      {children}
      {/* Fica por cima de todas as telas (botão flutuante + painel do avatar). */}
      <WidgetVLibras aoMudarAtivo={setAtivo} registrarTradutor={registrarTradutor} />
    </LibrasContext.Provider>
  );
}

export function useLibras() {
  return useContext(LibrasContext);
}
