import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, paragraphType, jobInfo } = await request.json();

    if (!text || !paragraphType) {
      return NextResponse.json(
        { error: 'Text and paragraph type are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let prompt = '';
    const jobContext = jobInfo ? `for a ${jobInfo.position} position at ${jobInfo.company}` : '';

    switch (paragraphType) {
      case 'introduction':
        prompt = `Enhance this cover letter introduction paragraph ${jobContext}. Make it more engaging, professional, and compelling while maintaining the core message. Keep it concise but impactful:

Original: "${text}"

Enhanced version:`;
        break;
      
      case 'bodyParagraph1':
        prompt = `Enhance this cover letter body paragraph about experience and skills ${jobContext}. Make it more specific, quantifiable, and compelling. Focus on achievements and relevant qualifications:

Original: "${text}"

Enhanced version:`;
        break;
      
      case 'bodyParagraph2':
        prompt = `Enhance this cover letter body paragraph about company interest ${jobContext}. Make it more specific about why the candidate wants to work for this company and how they can contribute:

Original: "${text}"

Enhanced version:`;
        break;
      
      case 'closing':
        prompt = `Enhance this cover letter closing paragraph ${jobContext}. Make it more professional, confident, and action-oriented while maintaining appropriate courtesy:

Original: "${text}"

Enhanced version:`;
        break;
      
      default:
        prompt = `Enhance this cover letter paragraph ${jobContext}. Make it more professional, engaging, and compelling:

Original: "${text}"

Enhanced version:`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career counselor and expert cover letter writer. Enhance cover letter paragraphs to be more compelling, specific, and professional while maintaining the original intent and tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim();
    
    if (!enhancedText) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({
      success: true,
      enhancedText: enhancedText
    });

  } catch (error) {
    console.error('Error enhancing paragraph:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enhance paragraph',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 