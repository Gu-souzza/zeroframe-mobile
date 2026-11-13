/**
 * Card de um pedido em "Meus pedidos" (Figma: "Pedido #0005" etc.).
 *
 * [Pedido #0005           (selo de status)]
 * [Feito em 02 out 2026                    ]
 * [foto][foto][+N]               2 itens   ]
 * [                           R$ 180,00    ]
 * -----------------------------------------
 * [Frase sobre o status do pedido          ]
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { Image } from 'expo-image';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import type { Pedido, StatusPedido } from '../types';
import { formatarDataCurta } from '../utils/datas';
import { formatarPreco } from '../utils/validacoes';

/**
 * Rótulo e cor de fundo do selo de cada status.
 * As cores são as do Figma (60% de opacidade), iguais nos dois temas;
 * o texto do selo usa a cor `placeholder` do tema.
 */
export const SELOS_STATUS: Record<StatusPedido, { rotulo: string; fundo: string }> = {
  pendente: { rotulo: 'Pendente', fundo: 'rgba(140, 90, 60, 0.6)' },
  preparando: { rotulo: 'Preparando', fundo: 'rgba(255, 204, 0, 0.6)' },
  saiu_para_entrega: { rotulo: 'Saiu para entrega', fundo: 'rgba(0, 192, 232, 0.6)' },
  entregue: { rotulo: 'Entregue', fundo: 'rgba(52, 199, 89, 0.6)' },
  // Pedidos criados pelo "finalizar compra" (sem pagamento ainda): mesma cor de "Entregue".
  concluido: { rotulo: 'Concluído', fundo: 'rgba(52, 199, 89, 0.6)' },
  cancelado: { rotulo: 'Cancelado', fundo: 'rgba(253, 55, 55, 0.6)' },
};

/** Frase da última linha do card, de acordo com o status. */
export function frasePedido(pedido: Pedido): string {
  switch (pedido.status) {
    case 'pendente':
      return 'Aguardando confirmação de pagamento';
    case 'preparando':
      return 'Estamos separando seus produtos';
    case 'saiu_para_entrega':
      return pedido.previsaoEntrega
        ? `Previsão de entrega: ${formatarDataCurta(pedido.previsaoEntrega)}`
        : 'Seu pedido está a caminho';
    case 'entregue':
      return `Entregue em ${formatarDataCurta(pedido.finalizadoEm ?? pedido.criadoEm)}`;
    case 'concluido':
      return `Pedido concluído em ${formatarDataCurta(pedido.finalizadoEm ?? pedido.criadoEm)}`;
    case 'cancelado':
      return 'Pedido cancelado';
  }
}

/** Quantas fotos aparecem antes do quadrado "+N". */
const MAX_FOTOS = 2;

export function CardPedido({ pedido, aoPressionar }: { pedido: Pedido; aoPressionar?: (pedido: Pedido) => void }) {
  const { cores } = useTema();
  const selo = SELOS_STATUS[pedido.status];
  const quantidade = pedido.itens.reduce((soma, i) => soma + i.quantidade, 0);
  const extras = pedido.itens.length - MAX_FOTOS;

  return (
    <Pressable
      onPress={() => aoPressionar?.(pedido)}
      disabled={!aoPressionar}
      style={({ pressed }) => [
        estilos.card,
        { backgroundColor: cores.cardFundo, borderColor: cores.borda, opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${pedido.numero}, ${selo.rotulo}, ${formatarPreco(pedido.total, true)}. Ver detalhes`}
    >
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <View style={estilos.info}>
          <Text style={[estilos.numero, { color: cores.texto }]}>Pedido {pedido.numero}</Text>
          <Text style={[estilos.data, { color: cores.texto }]}>Feito em {formatarDataCurta(pedido.criadoEm)}</Text>
        </View>
        <View style={[estilos.selo, { backgroundColor: selo.fundo }]}>
          <Text style={[estilos.textoSelo, { color: cores.placeholder }]}>{selo.rotulo}</Text>
        </View>
      </View>

      {/* Fotos + quantidade e total */}
      <View style={estilos.produtos}>
        <View style={estilos.fotos}>
          {pedido.itens.slice(0, MAX_FOTOS).map((item) => (
            // Fotos quadradas, recortadas sem distorcer.
            <Image key={`${item.produtoId}-${item.tamanho}`} source={item.imagem} style={estilos.foto} contentFit="cover" />
          ))}
          {extras > 0 && (
            <View style={[estilos.foto, estilos.mais, { borderColor: cores.borda }]}>
              <Text style={[estilos.textoMais, { color: cores.texto }]}>+{extras}</Text>
            </View>
          )}
        </View>
        <View style={estilos.valores}>
          <Text style={[estilos.quantidade, { color: cores.placeholder }]}>
            {quantidade} {quantidade === 1 ? 'item' : 'itens'}
          </Text>
          <Text style={[estilos.total, { color: cores.texto }]}>{formatarPreco(pedido.total, true)}</Text>
        </View>
      </View>

      {/* Frase do status */}
      <View style={[estilos.resumo, { borderTopColor: cores.borda }]}>
        <Text style={[estilos.frase, { color: cores.placeholder }]}>{frasePedido(pedido)}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    width: '100%',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  info: {
    flex: 1,
  },
  numero: {
    fontFamily: fontes.medium,
    fontSize: 14,
  },
  data: {
    fontFamily: fontes.light,
    fontSize: 10,
  },
  selo: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  textoSelo: {
    fontFamily: fontes.medium,
    fontSize: 10,
  },
  produtos: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fotos: {
    flexDirection: 'row',
    gap: 10,
  },
  foto: {
    width: 64,
    height: 64,
  },
  mais: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoMais: {
    fontFamily: fontes.medium,
    fontSize: 14,
  },
  valores: {
    alignItems: 'flex-end',
  },
  quantidade: {
    fontFamily: fontes.light,
    fontSize: 10,
  },
  total: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  resumo: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  frase: {
    fontFamily: fontes.regular,
    fontSize: 12,
  },
});
