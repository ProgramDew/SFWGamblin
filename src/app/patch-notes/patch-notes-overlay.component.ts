import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatchNotesService } from './patch-notes.service';

@Component({
  selector: 'app-patch-notes-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="patch-overlay" [class.active]="(svc.isOpen$ | async) === true" (click)="svc.close()" aria-hidden="true">
    <div class="panel" (click)="$event.stopPropagation()" *ngIf="(svc.isOpen$ | async) === true">
      <header class="panel-header">
        <h2>What's New?</h2>
        <button class="close" type="button" (click)="svc.close()" aria-label="Close">✕</button>
      </header>
      <section class="content" *ngIf="(svc.notes$ | async) as notes; else loading">
        <div class="meta">
          <span class="version">Version {{ notes?.version || '-' }}</span>
          <span class="sep">•</span>
          <span class="date">Updated {{ notes?.updatedAt || '-' }}</span>
        </div>
        <ul class="entries">
          <li class="entry" *ngFor="let e of (notes?.entries || [])">
            <h3 class="title">{{ e.title }}</h3>
            <ul class="details" *ngIf="e.details?.length">
              <li *ngFor="let d of e.details">{{ d }}</li>
            </ul>
          </li>
        </ul>
      </section>
      <ng-template #loading>
        <div class="loading">Loading latest notes…</div>
      </ng-template>
    </div>
  </div>
  `,
  styles: [`
    .patch-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: none;
      z-index: 9999;
    }
    .patch-overlay.active { display: block; }
    .panel {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(92vw, 820px);
      max-height: 80vh;
      color: #e8e8e8;
      background-color: black;
      box-shadow: 0 10px 40px rgba(0,0,0,0.45);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #161a1d;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .panel-header h2 {
      margin: 0;
      font-size: 1.1rem;
    }
    .close {
      background: transparent;
      border: none;
      color: #aaa;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .close:hover { color: #fff; }
    .content {
      padding: 8px 16px 16px 16px;
      overflow: auto;
    }
    .meta { color: #a0a0a0; font-size: 0.9rem; margin: 6px 0 12px; display: flex; gap: 8px; align-items: center; }
    .entries { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .entry { background: #0f1113; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 12px; }
    .title { margin: 0 0 6px; font-size: 1rem; color: #f0f0f0; }
    .details { margin: 0; padding-left: 18px; color: #cfd3d8; }
    .loading { padding: 20px; text-align: center; color: #cfd3d8; }
  `]
})
export class PatchNotesOverlayComponent {
  constructor(public svc: PatchNotesService) {}
}

