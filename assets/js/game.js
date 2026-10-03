// Rock Paper Scissors
// Pick a move, the house reveals its own (chosen at random before you pick),
// win +1 point, lose -1 (never below zero), draw no change.

(function () {
	'use strict';

	var PREFIX = 'sasso-carta-forbici:';
	var MOVES = ['rock', 'paper', 'scissors'];
	var BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

	// -------
	// Storage
	// -------

	function load(key, fallback) {
		try {
			var v = localStorage.getItem(PREFIX + key);
			return v === null ? fallback : JSON.parse(v);
		} catch (e) {
			return fallback;
		}
	}

	function save(key, value) {
		try {
			localStorage.setItem(PREFIX + key, JSON.stringify(value));
		} catch (e) { /* storage unavailable */ }
	}

	var blank = { score: 0, wins: 0, losses: 0, draws: 0, streak: 0, best: 0 };
	var stats = Object.assign({}, blank, load('stats', {}));

	// --------
	// Elements
	// --------

	var $ = function (id) { return document.getElementById(id); };
	var pickEl = $('pick');
	var duelEl = $('duel');
	var playerSlot = $('player-slot');
	var houseSlot = $('house-slot');
	var resultEl = $('result');
	var resultMsg = $('result-msg');
	var againBtn = $('btn-again');
	var scoreEl = $('score');
	var rulesEl = $('rules');
	var rulesBtn = $('btn-rules');
	var resetBtn = $('btn-reset');

	var state = 'pick'; // pick | reveal | result
	var houseChoice = null;
	var timers = [];
	var resetArmed = false;

	function later(fn, ms) {
		timers.push(setTimeout(fn, ms));
	}

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	function makeToken(move) {
		var el = document.createElement('div');
		el.className = 'token token-' + move;
		el.setAttribute('role', 'img');
		el.setAttribute('aria-label', move.charAt(0).toUpperCase() + move.slice(1));
		var i = document.createElement('i');
		i.className = 'icon-icon-' + move;
		el.appendChild(i);
		return el;
	}

	function renderStats() {
		scoreEl.textContent = stats.score;
		$('stat-wins').textContent = stats.wins;
		$('stat-losses').textContent = stats.losses;
		$('stat-draws').textContent = stats.draws;
		$('stat-streak').textContent = stats.streak;
		$('stat-best').textContent = stats.best;
	}

	// ----------
	// Game flow
	// ----------

	function newRound() {
		clearTimers();
		state = 'pick';
		houseChoice = MOVES[Math.floor(Math.random() * 3)];
		duelEl.hidden = true;
		pickEl.hidden = false;
		resultEl.classList.remove('done');
		document.querySelectorAll('.side').forEach(function (s) { s.classList.remove('winner'); });
	}

	function choose(move) {
		if (state !== 'pick' || isRulesOpen()) return;
		state = 'reveal';

		pickEl.hidden = true;
		duelEl.hidden = false;
		playerSlot.innerHTML = '';
		playerSlot.appendChild(makeToken(move));
		houseSlot.innerHTML = '';
		houseSlot.className = 'slot empty';
		resultMsg.textContent = '';
		resultMsg.className = 'result-msg';
		resultEl.classList.remove('done');

		// Short "thinking" shuffle before the house reveals its pick
		var n = 0;
		later(function shuffle() {
			houseSlot.className = 'slot shuffling';
			houseSlot.innerHTML = '';
			houseSlot.appendChild(makeToken(MOVES[n % 3]));
			n++;
			if (n < 7) later(shuffle, 90);
			else later(function () { reveal(move); }, 90);
		}, 450);
	}

	function reveal(move) {
		houseSlot.className = 'slot';
		houseSlot.innerHTML = '';
		houseSlot.appendChild(makeToken(houseChoice));

		var outcome = move === houseChoice ? 'draw' : (BEATS[move] === houseChoice ? 'win' : 'lose');

		later(function () {
			if (outcome === 'win') {
				stats.score++;
				stats.wins++;
				stats.streak++;
				stats.best = Math.max(stats.best, stats.streak);
				document.querySelector('.side-player').classList.add('winner');
			} else if (outcome === 'lose') {
				if (stats.score > 0) stats.score--;
				stats.losses++;
				stats.streak = 0;
				document.querySelector('.side-house').classList.add('winner');
			} else {
				stats.draws++;
			}
			save('stats', stats);
			renderStats();
			scoreEl.classList.remove('bump');
			void scoreEl.offsetWidth;
			if (outcome !== 'draw') scoreEl.classList.add('bump');

			resultMsg.textContent = outcome === 'win' ? 'You win' : (outcome === 'lose' ? 'You lose' : 'Draw');
			resultMsg.className = 'result-msg ' + outcome;
			resultEl.classList.add('done');
			state = 'result';
			againBtn.focus({ preventScroll: true });
		}, 350);
	}

	// -----
	// Rules
	// -----

	var lastFocus = null;

	function isRulesOpen() {
		return !rulesEl.hidden;
	}

	function openRules() {
		lastFocus = document.activeElement;
		rulesEl.hidden = false;
		disarmReset();
		rulesEl.querySelector('.btn-close').focus({ preventScroll: true });
	}

	function closeRules() {
		rulesEl.hidden = true;
		disarmReset();
		if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
	}

	function disarmReset() {
		resetArmed = false;
		resetBtn.classList.remove('confirm');
		resetBtn.textContent = 'Reset score & stats';
	}

	resetBtn.addEventListener('click', function () {
		if (!resetArmed) {
			resetArmed = true;
			resetBtn.classList.add('confirm');
			resetBtn.textContent = 'Tap again to confirm';
			return;
		}
		stats = Object.assign({}, blank);
		save('stats', stats);
		renderStats();
		resetBtn.textContent = 'Stats cleared';
		resetArmed = false;
		resetBtn.classList.remove('confirm');
	});

	rulesBtn.addEventListener('click', openRules);
	rulesEl.addEventListener('click', function (e) {
		if (e.target.closest('[data-close]')) closeRules();
	});

	// ------
	// Input
	// ------

	pickEl.addEventListener('click', function (e) {
		var btn = e.target.closest('[data-move]');
		if (btn) choose(btn.getAttribute('data-move'));
	});

	againBtn.addEventListener('click', function () {
		if (state === 'result') newRound();
	});

	var KEY_MOVES = { r: 'rock', p: 'paper', s: 'scissors', '1': 'rock', '2': 'paper', '3': 'scissors' };

	window.addEventListener('keydown', function (e) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		var k = e.key.toLowerCase();
		if (isRulesOpen()) {
			if (k === 'escape') { e.preventDefault(); closeRules(); }
			return;
		}
		if (state === 'pick' && KEY_MOVES[k]) {
			e.preventDefault();
			choose(KEY_MOVES[k]);
		} else if (state === 'result' && (k === 'enter' || k === ' ' || KEY_MOVES[k])) {
			e.preventDefault();
			newRound();
			if (KEY_MOVES[k]) choose(KEY_MOVES[k]);
		} else if (k === 'h' || k === '?') {
			openRules();
		}
	});

	window.addEventListener('contextmenu', function (e) { e.preventDefault(); });

	renderStats();
	newRound();
})();
