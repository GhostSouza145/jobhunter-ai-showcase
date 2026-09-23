/**
 * Catálogo de referência de tecnologias/skills, espelhando o seed em
 * supabase/migrations/0004_seed.sql. Usado pelo parser de currículo, pela
 * normalização de vagas e pelo algoritmo de match para reconhecer menções
 * de tecnologias em texto livre de forma consistente.
 */

export interface SkillDefinition {
  name: string;
  slug: string;
  category:
    | 'language'
    | 'framework'
    | 'database'
    | 'tool'
    | 'platform'
    | 'soft-skill'
    | 'other';
  /** Formas alternativas/abreviações usadas para reconhecimento em texto livre. */
  aliases?: string[];
}

export const SKILLS_CATALOG: SkillDefinition[] = [
  { name: 'JavaScript', slug: 'javascript', category: 'language', aliases: ['js'] },
  { name: 'TypeScript', slug: 'typescript', category: 'language', aliases: ['ts'] },
  { name: 'Python', slug: 'python', category: 'language' },
  { name: 'Java', slug: 'java', category: 'language' },
  { name: 'C#', slug: 'csharp', category: 'language', aliases: ['c sharp'] },
  { name: 'C++', slug: 'cpp', category: 'language' },
  { name: 'Go', slug: 'go', category: 'language', aliases: ['golang'] },
  { name: 'PHP', slug: 'php', category: 'language' },
  { name: 'Ruby', slug: 'ruby', category: 'language' },
  { name: 'Kotlin', slug: 'kotlin', category: 'language' },
  { name: 'Swift', slug: 'swift', category: 'language' },
  { name: 'HTML', slug: 'html', category: 'language', aliases: ['html5'] },
  { name: 'CSS', slug: 'css', category: 'language', aliases: ['css3'] },
  { name: 'React', slug: 'react', category: 'framework', aliases: ['react.js', 'reactjs'] },
  { name: 'Next.js', slug: 'nextjs', category: 'framework', aliases: ['nextjs', 'next'] },
  { name: 'Vue', slug: 'vue', category: 'framework', aliases: ['vue.js', 'vuejs'] },
  { name: 'Angular', slug: 'angular', category: 'framework' },
  { name: 'Node.js', slug: 'nodejs', category: 'framework', aliases: ['node', 'nodejs'] },
  { name: 'Express', slug: 'express', category: 'framework', aliases: ['express.js'] },
  { name: 'NestJS', slug: 'nestjs', category: 'framework', aliases: ['nest.js', 'nest'] },
  { name: 'Django', slug: 'django', category: 'framework' },
  { name: 'Flask', slug: 'flask', category: 'framework' },
  { name: 'Spring', slug: 'spring', category: 'framework', aliases: ['spring boot'] },
  { name: 'Laravel', slug: 'laravel', category: 'framework' },
  { name: '.NET', slug: 'dotnet', category: 'framework', aliases: ['dotnet', 'asp.net'] },
  { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'framework', aliases: ['tailwind'] },
  { name: 'PostgreSQL', slug: 'postgresql', category: 'database', aliases: ['postgres'] },
  { name: 'MySQL', slug: 'mysql', category: 'database' },
  { name: 'MongoDB', slug: 'mongodb', category: 'database', aliases: ['mongo'] },
  { name: 'Redis', slug: 'redis', category: 'database' },
  { name: 'SQLite', slug: 'sqlite', category: 'database' },
  { name: 'Supabase', slug: 'supabase', category: 'platform' },
  { name: 'Firebase', slug: 'firebase', category: 'platform' },
  { name: 'AWS', slug: 'aws', category: 'platform', aliases: ['amazon web services'] },
  { name: 'Azure', slug: 'azure', category: 'platform' },
  { name: 'Google Cloud', slug: 'gcp', category: 'platform', aliases: ['gcp'] },
  { name: 'Docker', slug: 'docker', category: 'tool' },
  { name: 'Kubernetes', slug: 'kubernetes', category: 'tool', aliases: ['k8s'] },
  { name: 'Git', slug: 'git', category: 'tool' },
  { name: 'GitHub', slug: 'github', category: 'tool' },
  { name: 'CI/CD', slug: 'ci-cd', category: 'tool', aliases: ['ci/cd', 'continuous integration'] },
  { name: 'Figma', slug: 'figma', category: 'tool' },
  { name: 'Jest', slug: 'jest', category: 'tool' },
  { name: 'GraphQL', slug: 'graphql', category: 'tool' },
  { name: 'REST API', slug: 'rest-api', category: 'tool', aliases: ['rest', 'restful'] },
  { name: 'Scrum', slug: 'scrum', category: 'soft-skill' },
  { name: 'Comunicação', slug: 'comunicacao', category: 'soft-skill' },
  { name: 'Trabalho em equipe', slug: 'trabalho-em-equipe', category: 'soft-skill' },
];

const ALIAS_INDEX = new Map<string, SkillDefinition>();
for (const skill of SKILLS_CATALOG) {
  ALIAS_INDEX.set(normalizeToken(skill.name), skill);
  for (const alias of skill.aliases ?? []) {
    ALIAS_INDEX.set(normalizeToken(alias), skill);
  }
}

export function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Resolve um token de texto livre para uma skill canônica, se reconhecida. */
export function resolveSkill(token: string): SkillDefinition | null {
  return ALIAS_INDEX.get(normalizeToken(token)) ?? null;
}

/**
 * Varre um texto livre e retorna as skills canônicas mencionadas nele,
 * usando limites de palavra para evitar falsos positivos (ex.: "go" dentro
 * de "algorithm").
 */
export function findSkillsInText(text: string): SkillDefinition[] {
  if (!text) return [];
  const found = new Map<string, SkillDefinition>();

  for (const skill of SKILLS_CATALOG) {
    const candidates = [skill.name, ...(skill.aliases ?? [])];
    for (const candidate of candidates) {
      const pattern = buildWordBoundaryRegex(candidate);
      if (pattern.test(text)) {
        found.set(skill.slug, skill);
        break;
      }
    }
  }

  return Array.from(found.values());
}

function buildWordBoundaryRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // '+', '#', '.' fazem parte de nomes de tecnologia (C++, C#, Node.js),
  // então usamos um limite baseado em espaço/pontuação de frase em vez de \b.
  return new RegExp(`(?:^|[\\s,;/()\\[\\]])${escaped}(?:$|[\\s,;/()\\[\\].:!?])`, 'i');
}
