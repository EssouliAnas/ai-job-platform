import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { section, content, context } = await request.json();

    let prompt = '';
    let systemMessage = 'You are a professional resume expert and career counselor. Provide enhanced, professional content that is natural, compelling, and tailored to job market expectations.';

    switch (section) {
      case 'summary':
        prompt = `
Enhance this professional summary to be more compelling and professional:

Current Summary: "${content}"

Context:
- Name: ${context.fullName || 'Professional'}
- Experience Level: ${context.experienceCount || 0} positions
- Education: ${context.educationLevel || 'Not specified'}
- Key Skills: ${context.topSkills || 'Various skills'}

Please provide an enhanced professional summary that:
1. Is 2-3 sentences long
2. Uses strong, action-oriented language
3. Highlights key value propositions
4. Is tailored to modern job market expectations
5. Sounds natural and professional

Return only the enhanced summary text, no additional formatting or explanations.
`;
        break;

      case 'experience':
        prompt = `
Enhance this work experience description to be more impactful and professional:

Current Description: "${content}"

Position Context:
- Job Title: ${context.position || 'Professional Role'}
- Company: ${context.company || 'Company'}
- Duration: ${context.duration || 'Time period'}

Please provide an enhanced description that:
1. Uses strong action verbs
2. Includes quantifiable achievements where possible
3. Highlights key responsibilities and accomplishments
4. Uses professional, industry-appropriate language
5. Is formatted as bullet points (use • for bullets)
6. Sounds natural and authentic

Return only the enhanced description text, no additional formatting or explanations.
`;
        break;

      case 'education':
        prompt = `
Enhance this education description to be more compelling and relevant:

Current Description: "${content}"

Education Context:
- Degree: ${context.degree || 'Degree'}
- Field: ${context.field || 'Field of Study'}
- School: ${context.school || 'Institution'}
- GPA: ${context.gpa || 'Not specified'}

Please provide an enhanced description that:
1. Highlights relevant coursework, projects, or achievements
2. Connects education to career goals and skills
3. Uses professional language
4. Emphasizes practical applications and learning outcomes
5. Sounds natural and authentic

Return only the enhanced description text, no additional formatting or explanations.
`;
        break;

      case 'skills':
        prompt = `
Enhance this skills overview to be more compelling and professional:

Current Skills Overview: "${content}"

Skills Context:
- Individual Skills: ${context.skillsList || 'Various technical skills'}
- Experience Level: ${context.experienceLevel || 'Professional level'}
- Industry Focus: ${context.industry || 'General professional'}

Please provide an enhanced skills overview that:
1. Showcases technical expertise and competencies
2. Uses professional, industry-appropriate language
3. Highlights both technical and soft skills
4. Demonstrates adaptability and continuous learning
5. Is concise but comprehensive (2-3 sentences)
6. Sounds natural and authentic

Return only the enhanced skills overview text, no additional formatting or explanations.
`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid section specified' },
          { status: 400 }
        );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedContent = completion.choices[0]?.message?.content;
    
    if (!enhancedContent) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ 
      enhancedContent: enhancedContent.trim(),
      section 
    });

  } catch (error) {
    console.error('Error enhancing section:', error);
    return NextResponse.json(
      { error: 'Failed to enhance section. Please try again.' },
      { status: 500 }
    );
  }
} 