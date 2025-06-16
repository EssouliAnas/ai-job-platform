import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Define the ResumeData type
interface Education {
  institution: string;
  degree: string;
  date: string;
}

interface Experience {
  company: string;
  position: string;
  date: string;
  responsibilities: string[];
  achievements: string[];
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ResumeData {
  summary: string;
  contact: {
    name: string;
    title: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skills;
  certifications: string[];
  languages: string[];
  hobbies: string[];
}

/**
 * Generate and download a PDF version of the resume
 */
export const generatePDF = (resumeData: ResumeData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.contact.name, 20, 20);
  
  // Add job title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.contact.title, 20, 27);
  
  // Add summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 20, 37);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
  doc.text(summaryLines, 20, 42);
  
  // Calculate the y position after summary
  let yPos = 42 + (summaryLines.length * 5);
  
  // Add experience
  doc.setFont('helvetica', 'bold');
  doc.text('EXPERIENCE', 20, yPos + 5);
  yPos += 10;
  
  resumeData.experience.forEach(exp => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${exp.position} | ${exp.company}`, 20, yPos);
    doc.setFont('helvetica', 'italic');
    doc.text(exp.date, 20, yPos + 5);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Responsibilities:', 25, yPos);
    yPos += 5;
    
    exp.responsibilities.forEach(resp => {
      const respLines = doc.splitTextToSize(`• ${resp}`, 165);
      doc.text(respLines, 30, yPos);
      yPos += respLines.length * 5;
    });
    
    yPos += 2;
    doc.text('Achievements:', 25, yPos);
    yPos += 5;
    
    exp.achievements.forEach(achievement => {
      const achievementLines = doc.splitTextToSize(`• ${achievement}`, 165);
      doc.text(achievementLines, 30, yPos);
      yPos += achievementLines.length * 5;
    });
    
    yPos += 5;
  });
  
  // Add education
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 20, yPos);
  yPos += 5;
  
  resumeData.education.forEach(edu => {
    const eduLines = doc.splitTextToSize(`${edu.degree}, ${edu.institution} (${edu.date})`, 170);
    doc.setFont('helvetica', 'normal');
    doc.text(eduLines, 20, yPos);
    yPos += eduLines.length * 5 + 2;
  });
  
  // Add skills
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('SKILLS', 20, yPos);
  yPos += 5;
  
  // Technical skills
  doc.setFont('helvetica', 'italic');
  doc.text('Technical:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const technicalSkills = resumeData.skills.technical.join(', ');
  const techSkillLines = doc.splitTextToSize(technicalSkills, 170);
  doc.text(techSkillLines, 20, yPos + 5);
  yPos += techSkillLines.length * 5 + 5;
  
  // Soft skills
  doc.setFont('helvetica', 'italic');
  doc.text('Soft:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const softSkills = resumeData.skills.soft.join(', ');
  const softSkillLines = doc.splitTextToSize(softSkills, 170);
  doc.text(softSkillLines, 20, yPos + 5);
  yPos += softSkillLines.length * 5 + 5;
  
  // Add certifications if any
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    resumeData.certifications.forEach(cert => {
      const certLines = doc.splitTextToSize(`• ${cert}`, 170);
      doc.text(certLines, 20, yPos);
      yPos += certLines.length * 5;
    });
    yPos += 5;
  }
  
  // Add languages if any
  if (resumeData.languages && resumeData.languages.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('LANGUAGES', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    const languages = resumeData.languages.join(', ');
    doc.text(languages, 20, yPos);
    yPos += 10;
  }
  
  // Save the PDF
  doc.save(`${resumeData.contact.name.replace(/\s+/g, '_')}_Resume.pdf`);
};

/**
 * Generate and download a DOCX version of the resume
 */
export const generateDOCX = async (resumeData: ResumeData) => {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Name
          new Paragraph({
            text: resumeData.contact.name,
            heading: HeadingLevel.HEADING_1,
          }),
          
          // Title
          new Paragraph({
            text: resumeData.contact.title,
            heading: HeadingLevel.HEADING_2,
          }),
          
          // Summary
          new Paragraph({
            text: "SUMMARY",
            heading: HeadingLevel.HEADING_3,
            thematicBreak: true,
          }),
          new Paragraph({
            text: resumeData.summary,
          }),
          
          // Experience
          new Paragraph({
            text: "EXPERIENCE",
            heading: HeadingLevel.HEADING_3,
            thematicBreak: true,
            spacing: {
              before: 400,
            },
          }),
          
          // Experience items
          ...resumeData.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.position} | ${exp.company}`,
                  bold: true,
                }),
              ],
              spacing: {
                before: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.date,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              text: "Responsibilities:",
              spacing: {
                before: 100,
              },
            }),
            ...exp.responsibilities.map(
              resp => new Paragraph({
                text: `• ${resp}`,
                indent: {
                  left: 360,
                },
              })
            ),
            new Paragraph({
              text: "Achievements:",
              spacing: {
                before: 100,
              },
            }),
            ...exp.achievements.map(
              achievement => new Paragraph({
                text: `• ${achievement}`,
                indent: {
                  left: 360,
                },
              })
            ),
          ]),
          
          // Education
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_3,
            thematicBreak: true,
            spacing: {
              before: 400,
            },
          }),
          
          // Education items
          ...resumeData.education.map(edu => 
            new Paragraph({
              text: `${edu.degree}, ${edu.institution} (${edu.date})`,
              spacing: {
                before: 100,
              },
            })
          ),
          
          // Skills
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_3,
            thematicBreak: true,
            spacing: {
              before: 400,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Technical: ",
                italics: true,
              }),
              new TextRun({
                text: resumeData.skills.technical.join(", "),
              }),
            ],
            spacing: {
              before: 100,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Soft: ",
                italics: true,
              }),
              new TextRun({
                text: resumeData.skills.soft.join(", "),
              }),
            ],
            spacing: {
              before: 100,
            },
          }),
          
          // Certifications
          ...(resumeData.certifications && resumeData.certifications.length > 0 ? [
            new Paragraph({
              text: "CERTIFICATIONS",
              heading: HeadingLevel.HEADING_3,
              thematicBreak: true,
              spacing: {
                before: 400,
              },
            }),
            ...resumeData.certifications.map(cert => 
              new Paragraph({
                text: `• ${cert}`,
                spacing: {
                  before: 100,
                },
              })
            ),
          ] : []),
          
          // Languages
          ...(resumeData.languages && resumeData.languages.length > 0 ? [
            new Paragraph({
              text: "LANGUAGES",
              heading: HeadingLevel.HEADING_3,
              thematicBreak: true,
              spacing: {
                before: 400,
              },
            }),
            new Paragraph({
              text: resumeData.languages.join(", "),
              spacing: {
                before: 100,
              },
            }),
          ] : []),
        ],
      },
    ],
  });
  
  // Generate the document as a blob
  const blob = await Packer.toBlob(doc);
  
  // Save the document
  saveAs(blob, `${resumeData.contact.name.replace(/\s+/g, '_')}_Resume.docx`);
}; 