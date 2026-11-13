/**
 * Caixa de seleção do carrinho (Figma: "Check-box").
 *
 * Desmarcada: quadrado vazio com borda na cor do texto.
 * Marcada: quadrado preenchido com a cor do texto e um "✓" desenhado por
 * dentro, na cor do fundo — fica claro que o item está selecionado.
 *
 * Obs.: no Figma a caixa tem 8x8; aqui tem 14x14 para o "✓" ficar legível.
 *
 * Só desenha a caixa. O toque é tratado por quem a usa (o card inteiro ou
 * o botão "Selecionar todos"), que tem área de toque maior.
 */
import { StyleSheet, View } from 'react-native';

import { useTema } from '../theme/TemaContext';

interface CaixaSelecaoProps {
  marcada: boolean;
  /** Lado da caixa em px (carrinho: 14; "Usar como endereço principal": 16, como no Figma). */
  tamanho?: number;
}

/**
 * Desmarcada usa o fundo dos cards (`card-bg`) — igual nos itens e no
 * "Selecionar todos" (o branco do Figma no "Selecionar todos" foi retirado).
 */
export function CaixaSelecao({ marcada, tamanho = 14 }: CaixaSelecaoProps) {
  const { cores } = useTema();
  // O "✓" acompanha o tamanho da caixa.
  const escala = tamanho / 14;

  return (
    <View
      style={[
        estilos.caixa,
        {
          width: tamanho,
          height: tamanho,
          borderColor: cores.texto,
          backgroundColor: marcada ? cores.texto : cores.cardFundo,
        },
      ]}
    >
      {marcada && (
        // "✓" feito com duas bordas de um retângulo girado 45° (não depende de fonte nem de ícone).
        <View
          style={[
            estilos.check,
            { borderColor: cores.fundo, width: 4 * escala, height: 8 * escala, marginTop: -2 * escala },
          ]}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});
