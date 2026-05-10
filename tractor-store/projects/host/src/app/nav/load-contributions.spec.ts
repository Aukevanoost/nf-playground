import { describe, expect, it, vi } from 'vitest';
import {
  decideContribution,
  exploreContribution,
} from '../../testing/nav-contribution.fixture';
import { fakeNf } from '../../testing/native-federation.stub';
import { testManifest } from '../../testing/manifest.fixture';
import {
  loadContributions,
  NAV_CONTRIBUTION_MODULE,
} from './load-contributions';

describe('loadContributions', () => {
  it('loads each remote and returns one LoadedContribution per remote', async () => {
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async (remoteName: string, exposed: string) => {
        expect(exposed).toBe(NAV_CONTRIBUTION_MODULE);
        if (remoteName === '@tractor-store/explore') {
          return { navContribution: exploreContribution };
        }
        return { default: decideContribution };
      });

    const loaded = await loadContributions(
      fakeNf(loadRemoteModule),
      testManifest,
    );

    expect(loaded).toHaveLength(2);
    expect(loaded.map((l) => l.remoteName)).toEqual([
      '@tractor-store/explore',
      '@tractor-store/decide',
    ]);
    expect(loaded[0].contribution).toBe(exploreContribution);
    expect(loaded[1].contribution).toBe(decideContribution);
  });

  it('accepts both `navContribution` and `default` exports', async () => {
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async (remoteName: string) =>
        remoteName === '@tractor-store/explore'
          ? { navContribution: exploreContribution }
          : { default: decideContribution },
      );

    const loaded = await loadContributions(
      fakeNf(loadRemoteModule),
      testManifest,
    );
    expect(loaded.map((l) => l.contribution.source)).toEqual([
      '@tractor-store/explore',
      '@tractor-store/decide',
    ]);
  });

  it('logs and skips remotes that fail to load and keeps the rest', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async (remoteName: string) => {
        if (remoteName === '@tractor-store/explore') {
          throw new Error('boom');
        }
        return { navContribution: decideContribution };
      });

    const loaded = await loadContributions(
      fakeNf(loadRemoteModule),
      testManifest,
    );

    expect(loaded).toHaveLength(1);
    expect(loaded[0].remoteName).toBe('@tractor-store/decide');
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toMatch(/@tractor-store\/explore/);
    warn.mockRestore();
  });

  it('rejects remotes whose export is not a valid contribution', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async (remoteName: string) => {
        if (remoteName === '@tractor-store/explore') {
          return { navContribution: { source: 'x' } };
        }
        return { navContribution: decideContribution };
      });

    const loaded = await loadContributions(
      fakeNf(loadRemoteModule),
      testManifest,
    );

    expect(loaded).toHaveLength(1);
    expect(loaded[0].remoteName).toBe('@tractor-store/decide');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns an empty list when the manifest has no remotes', async () => {
    const loadRemoteModule = vi.fn();
    const loaded = await loadContributions(fakeNf(loadRemoteModule), {});
    expect(loaded).toEqual([]);
    expect(loadRemoteModule).not.toHaveBeenCalled();
  });
});
