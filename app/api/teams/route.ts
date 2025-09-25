import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let teams = [];
let initialized = false;

function initializeTeams() {
  if (initialized) return;
  
  teams = [
    { id: faker.string.uuid(), name: 'IT Support' },
    { id: faker.string.uuid(), name: 'HR Support' },
    { id: faker.string.uuid(), name: 'Finance Support' },
    { id: faker.string.uuid(), name: 'Facilities' },
    { id: faker.string.uuid(), name: 'Security' }
  ];
  
  initialized = true;
}

export async function GET() {
  initializeTeams();
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  initializeTeams();
  const body = await request.json();
  
  const newTeam = {
    id: faker.string.uuid(),
    name: body.name
  };
  
  teams.push(newTeam);
  return NextResponse.json(newTeam, { status: 201 });
}