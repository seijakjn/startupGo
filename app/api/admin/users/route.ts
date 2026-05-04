import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  const client = await clerkClient();
  
  // Verify requester is admin
  const requester = await client.users.getUser(userId!);
  if (requester.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch all users (paginated by default, but we'll fetch first 100)
  const users = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at'
  });

  return NextResponse.json({
    users: users.data.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.emailAddresses[0]?.emailAddress,
      role: u.publicMetadata?.role || 'user',
      createdAt: u.createdAt,
      imageUrl: u.imageUrl
    }))
  });
}

export async function PATCH(request: Request) {
  const { userId: requesterId } = await auth();
  const client = await clerkClient();

  // Verify requester is admin
  const requester = await client.users.getUser(requesterId!);
  if (requester.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { targetUserId, role } = await request.json();

  if (!targetUserId || !role) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role: role
    }
  });

  return NextResponse.json({ success: true });
}
