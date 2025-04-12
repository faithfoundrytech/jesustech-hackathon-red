import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import { getAuthenticatedUser } from '@/lib/auth';
import { createQuestionsTask } from '@/src/trigger/create-questions';
import Staff from '@/models/Staff';
import mongoose from 'mongoose';
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    // Parse the request body
    const data = await req.json();
    const { 
      title, 
      description, 
      uploadMethod, 
      sermonText, 
      documentName, 
      mediaFileName, 
      videoUrl, 
      instructionsText, 
      seriesTheme,
      authors
    } = data;
    
    // Connect to the database
    await dbConnect();
    
    // Verify user has permission for this church
    const staffRecord = await Staff.findOne({ 
      userId: user._id, 
      isActive: true
    });
    
    if (!staffRecord) {
      return NextResponse.json(
        { error: "You don't have permission to create games for this church" }, 
        { status: 403 }
      );
    }

    const churchId = staffRecord.churchId;
    
    // Prepare sermon metadata based on upload method
    const sermonMetadata: any = {
      title: title || "Untitled Sermon",
      theme: seriesTheme || undefined,
      preacher: authors || undefined
    };
    
    // Add sermon content based on upload method
    if (uploadMethod === 'text' && sermonText) {
      sermonMetadata.sermonText = sermonText;
    } else if (uploadMethod === 'youtube' && videoUrl) {
      sermonMetadata.sermonUrl = videoUrl;
    } else if (uploadMethod === 'document' && documentName) {
      sermonMetadata.sermonUrl = documentName; // This would be the URL to the document in a real implementation
    } else if (uploadMethod === 'media' && mediaFileName) {
      sermonMetadata.sermonUrl = mediaFileName; // This would be the URL to the media in a real implementation
    }
    
    // Create a new game document
    const game = await Game.create({
      churchId: churchId,
      creatorId: user._id,
      title: title || "Untitled Sermon Game",
      description: description || undefined,
      metadata: sermonMetadata,
      status: 'pending',
      pointsAvailable: 0 // Points will be set when questions are generated
    });
    
    // Get the actual sermon content to send to the AI
    let sermonContent = '';
    if (uploadMethod === 'text' && sermonText) {
      sermonContent = sermonText;
    } else if (uploadMethod === 'youtube' && videoUrl) {
      // In a real implementation, you might fetch and transcribe the video
      sermonContent = `Video URL: ${videoUrl}\n\nPlease extract key themes, verses, and questions from this video.`;
    } else if (uploadMethod === 'document' && documentName) {
      // In a real implementation, you might extract text from the document
      sermonContent = `Document: ${documentName}\n\nPlease extract key themes, verses, and questions from this document.`;
    } else if (uploadMethod === 'media' && mediaFileName) {
      // In a real implementation, you might transcribe the audio
      sermonContent = `Media file: ${mediaFileName}\n\nPlease extract key themes, verses, and questions from this audio file.`;
    }
    
    // Trigger the question generation task
    const handle = await createQuestionsTask.trigger({
      gameId: game._id.toString(),
      instructions: instructionsText || "",
      churchId: churchId.toString(),
      uploadMethod,
      sermonContent
    });
    
    console.log("Question generation task triggered with handle", handle.id);
    
    // Return success response with the created game
    return NextResponse.json({
      success: true,
      game: {
        _id: game._id,
        title: game.title,
        status: game.status,
        createdAt: game.createdAt
      }
    });
    
  } catch (error: any) {
    console.error("Error creating game:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to create sermon game" }, 
      { status: 500 }
    );
  }
}

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
    
    // Get pending games for this church
    const pendingGames = await Game.find({ 
      churchId,
      status: 'pending'
    }).select('_id title status createdAt').sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true,
      pendingGames 
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
