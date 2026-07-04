import { describe, expect, it } from 'vitest';
import {
  allocateServiceAccessPort,
  buildServiceAccessKey,
  resolveStableServiceAccessPort,
} from './service-access-ports';

describe('service-access-ports', () => {
  it('builds stable service key', () => {
    expect(buildServiceAccessKey('demo', 'todo-web', 80)).toBe('demo/todo-web:80');
  });

  it('allocates first free port from pool', () => {
    expect(allocateServiceAccessPort(new Set())).toBe(31080);
    expect(allocateServiceAccessPort(new Set([31080, 31081]))).toBe(31082);
  });

  it('returns the same port for the same service key', () => {
    const key = 'demo/demo-shop-web:80';
    expect(resolveStableServiceAccessPort(key)).toBe(resolveStableServiceAccessPort(key));
  });

  it('assigns different ports for different services', () => {
    const demoShop = resolveStableServiceAccessPort('demo/demo-shop-web:80');
    const orderHub = resolveStableServiceAccessPort('demo/order-hub-web:80');

    expect(demoShop).not.toBe(orderHub);
  });

  it('avoids collisions with already reserved ports', () => {
    const firstKey = 'demo/demo-shop-web:80';
    const firstPort = resolveStableServiceAccessPort(firstKey);
    const reserved = new Map([[firstKey, firstPort]]);

    const secondPort = resolveStableServiceAccessPort('demo/order-hub-web:80', reserved);

    expect(secondPort).not.toBe(firstPort);
  });
});
