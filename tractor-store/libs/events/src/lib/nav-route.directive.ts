import { computed, Directive, input } from '@angular/core';
import { emitRoute } from './nav-bus';
import { appendQueryString } from './query';
import { NavPayload } from './nav-types';

/**
 * Drop-in replacement for routerLink when the URL is dynamic / data-driven
 * (already resolved to a path string). Click is dispatched through the shared
 * nav-bus so the host's router performs the navigation, keeping all sibling
 * MFE routers in sync. Unlike navLink, it does not depend on a registered
 * intent — the caller already knows the path.
 */
@Directive({
  selector: 'a[navRoute], button[navRoute]',
  host: {
    '(click)': 'onClick($event)',
    '[attr.href]': 'href()',
  },
})
export class NavRouteDirective {
  readonly navRoute = input<string>('');
  readonly navRouteParams = input<NavPayload>({});

  protected readonly href = computed(() => this.buildUrl());

  private buildUrl(): string {
    const path = this.navRoute() || window.location.pathname;
    return appendQueryString(path, this.navRouteParams());
  }

  onClick(event: Event): void {
    event.preventDefault();
    emitRoute({ url: this.buildUrl() });
  }
}
