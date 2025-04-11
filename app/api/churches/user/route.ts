import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '../../../../lib/dbConnect';
import Church from '../../../../models/Church';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find churches where the current user is the creator
    const churches = await Church.find({ 
      creatorId: userId 
    }).lean();

    return NextResponse.json({
      churches
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch churches' },
      { status: 500 }
    );
  }
} 