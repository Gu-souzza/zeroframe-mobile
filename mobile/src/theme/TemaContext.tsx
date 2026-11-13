/**
 * Contexto de tema (claro/escuro).
 *
 * - O tema inicial segue o do sistema operacional do aparelho.
 * - O botão de lua/sol (login/registro) e a chave "tema escuro" (perfil)
 *   chamam `alternarTema()`.
 *
 * Transição: crossfade direto das cores antigas para as novas (~220ms),
 * sem passar por uma tela de cor sólida.
 * - Android/iOS: tira uma "foto" da tela atual (react-native-view-shot),
 *   coloca por cima, troca o tema por baixo e a foto some aos poucos.
 * - Web: o navegador anima as cores sozinho com transição CSS, ligada só
 *   durante a troca de tema (para não afetar o resto da interface).
 *
 * Uso em qualquer componente:
 *   const { cores, icones, tema, alternarTema } = useTema();
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { cores, type NomeTema, type PaletaCores } from './cores';
import { icones, type ConjuntoIcones } from './icones';

interface ValorTema {
  tema: NomeTema;
  cores: PaletaCores;
  icones: ConjuntoIcones;
  alternarTema: () => void;
}

const TemaContext = createContext<ValorTema | null>(null);

/** Duração do crossfade entre os temas, em ms. */
const DURACAO_TRANSICAO = 220;

/** Classe colocada no <html> (web) só enquanto o tema está trocando. */
const CLASSE_TROCANDO_TEMA = 'zf-trocando-tema';
const CSS_TRANSICAO_WEB = `
  html.${CLASSE_TROCANDO_TEMA} * {
    transition: background-color ${DURACAO_TRANSICAO}ms ease, color ${DURACAO_TRANSICAO}ms ease,
      border-color ${DURACAO_TRANSICAO}ms ease !important;
  }
`;

export function TemaProvider({ children }: { children: ReactNode }) {
  const temaDoSistema = useColorScheme();
  const [tema, setTema] = useState<NomeTema>(temaDoSistema === 'dark' ? 'escuro' : 'claro');

  // --- Crossfade no celular -------------------------------------------------
  /** Área que é "fotografada" (o app inteiro). */
  const raiz = useRef<React.ComponentRef<typeof View>>(null);
  /** Foto da tela com o tema antigo, exibida por cima durante a transição. */
  const [foto, setFoto] = useState<string | null>(null);
  const [opacidadeFoto] = useState(() => new Animated.Value(0));
  /** Tema que entra quando a foto terminar de carregar. */
  const temaSeguinte = useRef<NomeTema | null>(null);
  /** Evita começar outra troca enquanto uma ainda está animando. */
  const animando = useRef(false);

  // --- Transição CSS na web --------------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const estilo = document.createElement('style');
    estilo.textContent = CSS_TRANSICAO_WEB;
    document.head.appendChild(estilo);
    return () => estilo.remove();
  }, []);

  // TODO(API/persistência): salvar a preferência do usuário (AsyncStorage
  // ou perfil na API) para manter o tema escolhido ao reabrir o app.
  const alternarTema = useCallback(async () => {
    if (animando.current) return;
    animando.current = true;
    const novo: NomeTema = tema === 'claro' ? 'escuro' : 'claro';

    if (Platform.OS === 'web') {
      // Liga a transição de cores, troca o tema e desliga depois da animação.
      const html = document.documentElement;
      html.classList.add(CLASSE_TROCANDO_TEMA);
      setTema(novo);
      setTimeout(() => {
        html.classList.remove(CLASSE_TROCANDO_TEMA);
        animando.current = false;
      }, DURACAO_TRANSICAO + 50);
      return;
    }

    try {
      // 1) "Foto" da tela atual. JPG em qualidade alta é rápido e fica idêntico na tela.
      const uri = await captureRef(raiz, { format: 'jpg', quality: 0.9, result: 'tmpfile' });
      temaSeguinte.current = novo;
      opacidadeFoto.setValue(1);
      setFoto(uri); // 2) a troca continua em `aoCarregarFoto`, quando a foto já está na tela
    } catch {
      // Se a captura falhar, troca sem animação (melhor que não trocar).
      setTema(novo);
      animando.current = false;
    }
  }, [tema, opacidadeFoto]);

  /** 3) Foto cobrindo a tela: troca o tema por baixo e some com a foto. */
  const aoCarregarFoto = useCallback(() => {
    if (!temaSeguinte.current) return;
    setTema(temaSeguinte.current);
    temaSeguinte.current = null;
    // Espera um quadro para as cores novas serem desenhadas antes do fade.
    requestAnimationFrame(() => {
      Animated.timing(opacidadeFoto, {
        toValue: 0,
        duration: DURACAO_TRANSICAO,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setFoto(null);
        animando.current = false;
      });
    });
  }, [opacidadeFoto]);

  const valor = useMemo<ValorTema>(
    () => ({ tema, cores: cores[tema], icones: icones[tema], alternarTema }),
    [tema, alternarTema],
  );

  return (
    <TemaContext.Provider value={valor}>
      {/* `collapsable={false}`: necessário no Android para a View poder ser fotografada */}
      <View ref={raiz} style={estilos.raiz} collapsable={false}>
        {children}
      </View>
      {foto && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: opacidadeFoto }]}>
          <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} onLoad={aoCarregarFoto} fadeDuration={0} />
        </Animated.View>
      )}
    </TemaContext.Provider>
  );
}

export function useTema(): ValorTema {
  const ctx = useContext(TemaContext);
  if (!ctx) {
    throw new Error('useTema() precisa estar dentro de <TemaProvider> (veja src/app/_layout.tsx).');
  }
  return ctx;
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
  },
});
