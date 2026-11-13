/**
 * Detalhes do pedido (Figma: claro 604:960 / escuro 611:2351).
 * Rota: /pedido/:id — aberta ao tocar num card em "Meus pedidos".
 *
 * - Topo: voltar + "Pedido #0002" + "Feito em 15/10/2026";
 * - Card de status com a linha do tempo da entrega;
 * - ITENS comprados (foto, tamanho, quantidade e preço);
 * - ENDEREÇO de entrega;
 * - Resumo de valores (subtotal, desconto, envio, total);
 * - "preciso de ajuda com este pedido".
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { SELOS_STATUS, frasePedido } from '../../components/CardPedido';
import { Icone } from '../../components/Icone';
import { LinhaDoTempoPedido } from '../../components/LinhaDoTempoPedido';
import { obterPedido } from '../../services/pedidosService';
import { avisar } from '../../utils/avisos';
import { useTema } from '../../theme/TemaContext';
import { iconesMonocromaticos } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import type { ItemPedido, Pedido } from '../../types';
import { formatarDataNumerica } from '../../utils/datas';
import { voltarOu } from '../../utils/navegacao';
import { formatarPreco } from '../../utils/validacoes';

export default function TelaDetalhesPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // `key` remonta a tela ao trocar de pedido, zerando o estado.
  return <ConteudoPedido key={id} id={id} />;
}

function ConteudoPedido({ id }: { id: string }) {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  // `undefined` = carregando, `null` = não encontrado
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    obterPedido(id).then((p) => ativo && setPedido(p)).catch((erro: Error) => {
      if (!ativo) return;
      setPedido(null);
      avisar('Não foi possível carregar o pedido', erro.message);
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  const voltar = () => voltarOu('/pedidos');

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina
        titulo={pedido ? `Pedido ${pedido.numero}` : 'Pedido'}
        subtitulo={pedido ? `Feito em ${formatarDataNumerica(pedido.criadoEm)}` : undefined}
        aoVoltar={voltar}
      />

      {pedido === undefined ? (
        <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
      ) : pedido === null ? (
        <View style={estilos.naoEncontrado}>
          <Icone fonte={iconesMonocromaticos.fantasma} largura={70} altura={64} tintColor={cores.texto} />
          <Text style={[estilos.textoNaoEncontrado, { color: cores.texto }]}>pedido não encontrado :(</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status + linha do tempo */}
          <View style={[estilos.card, estilos.cardStatus, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
            <Text style={[estilos.tituloStatus, { color: cores.texto }]}>{SELOS_STATUS[pedido.status].rotulo}</Text>
            <Text style={[estilos.fraseStatus, { color: cores.texto }]}>{frasePedido(pedido)}</Text>
            <LinhaDoTempoPedido pedido={pedido} />
          </View>

          {/* Itens */}
          <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>ITENS</Text>
          <View style={estilos.itens}>
            {pedido.itens.map((item) => (
              <CardItemPedido key={`${item.produtoId}-${item.tamanho}-${item.cor ?? ''}`} item={item} />
            ))}
          </View>

          {/* Endereço */}
          {pedido.enderecoEntrega && (
            <>
              <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>ENDEREÇO</Text>
              <View style={[estilos.card, estilos.cardEndereco, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
                <Icone fonte={iconesMonocromaticos.pinoEndereco} largura={22} altura={26} tintColor={cores.texto} />
                <View style={estilos.endereco}>
                  <Text style={[estilos.entregarEm, { color: cores.texto }]}>Entregar em</Text>
                  <View>
                    <Text style={[estilos.linhaEnderecoPrincipal, { color: cores.texto }]}>
                      {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero}
                    </Text>
                    <Text style={[estilos.linhaEndereco, { color: cores.texto }]}>
                      {[pedido.enderecoEntrega.complemento, pedido.enderecoEntrega.bairro].filter(Boolean).join(' - ')}
                    </Text>
                    <Text style={[estilos.linhaEndereco, { color: cores.texto }]}>
                      {pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.uf} - {pedido.enderecoEntrega.cep}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Resumo de valores */}
          <ResumoValores pedido={pedido} />

          {/* Ajuda */}
          <Pressable
            // Abre "Ajuda e suporte" já com o assunto e o pedido preenchidos.
            onPress={() =>
              router.push({
                pathname: '/suporte',
                params: { categoria: 'pedido', pedido: pedido.id, assunto: `Pedido ${pedido.numero}` },
              })
            }
            accessibilityRole="button"
            style={[estilos.botaoAjuda, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
          >
            <Text style={estilos.textoBotaoAjuda}>preciso de ajuda com este pedido</Text>
          </Pressable>
        </ScrollView>
      )}

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

/** Item comprado (Figma: "Produto comprado"). Foto quadrada recortada sem distorcer. */
function CardItemPedido({ item }: { item: ItemPedido }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.card, estilos.cardItem, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
      <Image source={item.imagem} style={estilos.fotoItem} contentFit="cover" />
      <View style={estilos.infoItem}>
        <View style={estilos.nomeItem}>
          <Text style={[estilos.textoNome, { color: cores.texto }]}>{item.nome}</Text>
          <Text style={[estilos.textoTamanho, { color: cores.texto }]}>
            {item.tamanho}{item.cor ? ' / ' + item.cor : ''} - Qtde: {item.quantidade}
          </Text>
        </View>
        <Text style={[estilos.textoPreco, { color: cores.texto }]}>
          {formatarPreco(item.precoUnitario * item.quantidade)}
        </Text>
      </View>
    </View>
  );
}

/** Card de valores: subtotal (sem desconto), desconto, envio e total. */
function ResumoValores({ pedido }: { pedido: Pedido }) {
  const { cores } = useTema();
  const subtotal = pedido.itens.reduce((s, i) => s + (i.precoOriginalUnitario ?? i.precoUnitario) * i.quantidade, 0);
  const pago = pedido.itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const envio = pedido.envio ?? 0;

  const linhas: [string, string][] = [
    ['Subtotal:', formatarPreco(subtotal, true)],
    ['Desconto:', formatarPreco(subtotal - pago, true)],
    ['Envio:', envio === 0 ? 'Grátis' : formatarPreco(envio, true)],
  ];

  return (
    <View style={[estilos.card, estilos.cardResumo, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
      <View style={estilos.linhasResumo}>
        {linhas.map(([rotulo, valor]) => (
          <View key={rotulo} style={estilos.linhaResumo}>
            <Text style={[estilos.textoResumo, { color: cores.texto }]}>{rotulo}</Text>
            <Text style={[estilos.textoResumo, { color: cores.texto }]}>{valor}</Text>
          </View>
        ))}
      </View>
      <View style={[estilos.divisoria, { backgroundColor: cores.borda }]} />
      <View style={estilos.linhaResumo}>
        <Text style={[estilos.textoTotal, { color: cores.texto }]}>Total:</Text>
        <Text style={[estilos.textoTotal, { color: cores.texto }]}>{formatarPreco(pedido.total, true)}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  carregando: {
    marginTop: 64,
  },
  naoEncontrado: {
    alignItems: 'center',
    gap: 16,
    padding: 48,
  },
  textoNaoEncontrado: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
  },
  cardStatus: {
    padding: 10,
    gap: 10,
  },
  tituloStatus: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  fraseStatus: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  tituloSecao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  itens: {
    gap: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  fotoItem: {
    width: 64,
    height: 64,
  },
  infoItem: {
    flex: 1,
    gap: 8,
  },
  nomeItem: {
    gap: 2,
  },
  textoNome: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  textoTamanho: {
    fontFamily: fontes.light,
    fontSize: 10,
  },
  textoPreco: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  cardEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  endereco: {
    flex: 1,
    gap: 5,
  },
  entregarEm: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  linhaEnderecoPrincipal: {
    fontFamily: fontes.light,
    fontSize: 14,
  },
  linhaEndereco: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  cardResumo: {
    padding: 16,
    gap: 16,
  },
  linhasResumo: {
    gap: 2,
  },
  linhaResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoResumo: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  divisoria: {
    height: 1,
    width: '100%',
  },
  textoTotal: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  botaoAjuda: {
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoAjuda: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
});
