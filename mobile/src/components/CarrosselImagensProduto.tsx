/**
 * Carrossel de fotos da tela do produto (Figma: "Product image").
 *
 * Foto quadrada (1:1, até 300x300) com borda #CCC e setas de 32px dos lados.
 * A foto é recortada para preencher o quadrado (`contentFit="cover"`),
 * nunca esticada. Dá para trocar de foto pelas setas ou arrastando.
 * As setas ficam apagadas quando não há foto anterior/próxima.
 */
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';

import { useTema } from '../theme/TemaContext';
import type { Imagem } from '../types';
import { Icone } from './Icone';

const TAMANHO_MAXIMO = 300;
const TAMANHO_SETA = 32;
const ESPACO = 16;

interface CarrosselImagensProdutoProps {
  imagens: Imagem[];
  nomeProduto: string;
}

export function CarrosselImagensProduto({ imagens, nomeProduto }: CarrosselImagensProdutoProps) {
  const { icones } = useTema();
  const { width } = useWindowDimensions();
  const lista = useRef<FlatList<Imagem>>(null);
  const [indice, setIndice] = useState(0);

  // Largura útil = tela (até 480) - margens - setas - espaços.
  const tamanho = Math.min(TAMANHO_MAXIMO, Math.min(width, 480) - 32 - TAMANHO_SETA * 2 - ESPACO * 2);
  const total = imagens.length;

  function irPara(novo: number) {
    if (novo < 0 || novo >= total) return;
    lista.current?.scrollToOffset({ offset: novo * tamanho, animated: true });
    setIndice(novo);
  }

  // Atualiza o índice quando o usuário arrasta a foto.
  function aoTerminarArraste(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndice(Math.round(e.nativeEvent.contentOffset.x / tamanho));
  }

  return (
    <View style={estilos.container}>
      <Pressable
        onPress={() => irPara(indice - 1)}
        disabled={indice === 0}
        accessibilityRole="button"
        accessibilityLabel="Foto anterior"
        hitSlop={8}
        style={indice === 0 && estilos.desabilitada}
      >
        <Icone fonte={icones.produtoEsquerda} largura={TAMANHO_SETA} altura={TAMANHO_SETA} />
      </Pressable>

      <View style={[estilos.moldura, { width: tamanho, height: tamanho }]}>
        <FlatList
          ref={lista}
          data={imagens}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={aoTerminarArraste}
          getItemLayout={(_, i) => ({ length: tamanho, offset: tamanho * i, index: i })}
          renderItem={({ item, index }) => (
            <Image
              source={item}
              style={{ width: tamanho, height: tamanho }}
              contentFit="cover"
              accessibilityLabel={`${nomeProduto}, foto ${index + 1} de ${total}`}
            />
          )}
        />
      </View>

      <Pressable
        onPress={() => irPara(indice + 1)}
        disabled={indice >= total - 1}
        accessibilityRole="button"
        accessibilityLabel="Próxima foto"
        hitSlop={8}
        style={indice >= total - 1 && estilos.desabilitada}
      >
        <Icone fonte={icones.produtoDireita} largura={TAMANHO_SETA} altura={TAMANHO_SETA} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moldura: {
    borderWidth: 1,
    borderColor: '#CCCCCC', // Figma: borda fixa #CCC nos dois temas
    overflow: 'hidden',
  },
  desabilitada: {
    opacity: 0.4,
  },
});
