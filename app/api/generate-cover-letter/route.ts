import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { personalInfo, jobInfo, userBackground } = await request.json();

    if (!personalInfo || !jobInfo) {
      return NextResponse.json(
        { error: 'Personal info and job info are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Generate a professional cover letter with the following information:

Personal Information:
- Name: ${personalInfo.fullName}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- Address: ${personalInfo.address}

Job Information:
- Position: ${jobInfo.position}
- Company: ${jobInfo.company}
- Hiring Manager: ${jobInfo.hiringManager || 'Hiring Manager'}
- Job Source: ${jobInfo.jobSource || 'job search'}

User Background: ${userBackground}

Please generate a cover letter with these 4 sections:
1. Introduction paragraph - Express interest in the position and mention how you found it
2. Body paragraph 1 - Highlight relevant experience, skills, and achievements
3. Body paragraph 2 - Explain why you want to work for this specific company and how you can contribute
4. Closing paragraph - Thank them and express enthusiasm for next steps

Make it professional, engaging, and tailored to the specific position and company. Each paragraph should be substantial but concise.

Return the response in this exact JSON format:
{
  "introduction": "...",
  "bodyParagraph1": "...",
  "bodyParagraph2": "...",
  "closing": "..."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career counselor and expert cover letter writer. Generate compelling, personalized cover letters that help candidates stand out."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let coverLetter;
    try {
      coverLetter = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract content manually
      console.log('JSON parsing failed, attempting manual extraction');
      
      // Fallback: create a basic structure if parsing fails
      coverLetter = {
        introduction: `I am writing to express my strong interest in the ${jobInfo.position} position at ${jobInfo.company}. ${jobInfo.jobSource ? `I discovered this opportunity through ${jobInfo.jobSource} and` : ''} I am excited about the possibility of contributing to your team.`,
        bodyParagraph1: `With my background and experience, I believe I would be a valuable addition to your organization. My skills and dedication make me well-suited for this role, and I am eager to bring my expertise to help ${jobInfo.company} achieve its goals.`,
        bodyParagraph2: `I am particularly drawn to ${jobInfo.company} because of its reputation and commitment to excellence. I am confident that my passion and skills align well with your company's values and objectives, and I would welcome the opportunity to contribute to your continued success.`,
        closing: `Thank you for considering my application. I would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${jobInfo.company}. I look forward to hearing from you soon.\n\nSincerely,\n${personalInfo.fullName}`
      };
    }

    return NextResponse.json({
      success: true,
      coverLetter: coverLetter
    });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate cover letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 