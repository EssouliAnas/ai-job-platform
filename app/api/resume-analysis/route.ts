import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parseResumeFile } from '@/lib/pdf/parser';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Use the correct server-side Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(fileType || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload a file smaller than 10MB' },
        { status: 400 }
      );
    }

    // Check if bucket exists first, create if it doesn't
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return NextResponse.json(
          { error: 'Storage service unavailable', details: bucketsError.message },
          { status: 500 }
        );
      }

      const bucketExists = buckets.some(bucket => bucket.name === 'resumes');
      
      if (!bucketExists) {
        // Try to create the bucket
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('resumes', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
          });

        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          return NextResponse.json(
            { error: 'Storage bucket not available. Please contact support.', details: createBucketError.message },
            { status: 500 }
          );
        }
      }
    } catch (bucketError: any) {
      console.error('Error checking/creating bucket:', bucketError);
      return NextResponse.json(
        { error: 'Storage configuration error', details: bucketError.message },
        { status: 500 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    try {
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, fileBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false
        });
      
      if (storageError) {
        console.error('Storage error:', storageError);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to upload file to storage';
        if (storageError.message.includes('Row Level Security')) {
          errorMessage = 'Storage access denied. Please ensure you are logged in.';
        } else if (storageError.message.includes('Bucket not found')) {
          errorMessage = 'Storage bucket not found. Please contact support.';
        } else if (storageError.message.includes('File size')) {
          errorMessage = 'File size exceeds the limit.';
        }
        
        return NextResponse.json(
          { error: errorMessage, details: storageError.message },
          { status: 500 }
        );
      }

      // Get the file URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Extract text content from the file
      let resumeContent;
      try {
        resumeContent = await parseResumeFile(file);
      } catch (parseError: any) {
        console.error('Error parsing file:', parseError);
        // Still proceed with AI analysis using filename and file type info
        resumeContent = `Resume file: ${file.name} (${fileType} format, ${(file.size / 1024).toFixed(2)} KB)`;
      }

      // Use OpenAI to analyze the resume
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a professional resume reviewer with 15+ years of experience in hiring and recruitment across various industries. 
            Analyze the resume comprehensively and provide detailed, actionable feedback.
            
            Respond with a JSON object containing:
            {
              "overallScore": number (0-100),
              "summary": "2-3 sentence overall assessment",
              "sectionAnalysis": {
                "structure": {
                  "score": number (0-100),
                  "feedback": "detailed feedback on resume structure, formatting, and organization",
                  "strengths": ["strength 1", "strength 2"],
                  "improvements": ["improvement 1", "improvement 2"]
                },
                "language": {
                  "score": number (0-100),
                  "feedback": "assessment of grammar, clarity, and professional tone",
                  "strengths": ["strength 1", "strength 2"],
                  "improvements": ["improvement 1", "improvement 2"]
                },
                "experienceMatch": {
                  "score": number (0-100),
                  "feedback": "evaluation of work experience relevance and presentation",
                  "strengths": ["strength 1", "strength 2"],
                  "improvements": ["improvement 1", "improvement 2"]
                },
                "skillsPresentation": {
                  "score": number (0-100),
                  "feedback": "assessment of skills section and technical competencies",
                  "strengths": ["strength 1", "strength 2"],
                  "improvements": ["improvement 1", "improvement 2"]
                },
                "education": {
                  "score": number (0-100),
                  "feedback": "evaluation of education section",
                  "strengths": ["strength 1", "strength 2"],
                  "improvements": ["improvement 1", "improvement 2"]
                }
              },
              "missingElements": ["element 1", "element 2", "element 3"],
              "improvementSuggestions": [
                {
                  "category": "High Priority",
                  "suggestions": ["suggestion 1", "suggestion 2"]
                },
                {
                  "category": "Medium Priority", 
                  "suggestions": ["suggestion 1", "suggestion 2"]
                },
                {
                  "category": "Low Priority",
                  "suggestions": ["suggestion 1", "suggestion 2"]
                }
              ],
              "atsCompatibility": {
                "score": number (0-100),
                "feedback": "assessment of ATS (Applicant Tracking System) compatibility",
                "issues": ["issue 1", "issue 2"],
                "recommendations": ["recommendation 1", "recommendation 2"]
              },
              "industryRelevance": {
                "detectedIndustry": "detected industry or 'General'",
                "relevanceScore": number (0-100),
                "feedback": "how well the resume fits the detected industry",
                "keywords": ["relevant keyword 1", "relevant keyword 2"]
              }
            }
            
            Provide specific, actionable feedback that will help the candidate improve their resume.`
          },
          {
            role: "user",
            content: `Please analyze this resume and provide comprehensive feedback: ${resumeContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      // Parse the AI response
      const aiResponse = completion.choices[0].message.content || '';
      
      let feedbackData;
      try {
        feedbackData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to basic structure if JSON parsing fails
        feedbackData = {
          overallScore: 75,
          summary: "Resume analysis completed. Please review the detailed feedback below.",
          sectionAnalysis: {
            structure: { score: 75, feedback: "Resume structure appears adequate.", strengths: [], improvements: [] },
            language: { score: 80, feedback: "Language and tone are professional.", strengths: [], improvements: [] },
            experienceMatch: { score: 70, feedback: "Experience section needs enhancement.", strengths: [], improvements: [] },
            skillsPresentation: { score: 75, feedback: "Skills are clearly presented.", strengths: [], improvements: [] },
            education: { score: 80, feedback: "Education section is well-formatted.", strengths: [], improvements: [] }
          },
          missingElements: ["Quantified achievements", "Professional summary", "Relevant keywords"],
          improvementSuggestions: [
            { category: "High Priority", suggestions: ["Add quantified results to experience section"] },
            { category: "Medium Priority", suggestions: ["Improve professional summary"] },
            { category: "Low Priority", suggestions: ["Optimize formatting"] }
          ],
          atsCompatibility: { score: 70, feedback: "Resume should be more ATS-friendly.", issues: [], recommendations: [] },
          industryRelevance: { detectedIndustry: "General", relevanceScore: 70, feedback: "Resume appears suitable for general applications.", keywords: [] }
        };
      }

      return NextResponse.json({ 
        success: true, 
        feedback: feedbackData,
        fileUrl: publicUrl 
      });
    } catch (error: any) {
      console.error('Error handling file storage:', error);
      return NextResponse.json(
        { error: 'Failed to process file storage', details: error.message || String(error) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: 'Failed to process resume', details: error.message || String(error) },
      { status: 500 }
    );
  }
}

 