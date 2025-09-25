import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let comments = [];
let initialized = false;

function initializeComments() {
  if (initialized) return;
  
  // Generate sample comments for different tickets
  comments = Array.from({ length: 50 }, () => ({
    id: faker.string.uuid(),
    ticket_id: faker.string.uuid(),
    author_id: faker.string.uuid(),
    body: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
    is_internal_note: faker.datatype.boolean(),
    created_at: faker.date.past().toISOString()
  }));
  
  initialized = true;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeComments();
  const ticketComments = comments.filter(c => c.ticket_id === params.id);
  
  // Generate some comments for this specific ticket if none exist
  if (ticketComments.length === 0) {
    const newComments = Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => ({
      id: faker.string.uuid(),
      ticket_id: params.id,
      author_id: faker.string.uuid(),
      body: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 2 })),
      is_internal_note: faker.datatype.boolean(),
      created_at: faker.date.past().toISOString()
    }));
    
    comments.push(...newComments);
    return NextResponse.json(newComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  }
  
  return NextResponse.json(ticketComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  initializeComments();
  const body = await request.json();
  
  const newComment = {
    id: faker.string.uuid(),
    ticket_id: params.id,
    author_id: body.author_id || faker.string.uuid(),
    body: body.body,
    is_internal_note: body.is_internal_note || false,
    created_at: new Date().toISOString()
  };
  
  comments.push(newComment);
  return NextResponse.json(newComment, { status: 201 });
}