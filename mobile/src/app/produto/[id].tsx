/**
 * Tela do produto (Figma: claro 534:1170 / escuro 538:1330).
 *
 * Rota: /produto/:id
 *
 * - Topo fixo: botão voltar + nome do produto;
 * - Carrossel de fotos (quadradas, recortadas sem distorcer);
 * - Botão "Adicionar aos favoritos" (vira "Adicionado aos favoritos" com
 *   coração vermelho, como na versão escura do Figma);
 * - Categoria, nome, preço, nota e seleção de tamanho;
 * - "adicionar ao carrinho" (exige tamanho escolhido);
 * - "PRODUTOS RECOMENDADOS" e a barra de navegação.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CarrosselImagensProduto } from '../../components/CarrosselImagensProduto';
import { Icone } from '../../components/Icone';
import { SecaoProdutos } from '../../components/SecaoProdutos';
import { useCarrinho } from '../../context/CarrinhoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { listarRecomendados, obterProduto } from '../../services/produtosService';
import { useTema } from '../../theme/TemaContext';
import { iconesComuns, iconesMonocromaticos } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import type { Produto } from '../../types';
import { avisar } from '../../utils/avisos';
import { abrirProduto } from '../../utils/navegacao';
import { formatarPreco } from '../../utils/validacoes';

export default function TelaProduto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // `key` remonta a tela ao abrir outro produto (ex.: pelos recomendados),
  // zerando tamanho, favorito e rolagem.
  return <ConteudoProduto key={id} id={id} />;
}

function ConteudoProduto({ id }: { id: string }) {
  const { cores, icones, tema } = useTema();
  const insets = useSafeAreaInsets();
  const { adicionar } = useCarrinho();
  const favoritos = useFavoritos();
  const favorito = favoritos.ehFavorito(id);

  // `undefined` = carregando, `null` = não encontrado
  const [produto, setProduto] = useState<Produto | null | undefined>(undefined);
  const [recomendados, setRecomendados] = useState<Produto[]>([]);
  const [variacaoId, setVariacaoId] = useState<number | null>(null);
  const [erroTamanho, setErroTamanho] = useState(false);
  const variacao = produto?.variacoes.find((item) => item.id === variacaoId);

  useEffect(() => {
    let ativo = true;
    Promise.all([obterProduto(id), listarRecomendados(id)]).then(([p, recs]) => {
      if (!ativo) return;
      setProduto(p);
      setRecomendados(recs);
      const emEstoque = p?.variacoes.filter((item) => item.estoque > 0);
      if (emEstoque?.length === 1) setVariacaoId(emEstoque[0].id);
    }).catch((erro: Error) => {
      if (ativo) {
        setProduto(null);
        avisar('Não foi possível carregar o produto', erro.message);
      }
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  const alternarFavorito = () => favoritos.alternar(id)
    .catch((erro: Error) => avisar('Não foi possível atualizar os favoritos', erro.message));

  async function adicionarAoCarrinho() {
    if (!produto) return;
    if (!variacao) {
      setErroTamanho(true);
      return;
    }
    try {
      await adicionar(variacao.id);
      avisar('Adicionado ao carrinho', `${produto.nome} — ${variacao.tamanho} / ${variacao.cor}`);
    } catch (erro) {
      avisar('Não foi possível adicionar ao carrinho', (erro as Error).message);
    }
  }

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/inicio'));

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      {/* Topo (Figma: "Head da página") */}
      <View
        style={[
          estilos.topo,
          { paddingTop: Math.max(32, insets.top + 16), backgroundColor: cores.fundo, borderBottomColor: cores.borda },
        ]}
      >
        <View style={estilos.topoConteudo}>
          <Pressable onPress={voltar} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
            <Icone fonte={icones.botaoVoltar} largura={48} altura={48} />
          </Pressable>
          <Text style={[estilos.tituloTopo, { color: cores.texto }]} numberOfLines={1} accessibilityRole="header">
            {produto?.nome ?? ''}
          </Text>
        </View>
      </View>

      {produto === undefined ? (
        <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
      ) : produto === null ? (
        <View style={estilos.naoEncontrado}>
          <Icone fonte={iconesMonocromaticos.fantasma} largura={70} altura={64} tintColor={cores.texto} />
          <Text style={[estilos.textoNaoEncontrado, { color: cores.texto }]}>produto não encontrado :(</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            estilos.conteudo,
            { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.detalhes}>
            <CarrosselImagensProduto imagens={produto.imagens ?? [produto.imagem]} nomeProduto={produto.nome} />

            {/* Favoritos (Figma: "Selecionar todos") */}
            <Pressable
              onPress={alternarFavorito}
              accessibilityRole="button"
              accessibilityState={{ selected: favorito }}
              style={[estilos.favoritos, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
            >
              {favorito ? (
                <Icone fonte={iconesComuns.coracaoCheio} largura={11} altura={10} />
              ) : (
                <Icone fonte={iconesMonocromaticos.coracaoContorno} largura={12.5} altura={11.5} tintColor={cores.texto} />
              )}
              <Text style={[estilos.textoFavoritos, { color: cores.texto }]}>
                {favorito ? 'Adicionado aos favoritos' : 'Adicionar aos favoritos'}
              </Text>
            </Pressable>

            {/* Informações do produto */}
            <View style={estilos.informacoes}>
              <View style={estilos.grupoPequeno}>
                <Text style={[estilos.categoria, { color: cores.texto }]}>{produto.categoria}</Text>
                <Text style={[estilos.nome, { color: cores.texto }]}>{produto.nome}</Text>
              </View>

              <View style={estilos.grupoPequeno}>
                {produto.precoOriginal !== undefined && (
                  <Text style={[estilos.precoOriginal, { color: cores.texto }]}>
                    {formatarPreco(produto.precoOriginal)}
                  </Text>
                )}
                <Text
                  style={[
                    estilos.preco,
                    { color: produto.precoOriginal !== undefined ? cores.precoPromocional : cores.texto },
                  ]}
                >
                  {formatarPreco(produto.preco)}
                </Text>
                <Text style={[estilos.pagamento, { color: cores.texto }]}>
                  no pix ou {produto.parcelas}x sem juros
                </Text>
              </View>

              <View style={estilos.nota} accessibilityLabel={`Nota ${produto.nota.toFixed(1)} de 5`}>
                <Icone fonte={iconesComuns.estrela} largura={16.5} altura={15.8} />
                <Text style={[estilos.textoNota, { color: cores.texto }]}>
                  {produto.nota.toFixed(1).replace('.', ',')}
                </Text>
              </View>

              {/* Seleção de tamanho */}
              <View style={estilos.secaoTamanho}>
                <Text style={[estilos.textoTamanho, { color: erroTamanho ? cores.erro : cores.texto }]}>
                  {variacao ? `${variacao.tamanho} / ${variacao.cor}` : erroTamanho ? 'Selecione tamanho e cor' : 'Tamanho e cor:'}
                </Text>
                <View style={estilos.tamanhos}>
                  {produto.variacoes.filter((item) => item.estoque > 0).map((item) => {
                    const selecionado = item.id === variacaoId;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setVariacaoId(item.id);
                          setErroTamanho(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Tamanho ${item.tamanho}, cor ${item.cor}`}
                        accessibilityState={{ selected: selecionado }}
                        style={[
                          estilos.botaoTamanho,
                          {
                            borderColor: cores.borda,
                            backgroundColor: selecionado ? cores.tamanhoSelecionadoFundo : cores.cardFundo,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            estilos.textoBotaoTamanho,
                            { color: selecionado ? cores.tamanhoSelecionadoTexto : cores.texto },
                          ]}
                        >
                          {item.tamanho} / {item.cor}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Botão de compra */}
            <Pressable
              onPress={adicionarAoCarrinho}
              accessibilityRole="button"
              style={({ pressed }) => [
                estilos.botaoCarrinho,
                { backgroundColor: cores.secundario, borderColor: cores.borda, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={estilos.textoBotaoCarrinho}>adicionar ao carrinho</Text>
            </Pressable>
          </View>

          {/* Recomendados não tem "VER TUDO" (sem `aoVerTudo`, o botão não aparece). */}
          <SecaoProdutos titulo="PRODUTOS RECOMENDADOS" produtos={recomendados} aoPressionarProduto={abrirProduto} />
        </ScrollView>
      )}

      <BarraNavegacao ativo="inicio" />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  topo: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
  },
  topoConteudo: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tituloTopo: {
    flex: 1,
    fontFamily: fontes.regular,
    fontSize: 20,
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
    textAlign: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  detalhes: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  favoritos: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 5,
  },
  textoFavoritos: {
    fontFamily: fontes.regular,
    fontSize: 10,
  },
  informacoes: {
    gap: 8,
  },
  grupoPequeno: {
    gap: 2,
  },
  categoria: {
    fontFamily: fontes.light,
    fontSize: 14,
  },
  nome: {
    fontFamily: fontes.bold,
    fontSize: 16,
  },
  precoOriginal: {
    fontFamily: fontes.light,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  preco: {
    fontFamily: fontes.bold,
    fontSize: 20,
  },
  pagamento: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  textoNota: {
    fontFamily: fontes.light,
    fontSize: 14,
  },
  secaoTamanho: {
    gap: 5,
  },
  textoTamanho: {
    fontFamily: fontes.light,
    fontSize: 14,
  },
  tamanhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  botaoTamanho: {
    minWidth: 52,
    minHeight: 32,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoTamanho: {
    fontFamily: fontes.archivo,
    fontSize: 14,
  },
  botaoCarrinho: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoCarrinho: {
    fontFamily: fontes.regular,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
});
