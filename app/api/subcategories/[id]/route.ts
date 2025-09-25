import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let subcategories = [];

function initializeSubcategories() {
  if (subcategories.length === 0) {
    subcategories = [
      { id: faker.string.uuid(), name: 'Desktop Computer', parent_category_id: 'cat1' },
      { id: faker.string.uuid(), name: 'Laptop Issues', parent_category_id: 'cat1' },
      { id: faker.string.uuid(), name: 'Printer Problems', parent_category_id: 'cat1' },
      { id: faker.string.uuid(), name: 'Monitor Issues', parent_category_id: 'cat1' },
      { id: faker.string.uuid(), name: 'Microsoft Office', parent_category_id: 'cat2' },
      { id: faker.string.uuid(), name: 'Adobe Creative Suite', parent_category_id: 'cat2' },
      { id: faker.string.uuid(), name: 'Web Browser Issues', parent_category_id: 'cat2' }
    ];
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeSubcategories();
  const body = await request.json();
  const subcategoryIndex = subcategories.findIndex(sc => sc.id === params.id);
  
  if (subcategoryIndex === -1) {
    return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
  }
  
  subcategories[subcategoryIndex] = { ...subcategories[subcategoryIndex], ...body };
  return NextResponse.json(subcategories[subcategoryIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeSubcategories();
  const subcategoryIndex = subcategories.findIndex(sc => sc.id === params.id);
  
  if (subcategoryIndex === -1) {
    return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
  }
  
  const deletedSubcategory = subcategories.splice(subcategoryIndex, 1)[0];
  return NextResponse.json(deletedSubcategory);
}