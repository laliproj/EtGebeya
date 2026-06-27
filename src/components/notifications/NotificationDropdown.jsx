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
