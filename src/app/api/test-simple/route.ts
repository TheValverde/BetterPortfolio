import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Prisma in API route...');
    console.log('PrismaClient:', typeof PrismaClient);
    
    if (!PrismaClient) {
      return NextResponse.json(
        { error: 'PrismaClient not available' },
        { status: 500 }
      );
    }
    
    const prisma = new PrismaClient();
    console.log('Prisma instance:', typeof prisma);
    console.log('Prisma methods:', Object.getOwnPropertyNames(prisma));
    console.log('contactSubmission method:', typeof prisma.contactSubmission);
    
    const submissions = await prisma.contactSubmission.findMany();
    console.log('Found submissions:', submissions.length);
    
    return NextResponse.json({
      success: true,
      message: 'Prisma API route working',
      submissions: submissions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed', details: error.message },
      { status: 500 }
    );
  }
}
