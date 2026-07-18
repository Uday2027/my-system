import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiRequest } from '@/lib/auth';

// GET all skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(skills);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch skills' }, { status: 500 });
  }
}

// POST a new skill
export async function POST(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, level, order } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, category' }, { status: 400 });
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        level: level !== undefined ? Number(level) : 80,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create skill' }, { status: 500 });
  }
}

// PUT (update) a skill
export async function PUT(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, category, level, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing skill ID' }, { status: 400 });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        name,
        category,
        level: level !== undefined ? Number(level) : undefined,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    return NextResponse.json(skill);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update skill' }, { status: 500 });
  }
}

// DELETE a skill
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing skill ID in query' }, { status: 400 });
    }

    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Skill deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete skill' }, { status: 500 });
  }
}
