import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spins-counter',
  imports: [],
  templateUrl: './spins-counter.component.html',
  styleUrl: './spins-counter.component.css',
})
export class SpinsCounterComponent {
  @Input() count = 0;
}

