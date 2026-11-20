import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const executar=promisify(execFile);
const base=(process.env.ZEROFRAME_TEST_API??'http://127.0.0.1:5155/api').replace(/\/$/,'');
const banco=process.env.ZEROFRAME_TEST_DATABASE;
const sql=async query => {
  assert(banco?.startsWith('ZeroFrame_Rotinas_'), 'Defina ZEROFRAME_TEST_DATABASE com uma base isolada ZeroFrame_Rotinas_*.');
  return (await executar('sqlcmd',['-S','(localdb)\\MSSQLLocalDB','-d',banco,'-E','-b','-h','-1','-W','-Q','SET NOCOUNT ON; '+query])).stdout.trim();
};
const numero=async query=>Number(await sql(query));
async function http(path,expected,{method='GET',token,body}={}){
 const r=await fetch(base+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const text=await r.text(); assert.equal(r.status,expected,path+' '+text); return text?JSON.parse(text):null;
}
test('histórico exige administrador e procedures concorrentes não repetem compra/cancelamento',async()=>{
 assert(banco?.startsWith('ZeroFrame_Rotinas_'));
 const cadastro={nome:'Teste Rotinas',email:randomUUID()+'@example.com',senha:'Teste12345',telefone:'11999999999'};
 const cliente=await http('/usuarios',201,{method:'POST',body:cadastro});
 const u=Number(cliente.usuarioId); assert(Number.isSafeInteger(u));
 const v=await numero('SELECT MIN(Id) FROM variacaoprodutos WHERE Estoque>5'); assert(v>0);
 const rota=`/variacoes/${v}/historico-estoque`;
 await http(rota,401); await http(rota,403,{token:cliente.token});
 const e=await http(`/usuarios/${u}/endereco`,201,{method:'POST',token:cliente.token,body:{usuarioId:u,rua:'Rua Teste',numero:'1',bairro:'Centro',cidade:'Sao Paulo',estado:'SP',cep:'01001000',principal:true}});
 const endereco=Number(e.enderecoId??e.id); assert(endereco>0);
 await sql(`INSERT INTO carrinhos(UsuarioId,Ativo) VALUES(${u},1); DECLARE @C INT=SCOPE_IDENTITY(); INSERT INTO item_Carrinhos(CarrinhoId,VariacaoProdutoId,Quantidade,PrecoUnitario) VALUES(@C,${v},1,90);`);
 const antes=await numero(`SELECT Estoque FROM variacaoprodutos WHERE Id=${v}`);
 const checkout=`DECLARE @P INT; EXEC dbo.sp_FinalizarPedidoAPartirDoCarrinho ${u},${endereco},@P OUTPUT; SELECT @P;`;
 const compras=await Promise.allSettled([sql(checkout),sql(checkout)]);
 assert.equal(compras.filter(r=>r.status==='fulfilled').length,1,'Apenas uma finalização deve consumir o carrinho.');
 const pedido=await numero(`SELECT MAX(Id) FROM pedidos WHERE UsuarioId=${u}`);
 assert.equal(await numero(`SELECT COUNT(*) FROM pedidos WHERE UsuarioId=${u}`),1);
 assert.equal(await numero(`SELECT Estoque FROM variacaoprodutos WHERE Id=${v}`),antes-1);
 const cancelamentos=await Promise.allSettled([sql(`EXEC dbo.sp_CancelarPedido ${pedido}`),sql(`EXEC dbo.sp_CancelarPedido ${pedido}`)]);
 assert(cancelamentos.every(r=>r.status==='fulfilled'));
 assert.equal(await numero(`SELECT Estoque FROM variacaoprodutos WHERE Id=${v}`),antes);
 await sql(`UPDATE Usuarios SET Perfil='Administrador' WHERE Id=${u}`);
 const admin=await http('/usuarios/login',200,{method:'POST',body:cadastro});
 const historico=await http(rota+'?pageSize=1',200,{token:admin.token});
 assert(historico.totalItems>=2); assert.equal(historico.items.length,1);
 assert.equal(historico.items[0].quantidadeAnterior,antes-1);
 assert.equal(historico.items[0].quantidadeNova,antes);
 await http('/variacoes/2147483647/historico-estoque',404,{token:admin.token});
});
