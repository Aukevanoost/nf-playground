type Handler = (data: unknown) => void;

export interface FakeRegistryBus {
  on(type: string, cb: Handler): () => void;
  onReady(type: string, cb: Handler): () => void;
  emit(type: string, data: unknown): void;
  register(type: string, resource: unknown): Promise<void>;
}

/** In-memory stand-in for `window.__NF_REGISTRY__`. Supports `on` for emit/listen
 *  and `onReady`/`register` for the publish-once resource pattern. */
export const fakeRegistryBus = (): FakeRegistryBus => {
  const listeners = new Map<string, Handler[]>();
  const resources = new Map<string, unknown>();
  const readyHandlers = new Map<string, Handler[]>();
  return {
    on: (type, cb) => {
      const arr = listeners.get(type) ?? [];
      arr.push(cb);
      listeners.set(type, arr);
      return () => {
        const next = (listeners.get(type) ?? []).filter((h) => h !== cb);
        listeners.set(type, next);
      };
    },
    onReady: (type, cb) => {
      if (resources.has(type)) {
        cb(resources.get(type));
      } else {
        const arr = readyHandlers.get(type) ?? [];
        arr.push(cb);
        readyHandlers.set(type, arr);
      }
      return () => {};
    },
    emit: (type, data) => {
      for (const cb of listeners.get(type) ?? []) {
        cb({ data, timestamp: Date.now() });
      }
    },
    register: async (type, resource) => {
      resources.set(type, resource);
      for (const cb of readyHandlers.get(type) ?? []) cb(resource);
      readyHandlers.delete(type);
    },
  };
};
