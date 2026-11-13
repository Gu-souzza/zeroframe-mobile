/**
 * Campo de texto dos formulários (Figma: "input-user", "input-senha", "email"...).
 *
 * Visual: 42px de altura, borda 1px, raio 10, ícone à direita.
 * Quando `senha` é true, o ícone de olho alterna mostrar/ocultar a senha.
 * Quando `erro` é informado, a borda fica vermelha e a mensagem aparece abaixo.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Texto';
import type { ImageSource } from 'expo-image';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

interface CampoTextoProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  /** Ícone à direita (ignorado se `senha` for true — nesse caso usa o olho). */
  icone?: ImageSource | number;
  /** Campo de senha: esconde o texto e mostra o botão de olho. */
  senha?: boolean;
  /** Mensagem de erro de validação (null/undefined = sem erro). */
  erro?: string | null;
}

export function CampoTexto({ icone, senha = false, erro, ...inputProps }: CampoTextoProps) {
  const { cores, icones } = useTema();
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={estilos.wrapper}>
      <View
        style={[
          estilos.caixa,
          { backgroundColor: cores.cardFundo, borderColor: erro ? cores.erro : cores.borda },
        ]}
      >
        <TextInput
          {...inputProps}
          secureTextEntry={senha && !senhaVisivel}
          placeholderTextColor={cores.placeholder}
          style={[estilos.input, { color: cores.texto }]}
          accessibilityLabel={inputProps.accessibilityLabel ?? inputProps.placeholder}
        />

        {senha ? (
          <Pressable
            onPress={() => setSenhaVisivel((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={10}
          >
            {/* Olho do Figma: 18x12 com 1px de traço para fora → arquivo 20x14 */}
            <Icone fonte={icones.olho} largura={20} altura={14} />
          </Pressable>
        ) : icone ? (
          <Icone fonte={icone} largura={20} altura={20} />
        ) : null}
      </View>

      {erro ? <Text style={[estilos.erro, { color: cores.erro }]}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 4,
  },
  caixa: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fontes.regular,
    fontSize: 16,
    paddingVertical: 0,
    // Remove o contorno de foco padrão do navegador ao testar na web
    // ('none' só existe na web, por isso o cast; no celular é ignorado).
    outlineStyle: 'none' as 'solid',
  },
  erro: {
    fontFamily: fontes.regular,
    fontSize: 12,
    paddingHorizontal: 4,
  },
});
