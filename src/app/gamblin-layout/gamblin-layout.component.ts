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
import { SYMBOLS } from './symbols';
import { withModule } from '@angular/core/testing';

@Component({
  selector: 'app-gamblin-layout',
  imports: [CommonModule],
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

  symbolsOnReels: string[] = [];
  symbolsOnReels2: string[] = [];
  symbolsOnReels3: string[] = [];

  fixedFirstThree1: string[] = [];
  fixedFirstThree2: string[] = [];
  fixedFirstThree3: string[] = [];

  ngOnInit(): void {
    console.log('Init');
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
      }, 6000);
    }
  }

  checkResults() {
    let jackpot = 0;
    const highlight = (cells: Array<{ reel: 'reel1'|'reel2'|'reel3'; idx: number }>) => {
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

  private triggerJackpot(durationMs = 2500) {
    this.jackpotActive = true;
    clearTimeout(this.jackpotTimer);
    this.jackpotTimer = setTimeout(
      () => (this.jackpotActive = false),
      durationMs
    );
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

    console.log('Neue Startsymbole für nächsten Spin:');
    console.log('Reel1:', this.fixedFirstThree1);
    console.log('Reel2:', this.fixedFirstThree2);
    console.log('Reel3:', this.fixedFirstThree3);
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

  calculatePoints(wins: string[]) {
    const winsound = new Audio();
    const jackpotsound = new Audio();
    winsound.src = 'assets/win.mp3';
    jackpotsound.src = 'assets/jackpot.mp3';

    if (!wins || wins.length === 0) return;

    const totalWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    const avgWeight = totalWeight / this.symbols.length;
    const basePerLine = 100;

    // Punkte pro Linie: seltener = mehr Punkte
    const perLinePoints = wins.map((path) => {
      const sym = this.getSymbolFromPath(path);
      const w = sym?.weight ?? avgWeight; // Fallback just in case
      const rarityMultiplier = avgWeight / w; // weight klein -> multiplier groß
      return Math.round(basePerLine * rarityMultiplier);
    });

    // Summe + kleiner Kombi-Bonus (20% je zusätzliche Linie)
    let points = perLinePoints.reduce((a, b) => a + b, 0);
    const comboBonus = 1 + 0.2 * (wins.length - 1);
    points = Math.round(points * comboBonus);

    // Optional: Jackpot Multiplikator
    if (wins.length === 8) {
      points *= 50;
      jackpotsound.play();
    }

    this.newPoints = points;

    setTimeout(() => {
      this.shownPoints += points;
    }, 600);

    winsound.play();
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

  private rowCenterY(row: 'top'|'mid'|'bot') {
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

  private positionHorizontal(selector: string, row: 'top'|'mid'|'bot') {
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

  private positionVertical(selector: string, reelId: 'reel1'|'reel2'|'reel3') {
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


  private positionDiagonal(selector: string, startReel: 'reel1'|'reel2'|'reel3', startRow: 'top'|'mid'|'bot', endReel: 'reel1'|'reel2'|'reel3', endRow: 'top'|'mid'|'bot') {
    const rects = this.getRects();
    if (!rects) return;
    const { machineRect } = rects;
    const x1 = this.centerXOf(startReel) - machineRect.left;
    const y1 = this.rowCenterY(startRow) - machineRect.top;
    const x2 = this.centerXOf(endReel) - machineRect.left;
    const y2 = this.rowCenterY(endRow) - machineRect.top;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
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
    this.positionHorizontal('.overlay-line-top','top');
    this.positionHorizontal('.overlay-line-middle','mid');
    this.positionHorizontal('.overlay-line-down','bot');
    this.positionVertical('.overlay-line-vertical1','reel1');
    this.positionVertical('.overlay-line-vertical2','reel2');
    this.positionVertical('.overlay-line-vertical3','reel3');
    this.positionDiagonal('.overlay-line-diagonal1','reel1','top','reel3','bot');
    this.positionDiagonal('.overlay-line-diagonal2','reel3','top','reel1','bot');
  }

  private getFileNameFromImg(img: HTMLImageElement | null): string {
    if (!img) return '';
    const src = img.getAttribute('src') || (img as any).src || '';
    const file = src.split('/').pop() || '';
    return file.split('?' )[0];
  }

  private getRowFiles(rows: { r1: {top:number,mid:number,bot:number}, r2: {top:number,mid:number,bot:number}, r3: {top:number,mid:number,bot:number} }) {
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
}








