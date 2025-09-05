import {
  Component,
  signal,
  computed,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SYMBOLS } from './symbols';
import { SpinsCounterComponent } from '../spins-counter/spins-counter.component';
import { withModule } from '@angular/core/testing';
import { MoneyCounterComponent } from '../money-counter/money-counter.component';
import { interval } from 'rxjs';

@Component({
  selector: 'app-gamblin-layout',
  imports: [CommonModule, FormsModule, SpinsCounterComponent, MoneyCounterComponent],
  templateUrl: './gamblin-layout.component.html',
  styleUrl: './gamblin-layout.component.css',
})
export class GamblinLayoutComponent implements OnInit {
  shownPoints = 0;
  symbols = SYMBOLS;
  public image = this.randomizeSymbols();
  isSpinning = false;
  resetting = false;
  firstTimePoints = true;

  /*  @Output() spinCounter = new EventEmitter<number>() */
  spins = 0;

  newPoints = 0;
  // Stake controls
  stake = 1;
  stakeMin = 1;
  stakeMax = 100;
  stakeStep = 10;

  private profit = 0;

  money = 100;
  // Track starting bankroll to compute overall loss
  private startingMoney = 100;

  // Simple, customizable popup config + state
  showSummaryModal = false;
  popupTitle = 'The House always wins!';
  popupMessagePrefix = 'You spun';
  popupMessageMiddle = 'times and gambled';
  popupMessageSuffix = 'away.';
  popupPrimaryText = 'Play Again';
  popupSecondaryText = 'Close';
  summarySpins = 0;
  summaryLoss = 0;


  increaseSound = new Audio();
  decreaseSound = new Audio();

  newMoney = new Audio();
  outofmoney = new Audio();
  playagain = new Audio();
  thehousealwayswins = new Audio();
  increaseStake() {
    if (this.isSpinning) return;

    this.increaseSound.src = 'assets/increase.mp3';
    this.increaseSound.play();

    if (this.stake === 1 && this.money != 0) {
      this.stake = this.stake + 9;
      return
    }
    this.stake = Math.min(this.stakeMax, this.stake + this.stakeStep);
  }

  decreaseStake() {
    if (this.isSpinning) return;
    this.decreaseSound.src = 'assets/decrease.mp3';
    this.decreaseSound.play();
    if (this.money === 0) this.stakeMin = 0;
    this.stake = Math.max(this.stakeMin, this.stake - this.stakeStep);

  }

  onStakeChange() {
    // Clamp manual edits
    if (typeof this.stake !== 'number') {
      this.stake = this.stakeMin;
    }
    this.stake = Math.max(this.stakeMin, Math.min(this.stake, this.stakeMax));
  }

  symbolsOnReels: string[] = [];
  symbolsOnReels2: string[] = [];
  symbolsOnReels3: string[] = [];

  fixedFirstThree1: string[] = [];
  fixedFirstThree2: string[] = [];
  fixedFirstThree3: string[] = [];

  ngOnInit(): void {
    console.log('Init');
    // Initialize starting bankroll for loss calculation
    this.startingMoney = this.money;
    console.log(this.symbolsOnReels);
    const getRandomSymbol = () =>
      'assets/symbols/' +
      this.symbols[Math.floor(Math.random() * this.symbols.length)].img;

    this.fixedFirstThree1 = [...Array.from({ length: 3 }, getRandomSymbol)];
    this.fixedFirstThree2 = [...Array.from({ length: 3 }, getRandomSymbol)];
    this.fixedFirstThree3 = [...Array.from({ length: 3 }, getRandomSymbol)];

    this.randomizeSymbols();
  }

  private calculateProbability() {
    const totalWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);

    let random = Math.random() * totalWeight;

    for (let s of this.symbols) {
      if (random < s.weight) {
        return 'assets/symbols/' + s.img;
      }
      random -= s.weight;
    }

    return 'assets/symbols/' + this.symbols[0].img;
  }

  private randomizeSymbols() {
    try {
      const getRandomSymbol = () => this.calculateProbability();

      this.symbolsOnReels = [
        ...this.fixedFirstThree1,
        ...Array.from({ length: 97 }, getRandomSymbol),
      ];

      this.symbolsOnReels2 = [
        ...this.fixedFirstThree2,
        ...Array.from({ length: 97 }, getRandomSymbol),
      ];

      this.symbolsOnReels3 = [
        ...this.fixedFirstThree3,
        ...Array.from({ length: 97 }, getRandomSymbol),
      ];

      console.log('Erfolgreich Randomized');
    } catch {
      console.log('Fehler beim Randomizen');
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      if (!this.isSpinning) {
        this.spin();
      }
    }
  }

  spin() {
    if (this.stake > this.money || this.money === 0 || this.stake === 0) {
      if (this.money === 0) {
        this.triggerBroke();
      }
      return;
    }
    console.log("Stake: " + this.stake)
    console.log("Money Before: " + this.money)

    this.spins++;
    localStorage.setItem('spinCounter', this.spins.toString());
    const slotssound = new Audio();
    const clicksound = new Audio();

    slotssound.src = 'assets/slotssound.mp3';
    clicksound.src = 'assets/clicksound.mp3';

    clicksound.play();
    if (this.isSpinning === false) {
      this.isSpinning = true;
      slotssound.play();
      this.money = this.money - this.stake;
      console.log("Money After: " + this.money);
      document.querySelector('.start button')?.classList.add('disabled');

      document
        .querySelector('.overlay-line-vertical1')
        ?.classList.remove('reveal');
      document
        .querySelector('.overlay-line-vertical2')
        ?.classList.remove('reveal');
      document
        .querySelector('.overlay-line-vertical3')
        ?.classList.remove('reveal');
      document.querySelector('.overlay-line-top')?.classList.remove('reveal');
      document
        .querySelector('.overlay-line-middle')
        ?.classList.remove('reveal');
      document.querySelector('.overlay-line-down')?.classList.remove('reveal');
      document
        .querySelector('.overlay-line-diagonal1')
        ?.classList.remove('reveal');
      document
        .querySelector('.overlay-line-diagonal2')
        ?.classList.remove('reveal');

      const symbols1 = document.getElementById('symbols1');
      const symbols2 = document.getElementById('symbols2');
      const symbols3 = document.getElementById('symbols3');

      if (symbols1) {
        symbols1.style.transition =
          'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
        {
          const reel1 = document.getElementById('reel1');
          if (reel1) {
            const t1 = this.computeTravel(reel1, symbols1, 0.9);
            symbols1.style.transform = `translateY(-${t1}px)`;
          }
        }
      }
      if (symbols2) {
        symbols2.style.transition =
          'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
        {
          const reel2El = document.getElementById('reel2');
          if (reel2El) {
            const t2 = this.computeTravel(reel2El, symbols2, 0.75);
            symbols2.style.transform = `translateY(-${t2}px)`;
          }
        }
      }
      if (symbols3) {
        symbols3.style.transition =
          'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
        {
          const reel3El = document.getElementById('reel3');
          if (reel3El) {
            const t3 = this.computeTravel(reel3El, symbols3, 0.6);
            symbols3.style.transform = `translateY(-${t3}px)`;
          }
        }
      }

      setTimeout(() => {
        this.checkResults();
      }, 5000);

      setTimeout(() => {
        this.setupNextSpin();
        this.randomizeSymbols();

        if (symbols1) {
          symbols1.style.transition = 'none';
          symbols1.style.transform = 'translateY(0)';
        }
        if (symbols2) {
          symbols2.style.transition = 'none';
          symbols2.style.transform = 'translateY(0)';
        }
        if (symbols3) {
          symbols3.style.transition = 'none';
          symbols3.style.transform = 'translateY(0)';
        }
        this.isSpinning = false;
        document.querySelector('.start button')?.classList.remove('disabled');
        this.firstTimePoints == true;
        // If balance is depleted after resolving wins, trigger broke overlay
        if (this.money <= 0) {
          this.triggerBroke();
        }
      }, 6000);
    }
  }

  checkResults() {
    let jackpot = 0;
    const highlight = (cells: Array<{ reel: 'reel1' | 'reel2' | 'reel3'; idx: number }>) => {
      for (const c of cells) {
        const reel = document.getElementById(c.reel);
        if (!reel) continue;
        const imgs = Array.from(reel.querySelectorAll<HTMLImageElement>('img.symbol-img'));
        const el = imgs[c.idx];
        if (el) el.classList.add('win-cell');
      }
      setTimeout(() => document.querySelectorAll('.win-cell').forEach((el) => el.classList.remove('win-cell')), 1500);
    };
    const wins: string[] = [];
    const rows = this.getVisibleRowIndices();
    const files = this.getRowFiles(rows);
    const r1Top = rows.r1.top, r1Mid = rows.r1.mid, r1Bot = rows.r1.bot;
    const r2Top = rows.r2.top, r2Mid = rows.r2.mid, r2Bot = rows.r2.bot;
    const r3Top = rows.r3.top, r3Mid = rows.r3.mid, r3Bot = rows.r3.bot;

    // Vertikal
    if (files.r1.top === files.r1.mid && files.r1.top === files.r1.bot) {
      highlight([{ reel: 'reel1', idx: rows.r1.top }, { reel: 'reel1', idx: rows.r1.mid }, { reel: 'reel1', idx: rows.r1.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r1.top);
    }
    if (files.r2.top === files.r2.mid && files.r2.top === files.r2.bot) {
      highlight([{ reel: 'reel2', idx: rows.r2.top }, { reel: 'reel2', idx: rows.r2.mid }, { reel: 'reel2', idx: rows.r2.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r2.top);
    }
    if (files.r3.top === files.r3.mid && files.r3.top === files.r3.bot) {
      highlight([{ reel: 'reel3', idx: rows.r3.top }, { reel: 'reel3', idx: rows.r3.mid }, { reel: 'reel3', idx: rows.r3.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r3.top);
    }

    // Horizontal
    if (files.r1.top === files.r2.top && files.r1.top === files.r3.top) {
      highlight([{ reel: 'reel1', idx: rows.r1.top }, { reel: 'reel2', idx: rows.r2.top }, { reel: 'reel3', idx: rows.r3.top }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r1.top);
    }
    if (files.r1.mid === files.r2.mid && files.r1.mid === files.r3.mid) {
      highlight([{ reel: 'reel1', idx: rows.r1.mid }, { reel: 'reel2', idx: rows.r2.mid }, { reel: 'reel3', idx: rows.r3.mid }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r1.mid);
    }
    if (files.r1.bot === files.r2.bot && files.r1.bot === files.r3.bot) {
      highlight([{ reel: 'reel1', idx: rows.r1.bot }, { reel: 'reel2', idx: rows.r2.bot }, { reel: 'reel3', idx: rows.r3.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r1.bot);
    }

    // Diagonal
    if (
      files.r1.top === files.r2.mid && files.r1.top === files.r3.bot
    ) {
      highlight([{ reel: 'reel1', idx: rows.r1.top }, { reel: 'reel2', idx: rows.r2.mid }, { reel: 'reel3', idx: rows.r3.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r1.top);
    }
    if (
      files.r3.top === files.r2.mid && files.r3.top === files.r1.bot
    ) {
      highlight([{ reel: 'reel3', idx: rows.r3.top }, { reel: 'reel2', idx: rows.r2.mid }, { reel: 'reel1', idx: rows.r1.bot }]);
      jackpot++;
      wins.push('assets/symbols/' + files.r3.top);
    }

    if (jackpot === 8) {
      console.log('JACKPOT!!!');
      this.triggerJackpot();
    }

    this.calculatePoints(wins);

    document.querySelector('.points')?.classList.add('reveal');
    if (this.newPoints != 0) {
      document.querySelector('.new-points')?.classList.add('reveal');
    }

    setTimeout(
      () => document.querySelector('.new-points')?.classList.remove('reveal'),
      800
    );
    setTimeout(
      () => document.querySelector('.points')?.classList.remove('reveal'),
      1500
    );
  }

  jackpotActive = false;
  private jackpotTimer?: any;
  brokeActive = false;
  private brokeTimer?: any;

  private triggerJackpot(durationMs = 2500) {
    this.jackpotActive = true;
    clearTimeout(this.jackpotTimer);
    this.jackpotTimer = setTimeout(
      () => (this.jackpotActive = false),
      durationMs
    );
  }

  private triggerBroke(durationMs = 3000) {
    try {
      const loseSound = new Audio();
      loseSound.src = 'assets/loose.mp3';
      this.outofmoney.src = 'assets/outofmoney.mp3';
      this.outofmoney.play().catch(() => { });
      loseSound.play().catch(() => { });
    } catch { }
    this.brokeActive = true;
    clearTimeout(this.brokeTimer);
    this.brokeTimer = setTimeout(() => {
      this.brokeActive = false;
      // After the broke animation completes, show session summary popup
      this.openSummaryModal();
    }, durationMs);
  }

  setupNextSpin() {
    this.newPoints = 0;
    const rows = this.getVisibleRowIndices();
    this.fixedFirstThree1[0] = this.symbolsOnReels[rows.r1.top];
    this.fixedFirstThree1[1] = this.symbolsOnReels[rows.r1.mid];
    this.fixedFirstThree1[2] = this.symbolsOnReels[rows.r1.bot];

    this.fixedFirstThree2[0] = this.symbolsOnReels2[rows.r2.top];
    this.fixedFirstThree2[1] = this.symbolsOnReels2[rows.r2.mid];
    this.fixedFirstThree2[2] = this.symbolsOnReels2[rows.r2.bot];

    this.fixedFirstThree3[0] = this.symbolsOnReels3[rows.r3.top];
    this.fixedFirstThree3[1] = this.symbolsOnReels3[rows.r3.mid];
    this.fixedFirstThree3[2] = this.symbolsOnReels3[rows.r3.bot];

    console.log('Neue Startsymbole fÃ¼r nÃ¤chsten Spin:');
    console.log('Reel1:', this.fixedFirstThree1);
    console.log('Reel2:', this.fixedFirstThree2);
    console.log('Reel3:', this.fixedFirstThree3);

    this.stakeMax = this.money;
  }

  // Determine the visible indices for top/middle/bottom rows of each reel
  private getVisibleRowIndices() {
    const computeForReel = (reelId: string) => {
      const reel = document.getElementById(reelId);
      if (!reel) {
        return { top: 0, mid: 1, bot: 2 };
      }
      const rect = reel.getBoundingClientRect();
      const targetY = rect.top + rect.height / 2;
      const imgs = Array.from(
        reel.querySelectorAll<HTMLImageElement>('img.symbol-img')
      );
      if (imgs.length === 0) {
        return { top: 0, mid: 1, bot: 2 };
      }

      let midIndex = 0;
      let best = Number.POSITIVE_INFINITY;
      for (let i = 0; i < imgs.length; i++) {
        const r = imgs[i].getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const d = Math.abs(cy - targetY);
        if (d < best) {
          best = d;
          midIndex = i;
        }
      }
      const topIndex = Math.max(0, midIndex - 1);
      const botIndex = Math.min(imgs.length - 1, midIndex + 1);
      return { top: topIndex, mid: midIndex, bot: botIndex };
    };

    return {
      r1: computeForReel('reel1'),
      r2: computeForReel('reel2'),
      r3: computeForReel('reel3'),
    };
  }

  private getSymbolFromPath(path: string) {
    const file = path.split('/').pop() || '';
    return this.symbols.find((s) => s.img === file);
  }

  /**
   * Calculate the payout for a spin and treat it as MONEY.
   *
   * How it works in simple steps:
   *  1) For each winning line we start from a base amount (basePayoutPerLine).
   *  2) We scale that amount by the symbol's rarity: rarer = pays more.
   *     Rarity is derived from weights: lower weight -> higher multiplier.
   *  3) If multiple lines win, apply a combo bonus (+20% per extra line).
   *  4) Apply your chosen stake as a final multiplier.
   *  5) Update the UI counters (newPoints/shownPoints) which now represent money.
   */
  calculatePoints(wins: string[]) {
    // Sounds
    const winSound = new Audio();
    const jackpotSound = new Audio();
    winSound.src = 'assets/win.mp3';
    jackpotSound.src = 'assets/jackpot.mp3';

    // No wins → no payout
    if (!wins || wins.length === 0) {
      return;
    }

    // 1) Base values
    const totalSymbolWeight = this.symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    const averageSymbolWeight = totalSymbolWeight / this.symbols.length;
    const basePayoutPerWinningLine = 10; // baseline money for an average symbol

    // 2) Compute payout for each winning line using rarity
    const perWinningLinePayouts: number[] = [];
    for (const symbolPath of wins) {
      const symbol = this.getSymbolFromPath(symbolPath);
      const symbolWeight = symbol?.weight ?? averageSymbolWeight; // fallback if unknown
      const rarityMultiplier = averageSymbolWeight / symbolWeight; // lower weight → higher payout
      const linePayout = Math.round(basePayoutPerWinningLine * rarityMultiplier);
      perWinningLinePayouts.push(linePayout);
    }

    // 3) Sum payouts and apply combo bonus (+20% per additional line)
    let sumOfLinePayouts = 0;
    for (const amount of perWinningLinePayouts) {
      sumOfLinePayouts += amount;
    }
    const comboBonusMultiplier = 1 + 0.2 * Math.max(0, wins.length - 1);
    let totalPayout = Math.round(sumOfLinePayouts * comboBonusMultiplier);

    // 4) Jackpot bonus when all 8 lines win
    const hitJackpot = wins.length === 8;
    if (hitJackpot) {
      totalPayout *= 50;
      jackpotSound.play();
    }

    // 5) Apply stake (final multiplier)
    const stakeMultiplier = Math.max(this.stakeMin, this.stake);
    totalPayout *= Math.floor(stakeMultiplier / 3.5) + 1;

    // 6) Update UI counters and balance
    this.newPoints = totalPayout; // used for the on-screen +money animation
    this.profit += this.newPoints - this.stake;

    setTimeout(() => {
      this.shownPoints += totalPayout; // visual overlay total
      this.money += totalPayout;       // real balance shown in MoneyCounter
    }, 600);

    winSound.play();
  }

  // Compute travel distance based on actual DOM sizes to avoid overshooting on small screens
  private computeTravel(reelEl: HTMLElement, symbolsEl: HTMLElement, factor: number) {
    const reelRect = reelEl.getBoundingClientRect();
    const imgs = symbolsEl.querySelectorAll("img.symbol-img");
    const imgH = imgs.length ? imgs[0].getBoundingClientRect().height : 100;
    const total = imgH * imgs.length;
    const maxTravel = Math.max(0, total - reelRect.height);
    // Snap travel to whole symbol heights to avoid partial rows
    const raw = Math.max(0, Math.min(maxTravel, maxTravel * factor));
    const steps = Math.max(1, Math.floor(raw / imgH));
    return steps * imgH;
  }

  private getLineThicknessPx() {
    const mach = document.querySelector('.slot-machine') as HTMLElement | null;
    const w = mach ? mach.getBoundingClientRect().width : 600;
    return Math.max(4, Math.min(25, Math.round(w * 0.025)));
  }

  private getRects() {
    const machine = document.querySelector('.slot-machine') as HTMLElement | null;
    const slots = document.querySelector('.slots') as HTMLElement | null;
    if (!machine || !slots) return null as any;
    return { machineRect: machine.getBoundingClientRect(), slotsRect: slots.getBoundingClientRect() };
  }

  private centerXOf(reelId: string) {
    const reel = document.getElementById(reelId);
    if (!reel) return 0;
    const r = reel.getBoundingClientRect();
    return r.left + r.width / 2;
  }

  private rowCenterY(row: 'top' | 'mid' | 'bot') {
    const rows = this.getVisibleRowIndices();
    const reel = document.getElementById('reel2'); // use middle reel for Y
    if (!reel) return 0;
    const imgs = Array.from(reel.querySelectorAll<HTMLImageElement>('img.symbol-img'));
    const idx = row === 'top' ? rows.r2.top : row === 'mid' ? rows.r2.mid : rows.r2.bot;
    const el = imgs[idx] || imgs[0];
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  }

  private positionHorizontal(selector: string, row: 'top' | 'mid' | 'bot') {
    const rects = this.getRects();
    if (!rects) return;
    const { machineRect, slotsRect } = rects;
    const y = this.rowCenterY(row);
    const thick = this.getLineThicknessPx();
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    el.style.left = `${Math.round(slotsRect.left - machineRect.left)}px`;
    el.style.width = `${Math.round(slotsRect.width)}px`;
    el.style.top = `${Math.round(y - machineRect.top - thick / 2)}px`;
    el.style.height = `${thick}px`;
  }

  private positionVertical(selector: string, reelId: 'reel1' | 'reel2' | 'reel3') {
    const rects = this.getRects();
    if (!rects) return;
    const { machineRect, slotsRect } = rects;
    const x = this.centerXOf(reelId);
    const thick = this.getLineThicknessPx();
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    el.style.top = `${Math.round(slotsRect.top - machineRect.top)}px`;
    el.style.height = `${Math.round(slotsRect.height)}px`;
    el.style.left = `${Math.round(x - machineRect.left - thick / 2)}px`;
    el.style.width = `${thick}px`;
  }


  private positionDiagonal(selector: string, startReel: 'reel1' | 'reel2' | 'reel3', startRow: 'top' | 'mid' | 'bot', endReel: 'reel1' | 'reel2' | 'reel3', endRow: 'top' | 'mid' | 'bot') {
    const rects = this.getRects();
    if (!rects) return;
    const { machineRect } = rects;
    const x1 = this.centerXOf(startReel) - machineRect.left;
    const y1 = this.rowCenterY(startRow) - machineRect.top;
    const x2 = this.centerXOf(endReel) - machineRect.left;
    const y2 = this.rowCenterY(endRow) - machineRect.top;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const thick = this.getLineThicknessPx();
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    el.style.left = `${Math.round(x1 - thick / 2)}px`;
    el.style.top = `${Math.round(y1)}px`;
    el.style.width = `${thick}px`;
    el.style.height = `${Math.round(len)}px`;
    el.style.transformOrigin = 'top center';
    el.style.transform = `rotate(${angle}deg)`;
  }

  @HostListener('window:resize')
  onResize() {
    this.repositionOverlays();
  }

  private repositionOverlays() {
    // Always compute positions so lines stay correct across resizes
    this.positionHorizontal('.overlay-line-top', 'top');
    this.positionHorizontal('.overlay-line-middle', 'mid');
    this.positionHorizontal('.overlay-line-down', 'bot');
    this.positionVertical('.overlay-line-vertical1', 'reel1');
    this.positionVertical('.overlay-line-vertical2', 'reel2');
    this.positionVertical('.overlay-line-vertical3', 'reel3');
    this.positionDiagonal('.overlay-line-diagonal1', 'reel1', 'top', 'reel3', 'bot');
    this.positionDiagonal('.overlay-line-diagonal2', 'reel3', 'top', 'reel1', 'bot');
  }

  private getFileNameFromImg(img: HTMLImageElement | null): string {
    if (!img) return '';
    const src = img.getAttribute('src') || (img as any).src || '';
    const file = src.split('/').pop() || '';
    return file.split('?')[0];
  }

  private getRowFiles(rows: { r1: { top: number, mid: number, bot: number }, r2: { top: number, mid: number, bot: number }, r3: { top: number, mid: number, bot: number } }) {
    const el = (id: string) => document.getElementById(id);
    const imgsFor = (id: string) => {
      const nodeList = el(id)?.querySelectorAll<HTMLImageElement>('img.symbol-img');
      return nodeList ? Array.from(nodeList) as HTMLImageElement[] : [] as HTMLImageElement[];
    };
    const r1 = imgsFor('reel1');
    const r2 = imgsFor('reel2');
    const r3 = imgsFor('reel3');
    return {
      r1: {
        top: this.getFileNameFromImg(r1[rows.r1.top] || null),
        mid: this.getFileNameFromImg(r1[rows.r1.mid] || null),
        bot: this.getFileNameFromImg(r1[rows.r1.bot] || null),
      },
      r2: {
        top: this.getFileNameFromImg(r2[rows.r2.top] || null),
        mid: this.getFileNameFromImg(r2[rows.r2.mid] || null),
        bot: this.getFileNameFromImg(r2[rows.r2.bot] || null),
      },
      r3: {
        top: this.getFileNameFromImg(r3[rows.r3.top] || null),
        mid: this.getFileNameFromImg(r3[rows.r3.mid] || null),
        bot: this.getFileNameFromImg(r3[rows.r3.bot] || null),
      },
    };
  }

  // Popup helpers
  private computeSummary() {
    this.summarySpins = this.spins;
    // Overall loss = starting bankroll - current money (clamped at 0)
    this.summaryLoss = this.profit + this.startingMoney;
  }

  openSummaryModal() {
    this.computeSummary();
    this.thehousealwayswins.src = 'assets/thehousealwayswins.mp3';
    this.thehousealwayswins.loop = true;
    this.thehousealwayswins.play();
    this.showSummaryModal = true;
  }

  closeSummaryModal() {
    this.showSummaryModal = false;
  }

  resetAndPlayAgain() {
    // Reset to starting bankroll and allow playing again
    this.playagain.src = 'assets/playagain.mp3';
    this.newMoney.src = 'assets/newmoney.mp3';
    this.playagain.play();
    this.newMoney.play();
    // Stop looping summary sound
    try {
      this.thehousealwayswins.loop = false;
      this.thehousealwayswins.pause();
      this.thehousealwayswins.currentTime = 0;
    } catch {}
    this.money = this.startingMoney;
    this.spins = 0;
    this.showSummaryModal = false;
    // Also allow stake to be at least 1 again
    this.stakeMin = 1;
    this.stakeMax = this.money
    this.shownPoints = 0;
    this.profit = 0;
    this.newPoints = 0;
  }
}








