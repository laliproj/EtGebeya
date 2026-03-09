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
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600">
          <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">መልዕክቶች (Messages)</h1>
      </div>

      <div className="flex-1 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden flex shadow-sm min-h-0">
        
        {/* Sidebar / Contacts */}
        <div className={`w-full md:w-80 border-r border-surface-200 dark:border-surface-800 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-surface-100 dark:border-surface-800">
            <h2 className="font-semibold text-surface-900 dark:text-white">ውይይቶች (Conversations)</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConv ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <HiOutlineChatBubbleLeftEllipsis className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ምንም መልዕክቶች የሉም (No conversations yet)</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-800">
                {conversations.map(conv => (
                  <div
                    key={conv.contact_id}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      activeContact?.contact_id?.toString() === conv.contact_id.toString()
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {conv.contact_avatar ? (
                        <img src={conv.contact_avatar} alt={conv.contact_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-surface-500">
                          <HiOutlineUser className="w-6 h-6" />
                        </div>
                      )}
                      {!conv.is_read && conv.last_message_date && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-danger-500 border-2 border-white dark:border-surface-900 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
