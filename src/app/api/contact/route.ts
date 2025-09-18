import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const body: ContactFormData = await request.json();
    
    // Basic validation
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Log the contact form data
    console.log('Contact form submission:', {
      name: body.name,
      email: body.email,
      message: body.message,
      timestamp: new Date().toISOString(),
    });

    // Store in database (if you want to keep a record)
    try {
      await prisma.contactSubmission.create({
        data: {
          name: body.name,
          email: body.email,
          message: body.message,
        },
      });
      console.log('Contact form stored in database');
    } catch (dbError) {
      console.error('Database storage failed:', dbError);
      // Continue with email sending even if DB fails
    }

    // Send email using Nodemailer with Zoho
    try {
      // Create transporter for Zoho Mail
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zoho.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email to you (the portfolio owner)
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_FROM, // Send to yourself
        subject: `New Portfolio Contact: ${body.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Message:</strong></p>
          <p>${body.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>Sent from your portfolio contact form at ${new Date().toLocaleString()}</em></p>
        `,
      });

      // Auto-reply to the person who submitted the form
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: body.email,
        subject: `Thank you for contacting ${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'}`,
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${body.name},</p>
          <p>Thank you for your message. I've received your inquiry and will get back to you as soon as possible.</p>
          <p>Best regards,<br>${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'}<br>${process.env.NEXT_PUBLIC_TITLE || 'Your Title'}<br>${process.env.NEXT_PUBLIC_PHONE_NUMBER || '(XXX) XXX-XXXX'}<br>${process.env.NEXT_PUBLIC_WEBSITE_URL || 'yourwebsite.com'}</p>
          <hr>
          <p><em>This is an automated response from ${process.env.NEXT_PUBLIC_WEBSITE_URL || 'yourwebsite.com'}</em></p>
        `,
      });

      console.log('Email sent successfully to:', body.email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails - still log the contact
    }

    return NextResponse.json(
      { 
        message: 'Thank you for your message! I\'ll get back to you soon.',
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}