'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CardSkeleton } from '@/components/ui/loading-spinner';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { ArrowLeft, Send, User, Users as UsersIcon } from 'lucide-react';

interface Ticket {
	id: string;
	display_id: string;
	subject: string;
	description: string;
	status: string;
	priority: string;
	requester: { id: string; full_name: string; email: string };
	assignee: { id: string; full_name: string; email: string } | null;
	team: { id: string; name: string };
	category: { id: string; name: string };
	created_at: string;
	updated_at: string;
}

interface Comment {
	id: string;
	ticket_id: string;
	author: { id: string; full_name: string; email: string };
	body: string;
	is_internal_note: boolean;
	created_at: string;
}

interface UserLite { id: string; full_name: string; email: string; role: string }
interface Team { id: string; name: string }

export default function TicketEditorPage() {
	const params = useParams();
	const router = useRouter();
	const ticketId = params?.id as string;

	const [ticket, setTicket] = useState<Ticket | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [users, setUsers] = useState<UserLite[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);
	const [reply, setReply] = useState('');
	const [isNote, setIsNote] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const [tRes, cRes, uRes, teamRes] = await Promise.all([
					fetch(`/api/tickets/${ticketId}`),
					fetch(`/api/tickets/${ticketId}/comments`),
					fetch('/api/users'),
					fetch('/api/teams'),
				]);
				const [t, c, u, tm] = await Promise.all([
					tRes.json(),
					cRes.json(),
					uRes.json(),
					teamRes.json(),
				]);
				setTicket(t);
				setComments(c);
				setUsers(u);
				setTeams(tm);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [ticketId]);

	const agents = useMemo(() => users.filter(u => u.role === 'Agent'), [users]);

	const updateTicket = async (patch: Partial<Ticket>) => {
		if (!ticket) return;
		setSaving(true);
		try {
			const res = await fetch(`/api/tickets/${ticket.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(patch),
			});
			if (res.ok) {
				const updated = await res.json();
				setTicket(updated);
			}
		} finally {
			setSaving(false);
		}
	};

	const addComment = async () => {
		if (!ticket || !reply.trim()) return;
		const author = agents[0] || users[0];
		const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: reply, is_internal_note: isNote, author_id: author?.id }),
		});
		if (res.ok) {
			const newComment = await res.json();
			setComments([...comments, newComment]);
			setReply('');
			setIsNote(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6">
				<CardSkeleton />
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className="p-6">
				<button onClick={() => router.push('/dashboard/tickets')} className="text-blue-600 flex items-center space-x-2 mb-4">
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Tickets</span>
				</button>
				<p className="text-gray-600">Ticket not found.</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="p-4 border-b bg-white flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<button onClick={() => router.push('/dashboard/tickets')} className="text-blue-600 flex items-center space-x-2">
						<ArrowLeft className="w-4 h-4" />
						<span>All Tickets</span>
					</button>
					<h1 className="text-xl font-semibold text-gray-900">{ticket.display_id} — {ticket.subject}</h1>
				</div>
				<div className="flex items-center space-x-3">
					<PriorityBadge priority={ticket.priority} />
					<StatusBadge status={ticket.status} />
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Left: Properties */}
				<aside className="w-80 border-r bg-white p-4 space-y-4 overflow-y-auto">
					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
						<select
							value={ticket.status}
							onChange={(e) => updateTicket({ status: e.target.value })}
							className="w-full border rounded px-2 py-1 text-sm"
						>
							<option>Open</option>
							<option>In Progress</option>
							<option>Pending</option>
							<option>Resolved</option>
							<option>Closed</option>
						</select>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
						<select
							value={ticket.priority}
							onChange={(e) => updateTicket({ priority: e.target.value })}
							className="w-full border rounded px-2 py-1 text-sm"
						>
							<option>Low</option>
							<option>Medium</option>
							<option>High</option>
							<option>Critical</option>
						</select>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
						<select
							value={ticket.assignee?.id || ''}
							onChange={(e) => {
								const user = users.find(u => u.id === e.target.value);
								updateTicket({ assignee: user ? { id: user.id, full_name: user.full_name, email: user.email } as any : null });
							}}
							className="w-full border rounded px-2 py-1 text-sm"
						>
							<option value="">Unassigned</option>
							{agents.map(a => (
								<option key={a.id} value={a.id}>{a.full_name}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
						<select
							value={ticket.team?.id}
							onChange={(e) => {
								const team = teams.find(t => t.id === e.target.value);
								updateTicket({ team: team ? { id: team.id, name: team.name } as any : ticket.team });
							}}
							className="w-full border rounded px-2 py-1 text-sm"
						>
							{teams.map(t => (
								<option key={t.id} value={t.id}>{t.name}</option>
							))}
						</select>
					</div>
				</aside>

				{/* Right: Conversation Tabs */}
				<main className="flex-1 p-0 flex flex-col">
					<div className="p-4 border-b bg-white">
						<div>
							<div className="text-sm text-gray-600">Requester</div>
							<div className="flex items-center space-x-2 text-gray-900">
								<div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-3 h-3 text-blue-600" /></div>
								<span className="font-medium">{ticket.requester.full_name}</span>
								<span className="text-sm text-gray-500">{ticket.requester.email}</span>
							</div>
						</div>
					</div>

					<Tabs defaultValue="conversation" className="flex-1 flex flex-col">
						<div className="px-4 bg-white border-b">
							<TabsList>
								<TabsTrigger value="conversation">Conversation</TabsTrigger>
								<TabsTrigger value="notes">Internal Notes</TabsTrigger>
								<TabsTrigger value="properties">Properties</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="conversation" className="flex-1 overflow-y-auto p-4">
							<div className="space-y-4">
								{comments.filter(c => !c.is_internal_note).map(c => (
									<div key={c.id} className="bg-white border rounded p-4">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center space-x-2 text-sm text-gray-700">
												<UsersIcon className="w-3 h-3" />
												<span className="font-medium">{c.author?.full_name || 'User'}</span>
											</div>
											<div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
										</div>
										<div className="text-gray-800 whitespace-pre-wrap text-sm">{c.body}</div>
									</div>
								))}
							</div>
						</TabsContent>

						<TabsContent value="notes" className="flex-1 overflow-y-auto p-4">
							<div className="space-y-4">
								{comments.filter(c => c.is_internal_note).map(c => (
									<div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded p-4">
										<div className="flex items-center justify-between mb-2">
											<div className="text-sm font-medium text-yellow-900">{c.author?.full_name || 'Agent'}</div>
											<div className="text-xs text-yellow-800">{new Date(c.created_at).toLocaleString()}</div>
										</div>
										<div className="text-yellow-900 whitespace-pre-wrap text-sm">{c.body}</div>
									</div>
								))}
							</div>
						</TabsContent>

						<TabsContent value="properties" className="p-4">
							<div className="bg-white rounded border p-4 text-sm space-y-2">
								<div><span className="text-gray-500">Display ID:</span> <span className="text-gray-900">{ticket.display_id}</span></div>
								<div><span className="text-gray-500">Category:</span> <span className="text-gray-900">{ticket.category?.name}</span></div>
								<div><span className="text-gray-500">Created:</span> <span className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</span></div>
								<div><span className="text-gray-500">Updated:</span> <span className="text-gray-900">{new Date(ticket.updated_at).toLocaleString()}</span></div>
							</div>
						</TabsContent>

						{/* Reply composer */}
						<div className="p-4 border-t bg-white flex items-start space-x-3">
							<textarea
								className="flex-1 border rounded p-3 text-sm"
								rows={3}
								placeholder={isNote ? 'Add an internal note…' : 'Reply to requester…'}
								value={reply}
								onChange={(e) => setReply(e.target.value)}
							/>
							<div className="flex flex-col space-y-2">
								<button onClick={addComment} disabled={!reply.trim()} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center space-x-2 disabled:opacity-50">
									<Send className="w-4 h-4" />
									<span>Send</span>
								</button>
								<button onClick={() => setIsNote(!isNote)} className={`px-4 py-2 rounded border ${isNote ? 'bg-yellow-100 border-yellow-300 text-yellow-900' : 'text-gray-700'}`}>Internal Note</button>
							</div>
						</div>
					</Tabs>
				</main>
			</div>
		</div>
	);
}


