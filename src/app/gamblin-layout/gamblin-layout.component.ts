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
        symbols1.style.transform = 'translateY(-10000px)';
      }
      if (symbols2) {
        symbols2.style.transition =
          'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
        symbols2.style.transform = 'translateY(-8000px)';
      }
      if (symbols3) {
        symbols3.style.transition =
          'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
        symbols3.style.transform = 'translateY(-6000px)';
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
    const wins: string[] = [];

    // Vertikal
    if (
      this.symbolsOnReels[40] === this.symbolsOnReels[41] &&
      this.symbolsOnReels[40] === this.symbolsOnReels[42]
    ) {
      document
        .querySelector('.overlay-line-vertical1')
        ?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels[40]);
    }
    if (
      this.symbolsOnReels2[32] === this.symbolsOnReels2[33] &&
      this.symbolsOnReels2[32] === this.symbolsOnReels2[34]
    ) {
      document
        .querySelector('.overlay-line-vertical2')
        ?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels2[32]);
    }
    if (
      this.symbolsOnReels3[24] === this.symbolsOnReels3[25] &&
      this.symbolsOnReels3[24] === this.symbolsOnReels3[26]
    ) {
      document
        .querySelector('.overlay-line-vertical3')
        ?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels3[24]);
    }

    // Horizontal
    if (
      this.symbolsOnReels[40] === this.symbolsOnReels2[32] &&
      this.symbolsOnReels[40] === this.symbolsOnReels3[24]
    ) {
      document.querySelector('.overlay-line-top')?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels[40]);
    }
    if (
      this.symbolsOnReels[41] === this.symbolsOnReels2[33] &&
      this.symbolsOnReels[41] === this.symbolsOnReels3[25]
    ) {
      document.querySelector('.overlay-line-middle')?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels[41]);
    }
    if (
      this.symbolsOnReels[42] === this.symbolsOnReels2[34] &&
      this.symbolsOnReels[42] === this.symbolsOnReels3[26]
    ) {
      document.querySelector('.overlay-line-down')?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels[42]);
    }

    // Diagonal
    if (
      this.symbolsOnReels[40] === this.symbolsOnReels2[33] &&
      this.symbolsOnReels[40] === this.symbolsOnReels3[26]
    ) {
      document
        .querySelector('.overlay-line-diagonal1')
        ?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels[40]);
    }
    if (
      this.symbolsOnReels3[24] === this.symbolsOnReels2[33] &&
      this.symbolsOnReels3[24] === this.symbolsOnReels[42]
    ) {
      document
        .querySelector('.overlay-line-diagonal2')
        ?.classList.add('reveal');
      jackpot++;
      wins.push(this.symbolsOnReels3[24]);
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
    for (let index = 0; index < 3; index++) {
      this.fixedFirstThree1[index] = this.symbolsOnReels[40 + index];
    }

    for (let index = 0; index < 3; index++) {
      this.fixedFirstThree2[index] = this.symbolsOnReels2[32 + index];
    }

    for (let index = 0; index < 3; index++) {
      this.fixedFirstThree3[index] = this.symbolsOnReels3[24 + index];
    }

    console.log('Neue Startsymbole für nächsten Spin:');
    console.log('Reel1:', this.fixedFirstThree1);
    console.log('Reel2:', this.fixedFirstThree2);
    console.log('Reel3:', this.fixedFirstThree3);
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
}
