import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { jobId, description, requiredSkills } = await req.json();

    // Get all applications for this job
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select(`
        id,
        resume_url,
        cover_letter_url,
        users (
          email
        )
      `)
      .eq('job_id', jobId);

    if (applicationsError) throw applicationsError;

    // For each application, analyze resume and calculate matching score
    const updatedApplications = await Promise.all(
      applications.map(async (application) => {
        try {
          // Get resume text content
          const resumeText = await getResumeText(application.resume_url);
          let coverLetterText = '';
          
          if (application.cover_letter_url) {
            coverLetterText = await getResumeText(application.cover_letter_url);
          }
          
          // Use GPT to analyze the match
          const matchingScore = await analyzeMatch(
            description,
            requiredSkills,
            resumeText,
            coverLetterText
          );

          // Update the application with the matching score
          const { error: updateError } = await supabase
            .from('job_applications')
            .update({ matching_score: matchingScore })
            .eq('id', application.id);

          if (updateError) throw updateError;

          return { ...application, matching_score: matchingScore };
        } catch (err) {
          console.error(`Error processing application ${application.id}:`, err);
          return application;
        }
      })
    );

    return NextResponse.json({ success: true, data: updatedApplications });
  } catch (error: any) {
    console.error('Error matching candidates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getResumeText(fileUrl: string): Promise<string> {
  try {
    // Get the file from Supabase storage
    const response = await fetch(fileUrl);
    const fileBuffer = await response.arrayBuffer();
    const fileType = fileUrl.split('.').pop()?.toLowerCase();

    // Use appropriate parser based on file type
    switch (fileType) {
      case 'pdf':
        return parsePDF(fileBuffer);
      case 'docx':
        return parseDOCX(fileBuffer);
      case 'doc':
        return parseDOC(fileBuffer);
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}

async function analyzeMatch(
  jobDescription: string,
  requiredSkills: string[],
  resumeText: string,
  coverLetterText: string = ''
): Promise<number> {
  try {
    const prompt = `
      You are an expert recruiter. Analyze how well the candidate's resume and cover letter match the job requirements.
      
      Job Description:
      ${jobDescription}
      
      Required Skills:
      ${requiredSkills.join(', ')}
      
      Resume:
      ${resumeText}
      
      ${coverLetterText ? `Cover Letter:\n${coverLetterText}` : ''}
      
      Analyze the match based on:
      1. Required skills match (40% weight)
      2. Experience relevance (30% weight)
      3. Overall qualification fit (20% weight)
      4. Communication and presentation (10% weight)
      
      For each category:
      1. Assign a score from 0-100
      2. Provide brief justification
      
      Return the weighted average score as a number between 0 and 100.
      Format your response as JSON with the following structure:
      {
        "skillsMatch": {
          "score": number,
          "justification": string
        },
        "experienceRelevance": {
          "score": number,
          "justification": string
        },
        "qualificationFit": {
          "score": number,
          "justification": string
        },
        "communication": {
          "score": number,
          "justification": string
        },
        "finalScore": number
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0].message.content || "{}");
    return Math.round(response.finalScore || 0);
  } catch (error) {
    console.error('Error analyzing match:', error);
    return 0;
  }
}

// Import these functions from your PDF parsing library
async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  // TODO: Implement PDF parsing
  return "Sample PDF text";
}

async function parseDOCX(buffer: ArrayBuffer): Promise<string> {
  // TODO: Implement DOCX parsing
  return "Sample DOCX text";
}

async function parseDOC(buffer: ArrayBuffer): Promise<string> {
  // TODO: Implement DOC parsing
  return "Sample DOC text";
} 