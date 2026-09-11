import { NextResponse } from 'next/server';
import connectDB from '@/backend/config/database';
import { fareService } from '@/backend/services/fareService';

export async function GET() {
  try {
    await connectDB();
    const data = fareService.getAirlines();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
