import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Game from '../../../models/Game';
import Church from '../../../models/Church';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';
import { IGame, SermonMetadata } from '@/models/Game';
import { IChurch } from '@/models/Church';

// Create consistent ObjectIds for dummy data
const createDummyId = (id: string) => {
  try {
    return new mongoose.Types.ObjectId(id.padStart(24, '0'));
  } catch (e) {
    return new mongoose.Types.ObjectId();
  }
};

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user using our helper
    const user = await getAuthenticatedUser();
    
    await dbConnect();
  // Create consistent church IDs for dummy data
  const church1Id = createDummyId("church1");
  const church2Id = createDummyId("church2");
  
    // Get all games with 'live' or 'generated' status
    let games = await Game.find({ 
      status: { $in: ['live', 'generated'] } 
    }).lean();

    // If no games found, return dummy data
    if (games.length === 0) {
      logger.info('api/games', 'No games found in database, returning dummy data');
      
    
      const dummyGames = [
        {
          _id: createDummyId("game1"),
          churchId: church1Id,
          creatorId: user._id,
          title: "Faith Foundations",
          description: "Test your knowledge on the foundations of faith",
          metadata: {
            title: "Faith Foundations Sermon",
            preacher: "Pastor John",
            date: new Date("2023-08-15"),
            mainVerses: ["John 3:16", "Romans 8:28"]
          },
          pointsAvailable: 100,
          status: "live",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: createDummyId("game2"),
          churchId: church1Id,
          creatorId: user._id,
          title: "Sermon on the Mount",
          description: "Learn about Jesus' famous teachings",
          metadata: {
            title: "The Sermon on the Mount",
            preacher: "Pastor Sarah",
            date: new Date("2023-08-22"),
            mainVerses: ["Matthew 5:1-12"]
          },
          pointsAvailable: 150,
          status: "live",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: createDummyId("game3"),
          churchId: church2Id,
          creatorId: user._id,
          title: "Parables of Jesus",
          description: "Explore the powerful stories Jesus told",
          metadata: {
            title: "Understanding Parables",
            preacher: "Pastor Mike",
            date: new Date("2023-08-10"),
            mainVerses: ["Luke 15:11-32"]
          },
          pointsAvailable: 120,
          status: "live",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      games = dummyGames as any;
    }

    // Get all unique church IDs from the games
    const churchIds = [...new Set(games.map(game => game.churchId))];

    // Get church details for all these IDs
    let churches = await Church.find({
      _id: { $in: churchIds }
    }).lean();

    // If no churches found, return dummy data
    if (churches.length === 0) {
      logger.info('api/games', 'No churches found in database, returning dummy data');
      
      
      const dummyChurches = [
        {
          _id: church1Id,
          name: "Grace Community Church",
          location: "Seattle, WA",
          description: "A vibrant church focused on community and faith",
          imageUrl: "https://placehold.co/400x200/FFF8F1/2F2F5D?text=Grace+Church",
          creatorId: user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: church2Id,
          name: "Hope Fellowship",
          location: "Portland, OR",
          description: "Building hope through Christ",
          imageUrl: "https://placehold.co/400x200/C5FAD5/2F2F5D?text=Hope+Fellowship",
          creatorId: user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      churches = dummyChurches as any;
    }

    // Convert IDs to strings for easier frontend consumption
    const formattedGames = games.map(game => ({
      ...game,
      _id: game._id.toString(),
      churchId: game.churchId.toString(),
      creatorId: game.creatorId.toString()
    }));

    const formattedChurches = churches.map(church => ({
      ...church,
      _id: church._id.toString(),
      creatorId: church.creatorId.toString()
    }));

    return NextResponse.json({
      games: formattedGames,
      churches: formattedChurches
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}