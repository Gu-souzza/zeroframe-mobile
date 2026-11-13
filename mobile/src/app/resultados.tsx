/**
 * Resultados da pesquisa.
 * Figma: com resultados — claro 538:1489 / escuro 549:3258;
 *        sem resultados — claro 540:2043 / escuro 540:2316.
 *
 * Parâmetro da rota: `termo` (texto buscado).
 *
 * - Topo: botão voltar + campo de busca preenchido (pode buscar outro termo);
 * - "Mostrando resultados para: <termo>";
 * - Seleção de gênero (Todos / Masculino / Feminino) — é um atalho para o
 *   grupo "Gênero" do menu de filtros, os dois ficam sempre sincronizados;
 * - Grade de produtos, ou o fantasma de "não foram encontrados resultados";
 * - Botão flutuante de funil: abre o menu de filtros (MenuFiltros).
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CampoBusca } from '../components/CampoBusca';
import { Icone } from '../components/Icone';
import { MenuFiltros } from '../components/MenuFiltros';
import { PilulaOpcao } from '../components/PilulaOpcao';
import { GradeProdutos } from '../components/SecaoProdutos';
import {
  FILTROS_VAZIOS,
  buscarProdutos,
  listarOpcoesFiltros,
  registrarBuscaRecente,
  type OpcoesFiltros,
} from '../services/produtosService';
import { useTema } from '../theme/TemaContext';
import { iconesComuns, iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { FiltrosBusca, Genero, Produto } from '../types';
import { avisar } from '../utils/avisos';
import { abrirProduto } from '../utils/navegacao';

/** Opções da seleção de gênero (Figma: "Lista de gêneros"). `null` = Todos. */
const GENEROS: { valor: Genero | null; rotulo: string }[] = [
  { valor: null, rotulo: 'Todos' },
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
];

export default function TelaResultados() {
  const { cores, icones, tema } = useTema();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ termo?: string }>();

  const termo = params.termo ?? '';
  const [texto, setTexto] = useState(termo);

  // Quando o termo da rota muda (nova busca nesta tela), atualiza o campo.
  // (Ajuste de estado durante a renderização, recomendado pelo React no lugar de useEffect.)
  const [termoAnterior, setTermoAnterior] = useState(termo);
  if (termo !== termoAnterior) {
    setTermoAnterior(termo);
    setTexto(termo);
  }

  const [filtros, setFiltros] = useState<FiltrosBusca>(FILTROS_VAZIOS);

  // Gênero destacado nas pílulas: "Todos" sem filtro de gênero; se o menu
  // de filtros marcou mais de um gênero, nenhuma pílula fica destacada.
  const generoSelecionado: Genero | null | undefined =
    filtros.generos.length === 0 ? null : filtros.generos.length === 1 ? filtros.generos[0] : undefined;
  const escolherGenero = (genero: Genero | null) =>
    setFiltros((atual) => ({ ...atual, generos: genero ? [genero] : [] }));
  const [menuAberto, setMenuAberto] = useState(false);
  // Conta as aberturas do menu: usado como `key` para o rascunho recomeçar dos
  // filtros aplicados a cada abertura, sem interromper a animação de fechar.
  const [aberturasMenu, setAberturasMenu] = useState(0);
  const [opcoesFiltros, setOpcoesFiltros] = useState<OpcoesFiltros | null>(null);

  // Guarda junto com os resultados a busca a que eles pertencem: enquanto a
  // busca atual não termina, a tela mostra "carregando".
  const chaveBusca = JSON.stringify([termo, filtros]);
  const [busca, setBusca] = useState<{ chave: string; produtos: Produto[] } | null>(null);
  const resultados = busca?.chave === chaveBusca ? busca.produtos : null;

  useEffect(() => {
    let ativo = true;
    buscarProdutos(termo, filtros).then((produtos) => ativo && setBusca({ chave: chaveBusca, produtos }))
      .catch((erro: Error) => {
        if (!ativo) return;
        setBusca({ chave: chaveBusca, produtos: [] });
        avisar('Não foi possível carregar a busca', erro.message);
      });
    return () => {
      ativo = false;
    };
  }, [termo, filtros, chaveBusca]);

  useEffect(() => {
    listarOpcoesFiltros().then(setOpcoesFiltros)
      .catch((erro: Error) => avisar('Não foi possível carregar os filtros', erro.message));
  }, []);

  function novaBusca(novoTermo: string) {
    const limpo = novoTermo.trim();
    if (!limpo) return;
    registrarBuscaRecente(limpo)
      .catch((erro: Error) => avisar('Não foi possível salvar a busca recente', erro.message));
    router.setParams({ termo: limpo });
  }

  const quantidadeFiltros = Object.values(filtros).reduce((soma, lista) => soma + lista.length, 0);

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      {/* Topo (Figma: "Header") */}
      <View style={[estilos.topo, { paddingTop: Math.max(32, insets.top + 16), backgroundColor: cores.fundo }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/buscar'))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          style={estilos.voltar}
        >
          <Icone fonte={icones.botaoVoltar} largura={48} altura={48} />
        </Pressable>
        <CampoBusca valor={texto} aoMudar={setTexto} aoBuscar={novaBusca} />
      </View>

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 80 }, // espaço p/ nav bar + botão de filtro
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[estilos.mostrando, { color: cores.texto }]}>
          Mostrando resultados para: <Text style={estilos.termo}>{termo}</Text>
        </Text>

        {/* Seleção de gênero */}
        <View style={estilos.generos}>
          {GENEROS.map((g) => (
            <PilulaOpcao
              key={g.rotulo}
              rotulo={g.rotulo}
              selecionada={generoSelecionado === g.valor}
              aoPressionar={() => escolherGenero(g.valor)}
            />
          ))}
        </View>

        {resultados === null ? (
          <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
        ) : resultados.length === 0 ? (
          // Figma: "Alerta de carrinho vazio" (reaproveitado para busca sem resultados)
          <View style={estilos.vazio}>
            <Icone fonte={iconesMonocromaticos.fantasma} largura={70} altura={64} tintColor={cores.texto} />
            <Text style={[estilos.textoVazio, { color: cores.texto }]}>
              não foram encontrados resultados para essa pesquisa :(
            </Text>
          </View>
        ) : (
          <GradeProdutos produtos={resultados} aoPressionarProduto={abrirProduto} />
        )}
      </ScrollView>

      {/* Botão flutuante de filtros (Figma: "Filtrar") */}
      <Pressable
        onPress={() => {
          setAberturasMenu((n) => n + 1);
          setMenuAberto(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={quantidadeFiltros ? `Filtrar, ${quantidadeFiltros} filtros ativos` : 'Filtrar'}
        style={[
          estilos.botaoFiltro,
          {
            bottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 24,
            backgroundColor: cores.secundario,
            borderColor: cores.borda,
          },
        ]}
      >
        <Icone fonte={iconesComuns.funil} largura={18} altura={16} />
        {quantidadeFiltros > 0 && (
          <View style={[estilos.contadorFiltros, { backgroundColor: cores.botaoPrimarioFundo }]}>
            <Text style={[estilos.textoContador, { color: cores.botaoPrimarioTexto }]}>{quantidadeFiltros}</Text>
          </View>
        )}
      </Pressable>

      <BarraNavegacao ativo="buscar" />

      <MenuFiltros
        // Remonta a cada abertura para o rascunho recomeçar dos filtros aplicados.
        key={aberturasMenu}
        visivel={menuAberto}
        opcoes={opcoesFiltros}
        filtrosAplicados={filtros}
        aoAplicar={(novos) => {
          setFiltros(novos);
          setMenuAberto(false);
        }}
        aoFechar={() => setMenuAberto(false)}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  topo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  voltar: {
    alignSelf: 'flex-start',
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  mostrando: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  termo: {
    fontFamily: fontes.medium,
  },
  generos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  carregando: {
    marginTop: 48,
  },
  vazio: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  textoVazio: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  botaoFiltro: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma: sombra leve em volta do botão
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  contadorFiltros: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoContador: {
    fontFamily: fontes.semiBold,
    fontSize: 10,
  },
});
