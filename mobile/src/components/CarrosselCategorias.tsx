/**
 * Carrossel "CATEGORIAS" da tela inicial (Figma: "categorias - container card").
 *
 * Layout do Figma (container de 380x332, fundo `secundario`, raio 32):
 * - Card central 225x300 com a foto da categoria atual, título e botão "Ver todos";
 * - Cards laterais 150x200 (categoria anterior e próxima), com 50% de opacidade
 *   e uma película escura por cima, parcialmente escondidos atrás do central;
 * - Setas de 32px nas laterais para navegar.
 *
 * As posições são as do Figma, multiplicadas por `escala` para caber em
 * telas mais estreitas que 412px.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from './Texto';
import { Image } from 'expo-image';

import type { Categoria } from '../types';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

const LARGURA_FIGMA = 380;
const ALTURA_FIGMA = 332;

interface CarrosselCategoriasProps {
  categorias: Categoria[];
  /** Índice da categoria que começa no centro (Figma começa em "Camisas"). */
  indiceInicial?: number;
  aoVerTodos?: (categoria: Categoria) => void;
}

export function CarrosselCategorias({ categorias, indiceInicial = 0, aoVerTodos }: CarrosselCategoriasProps) {
  const { cores, icones } = useTema();
  const { width } = useWindowDimensions();
  const [indice, setIndice] = useState(indiceInicial);

  if (categorias.length === 0) return null;

  const escala = Math.min(1, (Math.min(width, 480) - 32) / LARGURA_FIGMA);
  const e = (valor: number) => valor * escala;

  // Navegação circular: depois da última volta para a primeira.
  const total = categorias.length;
  const atual = categorias[indice % total];
  const anterior = categorias[(indice - 1 + total) % total];
  const proxima = categorias[(indice + 1) % total];

  const irPara = (passo: number) => setIndice((i) => (i + passo + total) % total);

  return (
    <View
      style={[
        estilos.container,
        { width: e(LARGURA_FIGMA), height: e(ALTURA_FIGMA), backgroundColor: cores.secundario, borderRadius: e(32) },
      ]}
    >
      {/* Card lateral esquerdo (categoria anterior) */}
      <CardLateral categoria={anterior} style={{ left: e(16), top: e(66), width: e(150), height: e(200), borderRadius: e(32) }} />
      {/* Card lateral direito (próxima categoria) */}
      <CardLateral categoria={proxima} style={{ left: e(214), top: e(66), width: e(150), height: e(200), borderRadius: e(32) }} />

      {/* Card central (categoria atual) */}
      <View style={[estilos.absoluto, estilos.recorte, { left: e(77), top: e(16), width: e(225), height: e(300), borderRadius: e(32) }]}>
        <Image source={atual.imagem} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>

      {/* Título + botão "Ver todos", centralizados sobre o card central */}
      <View style={[estilos.absoluto, estilos.tituloBotao, { left: e(77), top: e(135), width: e(225) }]}>
        <Text style={[estilos.titulo, { color: cores.tituloCategoria }]}>{atual.nome}</Text>
        <Pressable
          onPress={() => aoVerTodos?.(atual)}
          accessibilityRole="button"
          accessibilityLabel={`Ver todos os produtos de ${atual.nome}`}
          style={[estilos.botaoVerTodos, { backgroundColor: cores.secundario }]}
        >
          <Text style={estilos.textoVerTodos}>Ver todos</Text>
        </Pressable>
      </View>

      {/* Setas */}
      <Pressable
        onPress={() => irPara(-1)}
        accessibilityRole="button"
        accessibilityLabel="Categoria anterior"
        hitSlop={8}
        style={[estilos.absoluto, { left: e(8), top: e(150) }]}
      >
        <Icone fonte={icones.carrosselEsquerda} largura={32} altura={32} />
      </Pressable>
      <Pressable
        onPress={() => irPara(1)}
        accessibilityRole="button"
        accessibilityLabel="Próxima categoria"
        hitSlop={8}
        style={[estilos.absoluto, { left: e(340), top: e(150) }]}
      >
        <Icone fonte={icones.carrosselDireita} largura={32} altura={32} />
      </Pressable>
    </View>
  );
}

/** Card lateral: foto com 50% de opacidade + película preta 30%. */
function CardLateral({ categoria, style }: { categoria: Categoria; style: object }) {
  return (
    <View style={[estilos.absoluto, estilos.recorte, style]} accessible={false}>
      <Image source={categoria.imagem} style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  absoluto: {
    position: 'absolute',
  },
  recorte: {
    overflow: 'hidden',
  },
  tituloBotao: {
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    textAlign: 'center',
    // Sombra leve (não está no Figma) para o título continuar legível
    // sobre fotos claras, como a da categoria "Acessórios".
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  botaoVerTodos: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 73,
    alignItems: 'center',
  },
  textoVerTodos: {
    fontFamily: fontes.regular,
    fontSize: 12,
    color: '#F5EBE0',
  },
});
