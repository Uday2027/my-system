import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiRequest } from '@/lib/auth';

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST a new project
export async function POST(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, longDescription, image, githubUrl, liveUrl, tags, order, featured } = body;

    if (!title || !description || !tags) {
      return NextResponse.json({ error: 'Missing required fields: title, description, tags' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        longDescription,
        image,
        githubUrl,
        liveUrl,
        tags,
        order: Number(order) || 0,
        featured: Boolean(featured),
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}

// PUT (update) a project
export async function PUT(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, longDescription, image, githubUrl, liveUrl, tags, order, featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        longDescription,
        image,
        githubUrl,
        liveUrl,
        tags,
        order: order !== undefined ? Number(order) : undefined,
        featured: featured !== undefined ? Boolean(featured) : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

// DELETE a project
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing project ID in query' }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
