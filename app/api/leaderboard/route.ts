import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Points from '@/models/Points';
import Game from '@/models/Game';
import UserGame from '@/models/UserGame';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/utils/logger';
import mongoose, { PipelineStage } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    const churchId = searchParams.get('churchId');
    const type = searchParams.get('type') || 'all-time'; // all-time, monthly, weekly, game
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    await dbConnect();
    
    let pipeline: PipelineStage[] = [];
    let userRank: number | null = null;
    
    if (type === 'game' && gameId) {
      // Game-specific leaderboard
      pipeline = [
        {
          $match: {
            gameId: new mongoose.Types.ObjectId(gameId),
            status: 'completed'
          }
        },
        {
          $sort: { score: -1, timeSpentSeconds: 1 }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            score: 1,
            timeSpentSeconds: 1,
            completedAt: 1,
            userId: '$user._id',
            userName: '$user.name',
            userEmail: '$user.email',
            userImage: '$user.profileImageUrl'
          }
        }
      ];
      
      // Find the user's rank for this game
      const userGame = await UserGame.findOne({ 
        userId: user._id, 
        gameId,
        status: 'completed'
      });
      
      if (userGame) {
        const betterScores = await UserGame.countDocuments({
          gameId,
          status: 'completed',
          $or: [
            { score: { $gt: userGame.score } },
            { 
              score: userGame.score, 
              timeSpentSeconds: { $lt: userGame.timeSpentSeconds || Number.MAX_VALUE }
            }
          ]
        });
        
        userRank = betterScores + 1;
      }
    } else {
      // Points-based leaderboard (all-time, monthly, weekly)
      let timeFilter = {};
      
      if (type === 'monthly') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        timeFilter = { createdAt: { $gte: oneMonthAgo } };
      } else if (type === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        timeFilter = { createdAt: { $gte: oneWeekAgo } };
      }
      
      // Add church filter if provided
      const churchFilter = churchId ? { churchId: new mongoose.Types.ObjectId(churchId) } : {};
      
      // Aggregate points
      pipeline = [
        {
          $match: {
            transactionType: 'earned',
            ...timeFilter,
            ...churchFilter
          }
        },
        {
          $group: {
            _id: '$userId',
            totalPoints: { $sum: '$amount' },
            lastEarned: { $max: '$createdAt' }
          }
        },
        {
          $sort: { totalPoints: -1, lastEarned: 1 }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userName: '$user.name',
            userEmail: '$user.email',
            userImage: '$user.profileImageUrl',
            points: '$totalPoints',
            lastEarned: 1
          }
        }
      ];
      
      // Find the user's rank
      if (type === 'all-time') {
        const userDb = await User.findById(user._id);
        if (userDb) {
          const betterUsers = await User.countDocuments({
            totalPoints: { $gt: userDb.totalPoints }
          });
          userRank = betterUsers + 1;
        }
      } else {
        // For weekly or monthly, aggregate points earned in that period
        const pointsAggregation = await Points.aggregate([
          {
            $match: {
              userId: user._id,
              transactionType: 'earned',
              ...timeFilter,
              ...churchFilter
            }
          },
          {
            $group: {
              _id: null,
              totalPoints: { $sum: '$amount' }
            }
          }
        ]);
        
        const userPoints = pointsAggregation.length > 0 ? pointsAggregation[0].totalPoints : 0;
        
        if (userPoints > 0) {
          const betterPointsCount = await Points.aggregate([
            {
              $match: {
                transactionType: 'earned',
                ...timeFilter,
                ...churchFilter
              }
            },
            {
              $group: {
                _id: '$userId',
                totalPoints: { $sum: '$amount' }
              }
            },
            {
              $match: {
                totalPoints: { $gt: userPoints }
              }
            },
            {
              $count: 'betterCount'
            }
          ]);
          
          userRank = betterPointsCount.length > 0 ? betterPointsCount[0].betterCount + 1 : 1;
        }
      }
    }
    
    // Apply pagination
    const countPipeline = [...pipeline];
    
    // Add pagination to the leaderboard pipeline
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    // Execute the aggregation
    let leaderboard;
    let totalUsers;
    
    if (type === 'game' && gameId) {
      leaderboard = await UserGame.aggregate(pipeline);
      totalUsers = await UserGame.countDocuments({
        gameId: new mongoose.Types.ObjectId(gameId),
        status: 'completed'
      });
    } else {
      leaderboard = await Points.aggregate(pipeline);
      
      // Count total unique users with points
      const uniqueUsersCount = await Points.aggregate([
        {
          $match: {
            transactionType: 'earned'
          }
        },
        {
          $group: {
            _id: '$userId'
          }
        },
        {
          $count: 'total'
        }
      ]);
      
      totalUsers = uniqueUsersCount.length > 0 ? uniqueUsersCount[0].total : 0;
    }
    
    return NextResponse.json({
      leaderboard,
      userRank,
      total: totalUsers,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
