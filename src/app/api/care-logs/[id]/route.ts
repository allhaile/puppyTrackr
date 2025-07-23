import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { CreateCareLogData, CareLogType } from '@/lib/types';

function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  return payload;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: CreateCareLogData = await request.json();
    const { type, description, timestamp, caregiver, notes } = body;

    // Validate input
    if (!type || !caregiver) {
      return NextResponse.json(
        { error: 'Type and caregiver are required' },
        { status: 400 }
      );
    }

    // Validate care log type
    if (!Object.values(CareLogType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid care log type' },
        { status: 400 }
      );
    }

    // Check if care log exists and belongs to user
    const existingCareLog = await prisma.careLog.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingCareLog) {
      return NextResponse.json(
        { error: 'Care log not found' },
        { status: 404 }
      );
    }

    const careLog = await prisma.careLog.update({
      where: { id },
      data: {
        type,
        description,
        timestamp: timestamp ? new Date(timestamp) : undefined,
        caregiver,
        notes,
      },
    });

    return NextResponse.json(careLog);
  } catch (error) {
    console.error('Error updating care log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if care log exists and belongs to user
    const existingCareLog = await prisma.careLog.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingCareLog) {
      return NextResponse.json(
        { error: 'Care log not found' },
        { status: 404 }
      );
    }

    await prisma.careLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Care log deleted successfully' });
  } catch (error) {
    console.error('Error deleting care log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 