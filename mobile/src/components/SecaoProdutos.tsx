/**
 * Seção de produtos da tela inicial (Figma: "Seção recomendados",
 * "Seção ORIGINAIS", "Seção Multimarcas").
 *
 * Cabeçalho com título + "VER TUDO", linha divisória e grade de 2 colunas.
 */
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from './Texto';

import type { Produto } from '../types';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { CardProduto } from './CardProduto';
import { Icone } from './Icone';

/** Espaços da grade, iguais ao Figma. */
const PADDING_LATERAL = 16;
const ESPACO_COLUNAS = 10;
const ESPACO_LINHAS = 16;
/** Largura máxima do conteúdo (frame do Figma = 412px). */
const LARGURA_MAXIMA = 480;

interface SecaoProdutosProps {
  titulo: string;
  produtos: Produto[];
  aoVerTudo?: () => void;
  aoPressionarProduto?: (produto: Produto) => void;
}

export function SecaoProdutos({ titulo, produtos, aoVerTudo, aoPressionarProduto }: SecaoProdutosProps) {
  return (
    <View style={estilos.secao}>
      <CabecalhoSecao titulo={titulo} aoVerTudo={aoVerTudo} />
      <GradeProdutos produtos={produtos} aoPressionarProduto={aoPressionarProduto} />
    </View>
  );
}

/**
 * Grade de 2 colunas de cards de produto (Figma: "Products-cont").
 * Reaproveitada na tela inicial, nos resultados da busca e na tela do produto.
 * A largura dos cards acompanha a largura da tela (até 480px).
 */
export function GradeProdutos({
  produtos,
  aoPressionarProduto,
  aoRemoverFavorito,
}: {
  produtos: Produto[];
  aoPressionarProduto?: (produto: Produto) => void;
  /** Tela "Favoritos": mostra o coração no canto de cada card. */
  aoRemoverFavorito?: (produto: Produto) => void;
}) {
  const { width } = useWindowDimensions();

  const larguraConteudo = Math.min(width, LARGURA_MAXIMA) - PADDING_LATERAL * 2;
  const larguraCard = (larguraConteudo - ESPACO_COLUNAS) / 2;

  return (
    <View style={estilos.grade}>
      {produtos.map((produto) => (
        <CardProduto
          key={produto.id}
          produto={produto}
          largura={larguraCard}
          aoPressionar={aoPressionarProduto}
          aoRemoverFavorito={aoRemoverFavorito}
        />
      ))}
    </View>
  );
}

/** Título da seção + "VER TUDO" (opcional) + linha divisória. Reaproveitado em "CATEGORIAS". */
export function CabecalhoSecao({ titulo, aoVerTudo }: { titulo: string; aoVerTudo?: () => void }) {
  const { cores, icones } = useTema();

  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.linhaTitulo}>
        <Text style={[estilos.titulo, { color: cores.tituloSecao }]}>{titulo}</Text>

        {aoVerTudo && (
          <Pressable
            onPress={aoVerTudo}
            accessibilityRole="button"
            accessibilityLabel={`Ver tudo de ${titulo}`}
            hitSlop={8}
            style={estilos.verTudo}
          >
            <Text style={[estilos.titulo, { color: cores.tituloSecao }]}>VER TUDO</Text>
            <Icone fonte={icones.setaVerTudo} largura={16} altura={16} />
          </Pressable>
        )}
      </View>

      {/* Linha divisória exportada do Figma; o SVG estica na largura (preserveAspectRatio="none"). */}
      <Icone fonte={icones.linhaDivisoria} largura={0} altura={1} style={estilos.linha} />
    </View>
  );
}

const estilos = StyleSheet.create({
  secao: {
    width: '100%',
    paddingHorizontal: PADDING_LATERAL,
    paddingVertical: 16,
    gap: 22,
  },
  cabecalho: {
    width: '100%',
    gap: 8,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  verTudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linha: {
    width: '100%',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: ESPACO_COLUNAS,
    rowGap: ESPACO_LINHAS,
  },
});
