'use strict';

{
  const select = document.querySelector('#select');
  const start = document.querySelector('#start');
  const timer = document.querySelector('#timer');
  const bestDisplay = document.querySelector('#best');
  const tapSound = document.querySelector('#tapSound');
  const clearSound = document.querySelector('#clearSound');

  let startTime;
  let clearId;

  class Panel {
    constructor() {
      this.eLi = document.createElement('li');
      this.eLi.textContent = ''; // 初期は空
    }

    geteLi() {
      return this.eLi;
    }
  }

  class Panels {
    constructor() {
      this.board = document.querySelector('.board');
      this.main = document.querySelector('main');
      this.n = 3;
      this.currentNumber = 0;
      this.panels = [];
      this.init();
    }

    init() {
      this.createPanels(); // li 生成  変数へ代入
      this.setUp();        // li数に応じてwidthを設定 既li削除、新li追加 classをremove
      this.enableClick();  // liクリック時、条件に応じて処理
      this.loadBestTime(); 
    }

    // li 生成  変数へ代入
    createPanels() {
      this.panels = [];
      for (let i = 1; i <= this.n * this.n; i++) {
        this.panels.push(new Panel());
      }
    }

    // li数に応じてwidthを設定 既li削除、新li追加 classをremove
    setUp() {
      this.main.style.width = `${50 * this.n + 20}px`;
      while (this.board.firstChild) {
        this.board.removeChild(this.board.firstChild);
      }

      this.panels.forEach(panel => {
        const li = panel.geteLi();
        li.textContent = '';
        li.classList.remove('cleared');
        this.board.appendChild(li);
      });
    }

    // 乱数を生成
    getShuffledNumbers() {
      const numbers = [];
      for (let i = 1; i <= this.n * this.n; i++) {
        numbers.push(i);
      }

      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      return numbers;
    }

    // 乱数をliへ代入
    startGame() {
      const numbers = this.getShuffledNumbers();
      this.currentNumber = 0;

      this.panels.forEach(panel => {
        const li = panel.geteLi();
        li.classList.remove('cleared');
        li.textContent = numbers.pop();
      });
    }

    // li数変更時、widthをresize
    reSize(newSize) {
      this.n = Number(newSize);
      this.createPanels();
      this.setUp();
      this.enableClick();
      this.loadBestTime();
    }

    // liクリック時、条件に応じて処理
    enableClick() {
      this.currentNumber = 0;
      this.panels.forEach(panel => {
        const li = panel.geteLi();
        // li.onclick = () => { を修正
        li.addEventListener('pointerdown', () => {
          if (!li.classList.contains('cleared') &&
              Number(li.textContent) === this.currentNumber + 1) {
            li.classList.add('cleared');
            this.currentNumber++;
            tapSound.currentTime = 0;
            tapSound.play();

            if (this.currentNumber === this.n * this.n) {
              clearTimeout(clearId);
              this.checkBestTime();
              clearSound.currentTime = 0;
              clearSound.play();
              start.classList.remove('unclick');
              select.disabled = false;
            }
          }
        });
      });
    }

    // 経過時間の表示
    updateTimer() {
      if (this.currentNumber === this.n * this.n) return;

      const elapsed = Date.now() - startTime;
      const ms = String((elapsed % 1000) / 10 | 0).padStart(2, '0');
      const sec = String(Math.floor(elapsed / 1000) % 60).padStart(2, '0');
      const min = String(Math.floor(elapsed / 60000)).padStart(2, '0');
      timer.textContent = `${min}:${sec}.${ms}`;

      clearId = setTimeout(() => this.updateTimer(), 10);
    }

    // 経過時間の計算
    getElapsedTime() {
      return Date.now() - startTime;
    }

    // ベストタイムのチェックと保存
    checkBestTime() {
      const key = `best-${this.n}`;
      const current = this.getElapsedTime();
      const best = localStorage.getItem(key);

      if (!best || current < parseInt(best)) {
        localStorage.setItem(key, current);
        this.displayBestTime(current);
      }
    }

    // セットアップ時とリサイズ時 ベストタイムのロード
    loadBestTime() {
      const key = `best-${this.n}`;
      const best = localStorage.getItem(key);
      if (best) {
        this.displayBestTime(parseInt(best));
      } else {
        bestDisplay.textContent = `ベストタイム  --:--.--`;
      }
    }

    // ベストタイムの表示
    displayBestTime(ms) {
      const msPart = String((ms % 1000) / 10 | 0).padStart(2, '0');
      const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
      const min = String(Math.floor(ms / 60000)).padStart(2, '0');
      bestDisplay.textContent = `ベストタイム: ${min}:${sec}.${msPart}`;
    }
  }

  const game = new Panels();

  start.addEventListener('click', () => {
    if (start.classList.contains('unclick')) return;

    startTime = Date.now();
    game.startGame();
    game.updateTimer();
    start.classList.add('unclick');
    select.disabled = true;
  });

  select.addEventListener('change', () => {
    const value = select.value;
    if (value !== '') {
      game.reSize(value);
    }
  });
}
