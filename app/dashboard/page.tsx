'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { TableSkeleton, CardSkeleton } from '@/components/ui/loading-spinner';
import { UserProfileModal } from '@/components/modals/user-profile-modal';
import { ArrowUpDown, MessageCircle, Send, FileText, Clock } from 'lucide-react';

interface Ticket {
  id: string;
  display_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  requester_id: string;
  assignee_id: string | null;
  team_id: string;
  category_id: string;
  sub_category_id: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_internal_note: boolean;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'All Open Tickets';
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: keyof Ticket; direction: 'asc' | 'desc'} | null>(null);

  // Fetch tickets based on view
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets?view=${encodeURIComponent(view)}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [usersRes, teamsRes, categoriesRes, subcategoriesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/teams'),
          fetch('/api/categories'),
          fetch('/api/subcategories')
        ]);
        
        const [usersData, teamsData, categoriesData, subcategoriesData] = await Promise.all([
          usersRes.json(),
          teamsRes.json(),
          categoriesRes.json(),
          subcategoriesRes.json()
        ]);
        
        setUsers(usersData);
        setTeams(teamsData);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, []);

  // Fetch tickets when view changes
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Fetch comments when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      setCommentsLoading(true);
      fetch(`/api/tickets/${selectedTicket.id}/comments`)
        .then(res => res.json())
        .then(data => {
          setComments(data);
        })
        .catch(error => {
          console.error('Error fetching comments:', error);
        })
        .finally(() => {
          setCommentsLoading(false);
        });
    }
  }, [selectedTicket]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setUserModalOpen(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newComment,
          is_internal_note: isInternalNote,
          author_id: users.find(u => u.role === 'Agent')?.id
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSort = (key: keyof Ticket) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getUser = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="flex h-full">
      {/* Ticket List */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{view}</h2>
          <p className="text-sm text-gray-600">{tickets.length} tickets</p>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'display_id', label: 'ID' },
                      { key: 'subject', label: 'Subject' },
                      { key: 'priority', label: 'Priority' },
                      { key: 'status', label: 'Status' },
                      { key: 'updated_at', label: 'Updated' }
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(key as keyof Ticket)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{label}</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTickets.map((ticket) => {
                    const requester = getUser(ticket.requester_id);
                    return (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {ticket.display_id}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {requester?.full_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(ticket.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedTicket.display_id}
                </h1>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={selectedTicket.status} />
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>
              </div>
              <h2 className="text-lg text-gray-700 mb-4">{selectedTicket.subject}</h2>
              
              {/* Ticket Properties */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700">Requester:</label>
                  <button
                    onClick={() => handleUserClick(selectedTicket.requester_id)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {getUser(selectedTicket.requester_id)?.full_name || 'Unknown'}
                  </button>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Assignee:</label>
                  <span className="ml-2 text-gray-600">
                    {selectedTicket.assignee_id 
                      ? getUser(selectedTicket.assignee_id)?.full_name || 'Unknown'
                      : 'Unassigned'
                    }
                  </span>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Created:</label>
                  <span className="ml-2 text-gray-600">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Updated:</label>
                  <span className="ml-2 text-gray-600">
                    {new Date(selectedTicket.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {selectedTicket.description}
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Activity & Comments
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {commentsLoading ? (
                  <CardSkeleton />
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const author = getUser(comment.author_id);
                      return (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg border ${
                            comment.is_internal_note 
                              ? 'bg-yellow-50 border-yellow-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {author?.full_name || 'Unknown User'}
                              </span>
                              {comment.is_internal_note && (
                                <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {comment.body}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="mb-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !isInternalNote
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => setIsInternalNote(false)}
                    >
                      Public Reply
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isInternalNote
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => setIsInternalNote(true)}
                    >
                      Internal Note
                    </button>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isInternalNote ? 'Add internal note...' : 'Add public reply...'}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Attach files</span>
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isInternalNote ? 'Add Note' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}