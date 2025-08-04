import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header *ngIf="showHeader"></app-header>

      <main class="main-content" [class.with-header]="showHeader">
        <router-outlet></router-outlet>
      </main>

      <app-footer *ngIf="showFooter"></app-footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
      }

      .main-content.with-header {
        margin-top: 70px;
      }

      @media (max-width: 768px) {
        .main-content.with-header {
          margin-top: 60px;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  showHeader = true;
  showFooter = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ) // 👈 aquí está el cambio
      )
      .subscribe((event) => {
        const authRoutes = ['/auth/login', '/auth/register'];
        this.showHeader = !authRoutes.includes(event.url);
        this.showFooter = !authRoutes.includes(event.url);
      });
  }
}
