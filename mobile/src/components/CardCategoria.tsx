/**
 * Card de categoria da tela de pesquisa (Figma: "card-categoria").
 *
 * Quadrado (1:1) com a foto da categoria recortada para preencher o card,
 * raio 25, e uma faixa inferior com o nome + seta.
 * Ao tocar, a tela de pesquisa busca o nome da categoria.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { Image } from 'expo-image';

import type { Categoria } from '../types';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

interface CardCategoriaProps {
  categoria: Categoria;
  tamanho: number;
  aoPressionar: (categoria: Categoria) => void;
}

export function CardCategoria({ categoria, tamanho, aoPressionar }: CardCategoriaProps) {
  const { cores } = useTema();

  return (
    <Pressable
      onPress={() => aoPressionar(categoria)}
      accessibilityRole="button"
      accessibilityLabel={`Buscar ${categoria.nome}`}
      style={({ pressed }) => [
        estilos.card,
        { width: tamanho, height: tamanho, shadowColor: cores.texto, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, estilos.recorte]}>
        {/* `cover` recorta a foto sem distorcer; ancorada no topo para mostrar a peça */}
        <Image source={categoria.imagem} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
      </View>

      <View style={[estilos.faixa, { backgroundColor: cores.cardFundo }]}>
        <Text style={[estilos.nome, { color: cores.texto }]} numberOfLines={1}>
          {categoria.nome}
        </Text>
        {/* O SVG exportado aponta para a esquerda; o Figma o espelha (scaleX -1) para apontar à direita. */}
        <Icone
          fonte={iconesMonocromaticos.setaCategoria}
          largura={14.4}
          altura={14}
          tintColor={cores.texto}
          style={estilos.setaEspelhada}
        />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    borderRadius: 25,
    justifyContent: 'flex-end',
    // Figma: shadow 0 0 2px `inputs-e-botões/border`
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  recorte: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  nome: {
    fontFamily: fontes.regular,
    fontSize: 16,
    flexShrink: 1,
  },
  setaEspelhada: {
    transform: [{ scaleX: -1 }],
  },
});
