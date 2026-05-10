import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavRouteDirective } from './nav-route.directive';

type Listener = (data: unknown) => void;

const fakeBus = () => {
  const listeners = new Map<string, Listener[]>();
  return {
    on: (type: string, cb: Listener) => {
      const arr = listeners.get(type) ?? [];
      arr.push(cb);
      listeners.set(type, arr);
      return () => {};
    },
    onReady: () => () => {},
    emit: (type: string, data: unknown) => {
      for (const cb of listeners.get(type) ?? [])
        cb({ data, timestamp: Date.now() });
    },
    register: async () => {},
    clear: () => listeners.clear(),
  };
};

@Component({
  imports: [NavRouteDirective],
  template: `<a [navRoute]="path()" [navRouteParams]="params()">go</a>`,
})
class HostCmp {
  path = signal('/decide/product/CL-01');
  params = signal<Readonly<Record<string, string>>>({});
}

describe('NavRouteDirective', () => {
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

  it('renders the path as href', () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/decide/product/CL-01');
  });

  it('appends query params to the href', () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.componentInstance.params.set({ sku: 'CL-01-GY' });
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/decide/product/CL-01?sku=CL-01-GY');
  });

  it('falls back to current pathname when navRoute is empty', () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.componentInstance.path.set('');
    fixture.componentInstance.params.set({ sku: 'X' });
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe(`${window.location.pathname}?sku=X`);
  });

  it('emits route event on click and prevents default', () => {
    const fixture = TestBed.createComponent(HostCmp);
    fixture.componentInstance.params.set({ sku: 'CL-01-GY' });
    fixture.detectChanges();

    const routed = vi.fn();
    bus.on('navigation:route', (event) => {
      routed((event as { data: unknown }).data);
    });

    const a = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(routed).toHaveBeenCalledWith({
      url: '/decide/product/CL-01?sku=CL-01-GY',
    });
  });
});
