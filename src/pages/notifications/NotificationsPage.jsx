import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi2';
import { markAsReadAPI, markAllAsReadAPI, removeNotificationAPI } from '../../store/notificationSlice';
import { timeAgo, formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
            <HiOutlineBell className="w-8 h-8 text-primary-500" />
            Notifications
          </h1>
          <p className="text-surface-500 mt-1">
            You have {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
          </p>
        </div>

        {items.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => dispatch(markAllAsReadAPI())}
            disabled={unreadCount === 0}
            icon={HiOutlineCheck}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {items.map((notification) => (
              <div 
                key={notification.id}
                className={`p-6 transition-colors group flex gap-4 ${
                  !notification.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}
              >
                <div className="text-3xl mt-1 shrink-0">{notification.icon}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className={`text-base ${!notification.read ? 'font-bold text-surface-900 dark:text-white' : 'font-semibold text-surface-700 dark:text-surface-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-medium text-surface-400 whitespace-nowrap">
                      {formatDate(notification.createdAt)} ({timeAgo(notification.createdAt)})
                    </span>
                  </div>
                  
                  <p className={`text-sm ${!notification.read ? 'text-surface-700 dark:text-surface-200 font-medium' : 'text-surface-500 dark:text-surface-400'}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={() => dispatch(markAsReadAPI(notification.id))}
                      className="p-2 text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 bg-surface-100 dark:bg-surface-800 rounded-lg"
                      title="Mark as read"
                    >
                      <HiOutlineCheck className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(removeNotificationAPI(notification.id))}
                    className="p-2 text-surface-400 hover:text-danger-500 bg-surface-100 dark:bg-surface-800 rounded-lg"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 py-16">
          <EmptyState
            icon={HiOutlineBell}
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
