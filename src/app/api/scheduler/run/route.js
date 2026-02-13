import { NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/scheduler';

export async function POST(request) {
  try {
    // Verify cron secret key (for security)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run all scheduled checks
    const results = await runAllChecks();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error running scheduler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
