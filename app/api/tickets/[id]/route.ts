import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let tickets = [];

function initializeTickets() {
  if (tickets.length === 0) {
    // Initialize with some sample data for the specific ticket
    tickets = Array.from({ length: 10 }, (_, index) => ({
      id: faker.string.uuid(),
      display_id: `TICK-${String(index + 1).padStart(4, '0')}`,
      subject: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      status: faker.helpers.arrayElement(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed']),
      priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
      requester_id: faker.string.uuid(),
      assignee_id: faker.string.uuid(),
      team_id: faker.string.uuid(),
      category_id: faker.string.uuid(),
      sub_category_id: faker.string.uuid(),
      source: faker.helpers.arrayElement(['Email', 'Portal', 'Phone', 'Chat']),
      approval_status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected', null]),
      resolution_notes: faker.lorem.paragraph(),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString(),
      assigned_at: faker.date.past().toISOString(),
      first_responded_at: faker.date.recent().toISOString(),
      closed_at: null,
      resolution_due_date: faker.date.future().toISOString()
    }));
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeTickets();
  const ticket = tickets.find(t => t.id === params.id);
  
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeTickets();
  const body = await request.json();
  const ticketIndex = tickets.findIndex(t => t.id === params.id);
  
  if (ticketIndex === -1) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  
  tickets[ticketIndex] = { 
    ...tickets[ticketIndex], 
    ...body, 
    updated_at: new Date().toISOString() 
  };
  
  return NextResponse.json(tickets[ticketIndex]);
}