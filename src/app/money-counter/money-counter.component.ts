import { Component, Input, OnChanges, SimpleChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-money-counter',
  imports: [CommonModule],
  templateUrl: './money-counter.component.html',
  styleUrl: './money-counter.component.css'
})
export class MoneyCounterComponent implements OnInit, OnChanges {
  @Input() money = 100;

  // Value shown with animation
  displayMoney = 100;

  private rafId: number | null = null;
  private browser = true;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.browser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Initialize the displayed value
    this.displayMoney = this.money ?? 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['money'] && !changes['money'].firstChange) {
      this.animateTo(this.money ?? 0);
    }
  }

  private animateTo(target: number) {
    if (!this.browser) {
      // On server (SSR), skip animation
      this.displayMoney = target;
      return;
    }

    // Cancel previous animation if any
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const start = this.displayMoney ?? 0;
    const diff = target - start;
    if (diff === 0) return;

    const abs = Math.abs(diff);
    // Duration scales with change size but stays in reasonable bounds
    const min = 250; // ms
    const max = 1200; // ms
    const duration = Math.min(max, Math.max(min, abs * 20));

    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = start + diff * eased;

      // We display integer money; adjust if decimals are needed
      this.displayMoney = diff > 0 ? Math.floor(current) : Math.ceil(current);

      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.displayMoney = target; // ensure exact final value
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
