import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin reply API accessed from:', clientIP);
    
    const body = await request.json();
    const { submissionId, replyMessage, replySubject } = body;

    if (!submissionId || !replyMessage || !replySubject) {
      return NextResponse.json(
        { error: 'Submission ID, reply message, and subject are required' },
        { status: 400 }
      );
    }

    // Get the submission details
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.CONTACT_EMAIL) {
      console.error('Missing email environment variables:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        CONTACT_EMAIL: !!process.env.CONTACT_EMAIL,
      });
      return NextResponse.json(
        { error: 'Email configuration is missing' },
        { status: 500 }
      );
    }

    // Create transporter for Zoho Mail
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Attempting to send reply email to:', submission.email);

    // Send reply email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: submission.email,
      subject: replySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reply from ${process.env.FULL_NAME || 'Your Name'}</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #666;">Your original message:</h3>
            <p style="margin: 0; font-style: italic;">"${submission.message.replace(/"/g, '&quot;')}"</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">Reply:</h3>
            <p style="margin: 0; white-space: pre-wrap;">${replyMessage.replace(/\n/g, '<br>')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This is a reply to your message sent on ${new Date(submission.createdAt).toLocaleDateString()}. 
            If you have any further questions, feel free to reply to this email.
          </p>
          
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            ${process.env.FULL_NAME || 'Your Name'}<br>
            ${process.env.TITLE || 'Your Title'}<br>
            ${process.env.PHONE_NUMBER || '(XXX) XXX-XXXX'}<br>
            <a href="https://${process.env.WEBSITE_URL || 'yourwebsite.com'}" style="color: #2563eb;">${process.env.WEBSITE_URL || 'yourwebsite.com'}</a>
          </p>
        </div>
      `,
    });

    // Also send a copy to yourself for record keeping
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `[REPLY SENT] ${replySubject} - ${submission.name} (${submission.email})`,
      html: `
        <h2>Reply Sent</h2>
        <p><strong>To:</strong> ${submission.name} (${submission.email})</p>
        <p><strong>Original Message:</strong></p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${submission.message}</p>
        <p><strong>Your Reply:</strong></p>
        <p style="background-color: #e8f4fd; padding: 10px; border-radius: 3px;">${replyMessage}</p>
        <p><em>Sent on ${new Date().toLocaleString()}</em></p>
      `,
    });

    console.log('Reply sent successfully to:', submission.email);

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return NextResponse.json(
      { error: 'Failed to send reply', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
