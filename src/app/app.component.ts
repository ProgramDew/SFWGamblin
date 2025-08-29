import { HeaderComponent } from './header/header.component';
import { Component } from '@angular/core';
import { UserComponent } from './user/user.component';
import { GamblinLayoutComponent } from './gamblin-layout/gamblin-layout.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AboutPageComponent } from './about-page/about-page.component';


@Component({
  selector: 'app-root',
  imports: [HeaderComponent, GamblinLayoutComponent, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'angular';
  currentSpins = 0;
}
