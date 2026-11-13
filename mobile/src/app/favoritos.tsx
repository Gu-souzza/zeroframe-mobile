/**
 * Favoritos (Figma: claro 634:1588 / escuro 634:1706).
 * Aberta pelo atalho "favoritos" da tela de perfil.
 *
 * - Topo: voltar + "Favoritos" + quantidade de itens;
 * - Grade de produtos com o coração vermelho no canto: tocar no coração
 *   remove dos favoritos; tocar no card abre o produto.
 * Os favoritos são os mesmos marcados na tela do produto (FavoritosContext).
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { Icone } from '../components/Icone';
import { GradeProdutos } from '../components/SecaoProdutos';
import { useFavoritos } from '../context/FavoritosContext';
import { obterProdutos } from '../services/produtosService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { Produto } from '../types';
import { avisar } from '../utils/avisos';
import { abrirProduto, voltarOu } from '../utils/navegacao';

export default function TelaFavoritos() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  const { ids, alternar, recarregar } = useFavoritos();
  useFocusEffect(useCallback(() => {
    let ativo = true;
    recarregar().catch((erro: Error) => {
      if (ativo) avisar('Não foi possível carregar os favoritos', erro.message);
    });
    return () => { ativo = false; };
  }, [recarregar]));

  // Produtos já carregados, por id (para não piscar "carregando" ao remover um item).
  const [produtosPorId, setProdutosPorId] = useState<Record<string, Produto> | null>(null);

  useEffect(() => {
    let ativo = true;
    obterProdutos(ids).then((lista) => {
      if (!ativo) return;
      setProdutosPorId((atual) => ({ ...atual, ...Object.fromEntries(lista.map((p) => [p.id, p])) }));
    }).catch((erro: Error) => {
      if (!ativo) return;
      setProdutosPorId((atual) => atual ?? {});
      avisar('Não foi possível carregar os produtos', erro.message);
    });
    return () => {
      ativo = false;
    };
  }, [ids]);

  const produtos = produtosPorId ? ids.map((id) => produtosPorId[id]).filter(Boolean) : null;
  const quantidade = ids.length;

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina
        titulo="Favoritos"
        detalhe={quantidade > 0 ? `${quantidade} ${quantidade === 1 ? 'item' : 'itens'}` : undefined}
        aoVoltar={() => voltarOu('/perfil')}
      />

      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {produtos === null ? (
          <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
        ) : produtos.length === 0 ? (
          <View style={estilos.vazio}>
            <Icone fonte={iconesMonocromaticos.favoritos} largura={30} altura={27} tintColor={cores.texto} />
            <Text style={[estilos.textoVazio, { color: cores.texto }]}>você ainda não tem favoritos</Text>
            <Text style={[estilos.subtextoVazio, { color: cores.tituloSecaoSuave }]}>
              toque em &quot;Adicionar aos favoritos&quot; na página de um produto
            </Text>
            <Pressable
              onPress={() => router.navigate('/inicio')}
              accessibilityRole="button"
              style={[estilos.botao, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
            >
              <Text style={estilos.textoBotao}>ver produtos</Text>
            </Pressable>
          </View>
        ) : (
          <GradeProdutos
            produtos={produtos}
            aoPressionarProduto={abrirProduto}
            aoRemoverFavorito={(p) => alternar(p.id)
              .catch((erro: Error) => avisar('Não foi possível atualizar os favoritos', erro.message))}
          />
        )}
      </ScrollView>

      <BarraNavegacao ativo="perfil" />
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
  },
  carregando: {
    marginTop: 48,
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 32,
  },
  textoVazio: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  subtextoVazio: {
    fontFamily: fontes.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  botao: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
});
