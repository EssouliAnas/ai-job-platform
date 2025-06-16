import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export async function POST(request: NextRequest) {
  try {
    const { content, type, personalInfo } = await request.json()

    if (!content || !type) {
      return NextResponse.json({ error: 'Content and type are required' }, { status: 400 })
    }

    let doc: Document

    if (type === 'resume') {
      doc = await createResumeDocument(content, personalInfo)
    } else if (type === 'cover-letter') {
      doc = await createCoverLetterDocument(content, personalInfo)
    } else {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${personalInfo?.fullName || 'document'}_${type}.docx"`,
      },
    })

  } catch (error: any) {
    console.error('Error creating DOCX:', error)
    return NextResponse.json(
      { error: 'Failed to create DOCX document', details: error.message },
      { status: 500 }
    )
  }
}

async function createResumeDocument(resumeData: any, personalInfo: any): Promise<Document> {
  const children: Paragraph[] = []

  // Header with name and contact info
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo?.fullName || 'Your Name',
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
    })
  )

  // Contact information
  const contactInfo = [
    personalInfo?.email,
    personalInfo?.phone,
    personalInfo?.location,
    personalInfo?.website
  ].filter(Boolean).join(' | ')

  if (contactInfo) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo,
            size: 20,
          }),
        ],
      })
    )
  }

  children.push(new Paragraph({ text: '' })) // Empty line

  // Professional Summary
  if (resumeData.personalInfo?.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    )
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.summary,
            size: 20,
          }),
        ],
      })
    )
    children.push(new Paragraph({ text: '' }))
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    )

    resumeData.experience.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
            }),
          ],
        })
      )
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
              size: 20,
              italics: true,
            }),
          ],
        })
      )
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 20,
              }),
            ],
          })
        )
      }
      children.push(new Paragraph({ text: '' }))
    })
  }

  // Education
  if (resumeData.education?.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    )

    resumeData.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
            }),
          ],
        })
      )
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.school} | ${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
              size: 20,
              italics: true,
            }),
          ],
        })
      )
      children.push(new Paragraph({ text: '' }))
    })
  }

  // Skills
  if (resumeData.skills?.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    )
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.skills.join(', '),
            size: 20,
          }),
        ],
      })
    )
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })
}

async function createCoverLetterDocument(coverLetterData: any, personalInfo: any): Promise<Document> {
  const children: Paragraph[] = []

  // Header with name and contact info
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo?.fullName || 'Your Name',
          bold: true,
          size: 24,
        }),
      ],
    })
  )

  const contactInfo = [
    personalInfo?.email,
    personalInfo?.phone,
    personalInfo?.address
  ].filter(Boolean)

  contactInfo.forEach(info => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: info,
            size: 20,
          }),
        ],
      })
    )
  })

  children.push(new Paragraph({ text: '' })) // Empty line

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: new Date().toLocaleDateString(),
          size: 20,
        }),
      ],
    })
  )

  children.push(new Paragraph({ text: '' })) // Empty line

  // Addressee
  if (coverLetterData.jobInfo?.hiringManager || coverLetterData.jobInfo?.company) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: coverLetterData.jobInfo.hiringManager || 'Hiring Manager',
            size: 20,
          }),
        ],
      })
    )
    if (coverLetterData.jobInfo.company) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: coverLetterData.jobInfo.company,
              size: 20,
            }),
          ],
        })
      )
    }
    children.push(new Paragraph({ text: '' }))
  }

  // Cover letter content
  const contentSections = [
    coverLetterData.content?.introduction || coverLetterData.introduction,
    coverLetterData.content?.bodyParagraph1 || coverLetterData.bodyParagraph1,
    coverLetterData.content?.bodyParagraph2 || coverLetterData.bodyParagraph2,
    coverLetterData.content?.closing || coverLetterData.closing
  ].filter(Boolean)

  contentSections.forEach((section: string) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section,
            size: 20,
          }),
        ],
      })
    )
    children.push(new Paragraph({ text: '' }))
  })

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })
} 