import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Bell, MessageSquare, AlertTriangle, RefreshCw, CheckCheck, Clock, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export const NotificationsPage: React.FC = () => {
  usePageTitle('Notifications');
  const { notifications, markNotificationsAsRead } = usePortal();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const getIcon = (type: 'update' | 'message' | 'alert') => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4.5 w-4.5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />;
      default:
        return <RefreshCw className="h-4.5 w-4.5 text-purple-500" />;
    }
  };

  const getBackground = (type: 'update' | 'message' | 'alert') => {
    switch (type) {
      case 'message':
        return 'bg-blue-50';
      case 'alert':
        return 'bg-amber-50';
      default:
        return 'bg-purple-50';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header action area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Workspace Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track timeline changes, client comments, and critical handoff alerts.
          </p>
        </div>

        <button
          id="mark-all-read-btn"
          onClick={markNotificationsAsRead}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-sm"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Tabs and counts */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <span className="text-xs font-semibold text-slate-400">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </span>
      </div>

      {/* Primary Notifications list card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-4">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No notifications to display</h3>
            <p className="text-xs text-slate-400 mt-1">You are fully caught up with all current workspace alerts!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-5 flex items-start justify-between gap-4 transition duration-150 ${
                  notification.read ? 'bg-white' : 'bg-blue-50/20'
                }`}
              >
                <div className="flex gap-4">
                  {/* Category Styled Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getBackground(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Body description */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread alert" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                      {notification.description}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Optional project links */}
                {notification.projectId && (
                  <Link
                    to={notification.projectId ? `/projects/${notification.projectId}` : '#'}
                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-600 transition shadow-sm"
                  >
                    <span>View Workspace</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Pro Tip Card */}
      <div className="rounded-2xl border border-blue-50 bg-blue-50/40 p-5 flex gap-4 items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Sparkles className="h-5.5 w-5.5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Automated Alerts Configured</h4>
          <p className="text-xs text-blue-700 leading-normal mt-1">
            Whenever clients request revisions or sign off on visual assets, the agency is immediately alerted on their activity streams. Clients are likewise pinged whenever new handoff versions are uploaded. No more chasing down replies!
          </p>
        </div>
      </div>

    </div>
  );
};
export default NotificationsPage;
