const bus = new Map();

export function on(event, handler) {
  if (!bus.has(event)) bus.set(event, new Set());
  bus.get(event).add(handler);
}

export function emit(event, ...args) {
  bus.get(event)?.forEach((handler) => handler(...args));
}