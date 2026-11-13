/**
 * `Text` do app: igual ao `Text` do react-native, mais o suporte ao VLibras.
 *
 * ⚠️ Nas telas e componentes, importe o `Text` DAQUI, não do 'react-native':
 *     import { Text } from '../components/Texto';
 *
 * No celular, enquanto o painel do VLibras está aberto, tocar em um texto
 * envia esse texto para o avatar traduzir em Libras (o toque não aciona o
 * botão/link que está por baixo, como no widget do site). Com o painel
 * fechado, e sempre na web, ele se comporta exatamente como o `Text` normal
 * (na web, o próprio widget oficial cuida dos cliques).
 */
import { Children, createContext, isValidElement, useContext, type ComponentProps, type ReactNode } from 'react';
import { Text as TextoNativo } from 'react-native';

import { useLibras } from '../context/LibrasContext';

type TextoProps = ComponentProps<typeof TextoNativo>;

/** true dentro de outro Text: só o mais externo traduz (a frase inteira). */
const DentroDeTexto = createContext(false);

/** Junta o texto de todos os filhos: "ou ", 3, "x de R$ 10,00" → "ou 3x de R$ 10,00". */
function extrairTexto(no: ReactNode): string {
  if (typeof no === 'string' || typeof no === 'number') return String(no);
  if (Array.isArray(no)) return no.map(extrairTexto).join('');
  if (isValidElement<{ children?: ReactNode }>(no)) return extrairTexto(no.props.children);
  return '';
}

export function Text(props: TextoProps) {
  const { ativo, traduzir } = useLibras();
  const aninhado = useContext(DentroDeTexto);
  const traduzivel = ativo && !aninhado;

  return (
    <DentroDeTexto value>
      <TextoNativo
        {...props}
        {...(traduzivel && {
          onPress: () => traduzir(extrairTexto(Children.toArray(props.children))),
          onLongPress: undefined,
          suppressHighlighting: false,
        })}
      />
    </DentroDeTexto>
  );
}
