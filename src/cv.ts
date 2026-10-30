import cvJson from '../content/cv.json';

export interface Profile {
  name: string;
  firstName: string;
  headline: string;
  roles: string[];
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  github: string;
  specialty: string;
  owner: string;
  employeeCount: string;
  summary: string[];
  photoUrl?: string;
}

export interface SkillCategory {
  id?: string;
  title: string;
  icon: 'web' | 'apps' | 'ai' | 'automation';
  items: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  status: string;
  developer?: string;
  technologies: string[];
  features: string[];
  link?: string;
  github?: string;
}

export interface CVData {
  profile: Profile;
  skills: SkillCategory[];
  technologies: string[];
  projects: Project[];
  workEnvironment: string[];
  goal: string;
  targetFields: string[];
}

export const defaultCV = cvJson as CVData;

export function freshDefaultCV(): CVData {
  return JSON.parse(JSON.stringify(defaultCV)) as CVData;
}
