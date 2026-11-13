/**
 * Segurança da conta (Figma: claro 634:2402 / escuro 634:2628).
 * Aberta pelo item "segurança" da tela de perfil.
 *
 * - PROTEGER SUA CONTA: e-mail e senha, cada um com "alterar →";
 * - EXCLUIR SUA CONTA: botão vermelho com confirmação.
 */
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { Icone } from '../../components/Icone';
import { excluirConta, obterUsuarioAtual } from '../../services/authService';
import { useTema } from '../../theme/TemaContext';
import { iconesMonocromaticos } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import type { Imagem } from '../../types';
import { avisar, confirmar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';

export default function TelaSeguranca() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  // Recarrega ao voltar de "Alterar e-mail" para mostrar o e-mail novo.
  useFocusEffect(
    useCallback(() => {
      obterUsuarioAtual().then((u) => setEmail(u?.email ?? ''))
        .catch((erro: Error) => avisar('Não foi possível carregar a conta', erro.message));
    }, []),
  );

  async function aoExcluirConta() {
    const confirmado = await confirmar(
      'Excluir sua conta?',
      'Você perde o acesso a favoritos e endereços. Esta ação não pode ser desfeita.',
      'Excluir',
    );
    if (!confirmado) return;
    try {
      await excluirConta();
    } catch (erro) {
      avisar('Não foi possível excluir a conta', (erro as Error).message);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Segurança" aoVoltar={() => voltarOu('/perfil')} />

      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 }]}
      >
        <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>PROTEGER SUA CONTA</Text>

        <View style={estilos.opcoes}>
          <OpcaoSeguranca
            icone={iconesMonocromaticos.envelope}
            larguraIcone={20}
            alturaIcone={16}
            titulo="e-mail"
            valor={email}
            aoPressionar={() => router.push('/conta/alterar-email')}
          />
          <OpcaoSeguranca
            icone={iconesMonocromaticos.cadeado}
            larguraIcone={16}
            alturaIcone={20}
            titulo="senha"
            valor="••••••••"
            aoPressionar={() => router.push('/conta/alterar-senha')}
          />
        </View>

        <Text style={[estilos.observacao, { color: cores.tituloSecaoSuave }]}>
          Seu e-mail é usado para entrar no app e receber as atualizações dos pedidos.
        </Text>

        <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>EXCLUIR SUA CONTA</Text>

        <Pressable
          onPress={aoExcluirConta}
          accessibilityRole="button"
          style={[estilos.botaoExcluir, { backgroundColor: cores.vermelho, borderColor: cores.borda }]}
        >
          <Text style={estilos.textoExcluir}>excluir minha conta</Text>
        </Pressable>

        <Text style={[estilos.observacao, { color: cores.texto }]}>
          Ao excluir sua conta, você perde o acesso a favoritos e endereços. Seu histórico de pedidos continua
          registrado.
        </Text>
      </ScrollView>

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

/** Linha "e-mail / senha" com valor atual e "alterar →" (Figma: "Nav-item"). */
function OpcaoSeguranca({
  icone,
  larguraIcone,
  alturaIcone,
  titulo,
  valor,
  aoPressionar,
}: {
  icone: Imagem;
  larguraIcone: number;
  alturaIcone: number;
  titulo: string;
  valor: string;
  aoPressionar: () => void;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`Alterar ${titulo}`}
      style={[estilos.opcao, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
    >
      <View style={estilos.iconeInfo}>
        <View style={estilos.caixaIcone}>
          <Icone fonte={icone} largura={larguraIcone} altura={alturaIcone} tintColor={cores.texto} />
        </View>
        <View style={estilos.info}>
          <Text style={[estilos.tituloOpcao, { color: cores.texto }]}>{titulo}</Text>
          <Text style={[estilos.valorOpcao, { color: cores.tituloSecaoSuave }]} numberOfLines={1}>
            {valor}
          </Text>
        </View>
      </View>
      <View style={estilos.alterar}>
        <Text style={[estilos.textoAlterar, { color: cores.texto }]}>alterar</Text>
        {/* O SVG aponta para a esquerda; o Figma o espelha para apontar à direita. */}
        <Icone
          fonte={iconesMonocromaticos.setaCategoria}
          largura={14.4}
          altura={14}
          tintColor={cores.texto}
          style={estilos.setaEspelhada}
        />
      </View>
    </Pressable>
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
  tituloSecao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  opcoes: {
    gap: 2,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  iconeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  caixaIcone: {
    width: 20,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  tituloOpcao: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  valorOpcao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  alterar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoAlterar: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  setaEspelhada: {
    transform: [{ scaleX: -1 }],
  },
  observacao: {
    fontFamily: fontes.regular,
    fontSize: 12,
  },
  botaoExcluir: {
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoExcluir: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
});
