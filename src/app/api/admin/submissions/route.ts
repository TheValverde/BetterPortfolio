import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin submissions API accessed from:', clientIP);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found submissions:', submissions.length, 'with filters:', { status, priority, search });

    // Calculate stats from the submissions data
    const unreadCount = submissions.filter(s => s.status === 'UNREAD').length;
    const respondedCount = submissions.filter(s => s.isResponded).length;

    return NextResponse.json({
      submissions,
      total: submissions.length,
      stats: {
        unread: unreadCount,
        responded: respondedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}