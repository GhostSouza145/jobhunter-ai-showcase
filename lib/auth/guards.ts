/**
 * Funções puras de checagem de permissão, usadas tanto pelas rotas de
 * servidor quanto pelos testes. A garantia definitiva de isolamento entre
 * usuários é feita pelo Row Level Security do Supabase (ver
 * supabase/migrations/0002_rls_policies.sql); estas funções são uma camada
 * adicional explícita, fácil de testar sem um banco real.
 */

export interface OwnedResource {
  userId: string;
}

export function isOwner(requesterId: string | null | undefined, resource: OwnedResource): boolean {
  if (!requesterId) return false;
  return requesterId === resource.userId;
}

export function assertOwner(requesterId: string | null | undefined, resource: OwnedResource): void {
  if (!isOwner(requesterId, resource)) {
    throw new Error('Acesso negado: este recurso pertence a outro usuário.');
  }
}
