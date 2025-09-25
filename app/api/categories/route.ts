import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let categories = [];
let initialized = false;

function initializeCategories() {
  if (initialized) return;
  
  categories = [
    { id: faker.string.uuid(), name: 'Hardware Issues' },
    { id: faker.string.uuid(), name: 'Software Support' },
    { id: faker.string.uuid(), name: 'Account Access' },
    { id: faker.string.uuid(), name: 'Network Issues' },
    { id: faker.string.uuid(), name: 'Email Support' },
    { id: faker.string.uuid(), name: 'Phone Support' },
    { id: faker.string.uuid(), name: 'Training Request' },
    { id: faker.string.uuid(), name: 'General Inquiry' }
  ];
  
  initialized = true;
}

export async function GET() {
  initializeCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  initializeCategories();
  const body = await request.json();
  
  const newCategory = {
    id: faker.string.uuid(),
    name: body.name
  };
  
  categories.push(newCategory);
  return NextResponse.json(newCategory, { status: 201 });
}