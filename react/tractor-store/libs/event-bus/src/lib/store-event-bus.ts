import { defineChannel } from './event-bus-setup';

export type StoreSelectedPayload = {
  readonly id: string;
};

export const storeSelected =
  defineChannel<StoreSelectedPayload>('store:selected');
