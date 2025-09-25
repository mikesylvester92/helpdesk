'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Settings, LogOut, CircleHelp as HelpCircle, Inbox, Clock, CircleCheck as CheckCircle, Archive, BarChart3 } from 'lucide-react';

const views = [
  { name: 'Dashboard', icon: BarChart3, count: null, href: '/dashboard' },
  { name: 'Unassigned', icon: Inbox, count: 12 },
  { name: 'My Open Tickets', icon: User, count: 8 },
  { name: 'All Open Tickets', icon: Clock, count: 45 },
  { name: 'Recently Closed', icon: CheckCircle, count: 23 }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('All Open Tickets');

  const handleViewClick = (viewName: string) => {
    setActiveView(viewName);
    if (viewName === 'Dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/tickets?view=${encodeURIComponent(viewName)}`);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">HelpDesk Pro</h1>
            </div>
            
            <div className="relative ml-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Agent</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Views</h2>
            <div className="space-y-1">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = view.name === 'Dashboard' 
                  ? pathname === '/dashboard'
                  : activeView === view.name;
                return (
                  <button
                    key={view.name}
                    onClick={() => handleViewClick(view.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{view.name}</span>
                    </div>
                    {view.count !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {view.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}