/**
 * Chave liga/desliga (Figma: "Alternador", 40x22) usada no "tema escuro"
 * da tela de perfil.
 *
 * Desligado: trilho cinza #B9B5B3 e bolinha #F6F6F6 à esquerda.
 * Ligado:    trilho marrom #8C5A3C e bolinha creme à direita.
 * A bolinha desliza com animação ao trocar.
 */
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

interface AlternadorProps {
  ligado: boolean;
}

const LARGURA = 40;
const ALTURA = 22;
const BOLINHA = 18;
const MARGEM = 2;

export function Alternador({ ligado }: AlternadorProps) {
  // useState com inicialização preguiçosa: cria o Animated.Value uma vez só.
  const [posicao] = useState(() => new Animated.Value(ligado ? 1 : 0));

  useEffect(() => {
    Animated.timing(posicao, {
      toValue: ligado ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // a cor do trilho não pode usar o driver nativo
    }).start();
  }, [ligado, posicao]);

  const deslocamento = posicao.interpolate({ inputRange: [0, 1], outputRange: [0, LARGURA - BOLINHA - MARGEM * 2] });
  const corTrilho = posicao.interpolate({ inputRange: [0, 1], outputRange: ['#B9B5B3', '#8C5A3C'] });
  const corBolinha = posicao.interpolate({ inputRange: [0, 1], outputRange: ['#F6F6F6', '#F5EBE0'] });

  return (
    <Animated.View style={[estilos.trilho, { backgroundColor: corTrilho }]}>
      <Animated.View
        style={[estilos.bolinha, { backgroundColor: corBolinha, transform: [{ translateX: deslocamento }] }]}
      />
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  trilho: {
    width: LARGURA,
    height: ALTURA,
    borderRadius: ALTURA / 2,
    padding: MARGEM,
    justifyContent: 'center',
  },
  bolinha: {
    width: BOLINHA,
    height: BOLINHA,
    borderRadius: BOLINHA / 2,
  },
});
