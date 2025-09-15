


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/*
* default function to create an admin with managerial role
*/
async function createAdminUser() {
  try {

    // Default admin data
    const defaultData = {
      fullName: 'Admin Manager',
      email: 'manager@gharsamma.com',
      username: 'manager',
      password: 'manager123',
      address: 'Kathmandu, Nepal',
      department: 'Management',
      position: 'General Manager'
    };

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: defaultData.email }
    });

    if (existingUser) {
        console.log(`User with email ${defaultData.email} already exists!`);
      return;
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: defaultData.username }
    });

    if (existingUsername) {
      return;
    }

 

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: defaultData.email,
        username: defaultData.username,
        fullName: defaultData.fullName,
        password: hashedPassword,
        address: defaultData.address,
        department: defaultData.department,
        position: defaultData.position,
        role: 'MANAGERIAL', // Admin panel access role
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        address: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

  } catch (error) {
    return;
  } finally {
    await prisma.$disconnect();
  }
}


  createAdminUser();


export { createAdminUser };
