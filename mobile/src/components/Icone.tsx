/**
 * Exibe um ícone SVG exportado do Figma (ou qualquer imagem local).
 *
 * Usa o expo-image, que renderiza SVG em Android, iOS e Web.
 * Passe `largura` e `altura` com o tamanho do ícone no Figma.
 *
 * `tintColor` pinta o ícone inteiro de uma cor — usado nos ícones
 * monocromáticos (src/theme/icones.ts → iconesMonocromaticos) e na barra
 * de navegação, para não precisar de um arquivo por tema/estado.
 */
import { Image, type ImageSource } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

interface IconeProps {
  fonte: ImageSource | number;
  largura: number;
  altura: number;
  tintColor?: string;
  style?: StyleProp<ImageStyle>;
}

export function Icone({ fonte, largura, altura, tintColor, style }: IconeProps) {
  return (
    <Image
      source={fonte}
      style={[{ width: largura, height: altura }, style]}
      contentFit="contain"
      tintColor={tintColor}
      // Ícones são decorativos: o texto acessível fica no botão que os contém.
      accessible={false}
    />
  );
}
