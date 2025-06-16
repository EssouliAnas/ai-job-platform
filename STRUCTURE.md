# AI Job Platform - Project Structure & Documentation

## 🏗️ Project Overview
A comprehensive AI-powered job platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase. The platform serves both job seekers and companies with advanced AI features for resume building, job matching, and application management.

## 📁 Project Structure

```
ai-job-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── apply-job/           # Job application submission
│   │   ├── check-and-create-tables/ # Database table management
│   │   ├── check-env/           # Environment validation
│   │   ├── create-storage-bucket/ # Supabase storage setup
│   │   ├── enhance-resume/      # AI resume enhancement
│   │   ├── export-docx/         # Resume DOCX export
│   │   ├── generate-cover-letter/ # AI cover letter generation
│   │   ├── generate-docx/       # DOCX document generation
│   │   ├── generate-resume/     # Resume generation
│   │   ├── jobs/               # Job listings API
│   │   ├── match-candidates/    # Company candidate matching
│   │   ├── match-jobs/         # Job matching for candidates
│   │   ├── my-applications/    # User applications API
│   │   ├── reset-database/     # Database reset utility
│   │   ├── reset-policies/     # RLS policies reset
│   │   ├── resume-analysis/    # Resume analysis API
│   │   ├── resumes/           # Resume CRUD operations
│   │   ├── seed-jobs/         # Job seeding utility
│   │   ├── setup-database/    # Database initialization
│   │   ├── setup-recruitment/ # Recruitment setup
│   │   ├── setup-test-data/   # Test data generation
│   │   ├── setup-users/       # User setup utility
│   │   └── supabase-test/     # Supabase connection test
│   ├── admin/                  # Admin dashboard
│   ├── auth/                   # Authentication pages
│   ├── company/               # Company dashboard & management
│   ├── contact/               # Contact page
│   ├── cover-letter/          # Cover letter generator
│   ├── dashboard/             # Main user dashboard
│   ├── features/              # Features showcase
│   ├── job-match/             # Job matching interface
│   ├── jobs/                  # Job listings & details
│   │   └── [id]/             # Individual job pages
│   ├── pricing/               # Pricing page
│   ├── resume-ai-export/      # AI resume export
│   ├── resume-builder/        # Interactive resume builder
│   ├── resume-upload/         # Resume upload interface
│   ├── saved-resumes/         # Saved resumes management
│   ├── setup/                 # Initial setup wizard
│   ├── sign-in/               # Sign in page
│   ├── sign-up/               # Sign up page
│   ├── templates/             # Resume templates
│   ├── components/            # Shared React components
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── lib/                       # Utilities & configurations
│   ├── pdf/                  # PDF processing utilities
│   ├── supabase/             # Supabase client configuration
│   └── types.ts              # TypeScript type definitions
├── public/                    # Static assets
├── supabase/                  # Supabase configuration
├── DATABASE_SETUP.md          # Database setup instructions
├── middleware.ts              # Next.js middleware
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies & scripts
└── README.md                 # Project documentation
```

## 🚀 Key Features

### 1. **AI-Powered Resume Builder**
- **Location**: `/app/resume-builder/`
- **Features**:
  - Multi-section form (Personal Info, Experience, Education, Skills)
  - Real-time preview with professional formatting
  - AI enhancement using OpenAI GPT-4
  - DOCX export functionality
  - Auto-save with localStorage
  - Completion validation before AI features
- **APIs**: `/api/enhance-resume/`, `/api/generate-docx/`

### 2. **Intelligent Job Matching**
- **Location**: `/app/job-match/`, `/app/dashboard/`
- **Features**:
  - AI-powered job matching using OpenAI
  - Fallback algorithm-based matching
  - Match score calculation
  - Detailed match reasoning
  - One-click job applications
- **APIs**: `/api/match-jobs/`, `/api/apply-job/`

### 3. **Job Application System**
- **Features**:
  - Apply to jobs directly from dashboard
  - Application status tracking
  - Duplicate application prevention
  - Company application management
- **APIs**: `/api/apply-job/`, `/api/my-applications/`

### 4. **Company Dashboard**
- **Location**: `/app/company/`
- **Features**:
  - Job posting management
  - Application tracking
  - Candidate matching
  - Application status updates
- **APIs**: `/api/jobs/`, `/api/match-candidates/`

### 5. **Authentication & User Management**
- **Location**: `/app/auth/`, `/app/sign-in/`, `/app/sign-up/`
- **Features**:
  - Supabase Auth integration
  - User type differentiation (individual/company)
  - Protected routes via middleware
- **Middleware**: `middleware.ts`

## 🗄️ Database Schema

### Core Tables
- **users**: User profiles and authentication
- **companies**: Company information and profiles
- **job_postings**: Job listings with requirements
- **job_applications**: Application submissions and tracking
- **resumes**: Resume data and AI feedback

### Key Relationships
- Users → Companies (many-to-one for company employees)
- Job Postings → Companies (many-to-one)
- Job Applications → Users & Job Postings (many-to-one each)
- Resumes → Users (many-to-one)

## 🔧 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
- **Next.js API Routes**: Server-side logic

### AI & Document Processing
- **OpenAI GPT-4**: AI enhancement and matching
- **docx**: Word document generation
- **jsPDF**: PDF generation
- **mammoth**: Word document parsing
- **pdfjs-dist**: PDF parsing

### Form & File Handling
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **React Dropzone**: File upload interface
- **file-saver**: File download utility

## 🔑 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

## 🛠️ API Endpoints

### Resume Management
- `GET/POST /api/resumes` - Resume CRUD operations
- `POST /api/enhance-resume` - AI resume enhancement
- `POST /api/generate-docx` - DOCX generation
- `POST /api/resume-analysis` - Resume analysis

### Job Management
- `GET /api/jobs` - Job listings with filtering
- `POST /api/jobs` - Create new job posting
- `POST /api/seed-jobs` - Seed sample jobs

### Application System
- `POST /api/apply-job` - Submit job application
- `GET /api/my-applications` - User's applications

### AI Features
- `POST /api/match-jobs` - AI job matching
- `POST /api/match-candidates` - Company candidate matching
- `POST /api/generate-cover-letter` - AI cover letter

### Database Management
- `POST /api/setup-database` - Initialize database
- `POST /api/check-and-create-tables` - Table management
- `POST /api/reset-database` - Reset database

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Blue primary (#3B82F6), professional grays
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Responsive grid system with mobile-first approach
- **Components**: Reusable UI components with consistent styling

### User Experience
- **Loading States**: Animated loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation with clear feedback
- **Progressive Enhancement**: Features unlock as user completes sections

## 🔒 Security Features

### Authentication
- Supabase Auth with email/password
- Protected routes via middleware
- User session management

### Database Security
- Row Level Security (RLS) policies
- User-specific data access
- Company-scoped permissions

### API Security
- Server-side validation
- Environment variable protection
- Rate limiting considerations

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for medium screens
- **Desktop Enhancement**: Full-featured desktop experience
- **Touch-Friendly**: Appropriate touch targets and interactions

## 🚀 Deployment

### Vercel Configuration
- **Platform**: Deployed on Vercel
- **Build Command**: `npm run build`
- **Environment Variables**: Configured in Vercel dashboard
- **Domain**: Custom domain support

### Performance Optimizations
- Next.js automatic optimizations
- Image optimization
- Code splitting
- Static generation where applicable

## 🧪 Development Workflow

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting

### Code Quality
- ESLint configuration
- TypeScript strict mode
- Consistent code formatting
- Component-based architecture

## 📈 Future Enhancements

### Planned Features
- Advanced search and filtering
- Real-time notifications
- Video interview scheduling
- Skills assessment integration
- Analytics dashboard
- Mobile app development

### Technical Improvements
- Performance monitoring
- Error tracking
- Automated testing
- CI/CD pipeline
- Database optimization

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database setup
5. Start development server: `npm run dev`

### Code Standards
- Follow TypeScript best practices
- Use consistent naming conventions
- Write descriptive commit messages
- Test new features thoroughly

---

**Last Updated**: December 2024
**Version**: 0.1.0
**Maintainer**: Development Team 