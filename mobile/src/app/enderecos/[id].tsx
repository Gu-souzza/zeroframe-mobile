/**
 * Editar endereço (Figma: claro 634:1189 / escuro 634:1228).
 * Rota: /enderecos/:id — aberta pelo botão "editar" de "Meus endereços".
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { FormularioEndereco } from '../../components/FormularioEndereco';
import { obterEndereco, salvarEndereco } from '../../services/enderecosService';
import { useTema } from '../../theme/TemaContext';
import { fontes } from '../../theme/tipografia';
import type { EnderecoSalvo } from '../../types';
import { avisar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';

export default function TelaEditarEndereco() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cores, tema } = useTema();
  // `undefined` = carregando, `null` = não encontrado
  const [endereco, setEndereco] = useState<EnderecoSalvo | null | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    obterEndereco(id).then((e) => ativo && setEndereco(e)).catch((erro: Error) => {
      if (!ativo) return;
      setEndereco(null);
      avisar('Não foi possível carregar o endereço', erro.message);
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Editar endereço" aoVoltar={() => voltarOu('/enderecos')} />

      {endereco === undefined ? (
        <ActivityIndicator color={cores.secundario} size="large" style={estilos.carregando} />
      ) : endereco === null ? (
        <Text style={[estilos.naoEncontrado, { color: cores.texto }]}>endereço não encontrado :(</Text>
      ) : (
        <FormularioEndereco
          // `key`: remonta o formulário se outro endereço for aberto.
          key={endereco.id}
          inicial={{ ...endereco, complemento: endereco.complemento ?? '' }}
          textoBotao="salvar alterações"
          aoSalvar={async (dados) => {
            try {
              await salvarEndereco({ ...dados, id: endereco.id });
              voltarOu('/enderecos');
            } catch (erro) {
              avisar('Não foi possível salvar', (erro as Error).message);
            }
          }}
        />
      )}

      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  carregando: {
    marginTop: 48,
  },
  naoEncontrado: {
    fontFamily: fontes.semiBold,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 48,
  },
});
