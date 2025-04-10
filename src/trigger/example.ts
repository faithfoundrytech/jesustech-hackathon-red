import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { python } from "@trigger.dev/python";

export const helloWorldTask = task({
  id: "hello-world",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });
    const result = await python.runScript("./python/test.py", []);
    console.log(result);

    return result;
  },
});