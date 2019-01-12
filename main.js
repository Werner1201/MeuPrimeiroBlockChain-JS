const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(indice, tempoCria, info, hashAnterior){
        this.indice = indice;
        this.tempoCria = tempoCria;
        this.info = info;
        this.hashAnterior = hashAnterior;
        this.hash = this.calcularHash();
    }

    calcularHash(){
        //Transforma-se para String pois a Funcao SHA256 retorna um Objeto, e eu quero uma string
        return SHA256(this.indice + this.hashAnterior + this.tempoCria + JSON.stringify(this.info)).toString();
    }
}

class BlockChain{
    constructor(){
        //A Chain eh basicamente uma Corrente que eh uma lista de Blocos
        this.corrente = [this.criaBlockInicial()];
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
        novoBloco.hash = novoBloco.calcularHash();
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
wernerCoin.adcionaBloco(new Block(1, "05/01/2019", {
    donoAnterior: "Leonardo BoaMorte",
    proximoDono: "Matheus Cruz",
    qtdMoeda: 500,
}));

wernerCoin.adcionaBloco(new Block(2, "11/01/2019", {
    donoAnterior: "Matheus Cruz",
    proximoDono: "Daniella Eiriz",
    qtdMoeda: 2000,
}));

console.log("O Blockchain eh valido ?: "+ wernerCoin.isCorrenteValida());

//Tentativa de Mudanca nao requisitada para verificacao de validade do Blockchain
wernerCoin.corrente[1].info = { 
donoAnterior: "Matheus Cruz",
proximoDono: "Daniella Eiriz",
qtdMoeda: 4000,
};
wernerCoin.corrente[1].hash = wernerCoin.corrente[1].calcularHash();



//Resultado deve ser False
console.log("O Blockchain eh valido ?: "+ wernerCoin.isCorrenteValida());

//Mas mesmo descobrindo que ha algo de errado na BlockChain nao ha mecanismo implementado ainda para reverter as mudancas indesejadas
console.log(JSON.stringify(wernerCoin, null, 4));

/*
*TODO: Implementar funcionalidade de "Prova-Real" ou em Ingles Proof-of-Work
*/