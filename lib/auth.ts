import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { logger } from '@/utils/logger';

/**
 * Authentication helper for API routes
 * Returns the authenticated user or throws a 401 response
 * @returns MongoDB user document for the authenticated user
 */
export async function getAuthenticatedUser() {
  // Get the Clerk user ID
  const { userId } = await auth();
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Connect to database
  await dbConnect();

  // Find the user in the database by clerk ID
  let user = await User.findOne({ clerkId: userId });

  // If no user found by clerkId, try to find by email
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
      // Try to match by email
      user = await User.findOne({
        email: clerkUser.emailAddresses[0].emailAddress,
      });

      // If found, update the clerkId
      if (user) {
        let wasUpdated = false;
        if (user.clerkId !== userId) {
          user.clerkId = userId;
          wasUpdated = true;
        }
        if (user.name !== `${clerkUser.firstName} ${clerkUser.lastName}`) {
          user.name = `${clerkUser.firstName} ${clerkUser.lastName}`;
          wasUpdated = true;
        }
        await user.save();
        if (wasUpdated) {
          logger.info('auth lib clerk', 'User updated', { userId, wasUpdated });
        }
      } else {
        user = await User.create({
          clerkId: userId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress,
          name: `${clerkUser?.firstName} ${clerkUser?.lastName}`,
          image: clerkUser?.imageUrl,
        });
      }
    }
  }

  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  return user;
}