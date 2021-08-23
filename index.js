const _ = require('lodash');
const fs = require('fs');
const readline = require('readline');
const {
    table
} = require('console');

const classes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

async function lerArquivo(caminho) {
    var array = []

    const fileStream = fs.createReadStream(caminho);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    var index = 0;

    for await (const line of rl) {
        array[index] = {}
        array[index].data = _.split(line, ' ');
        array[index].def = array[index].data[array[index].data.length - 1];
        array[index].data.pop();
        index++;
    }

    return array

}

function distanciaEuclediana(ind1, ind2) {
    var soma = 0;

    for (var i = 0; i < ind1.data.length; i++) {
        soma += Math.pow(ind1.data[i] - ind2.data[i], 2)
    }

    return Math.sqrt(soma);
}

function distanciaManhattan(ind1, ind2) {
    var soma = 0;

    for (var i = 0; i < ind1.data.length; i++) {
        soma += Math.abs(ind1.data[i] - ind2.data[i]);
    }

    return soma;
}

function classificarAmostra(treinamento, ind, k, calcDistancia) {
    var distancias = [];

    for (var i = 0; i < treinamento.length; i++) {
        distancias.push({
            valor: calcDistancia(treinamento[i], ind),
            index: i
        });
    }

    var contClasses = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    distancias.sort(function (a, b) {
        return a.valor < b.valor ? -1 : a.valor > b.valor ? 1 : 0;
    });

    distancias.every((e, index) => {
        if (index >= k) return false;
        var classeDefinida = treinamento[e.index].def
        classes.every((c) => {
            if (c == classeDefinida) {
                contClasses[c]++;
                return false;
            };
            return true;
        });
        return true
    });

    var maior = 0;

    for (var i = 0; i < classes.length; i++) {
        if (contClasses[i] > contClasses[maior]) {
            maior = i;
        }
    }

    return classes[maior];
}

async function exec(k, treinamento, calcDistancia) {

    var classificacao = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    var qntTestes = 0;
    var acertos = 0;

    var conjuntoUtilizado = [];

    await lerArquivo('treinamento.txt').then((result) => {
        for (var i = 0; i < (treinamento / 100) * result.length; i++) {
            conjuntoUtilizado.push(result[Math.floor(Math.random() * result.length)])
        }
    });

    var inicio = new Date();

    await lerArquivo('teste.txt').then((teste) => {
        qntTestes = teste.length;
        for (var i = 0; i < teste.length; i++) {
            var classificacaoResolvida = classificarAmostra(conjuntoUtilizado, teste[i], k, calcDistancia);
            classificacao[teste[i].def][classificacaoResolvida]++;
            if (teste[i].def == classificacaoResolvida) acertos++;
        }
    });

    var fim = new Date();

    console.log('\n', 'K:', k, 'Treinamento:', treinamento + '%', 'Distância:', calcDistancia);
    console.table(classificacao);
    console.log('Acerto:', (acertos / qntTestes * 100).toFixed(3) + '%', 'Início:', inicio.toLocaleTimeString('pt-BR'), 'Fim:', fim.toLocaleTimeString('pt-BR'), 'Execução:', (fim - inicio) + 'ms');
}

function main() {
    k = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

    for (var x = 0; x < k.length; x++) {
        for (var i = 25; i < 101; i *= 2) {
            exec(k[x], i, distanciaManhattan);
            exec(k[x], i, distanciaEuclediana);
        }
    }
}

main();