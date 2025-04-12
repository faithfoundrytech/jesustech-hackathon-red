import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import { getAuthenticatedUser } from '@/lib/auth';
import Staff from '@/models/Staff';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    // Get church ID from URL params
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get('churchId');
    
    if (!churchId) {
      return NextResponse.json({ error: "Church ID is required" }, { status: 400 });
    }
    
    // Connect to database
    await dbConnect();
    
    // Verify user has access to this church
    const staffRecord = await Staff.findOne({ 
      userId: user._id, 
      churchId,
      isActive: true
    });
    
    if (!staffRecord) {
      return NextResponse.json({ 
        error: "You don't have permission to view games for this church" 
      }, { status: 403 });
    }
    
    // Get specific game ID if provided or all pending games
    const gameId = searchParams.get('gameId');
    
    // Set up the base query with proper typing
    const query: Record<string, any> = { churchId };
    
    if (gameId) {
      query._id = gameId;
    } else {
      // If no specific game ID, get all recent games
      query.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }
    
    // Get games for this church
    const games = await Game.find(query)
      .select('_id title status createdAt pointsAvailable')
      .sort({ createdAt: -1 });
    
    // Filter to get pending games
    const pendingGames = games.filter(game => game.status === 'pending');
    
    return NextResponse.json({ 
      success: true,
      games,
      pendingGames
    });
    
  } catch (error: any) {
    console.error("Error fetching pending games:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
