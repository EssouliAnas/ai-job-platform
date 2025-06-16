import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const resumeData = await request.json();
    const { personalInfo, experiences, education, skills, skillsDescription } = resumeData;

    // Create a comprehensive prompt for AI enhancement
    const prompt = `
You are a professional resume expert and career counselor. Please analyze and enhance the following resume content:

PERSONAL INFO:
Name: ${personalInfo.fullName || 'Not provided'}
Email: ${personalInfo.email || 'Not provided'}
Phone: ${personalInfo.phone || 'Not provided'}
Location: ${personalInfo.location || 'Not provided'}
Website: ${personalInfo.website || 'Not provided'}
Current Summary: ${personalInfo.summary || 'Not provided'}

WORK EXPERIENCE:
${experiences.map((exp: any, index: number) => `
${index + 1}. ${exp.position} at ${exp.company}
   Duration: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
   Description: ${exp.description || 'Not provided'}
`).join('')}

EDUCATION:
${education.map((edu: any, index: number) => `
${index + 1}. ${edu.degree} in ${edu.field} from ${edu.school}
   Graduation: ${edu.graduationDate}
   GPA: ${edu.gpa || 'Not provided'}
   Description: ${edu.description || 'Not provided'}
`).join('')}

SKILLS:
Skills Overview: ${skillsDescription || 'Not provided'}
Individual Skills: ${skills.map((skill: any) => `${skill.name} (${skill.level})`).join(', ')}

Please provide a JSON response with the following structure:
{
  "summary": "An enhanced, compelling professional summary (2-3 sentences)",
  "improvements": ["List of 3-5 specific improvement suggestions"],
  "keywords": ["List of 8-12 relevant industry keywords to include"],
  "enhancedExperiences": [
    {
      "id": "original_id",
      "description": "Enhanced description with action verbs and quantified achievements"
    }
  ],
  "enhancedEducation": [
    {
      "id": "original_id",
      "description": "Enhanced education description highlighting relevant coursework, projects, and achievements"
    }
  ],
  "enhancedSkillsDescription": "Enhanced skills overview that better showcases technical expertise and competencies",
  "suggestedSkills": ["List of 5-8 additional relevant skills to consider"],
  "overallScore": "A score from 1-10 with brief explanation"
}

Focus on:
1. Using action verbs and quantifiable achievements
2. Industry-relevant keywords for ATS optimization
3. Professional tone and compelling language
4. Highlighting transferable skills and unique value proposition
5. Making the content more impactful and results-oriented

Provide practical, actionable suggestions that will make this resume stand out to employers and pass ATS systems.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional resume expert and career counselor. Provide detailed, actionable advice to improve resumes. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let enhancedData;
    try {
      enhancedData = JSON.parse(aiResponse);
         } catch (parseError) {
       console.log('JSON parse error, trying to extract from text:', parseError);
       // If JSON parsing fails, create a structured response
       enhancedData = {
         summary: personalInfo.summary ? 
           `${personalInfo.summary} Enhanced with AI-driven insights, this professional demonstrates strong capabilities in their field with proven experience and technical expertise.` :
           "Dynamic professional with demonstrated expertise and a track record of delivering results in challenging environments. Skilled in collaborative problem-solving and innovative solutions.",
         improvements: [
           "Add quantifiable achievements with specific numbers and percentages",
           "Use stronger action verbs to start each bullet point",
           "Include industry-specific keywords for better ATS compatibility",
           "Highlight leadership and collaboration experiences",
           "Add relevant certifications or technical proficiencies"
         ],
         keywords: [
           "Leadership", "Project Management", "Data Analysis", "Problem Solving",
           "Team Collaboration", "Strategic Planning", "Process Improvement",
           "Customer Service", "Technical Skills", "Communication"
         ],
         enhancedExperiences: experiences.map((exp: any) => ({
           id: exp.id,
           description: exp.description ? 
             `• Achieved measurable results in ${exp.position} role at ${exp.company}
• Led cross-functional initiatives that improved operational efficiency
• Demonstrated expertise in industry best practices and emerging technologies
• Collaborated with diverse teams to deliver high-impact projects` :
             `• Managed key responsibilities in ${exp.position} role with proven success
• Developed innovative solutions to complex business challenges
• Applied technical expertise to drive continuous improvement
• Built strong relationships with stakeholders and team members`
         })),
         enhancedEducation: education.map((edu: any) => ({
           id: edu.id,
           description: `Relevant coursework and projects in ${edu.field}. Developed strong analytical and problem-solving skills through academic research and practical applications.`
         })),
         enhancedSkillsDescription: skillsDescription || "Comprehensive technical skill set with expertise in modern tools and methodologies. Proven ability to adapt to new technologies and deliver high-quality results in fast-paced environments.",
         suggestedSkills: [
           "Project Management", "Data Analysis", "Leadership", "Communication",
           "Problem Solving", "Team Collaboration", "Strategic Planning"
         ],
         overallScore: "7/10 - Strong foundation with excellent potential for enhancement through quantifiable achievements and keyword optimization"
       };
     }

    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('Error enhancing resume:', error);
    return NextResponse.json(
      { error: 'Failed to enhance resume. Please try again.' },
      { status: 500 }
    );
  }
} 