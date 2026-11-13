/**
 * Campo de busca arredondado (Figma: "search input").
 *
 * Fundo `card-bg`, borda, raio 50, texto 12 e lupa de 16px à direita.
 * Enviar pelo teclado ou tocar na lupa chama `aoBuscar` com o texto digitado.
 */
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

interface CampoBuscaProps {
  valor: string;
  aoMudar: (texto: string) => void;
  aoBuscar: (termo: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CampoBusca({
  valor,
  aoMudar,
  aoBuscar,
  placeholder = 'O que você está procurando?',
  autoFocus,
}: CampoBuscaProps) {
  const { cores } = useTema();

  return (
    <View style={[estilos.caixa, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        onSubmitEditing={() => aoBuscar(valor)}
        placeholder={placeholder}
        // No Figma o placeholder tem a mesma cor do texto.
        placeholderTextColor={cores.texto}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        accessibilityLabel="Buscar produtos"
        style={[estilos.input, { color: cores.texto }]}
      />
      <Pressable
        onPress={() => aoBuscar(valor)}
        accessibilityRole="button"
        accessibilityLabel="Pesquisar"
        hitSlop={10}
      >
        <Icone fonte={iconesMonocromaticos.lupa} largura={16} altura={16} tintColor={cores.texto} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 50,
  },
  input: {
    flex: 1,
    fontFamily: fontes.regular,
    fontSize: 12,
    padding: 0,
    // Remove o contorno de foco do navegador na web ('none' só existe na web).
    outlineStyle: 'none' as 'solid',
  },
});
