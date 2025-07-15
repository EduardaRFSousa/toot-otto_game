const board = document.querySelector("#board"); 
const selectionArea = document.querySelector("#selection_area");
let currentPlayerText = document.querySelector("#currentPlayer");
const cells = [];
let letter = 'T';
let activeSelectionCell = null;
let currentPlayer;
let gameActive;
let possibleMoves = 24;
let remainingRounds = [];
let roundsDisplay = {};

function showTopMessage(text) {
    const msgDiv = document.getElementById('messageContainer');
    msgDiv.textContent = text;
    msgDiv.classList.remove('show');

    void msgDiv.offsetWidth;

    msgDiv.classList.add('show');
    setTimeout(() => { msgDiv.classList.remove('show'); }, 2500);
}

//----------------------------------------------------------------------------------------------------------------------------

function changeLetter(event){
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const nextLetter = (letter === 'T') ? 'O' : 'T';
    if (rounds[currentPlayer][nextLetter] > 0) {
        letter = nextLetter;
        if (activeSelectionCell) {
            activeSelectionCell.textContent = letter;
        }
    } else {
        console.log(`Sem peças de "${nextLetter}" restantes para ${currentPlayer}`);
    }
}

//----------------------------------------------------------------------------------------------------------------------------

function updateRounds(player, letter) {
    if (rounds[player][letter] > 0) {
        rounds[player][letter]--;
        roundsDisplay[player][letter].textContent = rounds[player][letter];
    }
}

//----------------------------------------------------------------------------------------------------------------------------

function addListeners(selectionCell) {
    selectionCell.addEventListener("mouseover", e => {
        if(!gameActive) return;
        activeSelectionCell = e.target;
        activeSelectionCell.classList.add("selection_cell_mouse_over");
        activeSelectionCell.textContent = letter;
        let j = parseInt(e.target.dataset.column);
        for(let i = 3; i >= 0; i--){
            let cell = cells[i][j];
            if(!cell.classList.contains("filledCell")){
                cell.classList.add("emptyCell");
            }
        }
    });

    selectionCell.addEventListener("mouseout", e => {
        if(!gameActive) return;
        activeSelectionCell.classList.remove("selection_cell_mouse_over");
        activeSelectionCell.textContent = "";
        activeSelectionCell = null;
        let j = parseInt(e.target.dataset.column);
        for(let i = 3; i >= 0; i--){
            let cell = cells[i][j];
            cell.classList.remove("emptyCell");
        }
    });

    selectionCell.addEventListener("click", e => {
        if(!gameActive) return;
        if (rounds[currentPlayer][letter] <= 0) {
            showTopMessage(`Sem peças de "${letter}" restantes para ${currentPlayer}`);
            return;
        }

        let j = parseInt(e.target.dataset.column);
        if (cells[0][j].classList.contains("filledCell")) {
            showTopMessage(`Coluna ${j + 1} está cheia!`);
            return;
        }
        for(let i = 3; i >= 0; i--){
            let cell = cells[i][j];
            if(!cell.classList.contains("filledCell")){
                cell.classList.add("filledCell", "drop-animation");
                cell.textContent = letter;
                possibleMoves--;
                updateRounds(currentPlayer, letter);
                gameStatus();
                currentPlayer = (currentPlayer === "Toot") ? "Otto" : "Toot";
                currentPlayerText.textContent = currentPlayer;
                break;
            }
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------------

function removeSelections() {
    for (const selectionCell of selectionArea.children) {
        selectionCell.classList.remove("selection_cell_mouse_over");
        selectionCell.textContent = "";
    }

    for (const row of cells) {
        for (const cell of row) {
            cell.classList.remove("emptyCell");
        }
    }

    activeSelectionCell = null;
}

//----------------------------------------------------------------------------------------------------------------------------

function showEndMessage(message) {
    const box = document.getElementById("currentPlayerBox");
    box.innerHTML = ""; // Limpa o conteúdo atual

    const msg = document.createElement("p");
    msg.textContent = message;
    msg.classList.add("end-message");

    const btn = document.createElement("button");
    btn.textContent = "Reiniciar jogo";
    btn.addEventListener("click", initializeGame);

    box.appendChild(msg);
    box.appendChild(btn);
}

//----------------------------------------------------------------------------------------------------------------------------

function resetCurrentPlayerBox() {
    const box = document.getElementById("currentPlayerBox");
    box.innerHTML = `<div><p>Vez do jogador <span id="currentPlayer">Toot</span></p></div>
        <p>Dica: Use as setas &lt; ou &gt; para trocar de letra</p>`;
    currentPlayerText = document.querySelector("#currentPlayer");
}

//----------------------------------------------------------------------------------------------------------------------------

function gameStatus(){
    let tootVictory = false;
    let ottoVictory = false;

    // HORIZONTAL
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j <= 6 - 4; j++) {
            let s = "";
            for (let offset = 0; offset < 4; offset++) {
                s += cells[i][j + offset].textContent.trim().toLowerCase();
            }
            if (s === "otto") {
                ottoVictory = true;
            } else if (s === "toot") {
                tootVictory = true;
            }
        }
    }

    // VERTICAL
    for (let j = 0; j < 6; j++) {
        for (let i = 0; i <= 4 - 4; i++) {
            let s = "";
            for (let offset = 0; offset < 4; offset++) {
                s += cells[i + offset][j].textContent.trim().toLowerCase();
            }
            if (s === "otto") {
                ottoVictory = true;
            } else if (s === "toot") {
                tootVictory = true;
            }
        }
    }

    // DIAGONAL PRINCIPAL (\)
    for (let i = 0; i <= 4 - 4; i++) {
        for (let j = 0; j <= 6 - 4; j++) {
            let s = "";
            for (let offset = 0; offset < 4; offset++) {
                s += cells[i + offset][j + offset].textContent.trim().toLowerCase();
            }
            if (s === "otto") {
                ottoVictory = true;
            } else if (s === "toot") {
                tootVictory = true;
            }
        }
    }

    // DIAGONAL SECUNDÁRIA (/)
    for (let i = 0; i <= 4 - 4; i++) {
        for (let j = 3; j < 6; j++) {
            let s = "";
            for (let offset = 0; offset < 4; offset++) {
                s += cells[i + offset][j - offset].textContent.trim().toLowerCase();
            }
            if (s === "otto") {
                ottoVictory = true;
            } else if (s === "toot") {
                tootVictory = true;
            }
        }
    }

    if (tootVictory && ottoVictory) {
        gameActive = false;
        removeSelections();
        showEndMessage("Empate duplo!");
    } else if (tootVictory) {
        gameActive = false;
        removeSelections();
        showEndMessage("Toot venceu!");
    } else if (ottoVictory) {
        gameActive = false;
        removeSelections();
        showEndMessage("Otto venceu!");
    } else if (possibleMoves === 0) {
        gameActive = false;
        removeSelections();
        showEndMessage("Empate! Tabuleiro cheio.");
    }
}

//----------------------------------------------------------------------------------------------------------------------------

function initializeGame(){
    board.innerHTML = "";
    selectionArea.innerHTML = "";
    cells.length = 0;
    document.addEventListener("keyup", changeLetter);
    currentPlayer = "Toot";
    gameActive = true;
    resetCurrentPlayerBox();

    rounds = { Toot: { T: 6, O: 6 }, Otto: { T: 6, O: 6 }};
    remainingRounds = document.querySelectorAll(".rounds");
    roundsDisplay = {
        Toot: { T: remainingRounds[0], O: remainingRounds[1]
        },
        Otto: { T: remainingRounds[2], O: remainingRounds[3]
        }
    };

    for(let i = 0; i < 4; i++){
        const row = [];
        for(let j = 0; j < 6; j++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            board.appendChild(cell);
            row.push(cell);
        }
        cells.push(row);
    }

    for(let j = 0; j < 6; j++){
        const selectionCell = document.createElement("div");
        selectionCell.classList.add("selection_cell");
        selectionCell.dataset.column = j;
        addListeners(selectionCell);
        selectionArea.appendChild(selectionCell);
    }

    for (const player in rounds) {
        for (const letter of ['T', 'O']) {
            roundsDisplay[player][letter].textContent = rounds[player][letter];
        }
    }
}

document.addEventListener("DOMContentLoaded", initializeGame);