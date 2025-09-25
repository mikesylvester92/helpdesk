import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let tickets = [];
let users = [];
let teams = [];
let categories = [];

function initializeData() {
  if (tickets.length === 0) {
    // Initialize users
    users = Array.from({ length: 30 }, () => ({
      id: faker.string.uuid(),
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: faker.phone.number(),
      office_location: faker.location.city() + ', ' + faker.location.state(),
      role: faker.helpers.arrayElement(['Agent', 'Admin', 'User'])
    }));
    
    // Initialize teams
    teams = [
      { id: faker.string.uuid(), name: 'IT Support' },
      { id: faker.string.uuid(), name: 'HR Support' },
      { id: faker.string.uuid(), name: 'Finance Support' },
      { id: faker.string.uuid(), name: 'Facilities' }
    ];
    
    // Initialize categories
    categories = [
      { id: faker.string.uuid(), name: 'Hardware Issues' },
      { id: faker.string.uuid(), name: 'Software Support' },
      { id: faker.string.uuid(), name: 'Account Access' },
      { id: faker.string.uuid(), name: 'Network Issues' }
    ];
    
    // Initialize tickets with nested objects
    tickets = Array.from({ length: 100 }, (_, index) => {
      const createdAt = faker.date.past({ years: 0.5 });
      const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
      const status = faker.helpers.arrayElement(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed']);
      const priority = faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']);
      const requester = faker.helpers.arrayElement(users);
      const assignee = status !== 'Open' ? faker.helpers.arrayElement(users.filter(u => u.role === 'Agent')) : null;
      const team = faker.helpers.arrayElement(teams);
      const category = faker.helpers.arrayElement(categories);
      
      return {
      id: faker.string.uuid(),
      display_id: `TICK-${String(index + 1).padStart(4, '0')}`,
      subject: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      status,
      priority,
      requester: {
        id: requester.id,
        full_name: requester.full_name,
        email: requester.email
      },
      assignee: assignee ? {
        id: assignee.id,
        full_name: assignee.full_name,
        email: assignee.email
      } : null,
      team: {
        id: team.id,
        name: team.name
      },
      category: {
        id: category.id,
        name: category.name
      },
      sub_category_id: faker.string.uuid(),
      source: faker.helpers.arrayElement(['Email', 'Portal', 'Phone', 'Chat']),
      approval_status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected', null]),
      resolution_notes: status === 'Resolved' || status === 'Closed' ? faker.lorem.paragraph() : null,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      assigned_at: assignee ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString() : null,
      first_responded_at: faker.date.between({ from: createdAt, to: updatedAt }).toISOString(),
      closed_at: status === 'Closed' ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString() : null,
      resolution_due_date: faker.date.future({ days: 30 }).toISOString()
      };
    });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeData();
  const ticket = tickets.find(t => t.id === params.id);
  
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeData();
  const body = await request.json();
  const ticketIndex = tickets.findIndex(t => t.id === params.id);
  
  if (ticketIndex === -1) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  
  // Update the ticket while preserving nested objects
  const updatedTicket = {
    ...tickets[ticketIndex],
    ...body,
    updated_at: new Date().toISOString()
  };
  
  tickets[ticketIndex] = updatedTicket;
  
  return NextResponse.json(tickets[ticketIndex]);
}