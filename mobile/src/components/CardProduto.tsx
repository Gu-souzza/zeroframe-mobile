/**
 * Card de produto da tela inicial (Figma: "Product-Card").
 *
 * Mostra: imagem 150x150, categoria, nome, preço (com preço "de" riscado
 * e preço em vermelho quando há promoção) e o parcelamento sem juros.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { Image } from 'expo-image';

import type { Produto } from '../types';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { formatarPreco } from '../utils/validacoes';
import { Icone } from './Icone';

interface CardProdutoProps {
  produto: Produto;
  largura: number;
  aoPressionar?: (produto: Produto) => void;
  /**
   * Mostra o coração vermelho no canto (tela "Favoritos"); tocar nele chama
   * esta função (remover dos favoritos).
   */
  aoRemoverFavorito?: (produto: Produto) => void;
}

export function CardProduto({ produto, largura, aoPressionar, aoRemoverFavorito }: CardProdutoProps) {
  const { cores, icones } = useTema();
  const emPromocao = produto.precoOriginal !== undefined && produto.precoOriginal > produto.preco;
  const valorParcela = produto.preco / produto.parcelas;

  return (
    // O coração fica FORA do Pressable do card (irmão, por cima): botão dentro
    // de botão é inválido na web e confunde leitores de tela.
    <View style={{ width: largura }}>
      <Pressable
        onPress={() => aoPressionar?.(produto)}
        accessibilityRole="button"
        accessibilityLabel={`${produto.nome}, ${formatarPreco(produto.preco)}`}
        style={[estilos.card, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
      >
        {/* Foto quadrada (1:1), recortada sem distorcer. */}
        <Image source={produto.imagem} style={estilos.imagem} contentFit="cover" />

        <View style={estilos.textos}>
          <Text style={[estilos.categoria, { color: cores.texto }]}>{produto.categoria}</Text>
          <Text style={[estilos.nome, { color: cores.texto }]}>{produto.nome}</Text>

          {emPromocao && (
            <Text style={[estilos.precoOriginal, { color: cores.texto }]}>
              {formatarPreco(produto.precoOriginal!)}
            </Text>
          )}
          <Text style={[estilos.preco, { color: emPromocao ? cores.precoPromocional : cores.texto }]}>
            {formatarPreco(produto.preco)}
          </Text>

          <Text style={[estilos.parcelas, { color: cores.texto }]}>
            ou {produto.parcelas}x de {formatarPreco(valorParcela)} sem juros
          </Text>
        </View>
      </Pressable>

      {/* Coração no canto (Figma: "Botão favorito", 32x32) — só na tela Favoritos */}
      {aoRemoverFavorito && (
        <Pressable
          onPress={() => aoRemoverFavorito(produto)}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${produto.nome} dos favoritos`}
          hitSlop={6}
          style={estilos.botaoFavorito}
        >
          <Icone fonte={icones.botaoFavorito} largura={32} altura={32} />
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 16,
    gap: 16,
    alignItems: 'center',
  },
  imagem: {
    width: 150,
    height: 150,
  },
  botaoFavorito: {
    position: 'absolute',
    top: 16,
    right: 10,
  },
  textos: {
    width: '100%',
    gap: 5,
  },
  categoria: { fontFamily: fontes.regular, fontSize: 10 },
  nome: { fontFamily: fontes.semiBold, fontSize: 16 },
  precoOriginal: { fontFamily: fontes.light, fontSize: 12, textDecorationLine: 'line-through' },
  preco: { fontFamily: fontes.semiBold, fontSize: 16 },
  parcelas: { fontFamily: fontes.light, fontSize: 12 },
});
