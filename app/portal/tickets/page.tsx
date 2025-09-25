'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { TableSkeleton } from '@/components/ui/loading-spinner';
import { Plus, FileText, Clock } from 'lucide-react';

interface Ticket {
  id: string;
  display_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // In a real app, you'd get the current user ID from authentication
        const currentUserId = 'user-123'; // Mock user ID
        const response = await fetch(`/api/tickets?requester_id=${currentUserId}`);
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Support Tickets</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your submitted tickets and view responses.
          </p>
        </div>
        <Link
          href="/portal/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Ticket</span>
        </Link>
      </div>

      {tickets.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't submitted any support tickets yet. When you do, they'll appear here.
          </p>
          <Link
            href="/portal/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Your First Ticket</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Tickets ({tickets.length})
                </h2>
              </div>
              
              {loading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-blue-600">
                          {ticket.display_id}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <PriorityBadge priority={ticket.priority} />
                          <StatusBadge status={ticket.status} />
                        </div>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {ticket.subject}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created {formatDate(ticket.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated {formatDate(ticket.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg sticky top-6">
              {selectedTicket ? (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedTicket.display_id}
                    </h3>
                    <h4 className="text-sm text-gray-600 mb-3">
                      {selectedTicket.subject}
                    </h4>
                    <div className="flex items-center space-x-2 mb-4">
                      <StatusBadge status={selectedTicket.status} />
                      <PriorityBadge priority={selectedTicket.priority} />
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Status:</label>
                      <p className="text-gray-600 mt-1">{selectedTicket.status}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Priority:</label>
                      <p className="text-gray-600 mt-1">{selectedTicket.priority}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Created:</label>
                      <p className="text-gray-600 mt-1">
                        {formatDate(selectedTicket.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Last Updated:</label>
                      <p className="text-gray-600 mt-1">
                        {formatDate(selectedTicket.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Ticket details and communication history would be shown here in a full implementation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}