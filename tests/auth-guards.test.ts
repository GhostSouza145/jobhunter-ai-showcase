import { describe, expect, it } from 'vitest';
import { assertOwner, isOwner } from '@/lib/auth/guards';

describe('isOwner', () => {
  it('returns true when the requester owns the resource', () => {
    expect(isOwner('user-1', { userId: 'user-1' })).toBe(true);
  });

  it('returns false when the requester does not own the resource', () => {
    expect(isOwner('user-2', { userId: 'user-1' })).toBe(false);
  });

  it('returns false when there is no authenticated requester', () => {
    expect(isOwner(null, { userId: 'user-1' })).toBe(false);
    expect(isOwner(undefined, { userId: 'user-1' })).toBe(false);
  });
});

describe('assertOwner', () => {
  it('does not throw for the resource owner', () => {
    expect(() => assertOwner('user-1', { userId: 'user-1' })).not.toThrow();
  });

  it('throws for a non-owner, preventing cross-user data access', () => {
    expect(() => assertOwner('user-2', { userId: 'user-1' })).toThrow();
  });
});
