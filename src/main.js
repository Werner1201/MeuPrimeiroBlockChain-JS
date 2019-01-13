const SHA256 = require('crypto-js/sha256');


class Transaction {
    constructor(enderecoDe, enderecoPara, qtdMoeda){
        this.enderecoDe = enderecoDe;
        this.enderecoPara = enderecoPara;
        this.qtdMoeda = qtdMoeda;
    }
}

//Um bloco deve ser responsavel por receber multiplas transacoes por isso a mudanca de info para transacao
class Block {
    constructor(tempoCria, transacoes, hashAnterior){
        //Nao ha necessidade de indice pois a posicao de um bloco eh definida no array da corrente do Chain
        //this.indice = indice;
        this.tempoCria = tempoCria;
        this.transacoes = transacoes;
        this.hashAnterior = hashAnterior;
        this.hash = this.calcularHash();

        //Isso eh um valor que todo bloco possui nao tem nada haver com o que o bloco possui ele apenas serve para ativar 
        //Mudancas no bloco para que o hash mude ate possuir o elemento da dificuldade.
        this.semSentido = 0;
    }

    calcularHash(){
        //Transforma-se para String pois a Funcao SHA256 retorna um Objeto, e eu quero uma string
        return SHA256(this.hashAnterior + this.tempoCria + JSON.stringify(this.transacoes) + this.semSentido).toString();
    }

    //Implementando Prova-Real, que mostra se um Blockchain eh real e impede de criar varios blocos
    //rapido demais. Logo se implementa um metodo de mineracao de blocos
    mineraBloco(dificuldade){
        //Nessa linha nos tentamos criar uma restricao para criar o hash de bloco para comecar com um numero N de Zeros(0)
        //O loop so vai parar de rodar qnd o hash tiver um numero N de zeros
        while(this.hash.substring(0, dificuldade) !== Array(dificuldade + 1).join("0")){
            this.semSentido++;
            this.hash = this.calcularHash();
        }

        console.log("Bloco Minerado: "+ this.hash);
    }

}

class BlockChain{
    constructor(){
        //A Chain eh basicamente uma Corrente que eh uma lista de Blocos
        this.corrente = [this.criaBlockInicial()];
        //Adiciona-se uma propriedade de dificuldade do blockchain
        //Mudando a dificuldade para outros valores torna bem demandante do processamento do computador
        //Use a seu proprio risco
        this.dificuldade = 4;
        //Armazena as Transacoes que estao para serem validadas
        this.transacoesPendentes = [];
        //Define a qtd de moedas que serao recompensadas caso se minere com sucesso
        this.recompensaMineracao = 100;

    }

    //Todo Blockchain tem seu Genesis Block ou Bloco Inicial que eh criado manualmente por isso um metodo para tal.
    criaBlockInicial(){
        return new Block("01/01/2019", [], "0");
    }

    pegaUltimoBloco(){
        return this.corrente[this.corrente.length - 1];
    }

    //Com esse parametro se envia a recompensa para a carteira do endereco dado
    mineraTransacoesPendentes(enderecoRecompensaMineracao){
        //Cria um Bloco com a data atual e a classe transacoes pendentes.
        let bloco = new Block(Date.now, this.transacoesPendentes);
        //Depois tenta minerar esse bloco.
        bloco.mineraBloco(this.dificuldade);
        
        console.log("Bloco Minerado com Sucesso");
        this.corrente.push(bloco);
            //O endereco de origem eh null pq a moeda vem desse sistema logo nao tem outra origem se nao o proprio sistema
        this.transacoesPendentes = [new Transaction(null, enderecoRecompensaMineracao, this.recompensaMineracao, this.pegaUltimoBloco)];
    }
    //Cria uma Transacao e Add a lista de transacoes pendentes
    criaTransacao(transacao){
        this.transacoesPendentes.push(transacao);
    }

    //Cria um Metodo que mostra o Balanco do Endereco
    getBalancoEndereco(endereco){
        let balanco = 0;
        for(const bloco of this.corrente){
            for(const trans of bloco.transacoes){
                if(trans.enderecoDe == endereco){
                    balanco -= trans.qtdMoeda;
                }
                if(trans.enderecoPara == endereco){
                    balanco += trans.qtdMoeda;
                }
            }
        }
        return balanco;
    }

    isCorrenteValida(){
        //Nao conto o Bloco 0 pois ele eh o bloco inicial
        for(let i = 1; i < this.corrente.length; i++){
            const blocoAtual = this.corrente[i];
            const blocoAnterior = this.corrente[i-1];

            //Verifica se teve alguma mudanca recalculando o hash
            if(blocoAtual.hash !== blocoAtual.calcularHash()){
                return false;
            }
            //Eh necessario tbm verificar se o hash bloco anterior esta correto.
            if(blocoAtual.hashAnterior !== blocoAnterior.hash){
                return false;
            }

        }
        return true;
    }

}


//Execucao de Exemplo
let wernerCoin = new BlockChain();

//Essas sao transacoes que estao pendentes, para que acontecam eh preciso ativar os mineradores
wernerCoin.criaTransacao(new Transaction('Endereco0', 'Endereco1', 100));
wernerCoin.criaTransacao(new Transaction('Endereco1', 'Endereco0', 50));

//Iniciacao de Mineradores
console.log('\nIniciando os Mineradores...');
//Enderecos fakes pois ainda nao ha implementado rastreamento
wernerCoin.mineraTransacoesPendentes('Werner-endereco');
console.log('\nO Balanco de Werner eh: ', wernerCoin.getBalancoEndereco('Werner-endereco'));

//De novo pois a qtd de Moeda so aparece depois de outra transacao minerada
console.log('\nIniciando os Mineradores De novo...');
//Enderecos fakes pois ainda nao ha implementado rastreamento
wernerCoin.mineraTransacoesPendentes('Werner-endereco');
console.log('\nO Balanco de Werner eh: ', wernerCoin.getBalancoEndereco('Werner-endereco'));
