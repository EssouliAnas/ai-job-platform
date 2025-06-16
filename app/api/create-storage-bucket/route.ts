import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with admin key for bucket creation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Check if the bucket already exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (getBucketsError) {
      return NextResponse.json(
        { error: 'Failed to list buckets', details: getBucketsError },
        { status: 500 }
      );
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'resumes');
    
    if (bucketExists) {
      return NextResponse.json({ 
        message: 'Resumes bucket already exists',
        buckets
      });
    }
    
    // Create a new bucket
    const { data, error } = await supabase
      .storage
      .createBucket('resumes', {
        public: true,
        fileSizeLimit: 10485760, // 10MB in bytes
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create bucket', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Storage bucket "resumes" created successfully',
      data
    });
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 