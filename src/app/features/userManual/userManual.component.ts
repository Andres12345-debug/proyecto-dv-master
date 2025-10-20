import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

type ManualSection = {
  id: string;
  title: string;
  content: string | string[]; // párrafo(s)
  bullets?: string[];
  open?: boolean;
};

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="manual-container container py-5" id="top">
      <header class="mb-4 text-center">
        <h1 class="fw-bold text-primary mb-2">Manual del Usuario — VOCARE</h1>
        <p class="lead text-muted mb-0">
          Guía paso a paso para registrarte, realizar el test vocacional y explorar universidades y carreras.
        </p>
      </header>

      <!-- Barra de búsqueda -->
      <div class="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
        <div class="row g-2 mb-2">
          <label class="col-sm-8 col-md-6">Buscar en el manual</label>
          <input
            class="form-control form-control-sm"
            type="text"
            [(ngModel)]="query"
            (ngModelChange)="onSearch()"
            placeholder="Escribe palabras clave..."
          />
        </div>
      </div>

      <div class="mt-4 row g-4">
        <!-- Índice -->
        <aside class="col-lg-4">
          <div class="card shadow-sm border-0 sticky-top toc" style="top: 24px;">
            <div class="card-body">
              <h5 class="fw-semibold mb-3">Contenido</h5>
              <ol class="mb-0 ps-3">
                <li *ngFor="let s of filteredSections()">
                  <a class="manual-link" [routerLink]="[]" [fragment]="s.id">{{ s.title }}</a>
                </li>
              </ol>
            </div>
          </div>
        </aside>

        <!-- Acordeón -->
        <section class="col-lg-8">
          <div *ngFor="let s of filteredSections()" class="card manual-section shadow-sm border-0 mb-3" [attr.id]="s.id">
            <button class="section-header d-flex w-100 align-items-center justify-content-between px-4 py-3"
                    (click)="toggle(s)">
              <div class="text-start me-3">
                <h2 class="h5 fw-bold mb-0" [innerHTML]="highlight(s.title)"></h2>
                <small class="text-muted">Sección {{ indexOf(s) }}</small>
              </div>
              <span class="chev" [class.rotate]="s.open">⌄</span>
            </button>

            <div class="collapse-wrapper" [style.maxHeight.px]="s.open ? 1200 : 0">
              <div class="content px-4 pb-4">
                <!-- ✅ SIN UNIONES: forzamos tipos con helpers -->
                <ng-container *ngIf="isArrayContent(s); else paragraphBlock">
                  <p *ngFor="let p of asArray(s.content)" class="mb-3" [innerHTML]="highlight(p)"></p>
                </ng-container>

                <ng-template #paragraphBlock>
                  <p class="mb-3" [innerHTML]="highlight(asString(s.content))"></p>
                </ng-template>

                <ul *ngIf="s.bullets?.length" class="mb-0">
                  <li *ngFor="let b of s.bullets" [innerHTML]="highlight(b)"></li>
                </ul>

                <div class="text-end mt-3">
                  <a class="small manual-link" href="#top">Volver arriba</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío de búsqueda -->
          <div *ngIf="filteredSections().length === 0" class="text-center text-muted py-5">
            <h5>No se encontraron resultados</h5>
            <p>Intenta con otras palabras clave o limpia la búsqueda.</p>
            <button class="btn btn-outline-secondary" (click)="clearSearch()">Limpiar búsqueda</button>
          </div>
        </section>
      </div>

      <footer class="text-center text-muted small mt-4">
        © {{ year }} — VOCARE. Manual del Usuario.
      </footer>
    </div>
  `,
  styles: [`
    .manual-link { color: #0d6efd; text-decoration: none; }
    .manual-link:hover { text-decoration: underline; }

    .search-card .form-control-lg {
      border-radius: 12px;
      padding: .9rem 1rem;
    }

    .toc { border-radius: 16px; }
    .manual-section { border-radius: 16px; background: #fff; overflow: hidden; }
    .section-header {
      background: #f8f9fb;
      border: none;
      text-align: left;
      cursor: pointer;
      gap: 12px;
    }
    .section-header:focus { outline: 2px solid rgba(13,110,253, .25); }
    .chev {
      display: inline-block;
      transition: transform .25s ease;
      font-size: 20px;
      line-height: 1;
      transform: rotate(0deg);
    }
    .chev.rotate { transform: rotate(180deg); }

    .collapse-wrapper {
      transition: max-height .35s ease;
      will-change: max-height;
      overflow: hidden;
      background: #fff;
    }
    .content { line-height: 1.7; color: #495057; }

    mark.search-hit {
      background: #fff3cd;
      padding: 0 .2em;
      border-radius: 4px;
    }

    @media (max-width: 991.98px) {
      .search-card .card-body { padding: 1rem; }
      .toc { position: static; }
    }
  `]
})
export class UserManualComponent {
  year = new Date().getFullYear();

  private _query = signal<string>('');
  get query(): string { return this._query(); }
  set query(v: string) { this._query.set(v ?? ''); }

  constructor(private sanitizer: DomSanitizer) { }

  sections: ManualSection[] = [
    {
      id: 'registro',
      title: 'Registro',
      content: [
        'Para acceder a todas las funcionalidades de VOCARE y recibir recomendaciones personalizadas, es necesario crear una cuenta.',
        'Si eres usuario nuevo, haz clic en “Regístrate aquí” y completa la información solicitada en el formulario: datos personales, intereses y nivel educativo.'
      ],
      bullets: [
        'Verifica que tu correo esté correcto para recuperar el acceso más adelante.',
        'Usa una contraseña segura y guárdala en un lugar confiable.'
      ],
      open: true
    },
    {
      id: 'inicio-sesion',
      title: 'Inicio de sesión',
      content:
        'Si ya tienes una cuenta, ingresa con tu correo electrónico y contraseña en “Iniciar Sesión”. De esta forma tus resultados y avances se guardan de forma segura para que puedas continuar tu exploración en cualquier momento.'
    },
    {
      id: 'test-vocacional',
      title: 'Test Vocacional',
      content: [
        'El Test Vocacional te ayuda a identificar qué carreras se ajustan mejor a tus gustos, intereses y habilidades.',
        'Responde una serie de preguntas y, al finalizar, recibirás recomendaciones personalizadas de carreras que pueden ser una buena opción para ti.'
      ]
    },
    {
      id: 'universidades',
      title: 'Sección Universidades',
      content: [
        'Encuentra información sobre diferentes universidades y sus programas académicos.',
        'Podrás consultar requisitos, ofertas educativas y datos de interés que te ayudarán a elegir dónde continuar tus estudios.'
      ]
    },
    {
      id: 'carreras',
      title: 'Sección Carreras',
      content: [
        'Explora distintas carreras disponibles y conoce sus características principales.',
        'Revisa la descripción de cada carrera para identificar la que mejor se adapte a tus intereses.'
      ]
    },
    {
      id: 'perfil',
      title: 'Perfil',
      content: [
        'En la sección de Perfil puedes ver y actualizar tu información personal (nombre, edad, nivel educativo e intereses).',
        'También encontrarás tus estadísticas: porcentaje de perfil completado, tests realizados y fecha de registro.',
        'Desde aquí puedes acceder rápidamente a realizar un nuevo test, explorar universidades o descargar tu perfil.',
        'En la parte inferior se muestra tu historial de tests con los resultados y recomendaciones obtenidas.'
      ]
    },
    {
      id: 'resultados',
      title: 'Resultado de Test',
      content: [
        'Al finalizar el Test Vocacional, se muestran tus aptitudes principales según tus respuestas.',
        'Con base en ellas, recibirás una lista de carreras recomendadas que se ajustan a tu perfil y un apartado de universidades sugeridas donde puedes estudiar esas carreras.'
      ]
    }
  ];

  filteredSections = computed(() => {
    const q = this.normalize(this._query());
    if (!q) return this.sections;

    return this.sections
      .map(s => ({ s, score: this.sectionMatchScore(s, q) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.s);
  });

  onSearch(): void {
    const ids = new Set(this.filteredSections().map(s => s.id));
    this.sections.forEach(s => s.open = ids.has(s.id));
  }

  clearSearch(): void {
    this.query = '';
    this.sections.forEach(s => s.open = false);
    if (this.sections.length) this.sections[0].open = true;
  }

  toggle(s: ManualSection): void { s.open = !s.open; }
  indexOf(s: ManualSection): number { return this.sections.findIndex(x => x.id === s.id) + 1; }

  // ---------- Helpers de tipos para el template ----------
  isArrayContent(s: ManualSection): boolean {
    return Array.isArray(s.content);
  }
  asArray(val: string | string[]): string[] {
    return Array.isArray(val) ? val : [val];
  }
  asString(val: string | string[]): string {
    return Array.isArray(val) ? val.join('\n\n') : val;
  }

  // ---------- Búsqueda y resaltado ----------
  private normalize(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private sectionMatchScore(s: ManualSection, q: string): number {
    const haystack: string[] = [s.title];
    if (Array.isArray(s.content)) {
      haystack.push(...s.content);
    } else {
      haystack.push(s.content);
    }
    if (s.bullets?.length) haystack.push(...s.bullets);

    const norm = haystack.map(t => this.normalize(t));
    const tokens = q.split(/\s+/).filter(Boolean);
    let score = 0;
    for (const t of tokens) {
      for (const n of norm) {
        if (n.includes(t)) score += 1;
      }
    }
    return score;
  }

  highlight(text: string): SafeHtml {
    const q = this.normalize(this._query());
    if (!q) return text;

    const tokens = q.split(/\s+/).filter(Boolean).map(t => this.escapeRegExp(t));
    if (tokens.length === 0) return text;

    const re = new RegExp(`(${tokens.join('|')})`, 'gi');
    const replaced = (text || '').replace(re, match => `<mark class="search-hit">${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
