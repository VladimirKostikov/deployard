import { describe, expect, it } from 'vitest';
import { labelsMatchSelector } from './label-selector-match';

describe('labelsMatchSelector', () => {
  it('returns true when all selector keys match pod labels', () => {
    expect(
      labelsMatchSelector(
        { 'app.kubernetes.io/name': 'demo-api', tier: 'web' },
        { 'app.kubernetes.io/name': 'demo-api' },
      ),
    ).toBe(true);
  });

  it('returns false when a selector key is missing', () => {
    expect(labelsMatchSelector({ tier: 'web' }, { 'app.kubernetes.io/name': 'demo-api' })).toBe(false);
  });
});
