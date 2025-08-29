import { Routes } from '@angular/router';
import { GamblinLayoutComponent } from './gamblin-layout/gamblin-layout.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { WhyPageComponent } from './why-page/why-page.component';

export const routes: Routes = [
  { path: 'slot-machine', component: GamblinLayoutComponent },
  { path: 'about', component: AboutPageComponent },
  { path: '', redirectTo: '/slot-machine', pathMatch: 'full' },
  { path: 'why', component: WhyPageComponent },
];
