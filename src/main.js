//Importando de Blockchain.js
const {BlockChain, Transaction} = require('./blockchain');
//Importando o Elliptic
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//Criando minha chave pegando do Arquivo Untitled
const minhaChave = ec.keyFromPrivate('010e8a9ac23584191ced92339fd410a79fca3db47ff718631d1e4614507e7511')
//Pegando o endereco da minha chave publica
const EnderecoCarteira = minhaChave.getPublic('hex'); //Em Hexadecimal

//Execucao de Exemplo
let wernerCoin = new BlockChain();

//Aqui envio 10 moedas da minha carteira pra outra pessoa
const transa1 = new Transaction(EnderecoCarteira, 'Chave Publica de Outrem Vai Aqui', 10);
//Aqui Assino minha transacao com minha chave
transa1.assinaTransacao(minhaChave);
//E finalizo add a transacao.
wernerCoin.AdicionaTransacao(transa1);


//Iniciacao de Mineradores
console.log('\nIniciando os Mineradores...');
//Sem Enderecos fakes agora podemos enviar a recompensa para a carteira que tem uma chave publica
wernerCoin.mineraTransacoesPendentes(EnderecoCarteira);
console.log('\nO Balanco de Werner eh: ', wernerCoin.getBalancoEndereco(EnderecoCarteira));

//Tentando mexer com o BlockChain
//Lembrando que index 1 eh o bloco criado e nao o Bloco de genesis
wernerCoin.corrente[1].transacoes[0].qtdMoeda = 1;


console.log('A Cadeia eh Valida? ', wernerCoin.isCorrenteValida());