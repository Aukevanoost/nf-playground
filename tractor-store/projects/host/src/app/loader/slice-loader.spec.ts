import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import { EnvironmentConfig } from '@internal/federation';
import { createSliceLoader } from './slice-loader';

const env: EnvironmentConfig = {
  production: false,
  apiUrl: '',
  scope: 'http://localhost:4200',
  cdnUrl: 'http://cdn.test',
};

const manifest: FederationManifest = {
  '@tractor-store/explore': 'http://localhost:4201/remoteEntry.json',
  '@tractor-store/decide': 'http://localhost:4202/remoteEntry.json',
};

const makeNf = (
  loadRemoteModule: NativeFederationResult['loadRemoteModule'],
): NativeFederationResult =>
  ({ loadRemoteModule }) as unknown as NativeFederationResult;

describe('createSliceLoader', () => {
  let preDefined: Set<string>;
  let getSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    preDefined = new Set();
    getSpy = vi
      .spyOn(customElements, 'get')
      .mockImplementation((name: string) =>
        preDefined.has(name)
          ? (class {} as unknown as CustomElementConstructor)
          : undefined,
      );
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  it('calls bootstrap with a remote-scoped env config', async () => {
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async () => ({ bootstrap }));

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-explore');

    expect(loadRemoteModule).toHaveBeenCalledWith(
      '@tractor-store/explore',
      'mfe-explore',
    );
    expect(bootstrap).toHaveBeenCalledTimes(1);
    const [bootEnv] = bootstrap.mock.calls[0];
    expect(bootEnv.scope).toBe('http://localhost:4201');
    expect(bootEnv.cdnUrl).toBe(env.cdnUrl);
  });

  it('does not re-bootstrap a slice already loaded by the same remote', async () => {
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async () => ({ bootstrap }));

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-explore');
    await load('@tractor-store/explore', 'mfe-explore');

    expect(loadRemoteModule).toHaveBeenCalledTimes(1);
    expect(bootstrap).toHaveBeenCalledTimes(1);
  });

  it('skips loading when the tag is already defined externally', async () => {
    preDefined.add('mfe-legacy');
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async () => ({ bootstrap }));

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-legacy');

    expect(loadRemoteModule).not.toHaveBeenCalled();
    expect(bootstrap).not.toHaveBeenCalled();
  });

  it('warns when a different remote claims an already-loaded element', async () => {
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async () => ({ bootstrap }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-shared');
    await load('@tractor-store/decide', 'mfe-shared');

    expect(loadRemoteModule).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('mfe-shared');
    expect(warn.mock.calls[0][0]).toContain('explore');
    warn.mockRestore();
  });

  it('passes the loader itself so a slice can load nested slices', async () => {
    const exploreBootstrap = vi
      .fn()
      .mockImplementation(async (_e, loader) => {
        await loader('@tractor-store/decide', 'mfe-decide');
      });
    const decideBootstrap = vi.fn().mockResolvedValue(undefined);
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async (_remote: string, exposed: string) =>
        exposed === 'mfe-explore'
          ? { bootstrap: exploreBootstrap }
          : { bootstrap: decideBootstrap },
      );

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-explore');

    expect(loadRemoteModule).toHaveBeenCalledTimes(2);
    expect(loadRemoteModule.mock.calls[1]).toEqual([
      '@tractor-store/decide',
      'mfe-decide',
    ]);
    expect(decideBootstrap).toHaveBeenCalledOnce();
  });

  it('short-circuits on cyclic self-load instead of recursing forever', async () => {
    let callCount = 0;
    const bootstrap = vi.fn().mockImplementation(async (_e, loader) => {
      callCount += 1;
      // simulate a slice asking for itself again — must not loop
      await loader('@tractor-store/explore', 'mfe-explore');
    });
    const loadRemoteModule = vi
      .fn()
      .mockImplementation(async () => ({ bootstrap }));

    const load = createSliceLoader(makeNf(loadRemoteModule), env, manifest);
    await load('@tractor-store/explore', 'mfe-explore');

    expect(loadRemoteModule).toHaveBeenCalledTimes(1);
    expect(callCount).toBe(1);
  });
});
