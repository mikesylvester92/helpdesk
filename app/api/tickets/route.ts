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
    const subcategory = faker.helpers.arrayElement(subcategories.filter(s => s.parent_category_id === category.id));
    
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
      sub_category_id: subcategory.id,
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
  
  initialized = true;
}

export async function GET(request: Request) {
  initializeData();
  const url = new URL(request.url);
  const view = url.searchParams.get('view');
  const requesterId = url.searchParams.get('requester_id');
  
  let filteredTickets = tickets;
  
  if (requesterId) {
    filteredTickets = tickets.filter(t => t.requester.id === requesterId);
  } else if (view) {
    switch (view) {
      case 'Unassigned':
        filteredTickets = tickets.filter(t => !t.assignee);
        break;
      case 'My Open Tickets':
        // For demo, we'll show tickets assigned to first agent
        const firstAgent = users.find(u => u.role === 'Agent');
        if (firstAgent) {
          filteredTickets = tickets.filter(t => t.assignee?.id === firstAgent.id && ['Open', 'In Progress'].includes(t.status));
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
  
  // Find the requester user object
  const requester = users.find(u => u.id === body.requester_id);
  const team = teams.find(t => t.id === body.team_id) || teams[0];
  const category = categories.find(c => c.id === body.category_id);
  
  const newTicket = {
    id: faker.string.uuid(),
    display_id: `TICK-${String(tickets.length + 1).padStart(4, '0')}`,
    subject: body.subject,
    description: body.description,
    status: 'Open',
    priority: body.priority || 'Medium',
    requester: requester ? {
      id: requester.id,
      full_name: requester.full_name,
      email: requester.email
    } : {
      id: faker.string.uuid(),
      full_name: 'Unknown User',
      email: 'unknown@example.com'
    },
    assignee: body.assignee_id ? users.find(u => u.id === body.assignee_id) : null,
    team: {
      id: team.id,
      name: team.name
    },
    category: category ? {
      id: category.id,
      name: category.name
    } : null,
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