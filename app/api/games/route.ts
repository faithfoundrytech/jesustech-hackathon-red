import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/dbConnect';
import Game from '../../../models/Game';
import Church from '../../../models/Church';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all games with 'live' or 'generated' status
    const games = await Game.find({ 
      status: { $in: ['live', 'generated'] } 
    }).lean();

    // Get all unique church IDs from the games
    const churchIds = [...new Set(games.map(game => game.churchId))];

    // Get church details for all these IDs
    const churches = await Church.find({
      _id: { $in: churchIds }
    }).lean();

    return NextResponse.json({
      games,
      churches
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}