import type { EmploymentType, Level, RemoteModality } from './database';

/** Perfil do candidato usado como entrada do algoritmo de match. */
export interface CandidateProfile {
  professionalArea: string | null;
  level: Level | null;
  employmentTypes: EmploymentType[];
  modality: RemoteModality[];
  location: string | null;
  technologies: string[];
  interests: string[];
  experience: string | null;
  education: string | null;
}

export interface ParsedResumeData {
  name: string | null;
  education: string[];
  experiences: ParsedExperience[];
  technologies: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  certifications: string[];
  spokenLanguages: string[];
  projects: string[];
  links: string[];
  skills: string[];
}

export interface ParsedExperience {
  company: string | null;
  role: string | null;
  period: string | null;
  description: string | null;
}
