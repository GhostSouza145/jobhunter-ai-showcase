import type { ParsedExperience, ParsedResumeData } from '@/types/candidate';
import { findSkillsInText } from '@/lib/shared/skills-catalog';

const SPOKEN_LANGUAGES = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Mandarim',
  'Japonês',
];

const SECTION_PATTERNS: { key: SectionKey; patterns: RegExp[] }[] = [
  { key: 'experience', patterns: [/experi[eê]ncias?( profission(ais|al))?/i, /^work experience$/i] },
  { key: 'education', patterns: [/forma[cç][aã]o( acad[eê]mica)?/i, /^education$/i, /^educa[cç][aã]o$/i] },
  { key: 'projects', patterns: [/^projetos$/i, /^projects$/i] },
  { key: 'certifications', patterns: [/certifica[cç][oõ]es/i, /^certifications$/i] },
  { key: 'languages', patterns: [/^idiomas$/i, /^languages$/i] },
  { key: 'skills', patterns: [/habilidades/i, /compet[eê]ncias/i, /^skills$/i, /^tecnologias$/i] },
];

type SectionKey = 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'skills';

const URL_REGEX = /(https?:\/\/[^\s,;]+|(?:www\.)?(?:github|linkedin)\.com\/[^\s,;]+)/gi;
const DATE_RANGE_REGEX =
  /((?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?\s*\/?\s*\d{4}|\d{4})\s*[-–a]{1,3}\s*(atual|presente|current|(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?\s*\/?\s*\d{4}|\d{4})/i;

/**
 * Extrai dados estruturados de um currículo em texto puro. Nunca inventa
 * informações: quando algo não é encontrado no texto, o campo permanece
 * vazio/nulo em vez de ser adivinhado.
 */
export function extractResumeData(rawText: string): ParsedResumeData {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const sections = splitIntoSections(lines);
  const allSkills = findSkillsInText(rawText);

  return {
    name: guessName(lines),
    education: extractLines(sections.education),
    experiences: extractExperiences(sections.experience),
    technologies: allSkills.filter((s) => s.category === 'language').map((s) => s.name),
    languages: allSkills.filter((s) => s.category === 'language').map((s) => s.name),
    frameworks: allSkills.filter((s) => s.category === 'framework').map((s) => s.name),
    databases: allSkills.filter((s) => s.category === 'database').map((s) => s.name),
    tools: allSkills.filter((s) => s.category === 'tool' || s.category === 'platform').map((s) => s.name),
    certifications: extractLines(sections.certifications),
    spokenLanguages: extractSpokenLanguages(sections.languages ?? rawText),
    projects: extractLines(sections.projects),
    links: extractLinks(rawText),
    skills: allSkills.map((s) => s.name),
  };
}

function splitIntoSections(lines: string[]): Partial<Record<SectionKey, string[]>> {
  const sections: Partial<Record<SectionKey, string[]>> = {};
  let currentKey: SectionKey | null = null;

  for (const line of lines) {
    const matchedKey = detectSectionHeader(line);
    if (matchedKey) {
      currentKey = matchedKey;
      if (!sections[currentKey]) sections[currentKey] = [];
      continue;
    }
    if (currentKey) {
      sections[currentKey]!.push(line);
    }
  }

  return sections;
}

function detectSectionHeader(line: string): SectionKey | null {
  if (line.length > 45 || line.split(/\s+/).length > 6) return null;
  for (const { key, patterns } of SECTION_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(line))) return key;
  }
  return null;
}

function extractLines(lines: string[] | undefined): string[] {
  if (!lines) return [];
  return lines.filter((line) => line.length > 1).slice(0, 20);
}

function guessName(lines: string[]): string | null {
  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 5) continue;
    if (/\d/.test(line)) continue;
    if (/[@/]|http/i.test(line)) continue;
    const looksLikeName = words.every((word) => /^[A-ZÀ-Ý][a-zà-ÿ'.-]*$/.test(word));
    if (looksLikeName) return line;
  }
  return null;
}

function extractExperiences(lines: string[] | undefined): ParsedExperience[] {
  if (!lines || lines.length === 0) return [];

  const blocks: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    current.push(line);
    if (current.length >= 4) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) blocks.push(current);

  return blocks.slice(0, 10).map((block) => {
    const headerLine = block[0] ?? '';
    const period = DATE_RANGE_REGEX.exec(block.join(' '))?.[0] ?? null;
    const separatorParts = headerLine.split(/\s[-–|@]\s/);

    return {
      company: separatorParts[1]?.trim() || null,
      role: separatorParts[0]?.trim() || (separatorParts.length === 1 ? headerLine : null),
      period,
      description: block.slice(1).join(' ').trim() || null,
    };
  });
}

function extractSpokenLanguages(source: string[] | string): string[] {
  const text = Array.isArray(source) ? source.join(' ') : source;
  return SPOKEN_LANGUAGES.filter((language) => new RegExp(language, 'i').test(text));
}

function extractLinks(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;]$/, ''))));
}
