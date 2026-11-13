/**
 * Tipografia do app.
 *
 * - "Alexandria" (Google Fonts) é a fonte principal do Figma;
 * - "Archivo" aparece só nos botões de tamanho (P, M, G, GG) da tela do produto.
 * Ambas são carregadas em src/app/_layout.tsx via @expo-google-fonts.
 *
 * Use `fontes.<peso>` no `fontFamily` dos estilos. Não use `fontWeight` junto:
 * no Android o peso vem do arquivo da fonte, e misturar os dois pode fazer o
 * sistema trocar de fonte.
 */
export const fontes = {
  light: 'Alexandria_300Light',
  regular: 'Alexandria_400Regular',
  medium: 'Alexandria_500Medium',
  semiBold: 'Alexandria_600SemiBold',
  bold: 'Alexandria_700Bold',
  /** Somente para os botões de tamanho do produto. */
  archivo: 'Archivo_400Regular',
} as const;
