//Importa-se aqui uma biblioteca chamada elliptic
const EC = require('elliptic').ec;
//Aqui criamos uma nova instancia de Elliptic 
const ec = new EC('secp256k1'); //Nos parametros passamos qual curva eliptica (pesquise no README.md).

//Aqui irah gerar um par-chave
const chave = ec.genKeyPair();
const chavePublica = chave.getPublic('hex'); //Aqui no parametro se define como a chave deve ser representada.
const chavePrivada = chave.getPrivate('hex'); //O mesmo do Comentario acima

console.log();
console.log('Chave Privada: ', chavePrivada);

console.log();
console.log('Chave Publica: ', chavePublica);
