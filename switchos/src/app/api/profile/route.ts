import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      tier: true,
      xp: true,
      streak: true,
      lastActiveAt: true,
      createdAt: true,
      badges: true,
      progress: {
        select: {
          lessonId: true,
          trackId: true,
          status: true,
          completedSteps: true,
          timeSpentSecs: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { name, image } = await request.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image }),
      lastActiveAt: new Date(),
    },
    select: { id: true, email: true, name: true, image: true, tier: true, xp: true, streak: true },
  });

  return NextResponse.json(user);
}
