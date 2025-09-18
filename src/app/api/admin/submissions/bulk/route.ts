import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const body = await request.json();
    const { action, submissionIds, data } = body;

    if (!action || !submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update_status':
        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: submissionIds } },
          data: { status: data.status },
        });
        break;

      case 'update_priority':
        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: submissionIds } },
          data: { priority: data.priority },
        });
        break;

      case 'mark_responded':
        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: submissionIds } },
          data: { isResponded: data.isResponded },
        });
        break;

      case 'delete':
        result = await prisma.contactSubmission.deleteMany({
          where: { id: { in: submissionIds } },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
