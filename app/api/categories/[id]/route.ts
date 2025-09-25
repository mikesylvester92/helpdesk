import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let categories = [];

function initializeCategories() {
  if (categories.length === 0) {
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
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeCategories();
  const body = await request.json();
  const categoryIndex = categories.findIndex(c => c.id === params.id);
  
  if (categoryIndex === -1) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
  
  categories[categoryIndex] = { ...categories[categoryIndex], ...body };
  return NextResponse.json(categories[categoryIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeCategories();
  const categoryIndex = categories.findIndex(c => c.id === params.id);
  
  if (categoryIndex === -1) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
  
  const deletedCategory = categories.splice(categoryIndex, 1)[0];
  return NextResponse.json(deletedCategory);
}