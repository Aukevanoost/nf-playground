import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      max-width: 42rem;
      margin-inline: auto;
    }
    h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem;
    }
    p {
      color: #475569;
      line-height: 1.6;
    }
    .home__cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .home__card {
      display: block;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .home__card:hover {
      border-color: #c4b5fd;
      box-shadow: 0 4px 16px rgb(109 40 217 / 0.08);
    }
    .home__card h2 {
      margin: 0 0 0.25rem;
      font-size: 1.1rem;
      color: #6d28d9;
    }
    .home__card span {
      color: #64748b;
      font-size: 0.9rem;
    }
  `,
  template: `
    <h1>Native Federation + SSR</h1>
    <p>
      This host is a thin shell. Each feature below is a separate, server-rendered Angular
      application loaded over Native Federation and hydrated in the browser.
    </p>
    <div class="home__cards">
      <a class="home__card" routerLink="/todos">
        <h2>Todos →</h2>
        <span><code>mfe1</code> · federated child routes (loadChildren)</span>
      </a>
      <a class="home__card" routerLink="/insights">
        <h2>Insights →</h2>
        <span><code>mfe2</code> · federated component (loadComponent)</span>
      </a>
    </div>
  `,
})
export class Home {}
