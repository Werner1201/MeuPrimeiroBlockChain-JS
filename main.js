const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(indice, tempoCria, info, hashAnterior){
        this.indice = indice;
        this.tempoCria = tempoCria;
        this.info = info;
        this.hashAnterior = hashAnterior;
        this.hash = this.calcularHash();

        //Isso eh um valor que todo bloco possui nao tem nada haver com o que o bloco possui ele apenas serve para ativar 
        //Mudancas no bloco para que o hash mude ate possuir o elemento da dificuldade.
        this.semSentido = 0;
    }

    calcularHash(){
        //Transforma-se para String pois a Funcao SHA256 retorna um Objeto, e eu quero uma string
        return SHA256(this.indice + this.hashAnterior + this.tempoCria + JSON.stringify(this.info) + this.semSentido).toString();
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
    }

    //Todo Blockchain tem seu Genesis Block ou Bloco Inicial que eh criado manualmente por isso um metodo para tal.
    criaBlockInicial(){
        return new Block(0, "01/01/2019", {
            donoAnterior: "Werner Romling",
            proximoDono: "Leonardo BoaMorte",
            qtdMoeda: 1000,
        },"0");
    }

    pegaUltimoBloco(){
        return this.corrente[this.corrente.length - 1];
    }

    adcionaBloco(novoBloco){
        novoBloco.hashAnterior = this.pegaUltimoBloco().hash;
        //Agora quando um novo bloco for criado ele sera minerado primeiramente.
        novoBloco.mineraBloco(this.dificuldade);
        //novoBloco.hash = novoBloco.calcularHash();
        this.corrente.push(novoBloco);
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

//A partir desse momento o que determina a dificuldade determina tbm qnt tempo leva-se para obter o hash

console.log("Minerando o Bloco 1...");
wernerCoin.adcionaBloco(new Block(1, "05/01/2019", {
    donoAnterior: "Leonardo BoaMorte",
    proximoDono: "Matheus Cruz",
    qtdMoeda: 500,
}));


console.log("Minerando o Bloco 2...");
wernerCoin.adcionaBloco(new Block(2, "11/01/2019", {
    donoAnterior: "Matheus Cruz",
    proximoDono: "Daniella Eiriz",
    qtdMoeda: 2000,
}));

//console.log("O Blockchain eh valido ?: "+ wernerCoin.isCorrenteValida());

//Tentativa de Mudanca nao requisitada para verificacao de validade do Blockchain
/*
wernerCoin.corrente[1].info = { 
donoAnterior: "Matheus Cruz",
proximoDono: "Daniella Eiriz",
qtdMoeda: 4000,
};
wernerCoin.corrente[1].hash = wernerCoin.corrente[1].calcularHash();
*/


//Resultado deve ser False
//console.log("O Blockchain eh valido ?: "+ wernerCoin.isCorrenteValida());

//Mas mesmo descobrindo que ha algo de errado na BlockChain nao ha mecanismo implementado ainda para reverter as mudancas indesejadas
//console.log(JSON.stringify(wernerCoin, null, 4));

