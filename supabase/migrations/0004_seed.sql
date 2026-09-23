-- ============================================================================
-- JobHunter AI — seed de dados de referência
-- Catálogo inicial de skills usado pelo parser de currículo e pelo algoritmo
-- de match, e o registro das fontes de vagas conhecidas pela aplicação.
-- ============================================================================

insert into public.skills (name, slug, category) values
  ('JavaScript', 'javascript', 'language'),
  ('TypeScript', 'typescript', 'language'),
  ('Python', 'python', 'language'),
  ('Java', 'java', 'language'),
  ('C#', 'csharp', 'language'),
  ('C++', 'cpp', 'language'),
  ('Go', 'go', 'language'),
  ('PHP', 'php', 'language'),
  ('Ruby', 'ruby', 'language'),
  ('Kotlin', 'kotlin', 'language'),
  ('Swift', 'swift', 'language'),
  ('React', 'react', 'framework'),
  ('Next.js', 'nextjs', 'framework'),
  ('Vue', 'vue', 'framework'),
  ('Angular', 'angular', 'framework'),
  ('Node.js', 'nodejs', 'framework'),
  ('Express', 'express', 'framework'),
  ('NestJS', 'nestjs', 'framework'),
  ('Django', 'django', 'framework'),
  ('Flask', 'flask', 'framework'),
  ('Spring', 'spring', 'framework'),
  ('Laravel', 'laravel', 'framework'),
  ('.NET', 'dotnet', 'framework'),
  ('Tailwind CSS', 'tailwind-css', 'framework'),
  ('HTML', 'html', 'language'),
  ('CSS', 'css', 'language'),
  ('PostgreSQL', 'postgresql', 'database'),
  ('MySQL', 'mysql', 'database'),
  ('MongoDB', 'mongodb', 'database'),
  ('Redis', 'redis', 'database'),
  ('SQLite', 'sqlite', 'database'),
  ('Supabase', 'supabase', 'platform'),
  ('Firebase', 'firebase', 'platform'),
  ('AWS', 'aws', 'platform'),
  ('Azure', 'azure', 'platform'),
  ('Google Cloud', 'gcp', 'platform'),
  ('Docker', 'docker', 'tool'),
  ('Kubernetes', 'kubernetes', 'tool'),
  ('Git', 'git', 'tool'),
  ('GitHub', 'github', 'tool'),
  ('CI/CD', 'ci-cd', 'tool'),
  ('Figma', 'figma', 'tool'),
  ('Jest', 'jest', 'tool'),
  ('GraphQL', 'graphql', 'tool'),
  ('REST API', 'rest-api', 'tool'),
  ('Scrum', 'scrum', 'soft-skill'),
  ('Comunicação', 'comunicacao', 'soft-skill'),
  ('Trabalho em equipe', 'trabalho-em-equipe', 'soft-skill')
on conflict (slug) do nothing;

insert into public.job_sources (key, name, status) values
  ('demo', 'Vagas de demonstração', 'active'),
  ('remotive', 'Remotive (API pública)', 'active'),
  ('arbeitnow', 'Arbeitnow (API pública)', 'active'),
  ('indeed', 'Indeed', 'not_configured')
on conflict (key) do nothing;
