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
  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const { lessonId, trackId, status, currentStepId, completedSteps, timeSpentSecs, hintsUsed, showMeUsed } = body;

  if (!lessonId || !trackId) {
    return NextResponse.json({ error: 'lessonId and trackId required' }, { status: 400 });
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      trackId,
      status: status || 'IN_PROGRESS',
      currentStepId,
      completedSteps: completedSteps || [],
      startedAt: new Date(),
      timeSpentSecs: timeSpentSecs || 0,
      hintsUsed: hintsUsed || 0,
      showMeUsed: showMeUsed || 0,
      attempts: 1,
    },
    update: {
      status,
      currentStepId,
      completedSteps,
      timeSpentSecs,
      hintsUsed,
      showMeUsed,
      ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
    },
  });

  // Update user XP if lesson completed
  if (status === 'COMPLETED') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: (completedSteps?.length || 5) * 5 },
        lastActiveAt: new Date(),
      },
    });
  }

  return NextResponse.json(progress);
}
