import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import Church from '@/models/Church';
import Staff from '@/models/Staff';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST() {
  try {
    // Get authenticated user
   
    
    // Connect to database
    await dbConnect();

    const user = await User.findOne({ email: 'iangwaig@gmail.com' });
    if (!user) {
      throw new Error('User not found');
    }
    // Hardcoded church data
    const churchData = {
      name: "Jesus Tech Hackaton",
      location: "123 Main St, City, State",
      description: "A welcoming community of believers",
      creatorId: user._id,
      imageUrl: "/jesus-tech-hackathon.png"
    };

    // Create the church
    const church = await Church.create(churchData);

    // Create staff entry for the creator as pastor
    const staffData = {
      userId: user._id,
      churchId: church._id,
      role: 'pastor',
      title: 'Senior Pastor',
      permissions: ['manage_church', 'manage_staff', 'manage_sermons'],
      isActive: true,
      joinedAt: new Date()
    };

    await Staff.create(staffData);

    // Update user's primary church
    user.primaryChurchId = church._id;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      church,
      message: "Church created successfully" 
    });

  } catch (error: any) {
    console.error('Error creating church:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
