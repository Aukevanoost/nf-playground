import { computed, Directive, input, OnDestroy, signal } from '@angular/core';
import { emitNavigate, onRegistryReady } from './nav-bus';
import { INavRegistry, NavPayload } from './nav-types';

/**
 * Drop-in replacement for routerLink that targets cross-MFE intents.
 * Hidden (display:none) until the host's NavRegistry knows about the intent.
 */
@Directive({
  selector: 'a[navLink], button[navLink]',
  host: {
    '(click)': 'onClick($event)',
    '[hidden]': '!available()',
    '[attr.href]': 'href()',
    '[attr.aria-disabled]': 'available() ? null : "true"',
  },
})
export class NavLinkDirective implements OnDestroy {
  readonly navLink = input.required<string>();
  readonly navParams = input<NavPayload>({});

  private readonly registry = signal<INavRegistry | null>(null);
  private readonly unsubscribe = onRegistryReady((r) => this.registry.set(r));

  protected readonly available = computed(() => {
    const r = this.registry();
    return r ? r.isAvailable(this.navLink()) : false;
  });

  protected readonly href = computed(() => {
    if (!this.available()) return null;
    const r = this.registry();
    if (!r) return null;
    try {
      return r.resolve(this.navLink(), this.navParams());
    } catch {
      return null;
    }
  });

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  onClick(event: Event): void {
    event.preventDefault();
    if (!this.available()) return;
    emitNavigate({ id: this.navLink(), payload: this.navParams() });
  }
}
