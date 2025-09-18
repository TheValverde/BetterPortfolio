import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing admin API...');
    
    const submissions = await prisma.contactSubmission.findMany();
    console.log('Found submissions:', submissions.length);
    
    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions: submissions.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        status: s.status,
        priority: s.priority,
        isResponded: s.isResponded,
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
