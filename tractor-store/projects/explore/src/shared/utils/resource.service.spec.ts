import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ENV } from '../../env.config';
import { testEnv } from '../../testing/env.fixture';
import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  let svc: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ENV, useValue: testEnv }],
    });
    svc = TestBed.inject(ResourceService);
  });

  describe('cdnUrl', () => {
    it('prefixes a relative path with the configured cdn url', () => {
      expect(svc.cdnUrl('/img/x.webp')).toBe('http://cdn.test/img/x.webp');
    });

    it('inserts a slash for paths missing a leading slash', () => {
      expect(svc.cdnUrl('img/x.webp')).toBe('http://cdn.test/img/x.webp');
    });

    it('strips a trailing slash from the cdn url', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ENV,
            useValue: { ...testEnv, cdnUrl: 'http://cdn.test/' },
          },
        ],
      });
      const trailing = TestBed.inject(ResourceService);
      expect(trailing.cdnUrl('/img/x.webp')).toBe(
        'http://cdn.test/img/x.webp',
      );
    });
  });

  describe('imgSrc', () => {
    it('substitutes the [size] placeholder with the supplied number', () => {
      expect(svc.imgSrc('/img/[size]/x.webp', 200)).toBe(
        'http://cdn.test/img/200/x.webp',
      );
    });

    it('returns the path unchanged when there is no [size] placeholder', () => {
      expect(svc.imgSrc('/img/static.webp', 500)).toBe(
        'http://cdn.test/img/static.webp',
      );
    });

    it('only replaces the first [size] occurrence', () => {
      // Documents current String.replace behaviour without the /g flag.
      expect(svc.imgSrc('/[size]/[size].webp', 100)).toBe(
        'http://cdn.test/100/[size].webp',
      );
    });
  });

  describe('imgSrcset', () => {
    it('builds a comma-separated srcset with width descriptors', () => {
      expect(svc.imgSrcset('/img/[size]/x.webp', [200, 400])).toBe(
        'http://cdn.test/img/200/x.webp 200w, http://cdn.test/img/400/x.webp 400w',
      );
    });

    it('returns an empty string for an empty size list', () => {
      expect(svc.imgSrcset('/img/[size]/x.webp')).toBe('');
      expect(svc.imgSrcset('/img/[size]/x.webp', [])).toBe('');
    });
  });
});
