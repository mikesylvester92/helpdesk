'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { CardSkeleton } from '@/components/ui/loading-spinner';
import { ArrowLeft, Send, Clock, User } from 'lucide-react';

interface Ticket {
  id: string;
  display_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  requester: {
    id: string;
    full_name: string;
    email: string;
  };
  assignee: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  team: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  ticket_id: string;
  author: {
    id: string;
    full_name: string;
    email: string;
  };
  body: string;
  is_internal_note: boolean;
  created_at: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await fetch(`/api/tickets/${ticketId}/comments`);
        if (response.ok) {
          const data = await response.json();
          // Filter out internal notes for end users
          setComments(data.filter((comment: Comment) => !comment.is_internal_note));
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
      fetchComments();
    }
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newComment,
          is_internal_note: false,
          author_id: ticket.requester.id // In a real app, this would be the current user
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <CardSkeleton />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h1>
        <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or you don't have access to it.</p>
        <Link
          href="/portal/tickets"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/portal/tickets"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>

      {/* Ticket Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.display_id}</h1>
            <div className="flex items-center space-x-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <h2 className="text-xl text-gray-700 mb-4">{ticket.subject}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">Status:</label>
              <span className="ml-2 text-gray-600">{ticket.status}</span>
            </div>
            <div>
              <label className="font-medium text-gray-700">Priority:</label>
              <span className="ml-2 text-gray-600">{ticket.priority}</span>
            </div>
            <div>
              <label className="font-medium text-gray-700">Assigned Team:</label>
              <span className="ml-2 text-gray-600">{ticket.team?.name || 'Unassigned'}</span>
            </div>
            <div>
              <label className="font-medium text-gray-700">Category:</label>
              <span className="ml-2 text-gray-600">{ticket.category?.name || 'Unknown'}</span>
            </div>
            <div>
              <label className="font-medium text-gray-700">Created:</label>
              <span className="ml-2 text-gray-600">{formatDate(ticket.created_at)}</span>
            </div>
            <div>
              <label className="font-medium text-gray-700">Last Updated:</label>
              <span className="ml-2 text-gray-600">{formatDate(ticket.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-3">Description</h3>
          <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Conversation</h3>
        </div>

        <div className="p-6">
          {commentsLoading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Start the conversation below.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {comment.author?.full_name || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap ml-10">
                      {comment.body}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reply Form */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Add a Reply</h4>
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}