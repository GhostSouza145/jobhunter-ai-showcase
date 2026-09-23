export interface FavoriteCandidate {
  userId: string;
  jobId: string;
}

export interface ExistingFavorite {
  userId: string;
  jobId: string;
}

/** Um usuário não pode favoritar a mesma vaga duas vezes. */
export function canAddFavorite(candidate: FavoriteCandidate, existing: ExistingFavorite[]): boolean {
  return !existing.some((fav) => fav.userId === candidate.userId && fav.jobId === candidate.jobId);
}

/** Um usuário só pode remover os próprios favoritos. */
export function canRemoveFavorite(
  requesterId: string,
  favorite: ExistingFavorite,
): boolean {
  return requesterId === favorite.userId;
}
