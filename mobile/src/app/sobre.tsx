/**
 * Sobre a marca (Figma: claro 634:2240 / escuro 634:2326).
 * Aberta pelo item "sobre a marca" da tela de perfil.
 *
 * - Logo, "Sobre nós" e o texto da marca (src/data/sobreMarca.ts);
 * - "Missão" e "Valores" (também em src/data/sobreMarca.ts);
 * - "Fundadores": carrossel com foto, nome, função, bio e links (GitHub/LinkedIn).
 */
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { Icone } from '../components/Icone';
import { DESTAQUE_SOBRE, FUNDADORES, MISSAO, PARAGRAFOS_SOBRE, VALORES, type Fundador } from '../data/sobreMarca';
import { useTema } from '../theme/TemaContext';
import { logoZeroFrame } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import { avisar } from '../utils/avisos';
import { voltarOu } from '../utils/navegacao';

export default function TelaSobre() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Sobre a marca" aoVoltar={() => voltarOu('/perfil')} />

      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Image source={logoZeroFrame} style={estilos.logo} contentFit="cover" accessibilityLabel="Logo Zero Frame" />

        <View style={estilos.textos}>
          <Text style={[estilos.titulo, { color: cores.texto }]} accessibilityRole="header">
            Sobre nós
          </Text>
          <Text style={[estilos.paragrafo, { color: cores.texto }]}>{PARAGRAFOS_SOBRE.join('\n')}</Text>
          <Text style={[estilos.destaque, { color: cores.texto }]}>{DESTAQUE_SOBRE}</Text>
        </View>

        <View style={[estilos.divisoria, { backgroundColor: cores.texto }]} />

        {/* Missão e valores (Figma 675:1316) */}
        <View style={estilos.textos}>
          <Text style={[estilos.titulo, { color: cores.texto }]} accessibilityRole="header">
            Missão
          </Text>
          <Text style={[estilos.paragrafo, { color: cores.texto }]}>{MISSAO}</Text>
          <Text style={[estilos.titulo, { color: cores.texto }]} accessibilityRole="header">
            Valores
          </Text>
          {/* Um único Text com quebras de linha: os valores ficam colados, como no Figma. */}
          <Text style={[estilos.paragrafo, { color: cores.texto }]}>
            {VALORES.map((valor, i) => (
              <Text key={valor.nome}>
                {i > 0 ? '\n' : ''}
                <Text style={estilos.nomeValor}>{valor.nome}</Text>: {valor.descricao}
              </Text>
            ))}
          </Text>
        </View>

        <View style={[estilos.divisoria, { backgroundColor: cores.texto }]} />

        <Text style={[estilos.titulo, { color: cores.texto }]} accessibilityRole="header">
          Fundadores
        </Text>
        <CarrosselFundadores fundadores={FUNDADORES} />
      </ScrollView>

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

/** Carrossel de fundadores com setas (Figma: "fundadores-row"). */
function CarrosselFundadores({ fundadores }: { fundadores: Fundador[] }) {
  const { icones } = useTema();
  const [indice, setIndice] = useState(0);
  const total = fundadores.length;
  const fundador = fundadores[indice];
  const temVarios = total > 1;

  // Navegação circular: depois do último volta para o primeiro.
  const irPara = (passo: number) => setIndice((i) => (i + passo + total) % total);

  return (
    <View style={estilos.carrossel}>
      <Pressable
        onPress={() => irPara(-1)}
        disabled={!temVarios}
        accessibilityRole="button"
        accessibilityLabel="Fundador anterior"
        hitSlop={8}
        style={!temVarios && estilos.desabilitado}
      >
        <Icone fonte={icones.produtoEsquerda} largura={32} altura={32} />
      </Pressable>

      <CartaoFundador fundador={fundador} />

      <Pressable
        onPress={() => irPara(1)}
        disabled={!temVarios}
        accessibilityRole="button"
        accessibilityLabel="Próximo fundador"
        hitSlop={8}
        style={!temVarios && estilos.desabilitado}
      >
        <Icone fonte={icones.produtoDireita} largura={32} altura={32} />
      </Pressable>
    </View>
  );
}

function CartaoFundador({ fundador }: { fundador: Fundador }) {
  const { cores, icones } = useTema();

  function abrirLink(url: string | undefined, rede: string) {
    // TODO: preencher os links em src/data/sobreMarca.ts.
    if (!url) {
      avisar(rede, 'O link ainda não foi cadastrado.');
      return;
    }
    Linking.openURL(url);
  }

  return (
    <View style={estilos.fundador}>
      {/* Foto 192x256. Se o fundador tiver `recorte` (ex.: enquadramento do Figma),
          aplica o zoom/deslocamento; senão, a foto 3:4 preenche a moldura. */}
      <View style={[estilos.moldura, { borderColor: cores.borda }]}>
        <Image
          source={fundador.foto}
          style={
            fundador.recorte
              ? {
                  position: 'absolute',
                  width: LARGURA_FOTO * fundador.recorte.escalaX,
                  height: ALTURA_FOTO * fundador.recorte.escalaY,
                  left: LARGURA_FOTO * fundador.recorte.esquerda,
                  top: ALTURA_FOTO * fundador.recorte.topo,
                }
              : StyleSheet.absoluteFill
          }
          contentFit="cover"
          accessibilityLabel={fundador.nome}
        />
      </View>

      <View style={estilos.textosFundador}>
        <View style={estilos.nomeFuncao}>
          <Text style={[estilos.nome, { color: cores.texto }]}>{fundador.nome}</Text>
          <Text style={[estilos.funcao, { color: cores.texto }]}>{fundador.funcao}</Text>
        </View>
        <Text style={[estilos.paragrafo, { color: cores.texto }]}>{fundador.bio}</Text>

        <View style={estilos.redes}>
          <Pressable
            onPress={() => abrirLink(fundador.github, 'GitHub')}
            accessibilityRole="link"
            accessibilityLabel={`GitHub de ${fundador.nome}`}
          >
            <Icone fonte={icones.github} largura={48} altura={48} />
          </Pressable>
          <Pressable
            onPress={() => abrirLink(fundador.linkedin, 'LinkedIn')}
            accessibilityRole="link"
            accessibilityLabel={`LinkedIn de ${fundador.nome}`}
          >
            <Icone fonte={icones.linkedin} largura={48} altura={48} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const LARGURA_FOTO = 192;
const ALTURA_FOTO = 256;

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  logo: {
    width: 160,
    height: 160,
  },
  textos: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  titulo: {
    fontFamily: fontes.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  paragrafo: {
    width: '100%',
    fontFamily: fontes.regular,
    fontSize: 14,
    textAlign: 'justify',
  },
  nomeValor: {
    fontFamily: fontes.semiBold,
  },
  destaque: {
    width: '100%',
    fontFamily: fontes.semiBold,
    fontSize: 20,
  },
  divisoria: {
    height: 1,
    width: '100%',
  },
  carrossel: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desabilitado: {
    opacity: 0.4,
  },
  fundador: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  moldura: {
    width: LARGURA_FOTO,
    height: ALTURA_FOTO,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  textosFundador: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  nomeFuncao: {
    alignItems: 'center',
    gap: 2,
  },
  nome: {
    fontFamily: fontes.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  funcao: {
    fontFamily: fontes.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  redes: {
    flexDirection: 'row',
    gap: 16,
  },
});
