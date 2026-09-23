/**
 * Tipos do banco de dados Supabase, escritos à mão para espelhar
 * supabase/migrations/*.sql, no mesmo formato produzido por
 * `supabase gen types typescript`. Para regenerar automaticamente a partir
 * do schema real, veja a seção "Supabase" do README.
 */

export type Level = 'estagio' | 'trainee' | 'junior' | 'pleno' | 'senior';
export type RemoteModality = 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'estagio' | 'clt' | 'pj' | 'temporario' | 'trainee';
export type SkillCategory =
  | 'language'
  | 'framework'
  | 'database'
  | 'tool'
  | 'platform'
  | 'soft-skill'
  | 'other';
export type ResumeStatus = 'processing' | 'parsed' | 'failed';
export type RequirementLevel = 'required' | 'desired' | 'differential';
export type JobSourceStatus = 'active' | 'not_configured' | 'error';

type Tables = {
  profiles: {
    Row: {
      id: string;
      full_name: string | null;
      professional_area: string | null;
      level: Level | null;
      employment_types: string[];
      modality: string[];
      location: string | null;
      technologies: string[];
      interests: string[];
      experience: string | null;
      education: string | null;
      github_url: string | null;
      linkedin_url: string | null;
      portfolio_url: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Partial<Tables['profiles']['Row']> & { id: string };
    Update: Partial<Tables['profiles']['Row']>;
    Relationships: [];
  };
  resumes: {
    Row: {
      id: string;
      user_id: string;
      file_path: string;
      file_name: string;
      file_size: number;
      raw_text: string | null;
      parsed: Record<string, unknown>;
      status: ResumeStatus;
      error_message: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Partial<Tables['resumes']['Row']> & {
      user_id: string;
      file_path: string;
      file_name: string;
      file_size: number;
    };
    Update: Partial<Tables['resumes']['Row']>;
    Relationships: [];
  };
  skills: {
    Row: {
      id: string;
      name: string;
      slug: string;
      category: SkillCategory;
      created_at: string;
    };
    Insert: Partial<Tables['skills']['Row']> & { name: string; slug: string };
    Update: Partial<Tables['skills']['Row']>;
    Relationships: [];
  };
  candidate_skills: {
    Row: {
      id: string;
      user_id: string;
      skill_id: string;
      source: 'resume' | 'manual';
      created_at: string;
    };
    Insert: Partial<Tables['candidate_skills']['Row']> & { user_id: string; skill_id: string };
    Update: Partial<Tables['candidate_skills']['Row']>;
    Relationships: [];
  };
  jobs: {
    Row: {
      id: string;
      source: string;
      source_job_id: string;
      title: string;
      company: string;
      description: string;
      location: string | null;
      remote: RemoteModality | null;
      employment_type: string | null;
      level: Level | null;
      salary: string | null;
      url: string;
      published_at: string | null;
      requirements: string[];
      technologies: string[];
      is_demo: boolean;
      dedupe_hash: string;
      created_at: string;
      updated_at: string;
    };
    Insert: Partial<Tables['jobs']['Row']> & {
      source: string;
      source_job_id: string;
      title: string;
      company: string;
      url: string;
      dedupe_hash: string;
    };
    Update: Partial<Tables['jobs']['Row']>;
    Relationships: [];
  };
  job_skills: {
    Row: {
      id: string;
      job_id: string;
      skill_id: string;
      requirement_level: RequirementLevel;
    };
    Insert: Partial<Tables['job_skills']['Row']> & { job_id: string; skill_id: string };
    Update: Partial<Tables['job_skills']['Row']>;
    Relationships: [];
  };
  favorites: {
    Row: {
      id: string;
      user_id: string;
      job_id: string;
      created_at: string;
    };
    Insert: Partial<Tables['favorites']['Row']> & { user_id: string; job_id: string };
    Update: Partial<Tables['favorites']['Row']>;
    Relationships: [];
  };
  search_preferences: {
    Row: {
      id: string;
      user_id: string;
      professional_area: string | null;
      employment_types: string[];
      modality: string[];
      technologies: string[];
      location: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Partial<Tables['search_preferences']['Row']> & { user_id: string };
    Update: Partial<Tables['search_preferences']['Row']>;
    Relationships: [];
  };
  job_sources: {
    Row: {
      id: string;
      key: string;
      name: string;
      status: JobSourceStatus;
      last_synced_at: string | null;
      last_error: string | null;
      created_at: string;
    };
    Insert: Partial<Tables['job_sources']['Row']> & { key: string; name: string };
    Update: Partial<Tables['job_sources']['Row']>;
    Relationships: [];
  };
  job_search_history: {
    Row: {
      id: string;
      user_id: string;
      filters: Record<string, unknown>;
      results_count: number;
      created_at: string;
    };
    Insert: Partial<Tables['job_search_history']['Row']> & { user_id: string };
    Update: Partial<Tables['job_search_history']['Row']>;
    Relationships: [];
  };
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
