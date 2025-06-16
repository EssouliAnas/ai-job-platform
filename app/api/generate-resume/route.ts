import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { resumeData } = await request.json()

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `Based on the following resume data, generate a professional, well-structured resume content. Make it compelling, well-formatted, and highlight achievements quantitatively where possible.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please generate:
1. A compelling professional summary (2-3 sentences)
2. Enhanced work experience descriptions with quantified achievements
3. Improved education section formatting
4. Optimized skills presentation
5. Overall content improvements for ATS compatibility

Return the response as a JSON object with the same structure as the input but with enhanced content.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer with expertise in creating compelling resumes that pass ATS systems and attract hiring managers. Focus on quantifiable achievements, action verbs, and industry-specific keywords."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const enhancedResume = completion.choices[0]?.message?.content

    if (!enhancedResume) {
      throw new Error('Failed to generate enhanced resume')
    }

    // Try to parse as JSON, fallback to structured text
    let parsedResume
    try {
      parsedResume = JSON.parse(enhancedResume)
    } catch {
      // If not valid JSON, return as enhanced text content
      parsedResume = {
        ...resumeData,
        aiEnhanced: true,
        enhancedContent: enhancedResume
      }
    }

    return NextResponse.json({
      success: true,
      enhancedResume: parsedResume
    })

  } catch (error: any) {
    console.error('Error generating resume:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume', details: error.message },
      { status: 500 }
    )
  }
} 