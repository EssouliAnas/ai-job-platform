import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json();
    const { personalInfo, experiences, education, skills, skillsDescription } = resumeData;

    // Create document sections
    const sections = [];

    // Header with personal information
    const headerParagraphs = [
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName || 'Your Name',
            bold: true,
            size: 32,
            color: '2563eb', // Blue color
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ];

    // Contact information
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(`📧 ${personalInfo.email}`);
    if (personalInfo.phone) contactInfo.push(`📞 ${personalInfo.phone}`);
    if (personalInfo.location) contactInfo.push(`📍 ${personalInfo.location}`);
    if (personalInfo.website) contactInfo.push(`🌐 ${personalInfo.website}`);

    if (contactInfo.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' • '),
              size: 20,
              color: '6b7280', // Gray color
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    sections.push(...headerParagraphs);

    // Professional Summary
    if (personalInfo.summary) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL SUMMARY',
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          border: {
            bottom: {
              color: '2563eb',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: personalInfo.summary,
              size: 22,
              color: '374151',
            }),
          ],
          spacing: { after: 300 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    // Work Experience
    if (experiences.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'WORK EXPERIENCE',
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          border: {
            bottom: {
              color: '2563eb',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      experiences.forEach((exp: any) => {
        // Job title and company
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position || 'Position',
                bold: true,
                size: 22,
                color: '1f2937',
              }),
              new TextRun({
                text: ` • ${exp.company || 'Company'}`,
                size: 22,
                color: '374151',
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        // Duration
        const duration = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: duration,
                italics: true,
                size: 20,
                color: '6b7280',
              }),
            ],
            spacing: { after: 150 },
          })
        );

        // Description
        if (exp.description) {
          const descriptionLines = exp.description.split('\n').filter((line: string) => line.trim());
          descriptionLines.forEach((line: string) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.startsWith('•') ? line : `• ${line}`,
                    size: 20,
                    color: '374151',
                  }),
                ],
                spacing: { after: 100 },
                indent: { left: 360 },
              })
            );
          });
        }

        sections.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          })
        );
      });
    }

    // Education
    if (education.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EDUCATION',
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          border: {
            bottom: {
              color: '2563eb',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      education.forEach((edu: any) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree || 'Degree'} in ${edu.field || 'Field'}`,
                bold: true,
                size: 22,
                color: '1f2937',
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: edu.school || 'School/University',
                size: 20,
                color: '374151',
              }),
              new TextRun({
                text: ` • ${edu.graduationDate || 'Graduation Date'}`,
                italics: true,
                size: 20,
                color: '6b7280',
              }),
            ],
            spacing: { after: edu.gpa ? 100 : 200 },
          })
        );

        if (edu.gpa) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  size: 20,
                  color: '6b7280',
                }),
              ],
              spacing: { after: edu.description ? 100 : 200 },
            })
          );
        }

        // Education description
        if (edu.description) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.description,
                  size: 20,
                  color: '374151',
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 360 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      });
    }

    // Skills
    if (skills.length > 0 || skillsDescription) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SKILLS',
              bold: true,
              size: 24,
              color: '1f2937',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          border: {
            bottom: {
              color: '2563eb',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      // Skills description
      if (skillsDescription) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: skillsDescription,
                size: 20,
                color: '374151',
              }),
            ],
            spacing: { after: skills.length > 0 ? 200 : 300 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }

      // Group skills by level
      if (skills.length > 0) {
        const skillsByLevel: { [key: string]: string[] } = {};
        skills.forEach((skill: any) => {
          const level = skill.level || 'Intermediate';
          if (!skillsByLevel[level]) {
            skillsByLevel[level] = [];
          }
          skillsByLevel[level].push(skill.name);
        });

        Object.entries(skillsByLevel).forEach(([level, skillNames]) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${level}: `,
                  bold: true,
                  size: 20,
                  color: '1f2937',
                }),
                new TextRun({
                  text: skillNames.join(', '),
                  size: 20,
                  color: '374151',
                }),
              ],
              spacing: { after: 150 },
            })
          );
        });
      }
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: 'Calibri',
              size: 22,
            },
            paragraph: {
              spacing: {
                line: 240,
              },
            },
          },
        },
      },
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the document as a downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${(personalInfo.fullName || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}_resume.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json(
      { error: 'Failed to generate DOCX. Please try again.' },
      { status: 500 }
    );
  }
} 