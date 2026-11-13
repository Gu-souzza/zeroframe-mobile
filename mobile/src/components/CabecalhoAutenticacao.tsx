/**
 * Topo das telas de login e registro (Figma: "Head da página").
 *
 * - Esquerda: botão voltar (48x48)
 * - Direita: botão de modo noturno/claro (48x48, mostra lua ou sol)
 * - Abaixo: logo da Zero Frame (230x230)
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { useTema } from '../theme/TemaContext';
import { logoZeroFrame } from '../theme/icones';
import { Icone } from './Icone';

interface CabecalhoAutenticacaoProps {
  /** Ação do botão voltar. Padrão: volta para a tela de boas-vindas. */
  aoVoltar?: () => void;
}

export function CabecalhoAutenticacao({ aoVoltar }: CabecalhoAutenticacaoProps) {
  const { cores, icones, tema, alternarTema } = useTema();

  // Volta pela pilha (normalmente para as boas-vindas). Se a tela foi aberta
  // direto pela URL (web) e não há histórico, vai para as boas-vindas.
  const voltar =
    aoVoltar ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaBotoes}>
        <Pressable
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Icone fonte={icones.botaoVoltar} largura={48} altura={48} />
        </Pressable>

        <Pressable
          onPress={alternarTema}
          accessibilityRole="button"
          accessibilityLabel={tema === 'claro' ? 'Ativar modo noturno' : 'Ativar modo claro'}
          hitSlop={8}
          style={[estilos.botaoTema, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
        >
          <Icone fonte={icones.alternarTema} largura={20} altura={20} />
        </Pressable>
      </View>

      <Image
        source={logoZeroFrame}
        style={estilos.logo}
        contentFit="cover"
        accessibilityLabel="Logo Zero Frame"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  linhaBotoes: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoTema: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 230,
    height: 230,
  },
});
