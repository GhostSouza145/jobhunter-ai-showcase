import { describe, expect, it } from 'vitest';
import { MAX_RESUME_SIZE_BYTES, validateResumeFile } from '@/lib/resume/validate';
import { extractResumeData } from '@/lib/resume/extract-fields';

describe('validateResumeFile', () => {
  it('accepts a valid PDF within the size limit', () => {
    const result = validateResumeFile({ type: 'application/pdf', name: 'curriculo.pdf', size: 1024 });
    expect(result.valid).toBe(true);
  });

  it('rejects non-PDF mime types', () => {
    const result = validateResumeFile({ type: 'image/png', name: 'curriculo.png', size: 1024 });
    expect(result.valid).toBe(false);
  });

  it('rejects files larger than the size limit', () => {
    const result = validateResumeFile({
      type: 'application/pdf',
      name: 'curriculo.pdf',
      size: MAX_RESUME_SIZE_BYTES + 1,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects empty files', () => {
    const result = validateResumeFile({ type: 'application/pdf', name: 'curriculo.pdf', size: 0 });
    expect(result.valid).toBe(false);
  });
});

describe('extractResumeData', () => {
  it('extracts known technologies mentioned in the resume text', () => {
    const text = 'Experiência com React, TypeScript, Node.js e PostgreSQL.';
    const data = extractResumeData(text);

    expect(data.technologies).toContain('TypeScript');
    expect(data.frameworks).toContain('React');
    expect(data.databases).toContain('PostgreSQL');
  });

  it('extracts links present in the text', () => {
    const text = 'Contato: github.com/joaosilva e https://linkedin.com/in/joaosilva';
    const data = extractResumeData(text);

    expect(data.links.some((link) => link.includes('github.com/joaosilva'))).toBe(true);
    expect(data.links.some((link) => link.includes('linkedin.com/in/joaosilva'))).toBe(true);
  });

  it('does not invent a name when the text has no clear candidate name', () => {
    const text = '1234567890 !!! random symbols === not a resume';
    const data = extractResumeData(text);
    expect(data.name).toBeNull();
  });

  it('returns empty arrays instead of fabricated data when a section is absent', () => {
    const data = extractResumeData('Apenas um texto qualquer sem seções reconhecíveis.');
    expect(data.certifications).toEqual([]);
    expect(data.projects).toEqual([]);
  });
});
