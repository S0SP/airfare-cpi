import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/database';
import { runMockScraper } from '@/backend/services/scraperService';

export async function POST() {
  try {
    await connectDB();
    const data = await runMockScraper();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
