import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { createQuestionsTask } from "../../../src/trigger/create-questions";

export async function GET() {
  try {
    const result = await tasks.trigger<typeof createQuestionsTask>('create-questions', {
      gameId: 'test-game-id',
      instructions: 'Test instructions',
      churchId: 'test-church-id',
      uploadMethod: 'text',
      sermonContent: 'Test sermon content'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Task triggered successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error triggering task:', error);
    return NextResponse.json({ success: false, error: 'Failed to trigger task' }, { status: 500 });
  }
}
