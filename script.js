// Declarando as variáveis e selecionando os elementos.
const visor = document.getElementById('visor');
const botoesNumero = document.querySelectorAll('[data-numero]');
const botoesOperacao = document.querySelectorAll('[data-operacao]');
const botoesAcao = document.querySelectorAll('[data-acao]');
let visorAtual = '';

// Configurando os botões numéricos e a vírgula.
botoesNumero.forEach(function (botao) {
    botao.addEventListener('click', function () {

        const numero = botao.getAttribute('data-numero');
        const numeroAtual = visorAtual.match(/-?\d*,?\d*$/)[0];

        // Impedindo várias vírgulas em um número.
        if (numero === ',') {

            if (numeroAtual.includes(',')) {
                return;
            }

            // Adicionando zero antes da vírgula quando necessário.
            if (numeroAtual === '' || numeroAtual === '-') {
                visorAtual += '0,';
                visor.value = visorAtual;
                return;
            }
        }

        visorAtual = visorAtual + numero;
        visor.value = visorAtual;

    });
});


// Configurando as operações.
botoesOperacao.forEach(function (botao) {
    botao.addEventListener('click', function () {

        const operacao = botao.getAttribute('data-operacao');

        // Permitindo um único sinal negativo no início.
        if (operacao === '-' && visorAtual === '') {
            visorAtual += operacao;
            visor.value = visorAtual;
            return;
        }

        // Permitindo número negativo após +, × ou ÷.
        if (operacao === '-' && /[+×÷]$/.test(visorAtual)) {
            visorAtual += operacao;
            visor.value = visorAtual;
            return;
        }

        // Permitindo subtração seguida de número negativo.
        if (operacao === '-' && /\d-$/.test(visorAtual)) {
            visorAtual += operacao;
            visor.value = visorAtual;
            return;
        }

        // Impedindo operação consecutiva inválida.
        if (visorAtual === '' || /[+\-×÷,]$/.test(visorAtual)) {
            return;
        }

        visorAtual = visorAtual + operacao;
        visor.value = visorAtual;

    });
});

// Configurando os botões de apagar e limpar. 
botoesAcao.forEach(function (botao) {
    botao.addEventListener('click', function () {

        const acao = botao.getAttribute('data-acao');

        if (acao === 'limpar') {
            visorAtual = '';
            visor.value = '';
        }

        if (acao === 'apagar') {
            visorAtual = visorAtual.slice(0, -1);
            visor.value = visorAtual;
        }

    });
});

// Configurando o botão de igual.
botoesAcao.forEach(function (botao) {
    botao.addEventListener('click', function () {

        const acao = botao.getAttribute('data-acao');

        if (acao === 'igual') {

            // Impedindo expressões incompletas.
            if (visorAtual === '' || /[+\-×÷,]$/.test(visorAtual)) {
                return;
            }

            const resultado = calcular(visorAtual);

            if (resultado === null) {
                visor.value = 'Não é possível dividir por zero';
                visorAtual = '';
                return;
            }

            visorAtual = String(resultado).replace('.', ',');
            visor.value = visorAtual;

        }

    });
});

// Traduzindo a expressão.
function traduzirExpressao(expressao) {
    return expressao
        .replace(/,/g, '.')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
}

// Identificando os números e as operações.
function separarExpressao(expressao) {

    const numeros = [];
    const operacoes = [];
    let numeroAtual = '';

    expressao = traduzirExpressao(expressao);

    for (let i = 0; i < expressao.length; i++) {

        const caractere = expressao[i];

        // Identificando números e decimais.
        if ((caractere >= '0' && caractere <= '9') || caractere === '.') {
            numeroAtual += caractere;
        }

        // Identificando números negativos.
        else if (caractere === '-' && (i === 0 || '+-*/'.includes(expressao[i - 1]))) {
            numeroAtual += caractere;
        }

        // Identificando operações.
        else {
            numeros.push(Number(numeroAtual));
            operacoes.push(caractere);
            numeroAtual = '';
        }
    }

    numeros.push(Number(numeroAtual));

    return { numeros, operacoes };
}

// Multiplicando e dividindo os números.
function multiplicacaoDivisao(numeros, operacoes) {

    for (let i = 0; i < operacoes.length; i++) {

        if (operacoes[i] === '*') {
            numeros[i] = numeros[i] * numeros[i + 1];
            numeros.splice(i + 1, 1);
            operacoes.splice(i, 1);
            i--;
        }

        else if (operacoes[i] === '/') {

            if (numeros[i + 1] === 0) {
                return null;
            }

            numeros[i] = numeros[i] / numeros[i + 1];
            numeros.splice(i + 1, 1);
            operacoes.splice(i, 1);
            i--;
        }

    }

    return { numeros, operacoes };
}

// Adicionando e subtraindo os números.
function adicaoSubtracao(numeros, operacoes) {

    for (let i = 0; i < operacoes.length; i++) {

        if (operacoes[i] === '+') {
            numeros[i] = numeros[i] + numeros[i + 1];
            numeros.splice(i + 1, 1);
            operacoes.splice(i, 1);
            i--;
        }

        else if (operacoes[i] === '-') {
            numeros[i] = numeros[i] - numeros[i + 1];
            numeros.splice(i + 1, 1);
            operacoes.splice(i, 1);
            i--;
        }

    }

    return { numeros, operacoes };
}

// Cálculo completo.
function calcular(expressao) {

    const expressaoSeparada = separarExpressao(expressao);

    const numeros = expressaoSeparada.numeros;
    const operacoes = expressaoSeparada.operacoes;

    const resultadoMultiplicacaoDivisao = multiplicacaoDivisao(numeros, operacoes);

    if (resultadoMultiplicacaoDivisao === null) {
        return null;
    }

    adicaoSubtracao(numeros, operacoes);

    return Math.round(numeros[0] * 100000) / 100000;
    /* Arredondando o resultado para 5 casas decimais, pois o javascript é meio doido com números decimais.
    Exemplo: 0.1 + 0.2 = 0.30000000000000004
    ToDo: descobrir por que o JS faz isso e se tem uma forma melhor de resolver.*/
}