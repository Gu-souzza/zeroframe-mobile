/**
 * Tela de perfil / gerenciamento da conta (Figma: claro 549:3814 / escuro 628:872).
 *
 * - "Olá, <nome>" + e-mail e o botão "editar perfil";
 * - Atalhos: pedidos (abre "Meus pedidos"), favoritos e endereços;
 * - CONTA: segurança e a chave de "tema escuro" (troca o tema do app na hora);
 * - ZERO FRAME: sobre a marca e ajuda e suporte;
 * - "sair da conta": pede confirmação e volta para a tela de boas-vindas.
 *
 * Todos os atalhos e itens abrem as suas telas (pedidos, favoritos, endereços,
 * segurança, sobre a marca, ajuda e suporte).
 */
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alternador } from '../components/Alternador';
import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { Icone } from '../components/Icone';
import { obterUsuarioAtual, sair } from '../services/authService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { Imagem, Usuario } from '../types';
import { avisar, confirmar } from '../utils/avisos';


export default function TelaPerfil() {
  const { cores, tema, alternarTema } = useTema();
  const insets = useSafeAreaInsets();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Recarrega ao voltar para a tela (ex.: depois de editar o perfil, no futuro).
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      obterUsuarioAtual().then((dados) => {
        if (ativo) setUsuario(dados);
      }).catch((erro: Error) => {
        if (ativo) avisar('Não foi possível carregar o perfil', erro.message);
      });
      return () => { ativo = false; };
    }, []),
  );

  async function sairDaConta() {
    if (await confirmar('Sair da conta?', 'Você precisará entrar novamente.', 'Sair')) {
      try {
        await sair();
      } catch {
        avisar('Sessão encerrada neste dispositivo', 'A API não respondeu ao pedido de logout.');
      }
    }
  }

  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? '';

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      <CabecalhoPagina titulo="PERFIL" />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identificação do usuário */}
        <View style={estilos.secaoPerfil}>
          <View style={estilos.identificacao}>
            <Text style={[estilos.ola, { color: cores.texto }]} numberOfLines={1}>
              Olá, {primeiroNome}
            </Text>
            <Text style={[estilos.email, { color: cores.texto }]} numberOfLines={1}>
              {usuario?.email}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/conta/editar-perfil')}
            accessibilityRole="button"
            style={[estilos.botaoEditar, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
          >
            <Text style={estilos.textoEditar}>editar perfil</Text>
          </Pressable>
        </View>

        {/* Atalhos */}
        <View style={estilos.atalhos}>
          <Atalho
            rotulo="pedidos"
            icone={iconesMonocromaticos.pedidos}
            largura={24}
            altura={27}
            aoPressionar={() => router.push('/pedidos')}
          />
          <Atalho
            rotulo="favoritos"
            icone={iconesMonocromaticos.favoritos}
            largura={30}
            altura={27}
            aoPressionar={() => router.push('/favoritos')}
          />
          <Atalho
            rotulo="endereços"
            icone={iconesMonocromaticos.enderecos}
            largura={24}
            altura={27}
            aoPressionar={() => router.push('/enderecos')}
          />
        </View>

        {/* CONTA */}
        <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>CONTA</Text>
        <View style={estilos.grupo}>
          <ItemMenu
            rotulo="segurança"
            icone={iconesMonocromaticos.cadeado}
            largura={16}
            altura={20}
            aoPressionar={() => router.push('/conta/seguranca')}
          />
          <Pressable
            onPress={alternarTema}
            accessibilityRole="switch"
            accessibilityState={{ checked: tema === 'escuro' }}
            accessibilityLabel="tema escuro"
            style={[estilos.item, estilos.itemAlternador, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
          >
            <View style={estilos.iconeRotulo}>
              <Icone fonte={iconesMonocromaticos.lua} largura={20} altura={20} tintColor={cores.texto} />
              <Text style={[estilos.textoItem, { color: cores.texto }]}>tema escuro</Text>
            </View>
            <Alternador ligado={tema === 'escuro'} />
          </Pressable>
        </View>

        {/* ZERO FRAME */}
        <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>ZERO FRAME</Text>
        <View style={estilos.grupo}>
          <ItemMenu
            rotulo="sobre a marca"
            icone={iconesMonocromaticos.info}
            largura={20}
            altura={20}
            aoPressionar={() => router.push('/sobre')}
          />
          <ItemMenu
            rotulo="ajuda e suporte"
            icone={iconesMonocromaticos.suporte}
            largura={20}
            altura={18}
            aoPressionar={() => router.push('/suporte')}
          />
        </View>

        {/* Sair */}
        <Pressable
          onPress={sairDaConta}
          accessibilityRole="button"
          style={[estilos.botaoSair, { backgroundColor: cores.vermelho, borderColor: cores.borda }]}
        >
          <Text style={estilos.textoSair}>sair da conta</Text>
        </Pressable>
      </ScrollView>

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

/** Card de atalho (pedidos / favoritos / endereços). */
function Atalho({
  rotulo,
  icone,
  largura,
  altura,
  aoPressionar,
}: {
  rotulo: string;
  icone: Imagem;
  largura: number;
  altura: number;
  aoPressionar: () => void;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={[estilos.atalho, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
    >
      <Icone fonte={icone} largura={largura} altura={altura} tintColor={cores.texto} />
      <Text style={[estilos.textoAtalho, { color: cores.texto }]}>{rotulo}</Text>
    </Pressable>
  );
}

/** Linha do menu com ícone, texto e seta à direita (Figma: "Nav-item"). */
function ItemMenu({
  rotulo,
  icone,
  largura,
  altura,
  aoPressionar,
}: {
  rotulo: string;
  icone: Imagem;
  largura: number;
  altura: number;
  aoPressionar: () => void;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={[estilos.item, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
    >
      <View style={estilos.iconeRotulo}>
        <View style={estilos.caixaIcone}>
          <Icone fonte={icone} largura={largura} altura={altura} tintColor={cores.texto} />
        </View>
        <Text style={[estilos.textoItem, { color: cores.texto }]}>{rotulo}</Text>
      </View>
      {/* O SVG aponta para a esquerda; o Figma o espelha para apontar à direita. */}
      <Icone
        fonte={iconesMonocromaticos.setaCategoria}
        largura={14.4}
        altura={14}
        tintColor={cores.texto}
        style={estilos.setaEspelhada}
      />
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
  secaoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  identificacao: {
    flex: 1,
    gap: 2,
  },
  ola: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  email: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  botaoEditar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  textoEditar: {
    fontFamily: fontes.regular,
    fontSize: 12,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
  atalhos: {
    flexDirection: 'row',
    gap: 10,
  },
  atalho: {
    flex: 1,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 16,
  },
  textoAtalho: {
    fontFamily: fontes.regular,
    fontSize: 12,
  },
  tituloSecao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  grupo: {
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 5,
  },
  itemAlternador: {
    height: 54,
    paddingVertical: 14,
  },
  iconeRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  caixaIcone: {
    width: 20,
    alignItems: 'center',
  },
  textoItem: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  setaEspelhada: {
    transform: [{ scaleX: -1 }],
  },
  botaoSair: {
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoSair: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: `texto-botão-colorido`, fixo nos dois temas
  },
});
