/**
 * Item do carrinho (Figma: "Produto 1" / "Produto 2" em "Itens do carrinho").
 *
 * [caixa] [foto 64x64] [nome, tamanho, preço]  [lixeira]
 *                                              [− qtd +]
 *
 * - Tocar na caixa (ou na foto/nome) marca/desmarca o item para a compra;
 * - Lixeira remove o item;
 * - "−" e "+" mudam a quantidade (mínimo 1, máximo QUANTIDADE_MAXIMA).
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { Image } from 'expo-image';

import { QUANTIDADE_MAXIMA, type ItemCarrinho } from '../context/CarrinhoContext';
import { useTema } from '../theme/TemaContext';
import { iconesComuns, iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import { formatarPreco } from '../utils/validacoes';
import { CaixaSelecao } from './CaixaSelecao';
import { Icone } from './Icone';

interface CardItemCarrinhoProps {
  item: ItemCarrinho;
  aoAlternarSelecao: () => void;
  aoAlterarQuantidade: (quantidade: number) => void;
  aoRemover: () => void;
}

export function CardItemCarrinho({ item, aoAlternarSelecao, aoAlterarQuantidade, aoRemover }: CardItemCarrinhoProps) {
  const { cores } = useTema();
  const emPromocao = item.precoOriginal !== undefined && item.precoOriginal > item.preco;

  return (
    <View style={[estilos.card, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
      {/* Caixa + foto + textos: área de toque para marcar/desmarcar */}
      <Pressable
        onPress={aoAlternarSelecao}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.selecionado }}
        accessibilityLabel={`Selecionar ${item.nome}`}
        style={estilos.areaSelecao}
      >
        <CaixaSelecao marcada={item.selecionado} />

        {/* Foto quadrada, recortada sem distorcer */}
        <Image source={item.imagem} style={estilos.imagem} contentFit="cover" />

        <View style={estilos.informacoes}>
          <View style={estilos.nomeTamanho}>
            <Text style={[estilos.nome, { color: cores.texto }]}>{item.nome}</Text>
            <Text style={[estilos.tamanho, { color: cores.texto }]}>{item.tamanho} / {item.cor}</Text>
          </View>

          <View>
            {emPromocao && (
              <Text style={[estilos.precoOriginal, { color: cores.texto }]}>
                {formatarPreco(item.precoOriginal! * item.quantidade)}
              </Text>
            )}
            <Text style={[estilos.preco, { color: emPromocao ? cores.vermelho : cores.texto }]}>
              {formatarPreco(item.preco * item.quantidade)}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Controles: remover + quantidade */}
      <View style={estilos.controles}>
        <Pressable
          onPress={aoRemover}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.nome} do carrinho`}
          style={[estilos.botaoRemover, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
        >
          <Icone fonte={iconesComuns.lixeira} largura={18} altura={18} />
        </Pressable>

        <View style={[estilos.quantidade, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
          <Pressable
            onPress={() => aoAlterarQuantidade(item.quantidade - 1)}
            disabled={item.quantidade <= 1}
            accessibilityRole="button"
            accessibilityLabel="Diminuir quantidade"
            style={[estilos.botaoQuantidade, item.quantidade <= 1 && estilos.desabilitado]}
          >
            <Icone fonte={iconesMonocromaticos.menos} largura={12} altura={14} tintColor={cores.texto} />
          </Pressable>
          <Text style={[estilos.textoQuantidade, { color: cores.texto }]} accessibilityLabel={`Quantidade ${item.quantidade}`}>
            {item.quantidade}
          </Text>
          <Pressable
            onPress={() => aoAlterarQuantidade(item.quantidade + 1)}
            disabled={item.quantidade >= QUANTIDADE_MAXIMA}
            accessibilityRole="button"
            accessibilityLabel="Aumentar quantidade"
            style={[estilos.botaoQuantidade, item.quantidade >= QUANTIDADE_MAXIMA && estilos.desabilitado]}
          >
            <Icone fonte={iconesMonocromaticos.mais} largura={12} altura={10} tintColor={cores.texto} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
  },
  areaSelecao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imagem: {
    width: 64,
    height: 64,
  },
  informacoes: {
    flex: 1,
    gap: 8,
  },
  nomeTamanho: {
    gap: 2,
  },
  nome: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  tamanho: {
    fontFamily: fontes.light,
    fontSize: 10,
  },
  precoOriginal: {
    fontFamily: fontes.light,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  preco: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  controles: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoRemover: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  botaoQuantidade: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desabilitado: {
    opacity: 0.35,
  },
  textoQuantidade: {
    fontFamily: fontes.regular,
    fontSize: 12,
    minWidth: 8,
    textAlign: 'center',
  },
});
