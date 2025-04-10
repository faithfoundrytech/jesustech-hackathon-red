import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { helloWorldTask } from "../../../src/trigger/example";

export async function POST() {
  try {
    const result = await tasks.trigger<typeof helloWorldTask>('hello-world', {});
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error triggering task:', error);
    return NextResponse.json({ success: false, error: 'Failed to trigger task' }, { status: 500 });
  }
}
