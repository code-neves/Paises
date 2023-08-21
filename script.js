let palavras;
let regiao = '';

let palavraSelecionada = "";
let letrasAdivinhadas = [];
let tentativasRestantes = 0;
let gameIsOver = false;

const exibicaoPalavra = document.getElementById("exibicao-palavra");
const teclado = document.getElementById("teclado");
const mensagem = document.querySelector('.mensagem');
const contadorVitoria = document.querySelector('.contador-vitoria');

let vitorias = 0;
let derrotas = 0;

const botaoIniciar = document.getElementById("botao-iniciar");
const botaoJogarNovamente = document.getElementById("botao-jogar-novamente");
const botaoVoltarAoMenu = document.getElementById("botao-voltar-ao-menu");
const containerBotoes = document.getElementById("botoes-jogo");
const containerVidas = document.getElementById("container-vidas");
const pDificuldade = document.querySelectorAll('.dificuldade p');
const pContinente = document.querySelectorAll('.continente p');
const btnContinentes = document.getElementById('continentes');
const btnDificuldade = document.getElementById('dificuldade');
let dificuldade = '';

function getApi() {
    let dataPaises = [];
    fetch('https://servicodados.ibge.gov.br/api/v1/paises/{paises}')
        .then(response => response.json())
        .then(paises => {
            for (let pais in paises) {
                if (paises[pais].localizacao.regiao.nome == regiao) {
                    if ((paises[pais].nome.abreviado).length <= 15 && !dataPaises.includes(paises[pais].nome.abreviado)) {
                        let array = (paises[pais].nome.abreviado).split('');
                        if (!array.includes(' ') && !array.includes('-')) {
                            dataPaises.push(paises[pais].nome.abreviado);
                        }
                    }
                }
            }
        });
    return dataPaises;
}

function escolherDificuldade(event) {
    dificuldade = event.target.textContent;
    btnDificuldade.innerText = dificuldade;

    switch (dificuldade) {
        case 'Fácil - 6 vidas':
            tentativasRestantes = 6;
            break;
        case 'Médio - 4 vidas':
            tentativasRestantes = 4;
            break;
        case 'Difícil - 2 vidas':
            tentativasRestantes = 2;
            break;
        default:
            tentativasRestantes = 0;
            break;
    }
}

function escolherContinente(event) {
    btnContinentes.innerText = event.target.textContent;
    regiao = event.target.textContent;
    palavras = getApi();
    console.log(palavras);
}

function resetarVidas() {
    containerVidas.innerHTML = ""; // Clear the hearts container

    for (let i = 0; i < tentativasRestantes; i++) {
        const vida = document.createElement("span");
        vida.className = "vida";
        vida.innerHTML = "❤️"; // You can use any heart emoji here
        containerVidas.appendChild(vida);
    }
}

function iniciar() {
    if (regiao == "" || palavras == undefined || tentativasRestantes == 0) {
        alert('Escolha a dificuldade e o continente para iniciar o jogo');
    } else {
        configurarJogo();
        console.log("Iniciando o jogo...");
        document.querySelector('.dificuldade').style.visibility = 'hidden';
        document.querySelector('.continente').style.visibility = 'hidden';

        resetarVidas();

        botaoIniciar.style.display = 'none';
        containerBotoes.style.display = 'flex';
        botaoVoltarAoMenu.style.visibility = 'visible';
        teclado.style.visibility = 'visible';
        contadorVitoria.innerHTML = "";
    }
}

function configurarJogo() {
    console.log("Configurando o jogo...");
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)];
    letrasAdivinhadas = [];
    gameIsOver = false;
    atualizarExibicao();
    criarTeclado();

    mensagem.innerHTML = ""; // Clear previous messages
}

function atualizarExibicao() {
    let textoExibicao = "";

    for (let i = 0; i < palavraSelecionada.length; i++) {
        const letra = palavraSelecionada[i];
        if (letrasAdivinhadas.includes(letra)) {
            textoExibicao += letra;
        } else {
            textoExibicao += "_";
        }
    }

    exibicaoPalavra.textContent = textoExibicao;

    exibicaoPalavra.classList.remove("vencedor", "perdedor");
}

function criarTeclado() {
    console.log("Criando o teclado...");
    teclado.innerHTML = "";

    for (let i = 65; i <= 90; i++) {
        const letra = String.fromCharCode(i);
        const elementoTecla = document.createElement("div");
        elementoTecla.classList.add("tecla");
        elementoTecla.textContent = letra;
        elementoTecla.addEventListener("click", () => lidarComClique(letra));
        teclado.appendChild(elementoTecla);
    }
}

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function lidarComClique(letra) {
    console.log("Lidando com clique na letra:", letra);
    const teclaClicada = Array.from(document.querySelectorAll(".tecla")).find(tecla => tecla.textContent === letra);

    if (teclaClicada && !teclaClicada.classList.contains("adivinhada")) {
        console.log("Letra adivinhada:", letra);
        const letraSemAcento = removerAcentos(letra.toLowerCase());
        letrasAdivinhadas.push(letraSemAcento);
        teclaClicada.classList.add("adivinhada"); // Adicionar essa linha

        const letraEncontrada = verificarLetraEncontrada(letraSemAcento);

        if (!letraEncontrada) {
            console.log("Letra errada:", letra);
            tratarLetraErrada(teclaClicada);
        } else {
            teclaClicada.classList.add("correta"); // Adicionar essa linha
        }

        verificarFimDoJogo();
    }

    if (gameIsOver) return; // Retornar se o jogo já acabou
}

function verificarLetraEncontrada(letraSemAcento) {
    let letraEncontrada = false;

    for (let i = 0; i < palavraSelecionada.length; i++) {
        const letraPalavraSemAcento = removerAcentos(palavraSelecionada[i].toLowerCase());

        if (letraPalavraSemAcento === letraSemAcento) {
            exibicaoPalavra.textContent =
                exibicaoPalavra.textContent.substring(0, i) +
                palavraSelecionada[i] +
                exibicaoPalavra.textContent.substring(i + 1);
            
            letraEncontrada = true; // Tratamento pra repetição 
        }
    }

    return letraEncontrada;
}

function tratarLetraErrada(teclaClicada) {
    teclaClicada.classList.add("errada"); // Adicionar essa linha
    tentativasRestantes--;
    const vidas = containerVidas.querySelectorAll("span");
    if (vidas.length > tentativasRestantes) {
        containerVidas.removeChild(vidas[vidas.length - 1]);
    }
    if (tentativasRestantes === 0) {
        mostrarResultado(false);
        gameIsOver = true; // Definir gameIsOver como true quando o jogo é perdido
        desabilitarTeclado();
    }
}

function verificarFimDoJogo() {
    if (exibicaoPalavra.textContent === palavraSelecionada) {
        mostrarResultado(true);
        gameIsOver = true; // Definir gameIsOver como true quando o jogo é ganho
        desabilitarTeclado();
    }
}

function desabilitarTeclado() {
    const teclas = document.querySelectorAll(".tecla");
    teclas.forEach(tecla => {
        tecla.style.pointerEvents = "none"; // Desabilitar eventos de ponteiro para as teclas do teclado
    });
}

function jogarNovamente() {
    switch (dificuldade) {
        case 'Fácil - 6 vidas':
            tentativasRestantes = 6;
            break;
        case 'Médio - 4 vidas':
            tentativasRestantes = 4;
            break;
        case 'Difícil - 2 vidas':
            tentativasRestantes = 2;
            break;
        default:
            tentativasRestantes = 0;
            break;
    }
    configurarJogo();
    resetarVidas();
    botaoJogarNovamente.style.display = 'none'; // Esconder o botão "Jogar Novamente"
    UpdatecontadorVitoria()
}

function retornarAoMenu() {
    // Resetar os botoes
    botaoJogarNovamente.style.display = 'none';
    botaoVoltarAoMenu.style.visibility = 'hidden';
    configurarJogo();
    document.querySelector('.dificuldade').style.visibility = 'visible';
    document.querySelector('.continente').style.visibility = 'visible';
    btnContinentes.innerText = 'CONTINENTE';
    btnDificuldade.innerText = 'DIFICULDADE';
    botaoIniciar.style.display = 'block';
    containerBotoes.style.visibility = 'hidden';
    teclado.style.visibility = 'hidden';
    exibicaoPalavra.textContent = "";
    contadorVitoria.innerHTML = "";

    // Resetar as variáveis
    palavras = undefined;
    tentativasRestantes = 0;
    vitorias = 0;
    derrotas = 0;
    resetarVidas();

    // Limpadinha no console de cria
    console.clear();
    console.log("Retornando ao menu...");
}



function mostrarResultado(vencedor) {
    const mensagemClass = vencedor ? 'mensagem-vitoria' : 'mensagem-derrota';
    const mensagemTexto = vencedor ? "Você ganhou!" : `Você perdeu! A palavra era: ${palavraSelecionada}`;
    
    exibicaoPalavra.classList.add(vencedor ? "vencedor" : "perdedor");
    mensagem.classList.add(mensagemClass);
    mensagem.innerHTML = mensagemTexto;
    botaoJogarNovamente.style.display = 'block'; // Mostrar botão de Jogar Novamente
    botaoVoltarAoMenu.style.visibility = 'visible'; // Mostrar botão de Voltar ao Menu
    const opostoClass = vencedor ? 'mensagem-derrota' : 'mensagem-vitoria';
    if (mensagem.classList.contains(opostoClass)) {
        mensagem.classList.remove(opostoClass);
    }

    if (vencedor) {
        vitorias++;
    } else {
        derrotas++;
    }
}



function mostrarBotoesJogo() {
    botaoJogarNovamente.style.visibility = 'visible';
    botaoVoltarAoMenu.style.visibility = 'visible';
}

function UpdatecontadorVitoria() {
    contadorVitoria.innerHTML = `<p>Vitórias: ${vitorias} </p><p>Derrotas: ${derrotas} </p> `;
}
