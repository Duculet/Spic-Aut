const sentences = [
  'Mătușa măturătorului își face un smoothie din spaghete și ciocolată.',
  'Găina galbenă gătește gogoși gigantice pe terasa lunii.',
  'Cinci maimuțe mănâncă mămăligă pe un pat de batoane.',
  'Bunica beatbox-uiește în bucătărie cu un ciorap în gură.',
  'Șapte șosete supărate sar singure pe pluta din balcon.',
  'Un bursuc bărbos bea borș cu un mixaj de fluiere.',
  'Rața dansatoare dă din aripi pe scenă cu cizme de cauciuc.',
  'Pinguinul parfumat preferă pizza picantă cu brânză de zăpadă.',
  'Veverița veselă vinde violete violet la un magazin de nori.',
  'Melcul mecanic merge mereu miercurea cu o lanternă în bot.',
  'Cârtița cochetă caută căpșuni crocante pe trotuarul cosmic.',
  'Broasca bretonată brodează brioșe albastre pentru un dragon.',
  'Papagalul poartă pantaloni portocalii la operă în ploaie.',
  'Un crocodil curios croșetează cravate crem cu un ac de gheață.',
  'Pisica plinuță plimbă papuci prin ploaie cu o umbrelă de gogoși.',
  'Leul leneș linge limonadă lunea la marginea unui vulcan.',
  'Șoricelul șmecher șoptește știri șocante dintr-un castron de supă.',
  'O oaie obosită organizează o omletă cu cizmă de balet.',
  'Vulpea vopsită valsează vineri verde lângă un autobuz de cartofi.',
  'Trei tigri triști trag tramvaiul pe o stradă de nuci.',
  'Cocoșul cochet cântă colinde confuze în fața unui robot.',
  'Foca fericită fredonează la telefon în timp ce mănâncă covrigi.',
  'Zâna zglobie zboară cu un coș de biciclete și un cărucior de spanac.',
  'Delfinul dând din degete desenează dragoni pe o pizza de mare.',
  'Ursul uriaș urlă în liftul de la etajul 9 cu o minge de vată.',
  'Baba cu bereta bagă borcane de borcană în căruciorul de pepeni.',
  'Maimuța medicinează morcovii cu o pereche de ochelari de soare.',
  'Râsul ruginos rămâne în frigider lângă cutia de piese de lego.',
  'Păsărică plictisită pictează perne în forma unui platou de clătite.',
  'Iepurașul îmbrăcat în imperial își aprinde castronul cu bomboane.',
  'Porcușorul poet recită versuri în spațiul dintre două prăjituri.',
  'Buburuza bătătorită bate din aripi peste un șir de cărți de poker.',
  'Lupul lăudăros leagă la gât o salată de lămâi și un pian.',
  'Nava-născută de noapte navighează pe un ocean de iaurt cu praf de stele.',
  'Căprioara cu ciorapi cântă la trompetă în colțul unui muzeu de cartofi.',
  'Șarpele șugubăț se scaldă în sos de roșii cu patru clopoței.'
];

const MAX_PLAYERS = 8;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let players = [
  { name: 'Andrei', score: 0 },
  { name: 'Maria', score: 0 }
];

let turnDuration = 60;
let secondsLeft = 60;
let currentPlayerIndex = 0;
let cardIndex = 0;
let roundIndex = 1;
let timer = null;
let revealVisible = false;

function renderPlayers() {
  const playersList = $('#playersList');
  playersList.innerHTML = players
    .map((player, index) => `
      <div class="player-row">
        <span class="player-number">${index + 1}</span>
        <input class="player-input" data-index="${index}" value="${player.name}" maxlength="18" aria-label="Numele jucătorului ${index + 1}" />
        ${players.length > 1 ? `<button class="remove-player" data-remove="${index}" aria-label="Șterge jucătorul">×</button>` : ''}
      </div>
    `)
    .join('');

  $('#playerCountLabel').textContent = `${players.length} jucător${players.length === 1 ? '' : 'i'}`;

  $$('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.remove);
      if (players.length > 1) {
        players.splice(index, 1);
        if (currentPlayerIndex >= players.length) {
          currentPlayerIndex = 0;
        }
        renderPlayers();
      }
    });
  });

  $$('[data-index]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const index = Number(event.target.dataset.index);
      players[index].name = event.target.value.trim() || `Jucător ${index + 1}`;
      if (index === currentPlayerIndex) {
        $('#activePlayerName').textContent = players[index].name;
      }
    });
  });
}

function setRoundLabel() {
  $('#roundLabel').textContent = `TURA ${roundIndex}`;
}

function updateTimerDisplay() {
  const progress = Math.max(0, (secondsLeft / turnDuration) * 100);
  $('#timerValue').textContent = String(secondsLeft);
  $('#timerRing').style.setProperty('--progress', `${progress}%`);
  $('#timerRing').classList.toggle('warning', secondsLeft <= 10);
}

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer() {
  clearTimer();
  timer = setInterval(() => {
    secondsLeft -= 1;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearTimer();
      advanceTurn();
    }
  }, 1000);
}

function switchScreen(screenId) {
  $$('.screen').forEach((screen) => screen.classList.remove('active'));
  $(`#${screenId}`).classList.add('active');
}

function setActivePlayer(index) {
  currentPlayerIndex = (index + players.length) % players.length;
  const playerName = players[currentPlayerIndex]?.name || `Jucător ${currentPlayerIndex + 1}`;
  $('#activePlayerName').textContent = playerName;
}

function showSentenceCard() {
  const sentence = sentences[cardIndex % sentences.length];
  const cardNumber = String((cardIndex % sentences.length) + 1).padStart(2, '0');

  $('#sentenceText').textContent = sentence;
  $('#cardNumber').textContent = `#${cardNumber}`;
  $('#flashCard').classList.remove('reveal');
  void $('#flashCard').offsetWidth;
  $('#flashCard').classList.add('reveal');

  revealVisible = true;
  $('#showButton').classList.add('hidden');
  $('#resultActions').classList.remove('hidden');
  $('#gameHint').textContent = 'Toată lumea aude: alege dacă a fost ghicit sau nu.';
}

function prepareRound() {
  revealVisible = false;
  secondsLeft = turnDuration;
  updateTimerDisplay();
  $('#showButton').classList.remove('hidden');
  $('#resultActions').classList.add('hidden');
  $('#gameHint').textContent = 'Apasă „Arată propoziția” și încearcă să o spui cu plasticele în gură.';
  setActivePlayer(currentPlayerIndex);
  setRoundLabel();
}

function advanceTurn() {
  if (players.length === 0) return;

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  cardIndex += 1;
  roundIndex = Math.floor(cardIndex / players.length) + 1;
  prepareRound();
}

function startGame() {
  if (players.length === 0) return;

  players.forEach((player) => {
    player.score = 0;
  });

  currentPlayerIndex = 0;
  cardIndex = 0;
  roundIndex = 1;
  prepareRound();
  switchScreen('gameScreen');
}

function showScoreboard() {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  $('#scoreList').innerHTML = sortedPlayers
    .map((player, index) => `
      <div class="score-row">
        <span class="rank">${index + 1}</span>
        <span class="score-avatar">${['😎', '🤪', '🦄', '🐸', '🦊', '🐼', '🐙', '🦁'][index] || '🎉'}</span>
        <span class="score-name">${player.name}</span>
        <span class="points">${player.score}<small>pct</small></span>
      </div>
    `)
    .join('');

  switchScreen('scoreScreen');
}

$('#addPlayerButton').addEventListener('click', () => {
  if (players.length < MAX_PLAYERS) {
    players.push({ name: `Jucător ${players.length + 1}`, score: 0 });
    renderPlayers();
  }
});

$$('.duration-option').forEach((button) => {
  button.addEventListener('click', () => {
    $$('.duration-option').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');

    const selected = button.dataset.duration;
    const customInput = $('#customDuration');

    if (selected === 'custom') {
      customInput.classList.remove('hidden');
      turnDuration = Number(customInput.value) || 45;
    } else {
      customInput.classList.add('hidden');
      turnDuration = Number(selected);
    }

    secondsLeft = turnDuration;
    updateTimerDisplay();
  });
});

$('#customDuration').addEventListener('input', (event) => {
  const customValue = Number(event.target.value) || 45;
  if ($('.duration-option.selected')?.dataset.duration === 'custom') {
    turnDuration = Math.min(180, Math.max(10, customValue));
    secondsLeft = turnDuration;
    updateTimerDisplay();
  }
});

$('#startButton').addEventListener('click', () => {
  startGame();
  startTimer();
});

$('#showButton').addEventListener('click', () => {
  if (!revealVisible) showSentenceCard();
});

$('#correctButton').addEventListener('click', () => {
  players[currentPlayerIndex].score += 1;
  clearTimer();
  advanceTurn();
  startTimer();
});

$('#skipButton').addEventListener('click', () => {
  clearTimer();
  advanceTurn();
  startTimer();
});

$('#quitButton').addEventListener('click', () => {
  clearTimer();
  switchScreen('setupScreen');
});

$('#scoreButton').addEventListener('click', () => {
  clearTimer();
  showScoreboard();
});

$('#scoreBackButton').addEventListener('click', () => {
  switchScreen('gameScreen');
  if (players.length) {
    startTimer();
  }
});

$('#newGameButton').addEventListener('click', () => {
  clearTimer();
  switchScreen('setupScreen');
});

$('#helpButton').addEventListener('click', () => $('#helpDialog').showModal());
$('#closeHelp').addEventListener('click', () => $('#helpDialog').close());
$('#helpDialog').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
});

renderPlayers();
turnDuration = 60;
secondsLeft = turnDuration;
updateTimerDisplay();
$('#activePlayerName').textContent = players[0].name;
setRoundLabel();
