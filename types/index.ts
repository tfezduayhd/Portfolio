export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
  role: string;
  problem: string;
  process: string;
  solution: string;
  impact: string;
  liveUrl?: string;
  githubUrl?: string;
  year: number;
}

export interface LabItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
  component?: string; // name of the lazy-loaded component
  year: number;
}
