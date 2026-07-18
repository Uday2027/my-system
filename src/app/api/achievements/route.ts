import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiRequest } from '@/lib/auth';

// GET all achievements
export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(achievements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch achievements' }, { status: 500 });
  }
}

// POST a new achievement
export async function POST(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, link, order } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Missing required fields: title, date' }, { status: 400 });
    }

    const achievement = await prisma.achievement.create({
      data: {
        title,
        description,
        date,
        link,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create achievement' }, { status: 500 });
  }
}

// PUT (update) an achievement
export async function PUT(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, date, link, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing achievement ID' }, { status: 400 });
    }

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        title,
        description,
        date,
        link,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    return NextResponse.json(achievement);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update achievement' }, { status: 500 });
  }
}

// DELETE an achievement
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing achievement ID in query' }, { status: 400 });
    }

    await prisma.achievement.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Achievement deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete achievement' }, { status: 500 });
  }
}
