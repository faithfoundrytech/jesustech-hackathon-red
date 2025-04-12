import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Church from '@/models/Church';
import User from '@/models/User';
import Staff from '@/models/Staff';
import Game from '@/models/Game';
import UserGame from '@/models/UserGame';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find the user by clerkId
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find churches where the user is either the creator or a staff member
    const ownedChurches = await Church.find({ creatorId: user._id }).lean();
    
    // Find churches where the user is a staff member
    const staffAssociations = await Staff.find({ userId: user._id }).lean();
    const staffChurchIds = staffAssociations.map(staff => staff.churchId);
    
    const staffChurches = await Church.find({
      _id: { $in: staffChurchIds },
      creatorId: { $ne: user._id } // Exclude churches they already own
    }).lean();
    
    // Combine both sets of churches
    const userChurches = [...ownedChurches, ...staffChurches];
    
    if (userChurches.length === 0) {
      return NextResponse.json({ churches: [] });
    }
    
    // Get analytics and games for each church
    const churchesWithData = await Promise.all(userChurches.map(async (church) => {
      // Count church members
      const usersCount = await User.countDocuments({ 
        primaryChurchId: church._id 
      });
      
      // Count games played
      const gamesPlayedCount = await UserGame.countDocuments({ 
        churchId: church._id 
      });
      
      // Count total games
      const totalGamesCount = await Game.countDocuments({ 
        churchId: church._id 
      });
      
      // Get games list
      const games = await Game.find({ 
        churchId: church._id 
      })
      .select('_id title status createdAt pointsAvailable')
      .sort({ createdAt: -1 })
      .lean();
      
      // Mock shop items count
      const shopItemsCount = 8;
      
      return {
        ...church,
        metrics: {
          usersCount,
          gamesPlayedCount,
          totalGamesCount,
          shopItemsCount
        },
        games
      };
    }));

    return NextResponse.json({
      churches: churchesWithData
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch churches' },
      { status: 500 }
    );
  }
} 