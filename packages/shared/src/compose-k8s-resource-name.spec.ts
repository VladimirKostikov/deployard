import { describe, expect, it } from 'vitest';
import {
  composeK8sResourceName,
  composeServiceNameFromResourceName,
} from './compose-k8s-resource-name';

describe('composeK8sResourceName', () => {
  it('prefixes service with project name', () => {
    expect(composeK8sResourceName('demo-shop', 'web')).toBe('demo-web');
    expect(composeK8sResourceName('demo-shop', 'demo-api')).toBe('demo-api');
    expect(composeK8sResourceName('demo-shop', 'postgres')).toBe('demo-db');
    expect(composeK8sResourceName('order-hub', 'web')).toBe('order-hub-web');
  });

  it('avoids double prefix', () => {
    expect(composeK8sResourceName('demo-shop', 'demo-shop-web')).toBe('demo-shop-web');
  });
});

describe('composeServiceNameFromResourceName', () => {
  it('extracts compose service name from k8s resource name', () => {
    expect(composeServiceNameFromResourceName('demo-shop', 'demo-web')).toBe('web');
    expect(composeServiceNameFromResourceName('demo-shop', 'demo-api')).toBe('demo-api');
    expect(composeServiceNameFromResourceName('demo-shop', 'demo-db')).toBe('postgres');
  });
});
