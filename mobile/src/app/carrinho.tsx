/**
 * Tela do carrinho.
 * Figma: com produtos — claro 509:218 / escuro 628:1008;
 *        vazio        — claro 509:583 / escuro 509:1116.
 *
 * - Topo: "CARRINHO" + quantidade de itens (o Figma está escrito "PERFIL"
 *   por engano, copiado da tela de perfil);
 * - "Selecionar todos os produtos" e "Limpar carrinho";
 * - Lista de itens (CardItemCarrinho);
 * - Card "Resumo" fixo no rodapé, calculado só com os itens marcados;
 * - "finalizar compra": registra um pedido pendente na API compartilhada
 *   e abre "Meus pedidos".
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CaixaSelecao } from '../components/CaixaSelecao';
import { CardItemCarrinho } from '../components/CardItemCarrinho';
import { Icone } from '../components/Icone';
import { calcularResumo, useCarrinho } from '../context/CarrinhoContext';
import { cotarFrete } from '../services/carrinhoService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import { avisar, confirmar } from '../utils/avisos';
import { formatarPreco } from '../utils/validacoes';

/** Texto "1 item" / "2 itens". */
const textoItens = (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`;

export default function TelaCarrinho() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  const carrinho = useCarrinho();
  const { itens, totalItens, recarregar } = carrinho;

  // Altura do card de resumo (medida), para a lista não ficar escondida atrás dele.
  const [alturaResumo, setAlturaResumo] = useState(0);
  const [finalizando, setFinalizando] = useState(false);
  const compraEmAndamento = useRef(false);

  const resumo = calcularResumo(itens);
  const [cotacao, setCotacao] = useState<{ subtotal: number; frete: number } | null>(null);
  const frete = resumo.subtotal === 0 ? 0 : cotacao?.subtotal === resumo.subtotal ? cotacao.frete : null;
  useEffect(() => {
    const subtotal = resumo.subtotal;
    if (subtotal === 0) return;
    let ativo = true;
    cotarFrete(subtotal).then((dados) => {
      if (ativo) setCotacao({ subtotal, frete: dados.frete });
    }).catch((erro: Error) => {
      if (ativo) avisar('Não foi possível cotar o frete', erro.message);
    });
    return () => { ativo = false; };
  }, [resumo.subtotal]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    function atualizar() {
      recarregar().catch((erro: Error) => {
        if (ativo) avisar('Não foi possível atualizar o carrinho', erro.message);
      });
    }
    atualizar();
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });
    return () => { ativo = false; inscricao.remove(); };
  }, [recarregar]));
  const todosSelecionados = itens.length > 0 && itens.every((i) => i.selecionado);
  const vazio = itens.length === 0;

  async function limparCarrinho() {
    if (await confirmar('Limpar carrinho?', 'Todos os itens serão removidos.', 'Limpar')) {
      await alterarCarrinho(carrinho.limpar);
    }
  }

  async function alterarCarrinho(acao: () => Promise<void>) {
    if (compraEmAndamento.current) return;
    try {
      await acao();
    } catch (erro) {
      avisar('Não foi possível atualizar o carrinho', (erro as Error).message);
    }
  }

  async function finalizarCompra() {
    if (compraEmAndamento.current) return;
    const selecionados = itens.filter((i) => i.selecionado);
    if (selecionados.length === 0) {
      avisar('Nenhum item selecionado', 'Marque os produtos que deseja comprar.');
      return;
    }

    compraEmAndamento.current = true;
    setFinalizando(true);
    try {
      await carrinho.finalizar(selecionados);
      router.replace('/pedidos');
    } catch (erro) {
      avisar('Não foi possível finalizar a compra', (erro as Error).message);
    } finally {
      compraEmAndamento.current = false;
      setFinalizando(false);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      <CabecalhoPagina titulo="CARRINHO" detalhe={vazio ? undefined : textoItens(totalItens)} />

      {vazio ? (
        // Carrinho vazio (Figma: "Alerta de carrinho vazio")
        <View style={estilos.vazio}>
          <Icone fonte={iconesMonocromaticos.carrinhoVazio} largura={64} altura={84} tintColor={cores.texto} />
          <View style={estilos.textosVazio}>
            <Text style={[estilos.tituloVazio, { color: cores.texto }]}>seu carrinho está vazio! :(</Text>
            <Text style={[estilos.subtituloVazio, { color: cores.texto }]}>volte a navegar e adicione itens</Text>
          </View>
          <Pressable
            onPress={() => router.navigate('/inicio')}
            accessibilityRole="button"
            style={[estilos.botaoGrande, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
          >
            <Text style={estilos.textoBotaoGrande}>voltar as compras</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              estilos.conteudo,
              { paddingBottom: alturaResumo + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Ações para o carrinho inteiro */}
            <View style={estilos.acoes}>
              <Pressable
                onPress={() => carrinho.selecionarTodos(!todosSelecionados)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: todosSelecionados }}
                style={[estilos.botaoPequeno, { backgroundColor: cores.cardFundo }]}
              >
                <CaixaSelecao marcada={todosSelecionados} />
                <Text style={[estilos.textoBotaoPequeno, { color: cores.texto }]}>Selecionar todos os produtos</Text>
              </Pressable>

              <Pressable
                onPress={limparCarrinho}
                accessibilityRole="button"
                style={[estilos.botaoPequeno, { backgroundColor: cores.secundario }]}
              >
                <Text style={[estilos.textoBotaoPequeno, { color: cores.textoSobreSecundario }]}>Limpar carrinho</Text>
              </Pressable>
            </View>

            {/* Itens */}
            <View style={estilos.lista}>
              {itens.map((item) => (
                <CardItemCarrinho
                  key={item.id}
                  item={item}
                  aoAlternarSelecao={() => carrinho.alternarSelecao(item.id)}
                  aoAlterarQuantidade={(q) => alterarCarrinho(() => carrinho.alterarQuantidade(item, q))}
                  aoRemover={() => alterarCarrinho(() => carrinho.remover(item.id))}
                />
              ))}
            </View>
          </ScrollView>

          {/* Resumo fixo acima da barra de navegação (Figma: "Resumo do carrinho") */}
          <View
            onLayout={(e) => setAlturaResumo(e.nativeEvent.layout.height)}
            style={[
              estilos.resumo,
              {
                bottom: ALTURA_BARRA_NAVEGACAO + insets.bottom,
                backgroundColor: cores.cardFundo,
                borderColor: cores.borda,
              },
            ]}
          >
            <View style={estilos.cardResumo}>
              <Text style={[estilos.selecionados, { color: cores.texto }]}>
                {textoItens(resumo.quantidadeSelecionada)} {resumo.quantidadeSelecionada === 1 ? 'selecionado' : 'selecionados'}
              </Text>
              <Text style={[estilos.tituloResumo, { color: cores.texto }]}>Resumo</Text>

              <View style={estilos.linhasResumo}>
                <LinhaResumo rotulo="Total dos itens:" valor={formatarPreco(resumo.totalItens, true)} leve />
                <LinhaResumo
                  rotulo="Desconto:"
                  valor={formatarPreco(resumo.desconto, true)}
                  leve
                  corValor={cores.precoPromocional}
                />
                <LinhaResumo rotulo="Subtotal:" valor={formatarPreco(resumo.subtotal, true)} />
                <LinhaResumo rotulo="Envio:" valor={frete === null ? '—' : frete === 0 ? 'Grátis' : formatarPreco(frete, true)} />
                <LinhaResumo rotulo="Total:" valor={frete === null ? '—' : formatarPreco(resumo.subtotal + frete, true)} />
              </View>
            </View>

            <Pressable
              onPress={finalizarCompra}
              disabled={finalizando || frete === null}
              accessibilityRole="button"
              accessibilityState={{ busy: finalizando }}
              style={({ pressed }) => [
                estilos.botaoGrande,
                { backgroundColor: cores.secundario, borderColor: cores.borda, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {finalizando ? (
                <ActivityIndicator color="#F5EBE0" />
              ) : (
                <Text style={estilos.textoBotaoGrande}>finalizar compra</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      <BarraNavegacao ativo="carrinho" />
    </View>
  );
}

/** Uma linha do resumo: rótulo à esquerda, valor à direita. */
function LinhaResumo({
  rotulo,
  valor,
  leve = false,
  corValor,
}: {
  rotulo: string;
  valor: string;
  /** Fonte light (Total dos itens / Desconto); as demais linhas são regular. */
  leve?: boolean;
  corValor?: string;
}) {
  const { cores } = useTema();
  const fonte = { fontFamily: leve ? fontes.light : fontes.regular };
  return (
    <View style={estilos.linhaResumo}>
      <Text style={[estilos.textoResumo, fonte, { color: cores.texto }]}>{rotulo}</Text>
      <Text style={[estilos.textoResumo, fonte, { color: corValor ?? cores.texto }]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoPequeno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    // Figma: drop-shadow 0 0 1px rgba(0,0,0,0.25)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 1,
  },
  textoBotaoPequeno: {
    fontFamily: fontes.regular,
    fontSize: 10,
  },
  lista: {
    gap: 8,
  },
  resumo: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  cardResumo: {
    gap: 8,
  },
  selecionados: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  tituloResumo: {
    fontFamily: fontes.regular,
    fontSize: 16,
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
    fontSize: 14,
  },
  botaoGrande: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoGrande: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
  vazio: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  textosVazio: {
    alignItems: 'center',
  },
  tituloVazio: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  subtituloVazio: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
});
