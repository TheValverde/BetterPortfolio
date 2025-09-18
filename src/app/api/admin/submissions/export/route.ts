import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const format = searchParams.get('format') || 'csv';

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    if (format === 'csv') {
      const csvHeaders = 'ID,Name,Email,Message,Status,Priority,Responded,Notes,Created At,Updated At\n';
      const csvRows = submissions.map(sub => 
        `"${sub.id}","${sub.name}","${sub.email}","${sub.message.replace(/"/g, '""')}","${sub.status}","${sub.priority}","${sub.isResponded}","${sub.notes || ''}","${sub.createdAt.toISOString()}","${sub.updatedAt.toISOString()}"`
      ).join('\n');
      
      const csv = csvHeaders + csvRows;
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="contact-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default to JSON
    return NextResponse.json({
      submissions,
      exportedAt: new Date().toISOString(),
      total: submissions.length,
    });
  } catch (error) {
    console.error('Error exporting submissions:', error);
    return NextResponse.json(
      { error: 'Failed to export submissions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
