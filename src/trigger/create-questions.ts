import { logger, task } from "@trigger.dev/sdk/v3";
import mongoose from 'mongoose';
import Game from '@/models/Game';
import dbConnect from '@/lib/dbConnect';
import { generateQuestions, saveGeneratedQuestions } from '@/lib/openai';

interface CreateQuestionsPayload {
  gameId: string;
  instructions: string;
  churchId: string;
  uploadMethod: string;
  sermonContent: string;
}

// Fun messages to show during processing
const progressMessages = [
  "Reading the Word...",
  "Reflecting on the sermon...",
  "Discerning key insights...",
  "Crafting amazing questions...",
  "Finding biblical connections...",
  "Seeking divine inspiration...",
  "Connecting scripture dots...",
  "Pondering the meaning...",
  "Creating meaningful challenges...",
  "Making learning fun..."
];

export const createQuestionsTask = task({
  id: "create-questions",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: CreateQuestionsPayload, { ctx }) => {
    logger.log("Starting question creation process", { payload });
    
    try {
      // Connect to the database
      await dbConnect();
      
      // Get the game from the database
      const game = await Game.findById(payload.gameId);
      
      if (!game) {
        throw new Error(`Game not found: ${payload.gameId}`);
      }
      
      logger.log("Found game", { gameId: game._id, title: game.title });
      
      // Log initial status
      logger.log(progressMessages[0], { step: 1, total: progressMessages.length });
      
      // Process sermon content in steps
      let currentStep = 1;
      const logNextStep = () => {
        if (currentStep < progressMessages.length) {
          logger.log(progressMessages[currentStep], { 
            step: currentStep + 1, 
            total: progressMessages.length 
          });
          currentStep++;
        }
      };
      
      // Log several steps to show progress
      logNextStep(); // Step 2
      
      // Generate questions using OpenAI
      logger.log("Generating questions using AI...", { gameId: game._id.toString() });
      logNextStep(); // Step 3
      
      const generatedQuestions = await generateQuestions(
        game,
        payload.sermonContent,
        payload.instructions
      );
      
      // Ensure questions were generated
      if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error('Failed to generate valid questions');
      }
      
      logNextStep(); // Step 4
      logger.log("Questions generated successfully", { count: generatedQuestions.length });
      
      // Save questions to database
      logNextStep(); // Step 5
      logger.log("Saving questions to database...");
      
      const result = await saveGeneratedQuestions(
        payload.gameId,
        generatedQuestions
      );
      
      // Log remaining steps to complete the progress bar
      while (currentStep < progressMessages.length) {
        logNextStep();
        // Small pause between logs
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      logger.log("Game updated with generated questions", { 
        gameId: game._id, 
        status: 'generated',
        pointsAvailable: result.game.pointsAvailable,
        questionsCount: result.questions.length
      });
      
      return {
        success: true,
        gameId: game._id.toString(),
        status: 'generated',
        pointsAvailable: result.game.pointsAvailable,
        questionsCount: result.questions.length
      };
    } catch (error: any) {
      logger.error("Error processing sermon content", { error: error.message });
      
      // Handle errors by updating the game status
      try {
        // If connection failed above, try again
        if (!mongoose.connection.readyState) {
          await dbConnect();
        }
        
        const game = await Game.findById(payload.gameId);
        if (game) {
          game.status = 'rejected';
          await game.save();
          logger.log("Updated game status to rejected due to error", { gameId: payload.gameId });
        }
      } catch (updateError) {
        logger.error("Failed to update game status after error", { error: updateError });
      }
      
      throw error;
    }
  },
});