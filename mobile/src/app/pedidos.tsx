/**
 * Tela "Meus pedidos" (Figma: claro 601:2593 / escuro 601:2949).
 *
 * - Topo: botão voltar + "Meus pedidos";
 * - Filtros (Todos / Em andamento / Entregues / Cancelados) num carrossel
 *   horizontal: as pílulas que passam da largura da tela ficam acessíveis
 *   arrastando para o lado;
 * - Seções "PEDIDOS EM ANDAMENTO" e "PEDIDOS CONCLUÍDOS".
 *
 * É aberta pelo atalho "pedidos" do perfil e logo após "finalizar compra"
 * no carrinho (o pedido novo aparece no topo de "PEDIDOS CONCLUÍDOS").
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CardPedido } from '../components/CardPedido';
import { Icone } from '../components/Icone';
import { PilulaOpcao } from '../components/PilulaOpcao';
import {
  FILTROS_PEDIDOS,
  STATUS_EM_ANDAMENTO,
  listarPedidos,
  type FiltroPedidos,
} from '../services/pedidosService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { Pedido } from '../types';
import { abrirPedido } from '../utils/navegacao';
import { avisar } from '../utils/avisos';

export default function TelaPedidos() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [filtro, setFiltro] = useState<FiltroPedidos>('todos');

  // Recarrega sempre que a tela aparece (ex.: logo depois de finalizar uma compra).
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
        listarPedidos().then((lista) => ativo && setPedidos(lista)).catch((erro: Error) => {
          if (!ativo) return;
          setPedidos((atuais) => atuais ?? []);
          avisar('Não foi possível carregar os pedidos', erro.message);
        });
      return () => {
        ativo = false;
      };
    }, []),
  );

  // Aplica o filtro escolhido e separa as duas seções.
  const statusDoFiltro = FILTROS_PEDIDOS.find((f) => f.id === filtro)?.status;
  const visiveis = (pedidos ?? []).filter((p) => !statusDoFiltro || statusDoFiltro.includes(p.status));
  const emAndamento = visiveis.filter((p) => STATUS_EM_ANDAMENTO.includes(p.status));
  const concluidos = visiveis.filter((p) => !STATUS_EM_ANDAMENTO.includes(p.status));

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/perfil'));

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      <CabecalhoPagina titulo="Meus pedidos" aoVoltar={voltar} />

      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros em carrossel horizontal (Figma: "Lista de filtros do pedido") */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // Ocupa a largura toda da tela: as pílulas "saem" pela borda, indicando que dá para arrastar.
          style={estilos.carrosselFiltros}
          contentContainerStyle={estilos.filtros}
          accessibilityRole="tablist"
        >
          {FILTROS_PEDIDOS.map((f) => (
            <PilulaOpcao
              key={f.id}
              rotulo={f.rotulo}
              selecionada={filtro === f.id}
              aoPressionar={() => setFiltro(f.id)}
            />
          ))}
        </ScrollView>

        {pedidos === null ? (
          <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
        ) : visiveis.length === 0 ? (
          <View style={estilos.vazio}>
            <Icone fonte={iconesMonocromaticos.fantasma} largura={70} altura={64} tintColor={cores.texto} />
            <Text style={[estilos.textoVazio, { color: cores.texto }]}>nenhum pedido por aqui :(</Text>
          </View>
        ) : (
          <>
            {emAndamento.length > 0 && (
              <SecaoPedidos titulo="PEDIDOS EM ANDAMENTO" pedidos={emAndamento} />
            )}
            {concluidos.length > 0 && <SecaoPedidos titulo="PEDIDOS CONCLUÍDOS" pedidos={concluidos} />}
          </>
        )}
      </ScrollView>

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

function SecaoPedidos({ titulo, pedidos }: { titulo: string; pedidos: Pedido[] }) {
  const { cores } = useTema();
  return (
    <View style={estilos.secao}>
      <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>{titulo}</Text>
      {pedidos.map((pedido) => (
        // Tocar no card abre os detalhes do pedido (src/app/pedido/[id].tsx).
        <CardPedido key={pedido.id} pedido={pedido} aoPressionar={abrirPedido} />
      ))}
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
  carrosselFiltros: {
    // Compensa o padding da tela para o carrossel ir de borda a borda.
    marginHorizontal: -16,
    flexGrow: 0,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  carregando: {
    marginTop: 48,
  },
  vazio: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  textoVazio: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  secao: {
    gap: 16,
  },
  tituloSecao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
});
