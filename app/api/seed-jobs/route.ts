import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // First, get or create a test company
    let { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'TechCorp Solutions')
      .single();

    if (companiesError || !companies) {
      // Create test company
      const { data: newCompany, error: createCompanyError } = await supabase
        .from('companies')
        .insert([{
          name: 'TechCorp Solutions',
          description: 'A leading technology company specializing in AI and software development',
          industry: 'Technology',
          size: '50-200',
          location: 'San Francisco, CA',
          website: 'https://techcorp.example.com'
        }])
        .select('id')
        .single();

      if (createCompanyError) {
        console.error('Error creating company:', createCompanyError);
        return NextResponse.json(
          { error: 'Failed to create test company' },
          { status: 500 }
        );
      }
      companies = newCompany;
    }

    const companyId = companies.id;

    // Create test job postings
    const testJobs = [
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for a Senior Software Engineer to join our team. You will be responsible for developing scalable web applications using React, Node.js, and modern technologies. Experience with cloud platforms and DevOps practices is preferred.',
        required_skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        location: 'San Francisco, CA',
        job_type: 'FULL_TIME',
        salary_range: '$120,000 - $160,000',
        company_id: companyId,
        status: 'PUBLISHED'
      },
      {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build beautiful and responsive user interfaces. You will work with React, TypeScript, and modern CSS frameworks to create amazing user experiences.',
        required_skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
        location: 'Remote',
        job_type: 'FULL_TIME',
        salary_range: '$80,000 - $120,000',
        company_id: companyId,
        status: 'PUBLISHED'
      },
      {
        title: 'Data Scientist',
        description: 'We are seeking a Data Scientist to analyze large datasets and build machine learning models. Experience with Python, SQL, and machine learning frameworks is required.',
        required_skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas'],
        location: 'New York, NY',
        job_type: 'FULL_TIME',
        salary_range: '$100,000 - $140,000',
        company_id: companyId,
        status: 'PUBLISHED'
      },
      {
        title: 'UX Designer',
        description: 'Looking for a creative UX Designer to design intuitive and engaging user experiences. You will work closely with product managers and developers to create user-centered designs.',
        required_skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Wireframing'],
        location: 'Los Angeles, CA',
        job_type: 'FULL_TIME',
        salary_range: '$85,000 - $115,000',
        company_id: companyId,
        status: 'PUBLISHED'
      },
      {
        title: 'DevOps Engineer',
        description: 'Join our DevOps team to build and maintain our cloud infrastructure. Experience with Docker, Kubernetes, and CI/CD pipelines is essential.',
        required_skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
        location: 'Seattle, WA',
        job_type: 'FULL_TIME',
        salary_range: '$110,000 - $150,000',
        company_id: companyId,
        status: 'PUBLISHED'
      },
      {
        title: 'Product Manager',
        description: 'We are looking for a Product Manager to drive product strategy and roadmap. You will work with cross-functional teams to deliver amazing products.',
        required_skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Communication'],
        location: 'Austin, TX',
        job_type: 'FULL_TIME',
        salary_range: '$95,000 - $130,000',
        company_id: companyId,
        status: 'PUBLISHED'
      }
    ];

    // Check if jobs already exist
    const { data: existingJobs } = await supabase
      .from('job_postings')
      .select('id')
      .eq('company_id', companyId);

    if (existingJobs && existingJobs.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Test jobs already exist',
        count: existingJobs.length
      });
    }

    // Insert test jobs
    const { data: insertedJobs, error: insertError } = await supabase
      .from('job_postings')
      .insert(testJobs)
      .select('id, title');

    if (insertError) {
      console.error('Error inserting jobs:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test jobs', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test jobs created successfully',
      jobs: insertedJobs
    });

  } catch (error: any) {
    console.error('Error seeding jobs:', error);
    return NextResponse.json(
      { error: 'Failed to seed jobs', details: error.message },
      { status: 500 }
    );
  }
} 