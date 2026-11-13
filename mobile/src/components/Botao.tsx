/**
 * Botão retangular dos formulários (42px de altura, raio 10).
 *
 * Variantes (Figma):
 * - "primario":   ação principal ("entrar na conta", "criar conta").
 *                 Marrom no tema claro, creme no tema escuro.
 * - "secundario": ação alternativa ("criar uma conta", "fazer login").
 *                 Fundo de card com texto normal.
 */
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Text } from './Texto';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';

interface BotaoProps {
  titulo: string;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario';
  /** Mostra um indicador de carregamento e bloqueia novos toques. */
  carregando?: boolean;
  /**
   * Cores fixas que ignoram o tema. Use só quando o Figma define cores
   * próprias para o botão (ex.: tela de boas-vindas, sobre a foto).
   */
  corFundo?: string;
  corTexto?: string;
}

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  carregando = false,
  corFundo,
  corTexto: corTextoFixa,
}: BotaoProps) {
  const { cores } = useTema();

  const fundo = corFundo ?? (variante === 'primario' ? cores.botaoPrimarioFundo : cores.cardFundo);
  const corTexto = corTextoFixa ?? (variante === 'primario' ? cores.botaoPrimarioTexto : cores.texto);

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={carregando}
      accessibilityRole="button"
      accessibilityState={{ busy: carregando }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: fundo, borderColor: cores.borda, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontFamily: fontes.regular,
    fontSize: 16,
    textAlign: 'center',
  },
});
