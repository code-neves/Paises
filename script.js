let palavras;
let regiao = '';

let palavraSelecionada = "";
let letrasAdivinhadas = [];
let tentativasRestantes = 0;
let gameIsOver = false;

const exibicaoPalavra = document.getElementById("exibicao-palavra");
const teclado = document.getElementById("teclado");
const message = document.querySelector('.message'); 

const startButton = document.getElementById("start-button");
const playAgainButton = document.getElementById("play-again-button");
const returnToMenuButton = document.getElementById("return-to-menu-button");
const buttonsContainer = document.getElementById("game-buttons");

const pDifficult = document.querySelectorAll('.dificuldade p');
const pContinent = document.querySelectorAll('.continente p');
const btnContinentes = document.getElementById('continentes');
const btnDificuldade = document.getElementById('dificuldade');
let dificuldade = '';

pDifficult.forEach(pTag => {
    pTag.addEventListener('click', escolherDificuldade);
});

pContinent.forEach(pTag => {
    pTag.addEventListener('click', escolherContinente);
});

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

    if (dificuldade == 'Fácil - 6 vidas') {
        tentativasRestantes = 6;
    } else if (dificuldade == 'Médio - 4 vidas') {
        tentativasRestantes = 4;
    } else if (dificuldade == 'Difícil - 2 vidas') {
        tentativasRestantes = 2;
    } else {
        tentativasRestantes = 0;
    }
}

function escolherContinente(event) {
    for (let i = 0; i < pContinent.length; i++) {
        if (event.target.textContent == pContinent[i].textContent) {
            btnContinentes.innerText = event.target.textContent;
            regiao = event.target.textContent;
            palavras = getApi();
            console.log(palavras);
        }
    }
}

function iniciar() {
    if (regiao == "" || palavras == undefined || tentativasRestantes == 0) {
        alert('Escolha a dificuldade e o continente para iniciar o jogo');
    } else {
        configurarJogo();
        console.log("Iniciando o jogo...");
        document.querySelector('.dificuldade').style.display = 'none';
        document.querySelector('.continente').style.display = 'none';
        document.querySelector('nav').style.gap = '2.5rem';

        startButton.style.display = 'none'; // Hide the start button
        buttonsContainer.style.display = 'flex';
        returnToMenuButton.style.display = 'block';
        teclado.style.display = 'flex'; // Show the keyboard
    }
}

function configurarJogo() {
    console.log("Configurando o jogo...");
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)];
    letrasAdivinhadas = [];
    gameIsOver = false;
    atualizarExibicao();
    criarTeclado();

    message.innerHTML = ""; // Clear previous messages
}

function atualizarExibicao() {
    let displayText = "";

    for (let i = 0; i < palavraSelecionada.length; i++) {
        const letra = palavraSelecionada[i];
        if (letrasAdivinhadas.includes(letra)) {
            displayText += letra;
        } else {
            displayText += "_";
        }
    }

    exibicaoPalavra.textContent = displayText;

    exibicaoPalavra.classList.remove("winning", "losing"); // Limpar classes anteriores
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

    if (teclaClicada && !teclaClicada.classList.contains("guessed")) {
        console.log("Letra adivinhada:", letra);
        const letraSemAcento = removerAcentos(letra.toLowerCase());
        letrasAdivinhadas.push(letraSemAcento);
        teclaClicada.classList.add("guessed"); // Add this line

        let letraEncontrada = false;

        for (let i = 0; i < palavraSelecionada.length; i++) {
            const letraPalavraSemAcento = removerAcentos(palavraSelecionada[i].toLowerCase());
            if (letraPalavraSemAcento === letraSemAcento) {
                exibicaoPalavra.textContent = exibicaoPalavra.textContent.substring(0, i) + palavraSelecionada[i] + exibicaoPalavra.textContent.substring(i + 1);
                letraEncontrada = true;
            }
        }

        if (!letraEncontrada) {
            console.log("Letra errada:", letra);
            teclaClicada.classList.add("wrong"); // Add this line
            tentativasRestantes--;
            if (tentativasRestantes === 0) {
                mostrarResultado(false);
                gameIsOver = true; // Set gameIsOver to true when the game is lost
                disableTeclado();
                return;
            }
        } else {
            teclaClicada.classList.add("correct"); // Add this line
        }

        if (exibicaoPalavra.textContent === palavraSelecionada) {
            mostrarResultado(true);
            gameIsOver = true; // Set gameIsOver to true when the game is won
            disableTeclado();
        }
    }

    if (gameIsOver) return; // Return if the game is already over
}

function disableTeclado() {
    const teclas = document.querySelectorAll(".tecla");
    teclas.forEach(tecla => {
        tecla.style.pointerEvents = "none"; // Disable pointer events for keyboard keys
    });
}

playAgainButton.addEventListener("click", () => {

    if (dificuldade == 'Fácil - 6 vidas') {
        tentativasRestantes = 6;
    } else if (dificuldade == 'Médio - 4 vidas') {
        tentativasRestantes = 4;
    } else if (dificuldade == 'Difícil - 2 vidas') {
        tentativasRestantes = 2;
    } else {
        tentativasRestantes = 0;
    }

    configurarJogo();

    playAgainButton.style.display = 'none'; // Esconder o botão "Jogar Novamente"
});

returnToMenuButton.addEventListener("click", retornarAoMenu);


function retornarAoMenu() {
    playAgainButton.style.display = 'none';
    returnToMenuButton.style.display = 'none';
    configurarJogo(); // Reconfigurar o jogo

    // Show difficulty and continent buttons
    document.querySelector('.dificuldade').style.display = 'block';
    document.querySelector('.continente').style.display = 'block';
    btnContinentes.innerText = 'CONTINENTE';
    btnDificuldade.innerText = 'DIFICULDADE';
    startButton.style.display = 'block'; // Show the start button
    buttonsContainer.style.display = 'none'; // Hide game-related buttons
    teclado.style.display = 'none'; // Hide the keyboard
    exibicaoPalavra.textContent = ""; // Clear the word display

    palavras = undefined;
    tentativasRestantes = 0;

    if (window.matchMedia("(max-width: 750px)").matches) {
        document.querySelector('nav').style.gap = '15rem';
    } else {
        document.querySelector('nav').style.gap = '2.5rem';
    }


    console.clear(); // Clear the console
    console.log("Retornando ao menu...");
}





function mostrarResultado(vencedor) {
    if (vencedor) {
        exibicaoPalavra.classList.add("winning");
        message.classList.add('win-message');
        message.innerHTML = "Você ganhou!";
        playAgainButton.style.display = "block"; // Show Play Again button
        returnToMenuButton.style.display = "block"; // Show Return to Menu button
        if (message.classList.contains('lose-message')) {
            message.classList.remove('lose-message');
        }
    } else {
        exibicaoPalavra.classList.add("losing");
        message.classList.add('lose-message');
        message.innerHTML = "Você perdeu! A palavra era: " + palavraSelecionada;
        playAgainButton.style.display = "block"; // Show Play Again button
        returnToMenuButton.style.display = "block"; // Show Return to Menu button
        
        if (message.classList.contains('win-message')) {
            message.classList.remove('win-message');
        }
    }
    showGameButtons();
}

function showGameButtons() {
    playAgainButton.style.display = 'block';
    returnToMenuButton.style.display = 'block';
}

