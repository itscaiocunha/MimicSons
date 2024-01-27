document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('playerNameInput');
    const addPlayerBtn = document.getElementById('addPlayerBtn');

    const startGameBtn = document.getElementById('startGameBtn');
    const lobbySection = document.getElementById('lobby');
    const gameSection = document.getElementById('game');
    const turnInfo = document.getElementById('turnInfo');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const guessList = document.getElementById('guessList');
    const scoresContainer = document.getElementById('scoresContainer');
    const podiumContainer = document.getElementById('podiumContainer');
    const trainingModeCheckbox = document.getElementById('trainingModeCheckbox');
    const teamModeCheckbox = document.getElementById('teamModeCheckbox');
    const POINTS_TO_WIN = 10;

    let mediaRecorder;
    let chunks = [];
    let players = [];
    let currentPlayerIndex = 0;
    let playerScores = {};
    let challengeList = [
        'Imite um animal de forma hilária',
        'Faça uma imitação usando apenas palavras engraçadas',
        'Imite um personagem famoso',

    ];
    let voteList = {};
    let trainingMode = false;
    let teamMode = false;
    let teams = [];

    addPlayerBtn.addEventListener('click', addPlayer);
    startGameBtn.addEventListener('click', startGame);
    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    playBtn.addEventListener('click', playRecording);


    function getRandomChallenge() {
        return challengeList[Math.floor(Math.random() * challengeList.length)];
    }

    function addPlayer() {
        const playerName = playerNameInput.value.trim();
        if (playerName !== '') {
            players.push(playerName);
            playerNameInput.value = '';
            updatePlayerList();
        }
    }

    function updatePlayerList() {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';

        players.forEach(player => {
            const li = document.createElement('li');
            li.innerText = player;
            playerList.appendChild(li);
        });

        startGameBtn.disabled = players.length < 2 || (teamMode && teams.length < 2);
    }

    function startGame() {
        lobbySection.style.display = 'none';
        gameSection.style.display = 'block';
        currentPlayerIndex = 0;
        playerScores = {};
        voteList = {};
        updatePlayerList();
        startNextTurn();
    }

    function startNextTurn() {
        if (trainingMode) {
            turnInfo.innerHTML = `Modo de Treinamento: ${getRandomChallenge()}`;
        } else {
            turnInfo.innerHTML = `Vez de ${players[currentPlayerIndex]}! Aguarde 5 segundos.`;
            setTimeout(() => {
                turnInfo.innerHTML = `Desafio: ${getRandomChallenge()}`;
                recordBtn.disabled = false;
            }, 5000);
        }
    }

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            chunks = [];
            const audioUrl = URL.createObjectURL(blob);
            audioPlayer.src = audioUrl;
            playBtn.disabled = false;
        };

        mediaRecorder.start();
        recordBtn.disabled = true;
        stopBtn.disabled = false;
    }

    function stopRecording() {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }

    function playRecording() {
        audioPlayer.play();
        guessList.innerHTML += `<li>${players[currentPlayerIndex]} está imitando!</li>`;
        playBtn.disabled = true;

        audioPlayer.addEventListener('ended', () => {
            showVotingOptions();
        });
    }

    function showVotingOptions() {
        const votingOptionsHtml = '<h2>Votação</h2><ul id="votingOptions"></ul>';
        turnInfo.innerHTML += votingOptionsHtml;
        const votingOptionsList = document.getElementById('votingOptions');

        players.forEach(player => {
            if (player !== players[currentPlayerIndex]) {
                const li = document.createElement('li');
                li.innerHTML = `${player} <button onclick="voteForPlayer('${player}')">Adivinhar</button>`;
                votingOptionsList.appendChild(li);
            }
        });
    }

    function voteForPlayer(guessingPlayer) {
        if (!voteList[players[currentPlayerIndex]]) {
            voteList[players[currentPlayerIndex]] = [];
        }

        if (!voteList[players[currentPlayerIndex]].includes(guessingPlayer)) {
            voteList[players[currentPlayerIndex]].push(guessingPlayer);

            if (guessingPlayer === players[currentPlayerIndex]) {
                playerScores[guessingPlayer] = (playerScores[guessingPlayer] || 0) + 1;
                turnInfo.innerHTML += `<p>${guessingPlayer} acertou e ganhou 1 ponto!</p>`;
                showScores();
            }
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

        const winner = checkForWinner();
        if (winner) {
            scoresContainer.innerHTML += `<h2>${winner} venceu o jogo!</h2>`;
            setTimeout(resetGame, 5000);
        } else {
            startNextTurn();
        }
    }

    function showScores() {
        scoresContainer.innerHTML = '<h2>Pontuações</h2>';
        Object.entries(playerScores).forEach(([player, score]) => {
            scoresContainer.innerHTML += `<p>${player}: ${score} ponto(s)</p>`;
        });

        updatePodium();
    }

    function updatePodium() {
        const sortedPlayers = Object.entries(playerScores).sort((a, b) => b[1] - a[1]);

        podiumContainer.innerHTML = '<h2>Pódio</h2>';

        sortedPlayers.forEach(([player, score], index) => {
            const podiumItem = document.createElement('div');
            podiumItem.innerHTML = `<p>${index + 1}. ${player}: ${score} ponto(s)</p>`;
            podiumContainer.appendChild(podiumItem);
        });
    }

    function checkForWinner() {
        for (const [player, score] of Object.entries(playerScores)) {
            if (score >= POINTS_TO_WIN) {
                return player;
            }
        }
        return null;
    }

    function resetGame() {
        lobbySection.style.display = 'block';
        gameSection.style.display = 'none';
        players = [];
        playerScores = {};
        voteList = {};
        updatePlayerList();
    }
});
