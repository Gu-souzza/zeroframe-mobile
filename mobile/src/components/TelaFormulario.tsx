/**
 * Estrutura base das telas de login e registro:
 * fundo do tema + rolagem + ajuste do teclado + margens do Figma (16 lateral, 48 vertical).
 *
 * O conteúdo cresce para ocupar a tela inteira (flexGrow), permitindo que a
 * legenda "Não possui uma conta?" fique colada embaixo, como no Figma.
 * Em telas pequenas (ou com teclado aberto) a página rola.
 */
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTema } from '../theme/TemaContext';

interface TelaFormularioProps {
  children: ReactNode;
  /** Espaço entre o cabeçalho e o conteúdo (login: 80, registro: 64). */
  espacamento: number;
}

export function TelaFormulario({ children, espacamento }: TelaFormularioProps) {
  const { cores, tema } = useTema();

  return (
    <SafeAreaView style={[estilos.flex, { backgroundColor: cores.fundo }]} edges={['top', 'bottom']}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[estilos.conteudo, { gap: espacamento }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    // O Figma usa 48px no topo/rodapé; parte disso já vem da área segura.
    paddingVertical: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
