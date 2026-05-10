import {
  appendQueryString,
  INavRegistry,
  NavContribution,
  NavNavigator,
  NavPayload,
} from '@internal/events';
import { joinPath, resolveTemplate, splitIntentParams } from './path-template';

type ResolvedIntent = {
  readonly source: string;
  readonly basePath: string;
  readonly path: string;
  readonly params: readonly string[];
};

export class NavRegistry implements INavRegistry {
  private readonly intents = new Map<string, ResolvedIntent>();

  constructor(private readonly navigator: NavNavigator) {}

  register(contribution: NavContribution): void {
    for (const intent of contribution.intents) {
      this.intents.set(intent.id, {
        source: contribution.source,
        basePath: contribution.basePath,
        path: intent.path,
        params: splitIntentParams(intent.path),
      });
    }
  }

  isAvailable(id: string): boolean {
    return this.intents.has(id);
  }

  resolve(id: string, payload: NavPayload = {}): string {
    const r = this.intents.get(id);
    if (!r) throw new Error(`[nav] unknown intent id "${id}"`);
    const path = joinPath(r.basePath, resolveTemplate(r.path, payload));
    const queryParams = this.queryParams(payload, r.params);
    return appendQueryString(path, queryParams);
  }

  navigate(id: string, payload: NavPayload = {}): Promise<boolean> {
    return this.navigator(this.resolve(id, payload));
  }

  private queryParams(
    payload: NavPayload,
    pathParams: readonly string[],
  ): NavPayload {
    const out: Record<string, string> = {};
    for (const k of Object.keys(payload)) {
      if (!pathParams.includes(k)) out[k] = payload[k];
    }
    return out;
  }
}
