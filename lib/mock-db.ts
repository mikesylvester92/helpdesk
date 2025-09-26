// Simple in-memory mock database shared across API routes

export type MockUser = {
	id: string;
	full_name: string;
	email: string;
	role: 'Agent' | 'Admin' | 'User';
};

export type MockTeam = { id: string; name: string };
export type MockCategory = { id: string; name: string };

export type MockTicket = {
	id: string;
	display_id: string;
	subject: string;
	description: string;
	status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
	priority: 'Low' | 'Medium' | 'High' | 'Critical';
	requester: Pick<MockUser, 'id' | 'full_name' | 'email'>;
	assignee: (Pick<MockUser, 'id' | 'full_name' | 'email'>) | null;
	team: MockTeam;
	category: MockCategory;
	created_at: string;
	updated_at: string;
	assigned_at: string | null;
	first_responded_at: string | null;
	closed_at: string | null;
	resolution_due_date: string | null;
};

export type MockComment = {
	id: string;
	ticket_id: string;
	author: Pick<MockUser, 'id' | 'full_name' | 'email'>;
	body: string;
	is_internal_note: boolean;
	created_at: string;
};

let seeded = false;

export const db = {
	users: [] as MockUser[],
	teams: [] as MockTeam[],
	categories: [] as MockCategory[],
	tickets: [] as MockTicket[],
	commentsByTicketId: {} as Record<string, MockComment[]>,
};

function uid(n: number): string {
	return `id_${n}`;
}

export function ensureSeeded(): void {
	if (seeded) return;

	// Seed users
	db.users = [
		{ id: uid(1), full_name: 'Alice Johnson', email: 'alice@example.com', role: 'User' },
		{ id: uid(2), full_name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
		{ id: uid(3), full_name: 'Carol Agent', email: 'carol.agent@example.com', role: 'Agent' },
		{ id: uid(4), full_name: 'Dave Agent', email: 'dave.agent@example.com', role: 'Agent' },
		{ id: uid(5), full_name: 'Eve Admin', email: 'eve.admin@example.com', role: 'Admin' },
	];

	// Seed teams
	db.teams = [
		{ id: uid(10), name: 'IT Support' },
		{ id: uid(11), name: 'HR Support' },
	];

	// Seed categories
	db.categories = [
		{ id: uid(20), name: 'Hardware Issues' },
		{ id: uid(21), name: 'Software Support' },
		{ id: uid(22), name: 'Account Access' },
	];

	// Seed tickets
	const now = Date.now();
	function ts(offsetHours: number): string { return new Date(now - offsetHours * 3600_000).toISOString(); }

	const requesterA = db.users[0];
	const requesterB = db.users[1];
	const agent1 = db.users[2];
	const agent2 = db.users[3];

	const baseTickets: Omit<MockTicket, 'id' | 'display_id'>[] = [
		{
			subject: 'Cannot connect to Wi-Fi',
			description: 'My laptop fails to connect to the office Wi-Fi network.',
			status: 'Open',
			priority: 'High',
			requester: { id: requesterA.id, full_name: requesterA.full_name, email: requesterA.email },
			assignee: null,
			team: db.teams[0],
			category: db.categories[0],
			created_at: ts(72),
			updated_at: ts(48),
			assigned_at: null,
			first_responded_at: null,
			closed_at: null,
			resolution_due_date: ts(-24),
		},
		{
			subject: 'Outlook crashes on start',
			description: 'Outlook application crashes immediately after opening.',
			status: 'In Progress',
			priority: 'Medium',
			requester: { id: requesterB.id, full_name: requesterB.full_name, email: requesterB.email },
			assignee: { id: agent1.id, full_name: agent1.full_name, email: agent1.email },
			team: db.teams[0],
			category: db.categories[1],
			created_at: ts(120),
			updated_at: ts(6),
			assigned_at: ts(12),
			first_responded_at: ts(10),
			closed_at: null,
			resolution_due_date: ts(-72),
		},
		{
			subject: 'Password reset required',
			description: 'User cannot access account and needs a password reset.',
			status: 'Pending',
			priority: 'Low',
			requester: { id: requesterA.id, full_name: requesterA.full_name, email: requesterA.email },
			assignee: { id: agent2.id, full_name: agent2.full_name, email: agent2.email },
			team: db.teams[1],
			category: db.categories[2],
			created_at: ts(200),
			updated_at: ts(30),
			assigned_at: ts(36),
			first_responded_at: ts(35),
			closed_at: null,
			resolution_due_date: ts(-168),
		},
		{
			subject: 'Laptop battery replacement',
			description: 'Laptop battery no longer holds charge; needs replacement.',
			status: 'Closed',
			priority: 'Critical',
			requester: { id: requesterB.id, full_name: requesterB.full_name, email: requesterB.email },
			assignee: { id: agent1.id, full_name: agent1.full_name, email: agent1.email },
			team: db.teams[0],
			category: db.categories[0],
			created_at: ts(400),
			updated_at: ts(300),
			assigned_at: ts(395),
			first_responded_at: ts(394),
			closed_at: ts(310),
			resolution_due_date: ts(-336),
		},
	];

	db.tickets = baseTickets.map((t, i) => ({
		...t,
		id: uid(100 + i + 1),
		display_id: `TICK-${String(i + 1).padStart(4, '0')}`,
	}));

	seeded = true;
}

export function nextTicketId(): { id: string; display_id: string } {
	const n = db.tickets.length + 1;
	return { id: uid(100 + n), display_id: `TICK-${String(n).padStart(4, '0')}` };
}


