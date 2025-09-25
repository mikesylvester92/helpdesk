import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

// In-memory storage for demo purposes
let users = [];
let initialized = false;

function initializeUsers() {
  if (initialized) return;
  
  users = Array.from({ length: 50 }, () => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone_number: faker.phone.number(),
    office_location: faker.location.city() + ', ' + faker.location.state(),
    role: faker.helpers.arrayElement(['Agent', 'Admin', 'User'])
  }));
  
  initialized = true;
}

export async function GET() {
  initializeUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  initializeUsers();
  const body = await request.json();
  
  const newUser = {
    id: faker.string.uuid(),
    full_name: body.full_name,
    email: body.email,
    phone_number: body.phone_number || faker.phone.number(),
    office_location: body.office_location || faker.location.city() + ', ' + faker.location.state(),
    role: body.role || 'User'
  };
  
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}