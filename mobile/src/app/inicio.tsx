/**
 * Tela inicial dos produtos (Figma: claro 483:2 / escuro 486:173).
 *
 * Seções (de cima para baixo):
 *   PRODUTOS RECOMENDADOS → ZERO FRAME → MULTIMARCAS → CATEGORIAS (carrossel)
 * e a barra de navegação fixa no rodapé.
 *
 * Os dados vêm da API por src/services/produtosService.ts.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '../components/Botao';
import { Text } from '../components/Texto';
import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CarrosselCategorias } from '../components/CarrosselCategorias';
import { CabecalhoSecao, SecaoProdutos } from '../components/SecaoProdutos';
import { listarCategorias, listarProdutos, type SecaoProdutos as Secao } from '../services/produtosService';
import { useTema } from '../theme/TemaContext';
import type { Categoria, Produto } from '../types';
import { abrirProduto, abrirResultados } from '../utils/navegacao';

/**
 * Seções de produtos, na ordem do Figma.
 * `termoVerTudo`: o que o "VER TUDO" pesquisa (abre os resultados da busca).
 * Recomendados não tem "VER TUDO".
 */
const SECOES: { id: Secao; titulo: string; termoVerTudo?: string }[] = [
  { id: 'recomendados', titulo: 'PRODUTOS RECOMENDADOS' },
  { id: 'zero-frame', titulo: 'ZERO FRAME', termoVerTudo: 'Zero Frame' },
  { id: 'multimarcas', titulo: 'MULTIMARCAS', termoVerTudo: 'Multimarcas' },
];

export default function TelaInicio() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  const [produtosPorSecao, setProdutosPorSecao] = useState<Record<Secao, Produto[]> | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const [listas, cats] = await Promise.all([
        Promise.all(SECOES.map((s) => listarProdutos(s.id))),
        listarCategorias(),
      ]);
      if (!ativo) return;
      setProdutosPorSecao({
        recomendados: listas[0],
        'zero-frame': listas[1],
        multimarcas: listas[2],
      });
      setCategorias(cats);
    })().catch((falha: Error) => {
      if (ativo) setErro(falha.message);
    });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      {erro ? (
        <View style={[estilos.carregando, { gap: 16, padding: 16 }]}>
          <Text style={{ color: cores.texto }}>{erro}</Text>
          <Botao titulo="tentar novamente" aoPressionar={() => {
            setErro(null);
            setTentativa((atual) => atual + 1);
          }} />
        </View>
      ) : produtosPorSecao === null ? (
        <View style={estilos.carregando}>
          <ActivityIndicator color={cores.secundario} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            estilos.conteudo,
            // Topo: 48px do Figma (ou a área segura, se maior). Base: espaço para a nav bar.
            { paddingTop: Math.max(32, insets.top), paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {SECOES.map((secao) => (
            <SecaoProdutos
              key={secao.id}
              titulo={secao.titulo}
              produtos={produtosPorSecao[secao.id]}
              // "VER TUDO" pesquisa a marca, como se ela tivesse sido digitada na busca.
              aoVerTudo={secao.termoVerTudo ? () => abrirResultados(secao.termoVerTudo!) : undefined}
              aoPressionarProduto={abrirProduto}
            />
          ))}

          <View style={estilos.secaoCategorias}>
            <CabecalhoSecao titulo="CATEGORIAS" />
            <CarrosselCategorias
              categorias={categorias}
              indiceInicial={0} // começa em "Camisas", como no Figma
              // "Ver todos" busca o nome da categoria, igual aos cards da tela de pesquisa.
              aoVerTodos={(c) => abrirResultados(c.nome)}
            />
          </View>
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
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  secaoCategorias: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
});
