import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, shareReplay, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface PatchNotesEntry {
  title: string;
  details?: string[];
}

export interface PatchNotesDoc {
  version: string;
  updatedAt: string;
  entries: PatchNotesEntry[];
}

@Injectable({ providedIn: 'root' })
export class PatchNotesService {
  private open$ = new BehaviorSubject<boolean>(false);
  private reload$ = new BehaviorSubject<void>(undefined);

  // Cache-busted URL to avoid stale assets after deploy
  private assetUrl = 'assets/patch-notes.json';

  readonly isOpen$: Observable<boolean> = this.open$.asObservable();

  readonly notes$: Observable<PatchNotesDoc | null> = this.reload$.pipe(
    switchMap(() => this.http.get<PatchNotesDoc>(this.assetUrl)),
    catchError(() => of(null)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private http: HttpClient) {}

  open() {
    this.open$.next(true);
    this.reload();
  }

  close() {
    this.open$.next(false);
  }

  toggle() {
    this.open$.next(!this.open$.value);
    if (this.open$.value) this.reload();
  }

  reload() {
    this.reload$.next();
  }
}
