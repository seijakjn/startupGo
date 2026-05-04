import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, subcategory } = await req.json();

    if (role !== 'rider') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        subcategory, // 'fetch_me', 'food', or 'parcel'
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
