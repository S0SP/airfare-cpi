import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/config/database';
import { fareService } from '@/backend/services/fareService';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { origin, destination, airline } = body;
    
    if (!origin || !destination || !airline) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const data = await fareService.analyzeFare({ origin, destination, airline });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
