export type JobPosting = {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salary_range?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  companies?: {
    name: string;
  };
};

export type JobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string;
  cover_letter_url?: string;
  status: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WAITLIST';
  created_at: string;
  updated_at: string;
  matching_score?: number;
  candidate_name?: string;
  resume_id?: string;
  users?: {
    email: string;
  };
};

export type User = {
  id: string;
  email: string;
  user_type: 'individual' | 'company';
  company_id?: string;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}; 