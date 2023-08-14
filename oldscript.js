let palavras;
let regiao = '';

let palavraSelecionada = "";
let letrasAdivinhadas = [];
let tentativasRestantes = 6;
let gameIsOver = false;



const exibicaoPalavra = document.getElementById("exibicao-palavra");
const teclado = document.getElementById("teclado");
const restartButton = document.getElementById("restart-button");
const winMessage = document.getElementById("win-message");
const loseMessage = document.getElementById("lose-message");
const playAgainButton = document.getElementById("play-again-button");
const returnToMenuButton = document.getElementById("return-to-menu-button");


const pDifficult = document.querySelectorAll('.dificuldade p');
const pContinent = document.querySelectorAll('.continente p');
const btnContinentes = document.getElementById('continentes');
const btnDificuldade = document.getElementById('dificuldade');


pDifficult.forEach(pTag => {
    pTag.addEventListener('click', dificuldade);
});

pContinent.forEach(pTag => {
    pTag.addEventListener('click', continentes);
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

function dificuldade(event) {

    if (event.target.textContent == 'Fácil - 6 vidas') {
        btnDificuldade.innerText = event.target.textContent;
        tentativasRestantes = 6;
    } else if (event.target.textContent == 'Médio - 4 vidas') {
        btnDificuldade.innerText = event.target.textContent;
        tentativasRestantes = 4;
    } else if (event.target.textContent == 'Difícil - 2 vidas') {
        btnDificuldade.innerText = event.target.textContent;
        tentativasRestantes = 2;
    } else {
        tentativasRestantes = 6;
    };


};

function continentes(event) {

    for (let i of pContinent) {
        if (event.target.textContent == pContinent[i].textContent) {
            btnContinentes.innerText = event.target.textContent;
            regiao = event.target.textContent;
            palavras = getApi();
            console.log(palavras);
        }
    }

}

function iniciar() {
    if (regiao == "" || palavras == undefined) {
        alert('Escolha a dificuldade e o continente para iniciar o jogo')
    } else if (restartButton.innerText == 'REINICIAR') {
        location.reload();
    } else {
        configurarJogo();
        console.log("Iniciando o jogo...");
        document.querySelector('.dificuldade').style.display = 'none';
        document.querySelector('.continente').style.display = 'none';
        btnContinentes.style.backgroundColor = '#3e8e41';
        btnDificuldade.style.backgroundColor = '#3e8e41';
        restartButton.innerText = 'REINICIAR';

    }

}


function configurarJogo() {
    console.log("Configurando o jogo...");
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)];
    letrasAdivinhadas = [];

    atualizarExibicao();
    criarTeclado();
    winMessage.innerHTML = ""; // Clear previous messages
    loseMessage.innerHTML = "";
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function atualizarExibicao() {
    let displayText = "";

    for (let i of palavraSelecionada) {
        const letra = palavraSelecionada[i];
        if (letrasAdivinhadas.includes(letra)) {
            displayText += letra;
        } else {
            displayText += "_";
        }
    }

    exibicaoPalavra.textContent = displayText;

    exibicaoPalavra.classList.remove("winning", "losing"); // Clear previous classes

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

function lidarComClique(letra) {
    console.log("Lidando com clique na letra:", letra);
    const teclaClicada = Array.from(document.querySelectorAll(".tecla")).find(tecla => tecla.textContent === letra);

    if (teclaClicada && !teclaClicada.classList.contains("guessed")) {
        console.log("Letra adivinhada:", letra);
        const letraSemAcento = removeAccents(letra.toLowerCase());
        letrasAdivinhadas.push(letraSemAcento);
        teclaClicada.classList.add("guessed"); // Add this line

        let letraEncontrada = false;

        for (let i of palavraSelecionada) {
            const letraPalavraSemAcento = removeAccents(palavraSelecionada[i].toLowerCase());
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
                disableKeyboard();
                return;
            }
        } else {
            teclaClicada.classList.add("correct"); // Add this line
        }

        if (exibicaoPalavra.textContent === palavraSelecionada) {
            mostrarResultado(true);
            gameIsOver = true; // Set gameIsOver to true when the game is won
            disableKeyboard();
        }
    }

    if (gameIsOver) return; // Return if the game is already over


}
function disableKeyboard() {
    const teclas = document.querySelectorAll(".tecla");
    teclas.forEach(tecla => {
        tecla.style.pointerEvents = "none"; // Disable pointer events for keyboard keys
    });
}

playAgainButton.addEventListener("click", () => {
    playAgainButton.style.display = "none"; // Hide Play Again button
    returnToMenuButton.style.display = "none"; // Hide Return to Menu button
    configurarJogo();
});

returnToMenuButton.addEventListener("click", () => {
    playAgainButton.style.display = "none"; // Hide Play Again button
    returnToMenuButton.style.display = "none"; // Hide Return to Menu button
    // Implement logic to return to the menu or reset the game to its initial state
    // ...
});

function playAgain() {
    configurarJogo();
    resetGameButtons();
}

function returnToMenu() {
    document.querySelector('.dificuldade').style.display = 'block';
    document.querySelector('.continente').style.display = 'block';
    document.getElementById('continentes').style.backgroundColor = '#4CAF50';
    document.getElementById('dificuldade').style.backgroundColor = '#4CAF50';
    resetGameButtons();
}

function resetGameButtons() {
    playAgainButton.style.display = 'none';
    returnToMenuButton.style.display = 'none';
}

function mostrarResultado(vencedor) {
    if (vencedor) {
        exibicaoPalavra.classList.add("winning");
        winMessage.innerHTML = "Você ganhou!";
        loseMessage.innerHTML = "";
        playAgainButton.style.display = "block"; // Show Play Again button
        returnToMenuButton.style.display = "block"; // Show Return to Menu button
    } else {
        exibicaoPalavra.classList.add("losing");
        winMessage.innerHTML = "";
        loseMessage.innerHTML = "Você perdeu! A palavra era: " + palavraSelecionada;
        playAgainButton.style.display = "block"; // Show Play Again button
        returnToMenuButton.style.display = "block"; // Show Return to Menu button
    }
}


