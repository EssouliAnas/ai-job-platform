import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function calculateBasicMatchScore(resumeData: any, job: any): number {
  const userSkills = resumeData.skills.map((skill: any) => skill.name.toLowerCase());
  const jobRequirements = job.requirements.map((req: string) => req.toLowerCase());
  
  // Calculate skill overlap
  const matchingSkills = userSkills.filter((skill: string) => 
    jobRequirements.some((req: string) => 
      req.includes(skill) || skill.includes(req)
    )
  );
  
  // Calculate experience relevance
  let experienceScore = 0;
  const jobTitleLower = job.title.toLowerCase();
  const userExperiences = resumeData.experiences || [];
  
  userExperiences.forEach((exp: any) => {
    const positionLower = (exp.position || '').toLowerCase();
    if (positionLower.includes('developer') && jobTitleLower.includes('developer')) {
      experienceScore += 30;
    } else if (positionLower.includes('engineer') && jobTitleLower.includes('engineer')) {
      experienceScore += 30;
    } else if (positionLower.includes('manager') && jobTitleLower.includes('manager')) {
      experienceScore += 30;
    } else if (positionLower.includes('designer') && jobTitleLower.includes('designer')) {
      experienceScore += 30;
    } else if (positionLower.includes('analyst') && jobTitleLower.includes('analyst')) {
      experienceScore += 30;
    }
  });
  
  // Calculate education relevance
  let educationScore = 0;
  const userEducation = resumeData.education || [];
  userEducation.forEach((edu: any) => {
    const fieldLower = (edu.field || '').toLowerCase();
    if (fieldLower.includes('computer') || fieldLower.includes('software') || fieldLower.includes('engineering')) {
      if (jobTitleLower.includes('developer') || jobTitleLower.includes('engineer')) {
        educationScore += 20;
      }
    } else if (fieldLower.includes('design') && jobTitleLower.includes('designer')) {
      educationScore += 20;
    } else if (fieldLower.includes('business') && jobTitleLower.includes('manager')) {
      educationScore += 20;
    } else if (fieldLower.includes('data') || fieldLower.includes('statistics')) {
      if (jobTitleLower.includes('analyst') || jobTitleLower.includes('data')) {
        educationScore += 20;
      }
    }
  });
  
  // Base score calculation
  const skillScore = Math.min((matchingSkills.length / jobRequirements.length) * 50, 50);
  const totalScore = Math.min(skillScore + Math.min(experienceScore, 30) + Math.min(educationScore, 20), 100);
  
  return Math.round(totalScore);
}

function getMatchReasons(resumeData: any, job: any): string[] {
  const reasons: string[] = [];
  const userSkills = resumeData.skills.map((skill: any) => skill.name.toLowerCase());
  const jobRequirements = job.requirements.map((req: string) => req.toLowerCase());
  
  const matchingSkills = userSkills.filter((skill: string) => 
    jobRequirements.some((req: string) => 
      req.includes(skill) || skill.includes(req)
    )
  );
  
  if (matchingSkills.length > 0) {
    reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
  }
  
  const jobTitleLower = job.title.toLowerCase();
  const userExperiences = resumeData.experiences || [];
  
  const relevantExp = userExperiences.find((exp: any) => {
    const positionLower = (exp.position || '').toLowerCase();
    return (positionLower.includes('developer') && jobTitleLower.includes('developer')) ||
           (positionLower.includes('engineer') && jobTitleLower.includes('engineer')) ||
           (positionLower.includes('manager') && jobTitleLower.includes('manager')) ||
           (positionLower.includes('designer') && jobTitleLower.includes('designer')) ||
           (positionLower.includes('analyst') && jobTitleLower.includes('analyst'));
  });
  
  if (relevantExp) {
    reasons.push(`Relevant experience as ${relevantExp.position}`);
  }
  
  return reasons;
}

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json();
    const { personalInfo, experiences, education, skills } = resumeData;

    // Get jobs from database
    const supabase = createRouteHandlerClient({ cookies });
    const { data: jobsData, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          name,
          industry,
          location,
          website
        )
      `)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform jobs to match expected format
    const jobs = jobsData?.map(job => ({
      id: job.id,
      title: job.title,
      company: job.companies?.name || 'Unknown Company',
      location: job.location,
      salary: job.salary_range || 'Competitive',
      type: job.job_type?.replace('_', '-').toLowerCase() || 'full-time',
      description: job.description,
      requirements: job.required_skills || [],
      posted: job.created_at?.split('T')[0] || ''
    })) || [];

    if (!process.env.OPENAI_API_KEY || jobs.length === 0) {
      // If no OpenAI key or no jobs, fall back to basic matching
      const matchedJobs = jobs
        .map((job: any) => ({
          ...job,
          matchScore: calculateBasicMatchScore(resumeData, job),
          matchReasons: getMatchReasons(resumeData, job),
          canApply: true
        }))
        .filter((job: any) => job.matchScore > 20)
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, 10);

      return NextResponse.json({ jobs: matchedJobs });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create AI prompt for enhanced job matching
    const prompt = `
You are an AI job matching expert. Analyze this resume and match it with the following job postings.

RESUME DATA:
Name: ${personalInfo.fullName || 'Not provided'}
Summary: ${personalInfo.summary || 'Not provided'}

Work Experience:
${experiences.map((exp: any, index: number) => `
${index + 1}. ${exp.position} at ${exp.company}
   Duration: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
   Description: ${exp.description || 'Not provided'}
`).join('')}

Education:
${education.map((edu: any, index: number) => `
${index + 1}. ${edu.degree} in ${edu.field} from ${edu.school}
   Graduation: ${edu.graduationDate}
`).join('')}

Skills:
${skills.map((skill: any) => `${skill.name} (${skill.level})`).join(', ')}

AVAILABLE JOBS:
${jobs.map((job: any, index: number) => `
${index + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Salary: ${job.salary}
   Description: ${job.description}
   Requirements: ${job.requirements.join(', ')}
`).join('')}

For each job, provide a match score (0-100) and reasons why it matches or doesn't match. Focus on:
1. Skill alignment with job requirements
2. Experience relevance to the role
3. Education background fit
4. Career progression potential
5. Location preferences if any

Respond with a JSON array of the top matching jobs (minimum score 25) in this format:
[
  {
    "jobId": "job_id_from_list",
    "matchScore": 85,
    "matchReasons": ["Strong React skills match", "Relevant experience in similar role"],
    "improvementSuggestions": ["Consider learning TypeScript", "Add more backend experience"]
  }
]

Sort by match score (highest first) and include only jobs with score >= 25.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor and job matching expert. Provide accurate, helpful job matching analysis. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    let aiMatches;
    try {
      aiMatches = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fall back to basic matching if AI response parsing fails
      const matchedJobs = jobs
        .map((job: any) => ({
          ...job,
          matchScore: calculateBasicMatchScore(resumeData, job),
          matchReasons: getMatchReasons(resumeData, job),
          canApply: true
        }))
        .filter((job: any) => job.matchScore > 20)
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, 10);

      return NextResponse.json({ jobs: matchedJobs });
    }

    // Combine AI analysis with job data
    const enhancedJobs = aiMatches
      .map((match: any) => {
        const job = jobs.find((j: any) => j.id === match.jobId);
        if (!job) return null;
        
        return {
          ...job,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons || [],
          improvementSuggestions: match.improvementSuggestions || [],
          canApply: true
        };
      })
      .filter((job: any) => job !== null)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    return NextResponse.json({ jobs: enhancedJobs });

  } catch (error) {
    console.error('Error finding matching jobs:', error);
    
    // Return empty jobs array on error
    return NextResponse.json({ 
      jobs: [],
      error: 'Failed to find matching jobs. Please try again.'
    });
  }
} 