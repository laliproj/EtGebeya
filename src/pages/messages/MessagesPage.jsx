import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineChatBubbleLeftEllipsis, HiOutlinePaperAirplane, HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import messagesService from '../../services/messagesService';
import { timeAgo } from '../../utils/helpers';
import Skeleton from '../../components/common/Skeleton';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Authentication Guard
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (err) {
      toast.error('መልዕክቶችን ማምጣት አልተሳካም (Failed to load conversations)');
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // Refresh conversations every 15 seconds
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle URL param (e.g., coming from Product Detail page)
  useEffect(() => {
    const contactId = searchParams.get('user_id');
    if (contactId && contactId !== user?.id?.toString()) {
      // If we have a user_id param, select them
      const fetchDirect = async () => {
        try {
          // Add dummy active contact to start chat, their name will update once msgs load
