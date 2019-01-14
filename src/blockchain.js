const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 

class Transaction {
    constructor(enderecoDe, enderecoPara, qtdMoeda){
        this.enderecoDe = enderecoDe;
        this.enderecoPara = enderecoPara;
        this.qtdMoeda = qtdMoeda;
    }
    //Eh preciso tornar a Transacao assinada e pra isso eh necessario outras funcoes
    calcularHash(){
        return SHA256(this.enderecoDe, this.enderecoPara, this.qtdMoeda).toString();
    }
    //A chaveAssinatura sera o objeto que pegamos no Gerador de Chaves. o objeto chave do documento.
    assinaTransacao(chaveAssinatura){
        //Aqui verificamos se a chave Publica da ChaveAssinatura eh diferente do Endereco De, pq se for vc 
        //Nao pode assinar transacoes de outras carteiras.
        if(chaveAssinatura.getPublic('hex') !== this.enderecoDe){
            throw new Error('Voce nao pode assinar transacoes de outras carteiras');
        }

        const hashTrns = this.calcularHash();
        //Isso assina o hash da transacao com a Chave de assinatura
        const assi = chaveAssinatura.sign(hashTrns, 'base64');
        //Dai armazenamos a assinatura de num formato especial
        this.assinatura = assi.toDER('hex');

    }
    //Verifica se as transacoes estao assinadas corretamente.
    isValida(){
        //Verifica se Eh null pois na Classe BlockChain, a recompensa tem o enderecoDe Null pq eh algo gerado do sistema.
        if(this.enderecoDe === null) return true;

        //Checa se existe uma assinatura
        if(!this.assinatura || this.assinatura.length === 0){
            throw new Error('Transacao sem Assinatura');
        }
        // o EnderecoDe eh uma chave publica logo precisamos verificar se eh correta
        const chavePublica = ec.keyFromPublic(this.enderecoDe, 'hex');
        //Retorna se eh verdadeiro ou falso pelo verificador verify se o hash foi assinado pela assinatura
        return chavePublica.verify(this.calcularHash(), this.assinatura);
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

    //Metodo pra verificar todos as transacoes de um bloco
    temTrnsValida(){
        //Aqui itera-se em todas as transacoes do bloco
        for(const trnsc of this.transacoes){
            if(!trnsc.isValida()){
                return false;
            }
            //se passamos pelo loop e nao retornamos falso
            // retornamos true
            return true;
        }
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
         //O endereco de origem eh null pq a moeda vem desse sistema logo nao tem outra origem se nao o proprio sistema
        const recompensaTransa = new Transaction(null, enderecoRecompensaMineracao, this.recompensaMineracao);
        this.transacoesPendentes.push(recompensaTransa);
        
        //Cria um Bloco com a data atual e a classe transacoes pendentes.
        let bloco = new Block(Date.now, this.transacoesPendentes, this.pegaUltimoBloco().hash);
        //Depois tenta minerar esse bloco.
        bloco.mineraBloco(this.dificuldade);
        
        console.log("Bloco Minerado com Sucesso");
        this.corrente.push(bloco);
           
        this.transacoesPendentes = [];
    }
    //Cria uma Transacao e Add a lista de transacoes pendentes e Mudaremos o nome para Adiciona
    //E dentro dessa funcao faremos algumas checkagens
    AdicionaTransacao(transacao){
        //verifica se nao possui um enderecoDe ou EnderecoPara
        if(!transacao.enderecoDe || !transacao.enderecoPara){
            throw new Error('Transacao deve incluir Enderecos De e Para');
        }
        
        //Verificamos se a transacao nao eh valida
        if(!transacao.isValida()){
            throw new Error('Nao Pode Adicionar Transacoes Invalidas a corrente');
        }
        //Passando ambas verificacoes acima podemos  adcionar a transacao.

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

            //Aqui precisamos verificar tbm se todas as transacoes do blocoatual sao validas se nao retorna falso
            if(!blocoAtual.temTrnsValida()){
                return false;
            }

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

//Dividindo em 2 arquivos, eh necessario exportar certas classes.

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;