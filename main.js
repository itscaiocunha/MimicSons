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

    let mediaRecorder;
    let chunks = [];
    let players = [];
    let currentPlayerIndex = 0;
    let challengeList = [
        'Whale',
        'Crickets',
        'Frog',
        'Elephant',
        'Birds',
        'Lion',
        'Dolphin',
        'Wolf',
        'Monkey'

    ];
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
        updatePlayerList();
        startNextTurn();
    }

    function startNextRound() {
        guessList.innerHTML = '';
        document.getElementById('nextRoundBtn').disabled = true;
    
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
        turnInfo.innerHTML = `Próxima rodada: Vez de ${players[currentPlayerIndex]}! Aguarde 3 segundos.`;
        setTimeout(() => {
            turnInfo.innerHTML = `Desafio: ${getRandomChallenge()}`;
            recordBtn.disabled = false;
        }, 3000);
    }

    document.getElementById('nextRoundBtn').addEventListener('click', startNextRound);
    
    function startNextTurn() {
        if (trainingMode) {
            turnInfo.innerHTML = `Modo de Treinamento: ${getRandomChallenge()}`;
        } else {
            turnInfo.innerHTML = `Vez de ${players[currentPlayerIndex]}! Aguarde 3 segundos.`;
            setTimeout(() => {
                turnInfo.innerHTML = `Desafio: ${getRandomChallenge()}`;
                recordBtn.disabled = false;
            }, 3000);
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
            guessList.innerHTML = ''; 
            document.getElementById('nextRoundBtn').disabled = false;
        });
    }

    function resetGame() {
        lobbySection.style.display = 'block';
        gameSection.style.display = 'none';
        players = [];
        updatePlayerList();
    }
});
