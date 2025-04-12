import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {


    // Connect to the database
    await dbConnect();
    // Verify the user is authenticated
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }


    // Find the game and update its status
    const game = await Game.findById(gameId);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Only allow approving 'generated' games
    if (game.status !== 'generated') {
      return NextResponse.json(
        { error: 'Only games in generated status can be approved' }, 
        { status: 400 }
      );
    }

    // Update the game status to 'live'
    game.status = 'live';
    await game.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Game approved successfully',
      game: {
        id: game._id,
        title: game.title,
        status: game.status
      }
    });
    
  } catch (error) {
    console.error('Error approving game:', error);
    return NextResponse.json({ error: 'Failed to approve game' }, { status: 500 });
  }
}
