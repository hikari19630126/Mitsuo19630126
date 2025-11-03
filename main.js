'use strict';

{
  const btn = document.querySelector('#start-btn');
  const boardEl = document.querySelector('#board');
  const sizeSelect = document.querySelector('#grid-size');
  const tapSound = document.querySelector('#tapSound');
  const clearSound = document.querySelector('#clearSound');
  const startSound = document.querySelector('#startSound');
  const timerEl = document.querySelector('#timer');
  const bestEl = document.querySelector('#best-time');
  const overlay = document.querySelector('#overlay');
  const resultTimeEl = document.querySelector('#result-time');
  const canvas = document.querySelector('#fireworks');
  const ctx = canvas.getContext('2d');

  let timerID = null;
  let startTime = 0;
  let elapsed = 0;
  let currentNum = 1;
  let board;

  /* 花火パーティクルクラス */
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = Math.random() * 2 + 1;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 3 + 2;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.005;
    }
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + 1; // gravity
      this.alpha -= this.decay;
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  let particles = [];

  function createFireworks() {
    const w = canvas.width = overlay.clientWidth;
    const h = canvas.height = overlay.clientHeight;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.6;
      const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
      for (let j = 0; j < 20; j++) {
        particles.push(new Particle(x, y, color));
      }
    }
  }

  function animateFireworks() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.update();
      p.draw();
      if (p.alpha <= 0) particles.splice(i, 1);
    });
    if (particles.length > 0) requestAnimationFrame(animateFireworks);
  }

  /* Boardクラス */
  class Board {
    constructor(size = 3) {
      this.size = size;
      this.createBoard();
      this.loadBestTime();
    }

    createBoard() {
      boardEl.innerHTML = '';
      boardEl.dataset.size = this.size;
      const nums = this.shuffleNumbers();
      nums.forEach(num => {
        const li = document.createElement('li');
        li.textContent = num;
        li.style.animationDelay = `${Math.random() * 0.3}s`;
        boardEl.appendChild(li);
      });
    }

    shuffleNumbers() {
      const arr = Array.from({ length: this.size ** 2 }, (_, i) => i + 1);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    handleClick(e) {
      const li = e.target.closest('li');
      if (!li || !btn.classList.contains('is-disabled')) return;

      const num = Number(li.textContent);
      if (num === currentNum) {
        tapSound.currentTime = 0;
        tapSound.play();
        li.classList.add('disabled');

        if (num === this.size ** 2) {
          this.finishGame();
        }
        currentNum++;
      }
    }

    finishGame() {
      clearTimeout(timerID);
      clearSound.currentTime = 0;
      clearSound.play();

      btn.classList.remove('is-disabled');
      sizeSelect.disabled = false;
      this.checkBestTime();

      resultTimeEl.textContent = `TIME: ${this.formatTime(elapsed)}`;
      overlay.classList.remove('hidden');

      // 花火演出
      particles = [];
      createFireworks();
      animateFireworks();

      setTimeout(() => overlay.classList.add('hidden'), 3500);
    }

    startGame() {
      startSound.currentTime = 0;
      startSound.play();

      currentNum = 1;
      this.createBoard();
      this.startTimer();
      btn.classList.add('is-disabled');
      sizeSelect.disabled = true;
      overlay.classList.add('hidden');
    }

    startTimer() {
      clearTimeout(timerID);
      startTime = Date.now();
      const update = () => {
        elapsed = Date.now() - startTime;
        timerEl.textContent = this.formatTime(elapsed);
        timerID = setTimeout(update, 10);
      };
      update();
    }

    loadBestTime() {
      const best = localStorage.getItem(`best-${this.size}`);
      bestEl.textContent = best ? this.formatTime(parseInt(best)) : '--:--.--';
    }

    checkBestTime() {
      const best = localStorage.getItem(`best-${this.size}`);
      if (!best || elapsed < parseInt(best)) {
        localStorage.setItem(`best-${this.size}`, elapsed);
        bestEl.textContent = this.formatTime(elapsed);
      }
    }

    formatTime(ms) {
      const min = String(Math.floor(ms / 60000)).padStart(2, '0');
      const sec = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
      const msec = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
      return `${min}:${sec}.${msec}`;
    }
  }

  // 初期化
  board = new Board();
  boardEl.addEventListener('pointerdown', e => board.handleClick(e));
  btn.addEventListener('click', () => board.startGame());
  sizeSelect.addEventListener('change', () => {
    board = new Board(Number(sizeSelect.value));
    btn.classList.remove('is-disabled');
  });
}