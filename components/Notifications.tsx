import React from 'react';
import type { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsPage: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const handleClearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-cyan-400">Central de Notificações</h1>
        <div className="flex items-center space-x-4">
            <button
                onClick={handleClearRead}
                className="text-sm text-gray-400 hover:text-red-400 transition"
            >
                Limpar Lidas
            </button>
            <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Marcar todas como lidas
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                notification.read
                  ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                  : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 neon-glow'
              }`}
            >
                {!notification.read && <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>}
                <div className="flex-grow">
                    <p className={`text-gray-200 ${!notification.read ? 'font-semibold' : ''}`}>{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <p className="text-gray-400">Nada a relatar. O sistema está... quieto.</p>
            <p className="text-xs text-gray-600 mt-2">Demasiado quieto.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
