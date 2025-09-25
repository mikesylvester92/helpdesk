import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

let teams = [];

function initializeTeams() {
  if (teams.length === 0) {
    teams = [
      { id: faker.string.uuid(), name: 'IT Support' },
      { id: faker.string.uuid(), name: 'HR Support' },
      { id: faker.string.uuid(), name: 'Finance Support' },
      { id: faker.string.uuid(), name: 'Facilities' },
      { id: faker.string.uuid(), name: 'Security' }
    ];
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  initializeTeams();
  const body = await request.json();
  const teamIndex = teams.findIndex(t => t.id === params.id);
  
  if (teamIndex === -1) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  
  teams[teamIndex] = { ...teams[teamIndex], ...body };
  return NextResponse.json(teams[teamIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeTeams();
  const teamIndex = teams.findIndex(t => t.id === params.id);
  
  if (teamIndex === -1) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  
  const deletedTeam = teams.splice(teamIndex, 1)[0];
  return NextResponse.json(deletedTeam);
}