export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_RESUME_MIME_TYPES = ['application/pdf'];

export interface ResumeValidationResult {
  valid: boolean;
  error?: string;
}

/** Valida um arquivo de currículo antes de aceitar o upload. */
export function validateResumeFile(file: { type: string; size: number; name: string }): ResumeValidationResult {
  if (!ALLOWED_RESUME_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Apenas arquivos PDF são aceitos para o currículo.' };
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'O arquivo deve ter extensão .pdf.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'O arquivo está vazio.' };
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return { valid: false, error: 'O arquivo excede o tamanho máximo de 5MB.' };
  }

  return { valid: true };
}
