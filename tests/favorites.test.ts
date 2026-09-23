import { describe, expect, it } from 'vitest';
import { canAddFavorite, canRemoveFavorite } from '@/lib/favorites/validate';

describe('canAddFavorite', () => {
  it('allows adding a favorite that does not exist yet', () => {
    const result = canAddFavorite({ userId: 'user-1', jobId: 'job-1' }, []);
    expect(result).toBe(true);
  });

  it('prevents adding the same job twice for the same user', () => {
    const existing = [{ userId: 'user-1', jobId: 'job-1' }];
    const result = canAddFavorite({ userId: 'user-1', jobId: 'job-1' }, existing);
    expect(result).toBe(false);
  });

  it('allows different users to favorite the same job', () => {
    const existing = [{ userId: 'user-1', jobId: 'job-1' }];
    const result = canAddFavorite({ userId: 'user-2', jobId: 'job-1' }, existing);
    expect(result).toBe(true);
  });
});

describe('canRemoveFavorite', () => {
  it('allows the owner to remove their favorite', () => {
    expect(canRemoveFavorite('user-1', { userId: 'user-1', jobId: 'job-1' })).toBe(true);
  });

  it('prevents a different user from removing someone else\'s favorite', () => {
    expect(canRemoveFavorite('user-2', { userId: 'user-1', jobId: 'job-1' })).toBe(false);
  });
});
