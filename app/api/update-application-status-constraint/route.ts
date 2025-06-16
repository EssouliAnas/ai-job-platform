import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    console.log('Updating job_applications status constraint to include WAITLIST...');

    // Drop the existing constraint and create a new one with WAITLIST
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop the existing constraint
        ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS status_check;
        
        -- Add the new constraint with WAITLIST
        ALTER TABLE job_applications ADD CONSTRAINT status_check 
        CHECK (status IN ('NEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WAITLIST'));
      `
    });

    if (error) {
      console.error('Error updating constraint:', error);
      return NextResponse.json(
        { error: 'Failed to update status constraint', details: error.message },
        { status: 500 }
      );
    }

    console.log('Successfully updated job_applications status constraint');

    return NextResponse.json({
      success: true,
      message: 'Status constraint updated to include WAITLIST'
    });

  } catch (error) {
    console.error('Error in update-application-status-constraint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 