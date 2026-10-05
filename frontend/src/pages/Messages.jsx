import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Send,
  Users,
  User as UserIcon,
  Sparkles,
  Loader2,
  ShieldCheck,
  Clock,
  CheckCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'clubs'
  const [conversations, setConversations] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch user's direct conversations & approved clubs
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingConv(true);
      try {
        const [convRes, clubsRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/clubs')
        ]);

        if (convRes.data.success) {
          setConversations(convRes.data.conversations || []);
          if (convRes.data.conversations?.length > 0) {
            setSelectedPartner(convRes.data.conversations[0].user);
          }
        }

        if (clubsRes.data.clubs) {
          setMyClubs(clubsRes.data.clubs);
        }
      } catch (err) {
        console.error('Failed to load messaging data:', err);
      } finally {
        setLoadingConv(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Robust message merging and deduplication helper
  const mergeMessage = (prevMessages, newMsg, tempIdToRemove = null) => {
    if (!newMsg) return prevMessages;

    // 1. If message with the same real ID is already present
    if (newMsg.id && !String(newMsg.id).startsWith('temp-') && prevMessages.some(m => m.id === newMsg.id)) {
      if (tempIdToRemove) {
        return prevMessages.filter(m => m.id !== tempIdToRemove);
      }
      return prevMessages;
    }

    // 2. If this replaces an optimistic message (by explicit temp ID or matching sender + content)
    const tempIndex = prevMessages.findIndex(m => {
      if (tempIdToRemove && m.id === tempIdToRemove) return true;
      if (String(m.id).startsWith('temp-')) {
        const sameSender = String(m.sender_id) === String(newMsg.sender_id);
        const sameContent = (m.content || '').trim() === (newMsg.content || '').trim();
        return sameSender && sameContent;
      }
      return false;
    });

    if (tempIndex !== -1) {
      const updated = [...prevMessages];
      updated[tempIndex] = newMsg;
      return updated.filter((m, idx) => {
        if (idx === tempIndex) return true;
        if (String(m.id).startsWith('temp-') && String(m.sender_id) === String(newMsg.sender_id) && (m.content || '').trim() === (newMsg.content || '').trim()) {
          return false;
        }
        return true;
      });
    }

    // 3. Prevent duplicate socket echos within 3 seconds
    if (!String(newMsg.id).startsWith('temp-')) {
      const isDuplicateEcho = prevMessages.some(m => {
        if (m.id === newMsg.id) return true;
        const sameSender = String(m.sender_id) === String(newMsg.sender_id);
        const sameContent = (m.content || '').trim() === (newMsg.content || '').trim();
        const timeA = new Date(m.created_at || m.createdAt || Date.now()).getTime();
        const timeB = new Date(newMsg.created_at || newMsg.createdAt || Date.now()).getTime();
        return sameSender && sameContent && Math.abs(timeA - timeB) < 3000;
      });

      if (isDuplicateEcho) {
        return prevMessages;
      }
    }

    return [...prevMessages, newMsg];
  };

  // 2. Fetch active chat history when selected partner/club changes
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingChat(true);
      setMessages([]);
      try {
        if (activeTab === 'direct' && selectedPartner) {
          const res = await api.get(`/chat/direct/${selectedPartner.id}`);
          if (res.data.success) {
            setMessages(res.data.messages || []);
          }
        } else if (activeTab === 'clubs' && selectedClub) {
          const res = await api.get(`/chat/club/${selectedClub.id}`);
          if (res.data.success) {
            setMessages(res.data.messages || []);
          }
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchHistory();

    // Socket Room management
    if (socket) {
      if (activeTab === 'clubs' && selectedClub) {
        socket.emit('join_club_channel', selectedClub.id);
      }

      const handleNewMessage = (newMsg) => {
        if (activeTab === 'clubs' && newMsg.message_type === 'club_channel' && newMsg.club_id === selectedClub?.id) {
          setMessages(prev => mergeMessage(prev, newMsg));
        } else if (activeTab === 'direct' && newMsg.message_type === 'direct') {
          const isRelevant =
            (String(newMsg.sender_id) === String(selectedPartner?.id) && String(newMsg.receiver_id) === String(user.id)) ||
            (String(newMsg.sender_id) === String(user.id) && String(newMsg.receiver_id) === String(selectedPartner?.id));
          if (isRelevant) {
            setMessages(prev => mergeMessage(prev, newMsg));
          }
        }
      };

      const handleTyping = (data) => {
        if (activeTab === 'clubs' && data.targetId === selectedClub?.id) {
          setTypingUser(data.isTyping ? data.senderName : null);
        } else if (activeTab === 'direct' && String(data.senderId) === String(selectedPartner?.id)) {
          setTypingUser(data.isTyping ? data.senderName : null);
        }
      };

      socket.on('new_chat_message', handleNewMessage);
      socket.on('user_typing', handleTyping);

      return () => {
        if (activeTab === 'clubs' && selectedClub) {
          socket.emit('leave_club_channel', selectedClub.id);
        }
        socket.off('new_chat_message', handleNewMessage);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [activeTab, selectedPartner?.id, selectedClub?.id, socket, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (!socket || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        roomType: activeTab === 'clubs' ? 'club' : 'direct',
        targetId: activeTab === 'clubs' ? selectedClub?.id : selectedPartner?.id,
        senderName: user.name,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        roomType: activeTab === 'clubs' ? 'club' : 'direct',
        targetId: activeTab === 'clubs' ? selectedClub?.id : selectedPartner?.id,
        senderName: user.name,
        isTyping: false
      });
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      content: text,
      message_type: activeTab === 'clubs' ? 'club_channel' : 'direct',
      sender_id: user.id,
      receiver_id: activeTab === 'direct' ? selectedPartner?.id : null,
      club_id: activeTab === 'clubs' ? selectedClub?.id : null,
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: user.name, role: user.role }
    };

    setMessages(prev => mergeMessage(prev, optimisticMsg));
    setMessageInput('');

    try {
      const res = await api.post('/chat/send', {
        content: text,
        message_type: activeTab === 'clubs' ? 'club_channel' : 'direct',
        receiver_id: activeTab === 'direct' ? selectedPartner?.id : null,
        club_id: activeTab === 'clubs' ? selectedClub?.id : null
      });
      if (res.data.success) {
        setMessages(prev => mergeMessage(prev, res.data.message, tempId));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubs = myClubs.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-6 h-6" />
            </span>
            <span>Campus Messages & Channels</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time peer mentorship, club lounges, and direct communication
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl self-start">
          <button
            onClick={() => {
              setActiveTab('direct');
              if (conversations.length > 0 && !selectedPartner) {
                setSelectedPartner(conversations[0].user);
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'direct'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Direct Chats</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('clubs');
              if (myClubs.length > 0 && !selectedClub) {
                setSelectedClub(myClubs[0]);
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'clubs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Club Channels</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[720px]">
        {/* Left Sidebar (Conversations / Club list) */}
        <div className="lg:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/60">
          {/* Search Box */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'direct' ? 'Search contacts...' : 'Search club channels...'}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {loadingConv ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                <span className="text-xs">Loading contacts...</span>
              </div>
            ) : activeTab === 'direct' ? (
              filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active conversations found. Check the Mentors directory to start a chat!
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedPartner?.id === c.user.id;
                  return (
                    <button
                      key={c.user.id}
                      onClick={() => setSelectedPartner(c.user)}
                      className={`w-full text-left p-4 flex items-center space-x-3.5 transition ${
                        isSelected ? 'bg-indigo-600/15 border-l-4 border-indigo-500' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                          {c.user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-white truncate">{c.user.name}</h4>
                          {c.lastMessage && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {c.lastMessage?.content || 'Click to start chatting...'}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )
            ) : (
              /* Club Channels */
              filteredClubs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No clubs found.</div>
              ) : (
                filteredClubs.map((club) => {
                  const isSelected = selectedClub?.id === club.id;
                  return (
                    <button
                      key={club.id}
                      onClick={() => setSelectedClub(club)}
                      className={`w-full text-left p-4 flex items-center space-x-3.5 transition ${
                        isSelected ? 'bg-indigo-600/15 border-l-4 border-indigo-500' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 flex-shrink-0">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={club.name} className="w-11 h-11 rounded-xl object-cover" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate">{club.name}</h4>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-indigo-300 capitalize">
                          {club.category} Channel
                        </span>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right Chat Canvas */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-950/30">
          {/* Top Active Chat Bar */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
            {activeTab === 'direct' && selectedPartner ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                  {selectedPartner.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedPartner.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="inline-flex items-center text-emerald-400 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                      Online
                    </span>
                    <span>•</span>
                    <span className="capitalize">{selectedPartner.role}</span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'clubs' && selectedClub ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedClub.name} Channel</h3>
                  <p className="text-xs text-indigo-300 font-medium">All verified members & coordinators</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 font-medium">Select a conversation to start chatting</div>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-slate-900/40 to-slate-950/80">
            {loadingChat ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                <span className="text-xs">Loading chat history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No messages yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Send a message to break the ice and start the discussion!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && activeTab === 'clubs' && (
                      <span className="text-[11px] text-slate-400 font-medium mb-1 ml-1">
                        {msg.sender?.name || 'Member'}
                      </span>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div
                        className={`text-[10px] mt-1 text-right flex items-center justify-end space-x-1 ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-300" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {typingUser && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{typingUser} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-3"
          >
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={
                activeTab === 'clubs'
                  ? `Message #${selectedClub?.name || 'club-channel'}...`
                  : `Message ${selectedPartner?.name || 'recipient'}...`
              }
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
