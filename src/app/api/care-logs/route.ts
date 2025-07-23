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

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const careLogs = await prisma.careLog.findMany({
      where: {
        userId: user.userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(careLogs);
  } catch (error) {
    console.error('Error fetching care logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const careLog = await prisma.careLog.create({
      data: {
        type,
        description,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        caregiver,
        notes,
        userId: user.userId,
      },
    });

    return NextResponse.json(careLog);
  } catch (error) {
    console.error('Error creating care log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 