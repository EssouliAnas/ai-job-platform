This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### AI Resume Analysis

The platform offers AI-powered resume analysis:

1. Upload your existing resume (PDF, DOC, or DOCX format)
2. Our AI will analyze your resume and provide detailed feedback on:
   - Overall score and quality assessment
   - Section-by-section breakdown (Contact, Summary, Experience, Education, Skills)
   - Missing important elements
   - Specific improvement suggestions
   - Grammar and tone assessment

To use this feature:
- Navigate to the Resume Review page
- Upload your resume file or drag and drop it
- Wait for the AI analysis to complete
- Review the detailed feedback
- Use our Resume Builder to create an improved version based on the feedback

### Setup Requirements

To enable the AI resume analysis feature:
1. Set up a Supabase project and add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
2. Obtain an OpenAI API key and add it as `OPENAI_API_KEY`
3. Visit `/api/create-storage-bucket` once to create the required storage bucket

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
