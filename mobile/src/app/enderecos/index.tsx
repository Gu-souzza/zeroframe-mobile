/**
 * Meus endereços (Figma: claro 615:2490 / escuro 634:976).
 * Aberta pelo atalho "endereços" da tela de perfil.
 *
 * - Cada card mostra o endereço; o principal tem borda `secundario` e o selo "Principal";
 * - Botões: "editar", "tornar principal" (só nos que não são principais) e excluir;
 * - Botão flutuante "+" abre "Novo endereço".
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { Icone } from '../../components/Icone';
import { excluirEndereco, listarEnderecos, tornarPrincipal } from '../../services/enderecosService';
import { useTema } from '../../theme/TemaContext';
import { iconesComuns, iconesMonocromaticos } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import type { EnderecoSalvo } from '../../types';
import { avisar, confirmar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';

export default function TelaEnderecos() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  const [enderecos, setEnderecos] = useState<EnderecoSalvo[] | null>(null);

  const recarregar = useCallback(() => {
    listarEnderecos().then(setEnderecos).catch((erro: Error) => {
      setEnderecos((atuais) => atuais ?? []);
      avisar('Não foi possível carregar os endereços', erro.message);
    });
  }, []);

  // Recarrega ao voltar de "Novo/Editar endereço".
  useFocusEffect(recarregar);

  async function aoTornarPrincipal(endereco: EnderecoSalvo) {
    try {
      await tornarPrincipal(endereco.id);
      recarregar();
    } catch (erro) {
      avisar('Não foi possível alterar o endereço principal', (erro as Error).message);
    }
  }

  async function aoExcluir(endereco: EnderecoSalvo) {
    const ok = await confirmar(
      'Excluir endereço?',
      `${endereco.rua}, ${endereco.numero} será removido da sua conta.`,
      'Excluir',
    );
    if (!ok) return;
    try {
      await excluirEndereco(endereco.id);
      recarregar();
    } catch (erro) {
      avisar('Não foi possível excluir', (erro as Error).message);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Meus endereços" aoVoltar={() => voltarOu('/perfil')} />

      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {enderecos === null ? (
          <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
        ) : enderecos.length === 0 ? (
          <View style={estilos.vazio}>
            <Icone fonte={iconesMonocromaticos.casa} largura={26} altura={57} tintColor={cores.texto} />
            <Text style={[estilos.textoVazio, { color: cores.texto }]}>você ainda não tem endereços</Text>
            <Text style={[estilos.subtextoVazio, { color: cores.tituloSecaoSuave }]}>
              toque no + para cadastrar o primeiro
            </Text>
          </View>
        ) : (
          enderecos.map((endereco) => (
            <CardEndereco
              key={endereco.id}
              endereco={endereco}
              aoEditar={() => router.push({ pathname: '/enderecos/[id]', params: { id: endereco.id } })}
              aoTornarPrincipal={() => aoTornarPrincipal(endereco)}
              aoExcluir={() => aoExcluir(endereco)}
            />
          ))
        )}
      </ScrollView>

      {/* Botão flutuante de adicionar (Figma: "Botão adicionar") */}
      <Pressable
        onPress={() => router.push('/enderecos/novo')}
        accessibilityRole="button"
        accessibilityLabel="Adicionar endereço"
        style={[
          estilos.botaoAdicionar,
          { bottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 24, backgroundColor: cores.secundario, borderColor: cores.borda },
        ]}
      >
        <Icone fonte={iconesComuns.mais} largura={20} altura={20} />
      </Pressable>

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

function CardEndereco({
  endereco,
  aoEditar,
  aoTornarPrincipal,
  aoExcluir,
}: {
  endereco: EnderecoSalvo;
  aoEditar: () => void;
  aoTornarPrincipal: () => void;
  aoExcluir: () => void;
}) {
  const { cores, icones } = useTema();
  const linha2 = [endereco.complemento, endereco.bairro].filter(Boolean).join(' - ');

  return (
    <View
      style={[
        estilos.card,
        { backgroundColor: cores.cardFundo },
        // Principal: borda de 2px na cor `secundario`.
        endereco.principal
          ? { borderWidth: 2, borderColor: cores.secundario }
          : { borderWidth: 1, borderColor: cores.borda },
      ]}
    >
      <View style={estilos.conteudoEndereco}>
        <Icone fonte={iconesMonocromaticos.casa} largura={26} altura={57} tintColor={cores.texto} />
        <View style={estilos.info}>
          <View style={estilos.tituloLinha}>
            <Text style={[estilos.titulo, { color: cores.texto }]} numberOfLines={1}>
              {endereco.rua}, {endereco.numero}
            </Text>
            {endereco.principal && (
              <View style={[estilos.selo, { backgroundColor: cores.secundario }]}>
                <Text style={estilos.textoSelo}>Principal</Text>
              </View>
            )}
          </View>
          <View>
            {linha2 ? <Text style={[estilos.linhaEndereco, { color: cores.texto }]}>{linha2}</Text> : null}
            <Text style={[estilos.linhaEndereco, { color: cores.texto }]}>
              {endereco.cidade} - {endereco.uf} - {endereco.cep}
            </Text>
          </View>
        </View>
      </View>

      <View style={[estilos.divisoria, { backgroundColor: cores.borda }]} />

      <View style={estilos.acoes}>
        <Pressable
          onPress={aoEditar}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${endereco.rua}, ${endereco.numero}`}
          style={[estilos.botao, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
        >
          <Icone fonte={iconesMonocromaticos.lapis} largura={16} altura={16} tintColor={cores.texto} />
          <Text style={[estilos.textoBotao, { color: cores.texto }]}>editar</Text>
        </Pressable>
        {!endereco.principal && (
          <Pressable
            onPress={aoTornarPrincipal}
            accessibilityRole="button"
            style={[estilos.botao, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
          >
            <Text style={[estilos.textoBotao, { color: cores.texto }]}>tornar principal</Text>
          </Pressable>
        )}
        <Pressable
          onPress={aoExcluir}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${endereco.rua}, ${endereco.numero}`}
        >
          <Icone fonte={icones.botaoExcluir} largura={42} altura={42} />
        </Pressable>
      </View>
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
  carregando: {
    marginTop: 48,
  },
  vazio: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
  },
  textoVazio: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
  subtextoVazio: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
    borderRadius: 16,
  },
  conteudoEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  selo: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  textoSelo: {
    fontFamily: fontes.medium,
    fontSize: 10,
    color: '#F5EBE0', // Figma: `texto-botão-colorido`, fixo nos dois temas
  },
  linhaEndereco: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  divisoria: {
    height: 1,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botao: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 5,
  },
  textoBotao: {
    fontFamily: fontes.medium,
    fontSize: 14,
  },
  botaoAdicionar: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
});
