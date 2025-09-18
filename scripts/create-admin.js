const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = 'admin';
    const email = process.env.SMTP_FROM || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123'; // You can change this

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('ID:', admin.id);
    console.log('\n🔐 Login credentials:');
    console.log('Username: admin');
    console.log('Password:', password);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin account already exists!');
    } else {
      console.error('Error creating admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
