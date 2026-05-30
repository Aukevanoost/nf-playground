import { defineChannel } from './event-bus-setup';

export interface CartLineItem {
  readonly sku: string;
  readonly quantity: number;
}

export interface CartUpdatedPayload {
  readonly items: readonly CartLineItem[];
}

const cartUpdated = defineChannel<CartUpdatedPayload>('cart:updated');

export const emitCartUpdated = (data: CartUpdatedPayload): void =>
  cartUpdated.emit(data);

export const onCartUpdated = (
  handler: (data: CartUpdatedPayload) => void,
): (() => void) => cartUpdated.on(handler);
