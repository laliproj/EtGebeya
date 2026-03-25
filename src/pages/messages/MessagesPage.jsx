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
          setActiveContact({ contact_id: contactId, contact_name: 'Loading...' });
          await loadMessages(contactId);
        } catch (e) {}
      };
      fetchDirect();
    }
  }, [searchParams, user]);

  const loadMessages = async (contactId) => {
    setLoadingMsgs(true);
    try {
      const msgs = await messagesService.getHistory(contactId);
      setMessages(msgs);
      // Update active contact name based on fetched conversations if possible
      const conv = conversations.find(c => c.contact_id.toString() === contactId.toString());
      if (conv) setActiveContact(conv);
    } catch (err) {
      toast.error('የመልዕክት ታሪክ ማምጣት አልተሳካም (Failed to load chat)');
    } finally {
      setLoadingMsgs(false);
      scrollToBottom();
    }
  };

  const selectConversation = (conv) => {
    setActiveContact(conv);
    setSearchParams({ user_id: conv.contact_id });
    loadMessages(conv.contact_id);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    setSending(true);
    try {
      // If there's a product_id in the URL (starting chat about specific product)
      const productId = searchParams.get('product_id');
      await messagesService.sendMessage(activeContact.contact_id, newMessage, productId);
      
      setNewMessage('');
      await loadMessages(activeContact.contact_id);
      loadConversations(); // Update side list latest message
      
      // Remove product_id from URL after first message
      if (productId) setSearchParams({ user_id: activeContact.contact_id });
    } catch (err) {
      toast.error('መልዕክት መላክ አልተሳካም (Failed to send message)');
    } finally {
      setSending(false);
