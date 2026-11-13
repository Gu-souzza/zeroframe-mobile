/**
 * Campo com rótulo em cima (Figma: "Edição do nome", "Senha atual"...),
 * usado em Editar perfil, Alterar e-mail e Alterar senha.
 *
 * [Rótulo (16)]
 * [ input 42px, raio 10, texto 14          (olho) ]
 * [ mensagem de erro (opcional)                   ]
 *
 * - `senha`: esconde o texto; `mostrarOlho` adiciona o botão de mostrar/ocultar;
 * - `somenteLeitura`: exibe o valor sem permitir edição (tocar chama `aoPressionar`).
 */
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Texto';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

interface CampoFormularioProps extends Omit<TextInputProps, 'style' | 'secureTextEntry' | 'editable'> {
  rotulo: string;
  erro?: string | null;
  senha?: boolean;
  /** Mostra o ícone de olho para alternar a visibilidade da senha. */
  mostrarOlho?: boolean;
  somenteLeitura?: boolean;
  /** Ação ao tocar no campo quando `somenteLeitura` (ex.: abrir outra tela). */
  aoPressionar?: () => void;
  /** Texto pequeno abaixo do campo (ex.: explicação). */
  ajuda?: string;
}

export function CampoFormulario({
  rotulo,
  erro,
  senha = false,
  mostrarOlho = false,
  somenteLeitura = false,
  aoPressionar,
  ajuda,
  ...inputProps
}: CampoFormularioProps) {
  const { cores, icones } = useTema();
  const [visivel, setVisivel] = useState(false);

  const caixa = (
    <View
      style={[
        estilos.caixa,
        { backgroundColor: cores.cardFundo, borderColor: erro ? cores.erro : cores.borda },
        somenteLeitura && estilos.somenteLeitura,
      ]}
    >
      <TextInput
        {...inputProps}
        editable={!somenteLeitura}
        secureTextEntry={senha && !visivel}
        placeholderTextColor={cores.placeholder}
        accessibilityLabel={inputProps.accessibilityLabel ?? rotulo}
        style={[estilos.input, { color: cores.texto }]}
        // Somente leitura: o toque vai para o Pressable em volta.
        pointerEvents={somenteLeitura ? 'none' : 'auto'}
      />
      {senha && mostrarOlho && (
        <Pressable
          onPress={() => setVisivel((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={10}
        >
          <Icone fonte={icones.olho} largura={20} altura={14} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={estilos.campo}>
      <Text style={[estilos.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      {somenteLeitura && aoPressionar ? (
        <Pressable onPress={aoPressionar} accessibilityRole="button" accessibilityLabel={`${rotulo}: alterar`}>
          {caixa}
        </Pressable>
      ) : (
        caixa
      )}
      {erro ? <Text style={[estilos.mensagem, { color: cores.erro }]}>{erro}</Text> : null}
      {!erro && ajuda ? <Text style={[estilos.mensagem, { color: cores.tituloSecaoSuave }]}>{ajuda}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: {
    width: '100%',
    gap: 2,
  },
  rotulo: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  caixa: {
    height: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  somenteLeitura: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fontes.regular,
    fontSize: 14,
    paddingVertical: 0,
    // Remove o contorno de foco do navegador na web ('none' só existe na web).
    outlineStyle: 'none' as 'solid',
  },
  mensagem: {
    fontFamily: fontes.regular,
    fontSize: 12,
    paddingHorizontal: 4,
    marginTop: 2,
  },
});
