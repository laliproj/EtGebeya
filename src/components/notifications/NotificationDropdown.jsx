import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi2';
import { markAsReadAPI, markAllAsReadAPI, removeNotificationAPI } from '../../store/notificationSlice';
import { timeAgo } from '../../utils/helpers';

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.notifications);

  const handleMarkAsRead = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markAsReadAPI(id));
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeNotificationAPI(id));
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden animate-scale-in origin-top-right z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
        <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
        {items.length > 0 && (
          <button
            onClick={() => dispatch(markAllAsReadAPI())}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {items.length > 0 ? (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {items.map((notification) => (
              <div
                key={notification.id}
                onClick={(e) => {
                  if (!notification.read) handleMarkAsRead(e, notification.id);
                  onClose();
                }}
                className={`p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors group cursor-pointer ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
              >
                <Link 
                  to={notification.type === 'message' ? '/messages' : '/notifications'} 
                  className="flex gap-3"
                >
                  <div className="text-2xl mt-0.5 shrink-0">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-700 dark:text-surface-300'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-surface-400 mt-1.5">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="p-1 text-surface-400 hover:text-primary-600 dark:hover:text-primary-400"
                        title="Mark as read"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="p-1 text-surface-400 hover:text-danger-500"
                      title="Delete notification"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-surface-500 font-medium">No notifications yet</p>
            <p className="text-sm text-surface-400 mt-1">We'll let you know when something happens.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block w-full py-2 text-center text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
