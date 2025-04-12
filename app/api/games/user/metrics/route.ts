import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserGame from "@/models/UserGame";
import Points from "@/models/Points";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get the MongoDB user ID that corresponds to the Clerk user ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Use the MongoDB user ID to find games and points
    const gamesCount = await UserGame.countDocuments({
      userId: user._id,
    });
    
    // Get user's points balance
    let pointsBalance = 0;
    try {
      pointsBalance = await Points.getUserBalance(user._id.toString());
    } catch (error) {
      console.error("Error fetching points:", error);
      // Default to 0 if there's an error or no points found
    }
    
    // Return metrics
    return NextResponse.json({
      gamesCount,
      pointsBalance
    });
    
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user metrics" },
      { status: 500 }
    );
  }
}
