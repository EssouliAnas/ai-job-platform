import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection and storage permissions
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets',
        details: bucketsError
      }, { status: 500 });
    }
    
    // Check if the resumes bucket exists
    const resumesBucket = buckets.find(bucket => bucket.name === 'resumes');
    
    if (!resumesBucket) {
      return NextResponse.json({
        success: false,
        error: 'Resumes bucket does not exist',
        message: 'Please visit /api/create-storage-bucket to create it'
      }, { status: 404 });
    }
    
    // Test uploading a small test file
    const testFile = new Uint8Array([0, 1, 2, 3, 4]);
    const testFileName = `test_${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('resumes')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to upload test file',
        details: uploadError
      }, { status: 500 });
    }
    
    // Clean up the test file
    const { error: deleteError } = await supabase
      .storage
      .from('resumes')
      .remove([testFileName]);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase storage is configured correctly',
      buckets: buckets.map(b => b.name),
      testUpload: uploadData ? 'success' : 'failed',
      testDelete: deleteError ? 'failed' : 'success'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error testing Supabase',
      details: error.message || String(error)
    }, { status: 500 });
  }
} 