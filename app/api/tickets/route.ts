import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let tickets = [];
let users = [];
let teams = [];
let categories = [];
let subcategories = [];
let initialized = false;

function initializeData() {
  if (initialized) return;
  
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
  
  // Initialize subcategories
  subcategories = [
    { id: faker.string.uuid(), name: 'Desktop Computer', parent_category_id: categories[0].id },
    { id: faker.string.uuid(), name: 'Laptop Issues', parent_category_id: categories[0].id },
    { id: faker.string.uuid(), name: 'Microsoft Office', parent_category_id: categories[1].id },
    { id: faker.string.uuid(), name: 'Password Reset', parent_category_id: categories[2].id },
    { id: faker.string.uuid(), name: 'Wi-Fi Connection', parent_category_id: categories[3].id }
  ];
  
  // Initialize tickets
  tickets = Array.from({ length: 100 }, (_, index) => {
    const createdAt = faker.date.past({ years: 0.5 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    const status = faker.helpers.arrayElement(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed']);
    const priority = faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']);
    
    return {
      id: faker.string.uuid(),
      display_id: `TICK-${String(index + 1).padStart(4, '0')}`,
      subject: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      status,
      priority,
      requester_id: faker.helpers.arrayElement(users).id,
      assignee_id: status !== 'Open' ? faker.helpers.arrayElement(users).id : null,
      team_id: faker.helpers.arrayElement(teams).id,
      category_id: faker.helpers.arrayElement(categories).id,
      sub_category_id: faker.helpers.arrayElement(subcategories).id,
      source: faker.helpers.arrayElement(['Email', 'Portal', 'Phone', 'Chat']),
      approval_status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected', null]),
      resolution_notes: status === 'Resolved' || status === 'Closed' ? faker.lorem.paragraph() : null,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      assigned_at: status !== 'Open' ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString() : null,
      first_responded_at: faker.date.between({ from: createdAt, to: updatedAt }).toISOString(),
      closed_at: status === 'Closed' ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString() : null,
      resolution_due_date: faker.date.future({ days: 30 }).toISOString()
    };
  });
  
  initialized = true;
}

export async function GET(request: Request) {
  initializeData();
  const url = new URL(request.url);
  const view = url.searchParams.get('view');
  const requesterId = url.searchParams.get('requester_id');
  
  let filteredTickets = tickets;
  
  if (requesterId) {
    filteredTickets = tickets.filter(t => t.requester_id === requesterId);
  } else if (view) {
    switch (view) {
      case 'Unassigned':
        filteredTickets = tickets.filter(t => !t.assignee_id);
        break;
      case 'My Open Tickets':
        // For demo, we'll show tickets assigned to first agent
        const firstAgent = users.find(u => u.role === 'Agent');
        if (firstAgent) {
          filteredTickets = tickets.filter(t => t.assignee_id === firstAgent.id && ['Open', 'In Progress'].includes(t.status));
        }
        break;
      case 'All Open Tickets':
        filteredTickets = tickets.filter(t => ['Open', 'In Progress', 'Pending'].includes(t.status));
        break;
      case 'Recently Closed':
        filteredTickets = tickets.filter(t => t.status === 'Closed').slice(0, 20);
        break;
    }
  }
  
  return NextResponse.json(filteredTickets);
}

export async function POST(request: Request) {
  initializeData();
  const body = await request.json();
  
  const newTicket = {
    id: faker.string.uuid(),
    display_id: `TICK-${String(tickets.length + 1).padStart(4, '0')}`,
    subject: body.subject,
    description: body.description,
    status: 'Open',
    priority: body.priority || 'Medium',
    requester_id: body.requester_id,
    assignee_id: body.assignee_id || null,
    team_id: body.team_id || teams[0].id,
    category_id: body.category_id,
    sub_category_id: body.sub_category_id,
    source: body.source || 'Portal',
    approval_status: null,
    resolution_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_at: body.assignee_id ? new Date().toISOString() : null,
    first_responded_at: null,
    closed_at: null,
    resolution_due_date: faker.date.future({ days: 7 }).toISOString()
  };
  
  tickets.unshift(newTicket);
  return NextResponse.json(newTicket, { status: 201 });
}