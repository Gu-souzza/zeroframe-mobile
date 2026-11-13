/**
 * Tela de boas-vindas — primeira tela do app (Figma: "Tela inicial", node 463:3).
 *
 * - Fundo: foto da campanha (preenchimento do quadro no Figma), ocupando a
 *   tela toda, alinhada pela base;
 * - Centro: logo da Zero Frame (250x250);
 * - Rodapé: painel marrom com "Bem vindo(a) a Zero Frame!" e os botões
 *   "fazer login" e "criar conta".
 *
 * Fluxo: Boas-vindas → Login / Registro → Início (produtos).
 *
 * O Figma só tem esta tela na versão clara. Como ela fica sobre a foto,
 * textos e botões usam cores fixas do Figma; só o painel segue o tema
 * (`secundario`), para combinar com o restante do app no modo escuro.
 */
import { StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { Redirect, router } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '../components/Botao';
import { useToken } from '../services/sessao';
import { useTema } from '../theme/TemaContext';
import { logoZeroFrame } from '../theme/icones';
import { fontes } from '../theme/tipografia';

const fundoBoasVindas = require('../../assets/images/fundo-boas-vindas.png');

/** Cores fixas do Figma para esta tela (variáveis `principal-claro` e `texto`). */
const CREME = '#F5EBE0';
const QUASE_PRETO = '#201B1B';

export default function TelaBoasVindas() {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const token = useToken();

  if (token) return <Redirect href="/inicio" />;

  return (
    <View style={estilos.tela}>
      {/* A foto é escura, então a barra de status fica com ícones claros. */}
      <StatusBar style="light" />

      <Image
        source={fundoBoasVindas}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
        accessible={false}
      />

      <View style={estilos.areaLogo}>
        <Image
          source={logoZeroFrame}
          style={estilos.logo}
          contentFit="cover"
          accessibilityLabel="Logo Zero Frame"
        />
      </View>

      <View
        style={[
          estilos.painel,
          { backgroundColor: cores.secundario, paddingBottom: 64 + insets.bottom },
        ]}
      >
        <Text style={estilos.titulo} accessibilityRole="header">
          {'Bem vindo(a) a\n'}
          <Text style={estilos.tituloDestaque}>Zero Frame</Text>!
        </Text>

        <View style={estilos.acoes}>
          <Text style={estilos.subtitulo}>Entre na sua conta ou crie uma</Text>

          <View style={estilos.botoes}>
            <View style={estilos.sombra}>
              <Botao
                titulo="fazer login"
                aoPressionar={() => router.push('/login')}
                corFundo={CREME}
                corTexto={QUASE_PRETO}
              />
            </View>
            <Botao
              titulo="criar conta"
              aoPressionar={() => router.push('/registro')}
              corFundo={QUASE_PRETO}
              corTexto={CREME}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: QUASE_PRETO, // aparece só enquanto a foto carrega
  },
  areaLogo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  painel: {
    width: '100%',
    paddingTop: 32,
    paddingHorizontal: 16,
    gap: 24,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  titulo: {
    fontFamily: fontes.regular,
    fontSize: 32,
    color: CREME,
  },
  tituloDestaque: {
    fontFamily: fontes.semiBold,
  },
  acoes: {
    width: '100%',
    gap: 10,
  },
  subtitulo: {
    fontFamily: fontes.regular,
    fontSize: 16,
    color: CREME,
  },
  botoes: {
    width: '100%',
    gap: 8,
  },
  sombra: {
    // Figma: drop-shadow 0 0 1px rgba(32,27,27,0.5) no botão "fazer login"
    borderRadius: 10,
    shadowColor: QUASE_PRETO,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
  },
});
