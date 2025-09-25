import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

export async function GET() {
  // Generate dashboard statistics
  const stats = {
    totalOpenTickets: faker.number.int({ min: 45, max: 120 }),
    myAssignedTickets: faker.number.int({ min: 8, max: 25 }),
    unassignedTickets: faker.number.int({ min: 5, max: 15 }),
    highPriorityOpen: faker.number.int({ min: 2, max: 8 }),
    
    // Tickets by category for bar chart
    ticketsByCategory: [
      { name: 'Hardware Issues', count: faker.number.int({ min: 15, max: 35 }) },
      { name: 'Software Support', count: faker.number.int({ min: 20, max: 40 }) },
      { name: 'Account Access', count: faker.number.int({ min: 8, max: 20 }) },
      { name: 'Network Issues', count: faker.number.int({ min: 10, max: 25 }) },
      { name: 'Email Support', count: faker.number.int({ min: 5, max: 15 }) }
    ],
    
    // Tickets created vs resolved for line chart (last 7 days)
    ticketTrends: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        created: faker.number.int({ min: 5, max: 20 }),
        resolved: faker.number.int({ min: 3, max: 18 })
      };
    }),
    
    // Recent activity feed
    recentActivity: Array.from({ length: 8 }, () => ({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['ticket_created', 'ticket_assigned', 'ticket_resolved', 'comment_added']),
      description: faker.helpers.arrayElement([
        'New ticket created by John Smith',
        'Ticket TICK-0123 assigned to Sarah Johnson',
        'Ticket TICK-0456 marked as resolved',
        'Comment added to ticket TICK-0789',
        'High priority ticket created',
        'Ticket escalated to Level 2 support'
      ]),
      timestamp: faker.date.recent({ days: 2 }).toISOString(),
      ticketId: `TICK-${faker.number.int({ min: 1000, max: 9999 })}`,
      user: faker.person.fullName()
    }))
  };
  
  return NextResponse.json(stats);
}