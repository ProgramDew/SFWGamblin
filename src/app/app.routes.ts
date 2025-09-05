import { Routes } from '@angular/router';
import { GamblinLayoutComponent } from './gamblin-layout/gamblin-layout.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { WhyPageComponent } from './why-page/why-page.component';
import { MoneyCounterComponent } from './money-counter/money-counter.component';

export const routes: Routes = [
  { path: '', component: GamblinLayoutComponent, pathMatch: 'full' },
  { path: 'slot-machine', redirectTo: '', pathMatch: 'full' },
  { path: 'about', component: AboutPageComponent },
  { path: 'why', component: WhyPageComponent },
  

];
