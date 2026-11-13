/**
 * Painel fixo acima da barra de navegação com um botão grande
 * (Figma: "Salvar alterações").
 *
 * Usado em Editar perfil, Alterar e-mail e Alterar senha. Avisa a sua altura
 * por `aoMedir`, para a tela deixar espaço no fim da rolagem.
 */
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { ALTURA_BARRA_NAVEGACAO } from './BarraNavegacao';

interface PainelAcaoInferiorProps {
  titulo: string;
  aoPressionar: () => void;
  carregando?: boolean;
  aoMedir?: (altura: number) => void;
}

export function PainelAcaoInferior({ titulo, aoPressionar, carregando = false, aoMedir }: PainelAcaoInferiorProps) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();

  return (
    <View
      onLayout={(e) => aoMedir?.(e.nativeEvent.layout.height)}
      style={[
        estilos.painel,
        { bottom: ALTURA_BARRA_NAVEGACAO + insets.bottom, backgroundColor: cores.cardFundo, borderColor: cores.borda },
      ]}
    >
      <Pressable
        onPress={aoPressionar}
        disabled={carregando}
        accessibilityRole="button"
        accessibilityState={{ busy: carregando }}
        style={({ pressed }) => [
          estilos.botao,
          { backgroundColor: cores.secundario, borderColor: cores.borda, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {carregando ? <ActivityIndicator color="#F5EBE0" /> : <Text style={estilos.texto}>{titulo}</Text>}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  painel: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 16,
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  botao: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    // Figma: drop-shadow 0 0 1px rgba(0,0,0,0.25)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 1,
  },
  texto: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
});
