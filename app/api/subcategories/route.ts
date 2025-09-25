import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let subcategories = [];
let categories = [];
let initialized = false;

function initializeData() {
  if (initialized) return;
  
  categories = [
    { id: 'cat1', name: 'Hardware Issues' },
    { id: 'cat2', name: 'Software Support' },
    { id: 'cat3', name: 'Account Access' },
    { id: 'cat4', name: 'Network Issues' }
  ];
  
  subcategories = [
    { id: faker.string.uuid(), name: 'Desktop Computer', parent_category_id: 'cat1' },
    { id: faker.string.uuid(), name: 'Laptop Issues', parent_category_id: 'cat1' },
    { id: faker.string.uuid(), name: 'Printer Problems', parent_category_id: 'cat1' },
    { id: faker.string.uuid(), name: 'Monitor Issues', parent_category_id: 'cat1' },
    { id: faker.string.uuid(), name: 'Microsoft Office', parent_category_id: 'cat2' },
    { id: faker.string.uuid(), name: 'Adobe Creative Suite', parent_category_id: 'cat2' },
    { id: faker.string.uuid(), name: 'Web Browser Issues', parent_category_id: 'cat2' },
    { id: faker.string.uuid(), name: 'Password Reset', parent_category_id: 'cat3' },
    { id: faker.string.uuid(), name: 'Account Locked', parent_category_id: 'cat3' },
    { id: faker.string.uuid(), name: 'New User Setup', parent_category_id: 'cat3' },
    { id: faker.string.uuid(), name: 'Wi-Fi Connection', parent_category_id: 'cat4' },
    { id: faker.string.uuid(), name: 'VPN Issues', parent_category_id: 'cat4' },
    { id: faker.string.uuid(), name: 'Internet Slow', parent_category_id: 'cat4' }
  ];
  
  initialized = true;
}

export async function GET() {
  initializeData();
  return NextResponse.json(subcategories);
}

export async function POST(request: Request) {
  initializeData();
  const body = await request.json();
  
  const newSubcategory = {
    id: faker.string.uuid(),
    name: body.name,
    parent_category_id: body.parent_category_id
  };
  
  subcategories.push(newSubcategory);
  return NextResponse.json(newSubcategory, { status: 201 });
}