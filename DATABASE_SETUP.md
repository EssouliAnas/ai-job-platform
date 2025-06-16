# AI Job Platform - Database Setup Guide

## Prerequisites
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to the SQL Editor (left sidebar)

## Step 1: Create Tables

Copy and paste the following SQL commands into the Supabase SQL Editor and run them:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'company')),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  content JSONB NOT NULL,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_range TEXT,
  company_id UUID NOT NULL REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  CONSTRAINT job_type_check CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP')),
  CONSTRAINT status_check CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED'))
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES job_postings(id),
  applicant_id UUID NOT NULL REFERENCES users(id),
  resume_url TEXT NOT NULL,
  cover_letter_url TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  matching_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT status_check CHECK (status IN ('NEW', 'SHORTLISTED', 'REJECTED', 'HIRED'))
);
```

## Step 2: Create Indexes

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
```

## Step 3: Create Update Triggers

```sql
-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Create User Management Function

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type)
  VALUES (NEW.id, NEW.email, 'individual')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
```

## Step 6: Create Security Policies (Fixed - No Infinite Recursion)

```sql
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view company profiles" ON companies;
DROP POLICY IF EXISTS "Users can manage their own company" ON companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Company admins can view company users" ON users;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;
DROP POLICY IF EXISTS "Public can view published jobs" ON job_postings;
DROP POLICY IF EXISTS "Company members can manage their jobs" ON job_postings;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON job_applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON job_applications;
DROP POLICY IF EXISTS "Company members can view applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Company members can manage applications for their jobs" ON job_applications;

-- Companies policies
CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Company users can update their company"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.company_id = companies.id 
      AND u.user_type = 'company'
    )
  );

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can manage their own resumes"
  ON resumes FOR ALL
  USING (user_id = auth.uid());

-- Job postings policies
CREATE POLICY "Anyone can view published jobs"
  ON job_postings FOR SELECT
  USING (status = 'PUBLISHED' OR auth.uid() IS NOT NULL);

CREATE POLICY "Company users can manage their jobs"
  ON job_postings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.company_id = job_postings.company_id 
      AND u.user_type = 'company'
    )
  );

-- Job applications policies
CREATE POLICY "Users can view their own applications"
  ON job_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Users can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Company users can view applications to their jobs"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN users u ON u.company_id = jp.company_id
      WHERE jp.id = job_applications.job_id
      AND u.id = auth.uid()
      AND u.user_type = 'company'
    )
  );

CREATE POLICY "Company users can update applications to their jobs"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN users u ON u.company_id = jp.company_id
      WHERE jp.id = job_applications.job_id
      AND u.id = auth.uid()
      AND u.user_type = 'company'
    )
  );
```

## Step 7: Create Storage Bucket (Optional)

Go to Storage in the Supabase dashboard and create a bucket named `resumes` with the following settings:
- Public: No
- File size limit: 10MB
- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

Or run this SQL:

```sql
-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false, 
  10485760, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 8: Create Test Data (Optional)

```sql
-- Create test company
INSERT INTO companies (name, description, industry, size, location, website)
VALUES (
  'TechCorp Solutions',
  'A leading technology company specializing in AI and software development',
  'Technology',
  '50-200',
  'San Francisco, CA',
  'https://techcorp.example.com'
) ON CONFLICT DO NOTHING;

-- Note: Test users will be created automatically through the signup flow
```

## Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## Verification

After running all the SQL commands:

1. Check that all tables are created in the Table Editor
2. Verify that Row Level Security is enabled
3. Test the setup by visiting `/setup` in your application
4. Create test accounts using the application's signup flow

## Next Steps

1. Visit your application at `http://localhost:3000`
2. Go to `/setup` to verify the database setup
3. Create test accounts or use the setup endpoint to create them
4. Start using the AI resume analysis features!

## Troubleshooting

- If you get permission errors, make sure RLS policies are correctly set up
- If tables don't appear, refresh the Supabase dashboard
- For storage issues, check that the bucket is created and policies are in place
- Verify your environment variables are correctly set
- If you get infinite recursion errors, make sure you've run the fixed policies from Step 6 