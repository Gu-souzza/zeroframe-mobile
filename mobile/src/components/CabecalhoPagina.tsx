/**
 * Topo das telas de carrinho, perfil e pedidos (Figma: "Titulo Carrinho" /
 * "Head da página").
 *
 * - Título em 20px à esquerda (com botão voltar antes dele, se `aoVoltar`);
 * - Texto pequeno opcional à direita (ex.: "2 itens");
 * - Linha fina embaixo.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

interface CabecalhoPaginaProps {
  titulo: string;
  /** Texto à direita do título (ex.: quantidade de itens). */
  detalhe?: string;
  /** Linha pequena embaixo do título (ex.: "Feito em 15/10/2026"). */
  subtitulo?: string;
  /** Mostra o botão voltar e chama esta função ao tocar. */
  aoVoltar?: () => void;
}

export function CabecalhoPagina({ titulo, detalhe, subtitulo, aoVoltar }: CabecalhoPaginaProps) {
  const { cores, icones } = useTema();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        estilos.topo,
        { paddingTop: Math.max(32, insets.top + 16), backgroundColor: cores.fundo, borderBottomColor: cores.borda },
      ]}
    >
      <View style={estilos.linha}>
        {aoVoltar && (
          <Pressable onPress={aoVoltar} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
            <Icone fonte={icones.botaoVoltar} largura={48} altura={48} />
          </Pressable>
        )}
        <View style={estilos.textos}>
          <Text style={[estilos.titulo, { color: cores.texto }]} numberOfLines={1} accessibilityRole="header">
            {titulo}
          </Text>
          {subtitulo ? <Text style={[estilos.subtitulo, { color: cores.texto }]}>{subtitulo}</Text> : null}
        </View>
        {detalhe ? <Text style={[estilos.detalhe, { color: cores.texto }]}>{detalhe}</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  topo: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  linha: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontFamily: fontes.regular,
    fontSize: 20,
  },
  subtitulo: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  detalhe: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
});
