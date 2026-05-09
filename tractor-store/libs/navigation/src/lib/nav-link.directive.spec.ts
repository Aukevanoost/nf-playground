import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavLinkDirective } from './nav-link.directive';
import { INavRegistry, NavContribution, NavPayload } from './nav-types';

type Listener = (data: unknown) => void;

const fakeBus = () => {
  const listeners = new Map<string, Listener[]>();
  const resources = new Map<string, unknown>();
  const readyHandlers = new Map<string, Listener[]>();
  return {
    on: (type: string, cb: Listener) => {
      const arr = listeners.get(type) ?? [];
      arr.push(cb);
      listeners.set(type, arr);
      return () => {};
    },
    onReady: (type: string, cb: Listener) => {
      if (resources.has(type)) cb(resources.get(type));
      else {
        const arr = readyHandlers.get(type) ?? [];
        arr.push(cb);
        readyHandlers.set(type, arr);
      }
      return () => {};
    },
    emit: (type: string, data: unknown) => {
      for (const cb of listeners.get(type) ?? [])
        cb({ data, timestamp: Date.now() });
    },
    register: async (type: string, resource: unknown) => {
      resources.set(type, resource);
      for (const cb of readyHandlers.get(type) ?? []) cb(resource);
      readyHandlers.delete(type);
    },
    clear: () => {
      listeners.clear();
      resources.clear();
      readyHandlers.clear();
    },
  };
};

const fakeRegistry = (): INavRegistry => {
  const intents = new Map<string, { basePath: string; path: string }>();
  return {
    register(c: NavContribution): void {
      for (const intent of c.intents) {
        intents.set(intent.id, { basePath: c.basePath, path: intent.path });
      }
    },
    isAvailable(id: string): boolean {
      return intents.has(id);
    },
    resolve(id: string, _payload: NavPayload = {}): string {
      const r = intents.get(id);
      if (!r) throw new Error(`unknown intent "${id}"`);
      const base = r.basePath.startsWith('/') ? r.basePath : `/${r.basePath}`;
      return `${base}${r.path}`;
    },
    async navigate(): Promise<boolean> {
      return true;
    },
  };
};

@Component({
  imports: [NavLinkDirective],
  template: `<a [navLink]="id()" [navParams]="params()">go</a>`,
})
class HostCmp {
  id = signal('explore.products');
  params = signal<Readonly<Record<string, string>>>({});
}

describe('NavLinkDirective', () => {
  let original: unknown;
  let bus: ReturnType<typeof fakeBus>;

  beforeEach(() => {
    original = (window as unknown as { __NF_REGISTRY__?: unknown })
      .__NF_REGISTRY__;
    bus = fakeBus();
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ = bus;
  });

  afterEach(() => {
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      original;
  });

  it('hides the link until a populated registry is published, then shows it', async () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();

    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.hasAttribute('hidden')).toBe(true);

    // Mirrors the host's real flow: contributions are registered into the
    // registry first, then the registry is published on the bus.
    const registry = fakeRegistry();
    registry.register({
      source: 'explore',
      basePath: 'explore',
      intents: [{ id: 'explore.products', path: '/products' }],
    });
    await bus.register('navigation:registry', registry);
    fixture.detectChanges();

    expect(a.hasAttribute('hidden')).toBe(false);
    expect(a.getAttribute('href')).toBe('/explore/products');
  });

  it('stays hidden when the published registry does not know the intent', async () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();

    const registry = fakeRegistry();
    await bus.register('navigation:registry', registry);
    fixture.detectChanges();

    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.hasAttribute('hidden')).toBe(true);
  });

  it('emits navigate event on click and prevents default', async () => {
    const fixture = TestBed.createComponent(HostCmp);
    const registry = fakeRegistry();
    registry.register({
      source: 'explore',
      basePath: 'explore',
      intents: [{ id: 'explore.products', path: '/products' }],
    });
    await bus.register('navigation:registry', registry);
    fixture.detectChanges();

    const navigated = vi.fn();
    bus.on('navigation:navigate', (event) => {
      navigated((event as { data: unknown }).data);
    });

    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(navigated).toHaveBeenCalledWith({
      id: 'explore.products',
      payload: {},
    });
  });
});
