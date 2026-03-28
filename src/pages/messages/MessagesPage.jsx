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
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-semibold text-surface-900 dark:text-white text-sm truncate">{conv.contact_name}</h3>
                        <span className="text-xs text-surface-400 shrink-0 ml-2">{timeAgo(conv.last_message_date)}</span>
                      </div>
                      <p className={`text-sm truncate ${!conv.is_read ? 'font-semibold text-surface-900 dark:text-white' : 'text-surface-500'}`}>
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-3 bg-white dark:bg-surface-900 shrink-0">
                <button 
                  onClick={() => { setActiveContact(null); setSearchParams({}); }}
                  className="md:hidden p-2 -ml-2 text-surface-500 hover:text-surface-900 dark:hover:text-white"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div className="font-semibold text-surface-900 dark:text-white">
                  {activeContact.contact_name}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-surface-50 dark:bg-surface-900/50">
                {loadingMsgs ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-surface-500">
                    <p>መልዕክት ያስገቡ — Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {msg.product_title && (
                            <div className="text-[10px] text-surface-400 mb-1 px-2 uppercase tracking-wide">
                              Re: {msg.product_title}
                            </div>
                          )}
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-primary-600 text-white rounded-br-sm' 
                              : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-bl-sm'
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-surface-400 mt-1 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="መልዕክት ይፃፉ... (Type a message...)"
                    className="flex-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <HiOutlinePaperAirplane className="w-5 h-5 -ml-0.5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-surface-500 bg-surface-50 dark:bg-surface-900/50">
              <HiOutlineChatBubbleLeftEllipsis className="w-16 h-16 opacity-20 mb-4" />
              <p>ውይይት ለመጀመር ከግራ ይምረጡ</p>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessagesPage;
