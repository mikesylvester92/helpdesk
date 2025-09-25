import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

// This would normally connect to your database
let users = [];

function initializeUsers() {
  if (users.length === 0) {
    users = Array.from({ length: 50 }, () => ({
      id: faker.string.uuid(),
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: faker.phone.number(),
      office_location: faker.location.city() + ', ' + faker.location.state(),
      role: faker.helpers.arrayElement(['Agent', 'Admin', 'User'])
    }));
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeUsers();
  const user = users.find(u => u.id === params.id);
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeUsers();
  const body = await request.json();
  const userIndex = users.findIndex(u => u.id === params.id);
  
  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  users[userIndex] = { ...users[userIndex], ...body };
  return NextResponse.json(users[userIndex]);
}