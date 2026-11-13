/**
 * Pílula selecionável (Figma: "Gênero-Item").
 *
 * Usada na lista de gêneros da pesquisa (Todos / Masculino / Feminino) e
 * nas opções dentro de cada grupo do menu de filtros.
 * Selecionada: fundo `secundario`, texto creme semibold.
 * Não selecionada: fundo da tela, borda e texto normal.
 */
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Texto';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';

interface PilulaOpcaoProps {
  rotulo: string;
  selecionada: boolean;
  aoPressionar: () => void;
}

export function PilulaOpcao({ rotulo, selecionada, aoPressionar }: PilulaOpcaoProps) {
  const { cores } = useTema();

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionada }}
      style={[
        estilos.pilula,
        { borderColor: cores.borda, backgroundColor: selecionada ? cores.secundario : cores.fundo },
      ]}
    >
      <Text
        style={[
          estilos.texto,
          selecionada
            ? { fontFamily: fontes.semiBold, color: cores.textoSobreSecundario }
            : { fontFamily: fontes.regular, color: cores.texto },
        ]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pilula: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: 12,
    textAlign: 'center',
  },
});
