/**
 * Novo endereço (Figma: claro 634:1044 / escuro 634:1121).
 * Aberta pelo botão "+" de "Meus endereços".
 */
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { FormularioEndereco } from '../../components/FormularioEndereco';
import { salvarEndereco } from '../../services/enderecosService';
import { useTema } from '../../theme/TemaContext';
import { avisar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';

export default function TelaNovoEndereco() {
  const { cores, tema } = useTema();

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Novo endereço" aoVoltar={() => voltarOu('/enderecos')} />

      <FormularioEndereco
        textoBotao="salvar endereço"
        aoSalvar={async (dados) => {
          try {
            await salvarEndereco(dados);
            voltarOu('/enderecos');
          } catch (erro) {
            avisar('Não foi possível salvar', (erro as Error).message);
          }
        }}
      />

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
});
