import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User as UserIcon, Users, MessageSquare, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function ChatModal({
  isOpen,
  onClose,
  recipientUser, // For direct 1-on-1 chat (e.g. mentor)
  clubData // For club channel discussion
}) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isClubChat = Boolean(clubData);
  const recipientName = isClubChat
    ? clubData.name
    : (recipientUser?.name || 'Senior Mentor');
  const recipientSubtitle = isClubChat
    ? `${clubData.category || 'Campus'} Club Channel`
    : (recipientUser?.department ? `${recipientUser.department} • Senior Mentor` : 'Verified Senior Mentor');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Load initial messages
  useEffect(() => {
    if (!isOpen || !user) return;

    const targetRecipientId = recipientUser?.id || recipientUser?.user_id;

    const fetchMessages = async () => {
      setLoading(true);
      setSendError('');
      try {
        if (isClubChat && clubData?.id) {
          const res = await api.get(`/chat/club/${clubData.id}`);
          if (res.data.success) {
            setMessages(res.data.messages || []);
          }
        } else if (targetRecipientId) {
          const res = await api.get(`/chat/direct/${targetRecipientId}`);
          if (res.data.success) {
            setMessages(res.data.messages || []);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket Room management
    if (socket) {
      if (isClubChat && clubData?.id) {
        socket.emit('join_club_channel', clubData.id);
      }

      const handleNewMessage = (newMsg) => {
        if (isClubChat && newMsg.message_type === 'club_channel' && newMsg.club_id === clubData?.id) {
          setMessages(prev => mergeMessage(prev, newMsg));
        } else if (!isClubChat && newMsg.message_type === 'direct') {
          const isRelevant =
            (String(newMsg.sender_id) === String(targetRecipientId) && String(newMsg.receiver_id) === String(user.id)) ||
            (String(newMsg.sender_id) === String(user.id) && String(newMsg.receiver_id) === String(targetRecipientId));
          if (isRelevant) {
            setMessages(prev => mergeMessage(prev, newMsg));
          }
        }
      };

      const handleTyping = (data) => {
        if (isClubChat && data.targetId === clubData?.id) {
          setTypingUser(data.isTyping ? data.senderName : null);
        } else if (!isClubChat && String(data.senderId) === String(targetRecipientId)) {
          setTypingUser(data.isTyping ? data.senderName : null);
        }
      };

      socket.on('new_chat_message', handleNewMessage);
      socket.on('user_typing', handleTyping);

      return () => {
        if (isClubChat && clubData?.id) {
          socket.emit('leave_club_channel', clubData.id);
        }
        socket.off('new_chat_message', handleNewMessage);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [isOpen, recipientUser?.id, recipientUser?.user_id, clubData?.id, socket, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const targetRecipientId = recipientUser?.id || recipientUser?.user_id;
    if (!socket || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        roomType: isClubChat ? 'club' : 'direct',
        targetId: isClubChat ? clubData?.id : targetRecipientId,
        senderName: user.name,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        roomType: isClubChat ? 'club' : 'direct',
        targetId: isClubChat ? clubData?.id : targetRecipientId,
        senderName: user.name,
        isTyping: false
      });
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const targetRecipientId = recipientUser?.id || recipientUser?.user_id;

    if (!isClubChat && !targetRecipientId) {
      setSendError('Recipient information is incomplete. Please try again.');
      return;
    }

    // Optimistic UI message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      content: text,
      sender_id: user.id,
      receiver_id: isClubChat ? null : targetRecipientId,
      club_id: isClubChat ? clubData?.id : null,
      message_type: isClubChat ? 'club_channel' : 'direct',
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: user.name, role: user.role }
    };

    setMessages(prev => mergeMessage(prev, optimisticMsg));
    setInputText('');
    setSendError('');

    try {
      const res = await api.post('/chat/send', {
        content: text,
        message_type: isClubChat ? 'club_channel' : 'direct',
        receiver_id: isClubChat ? null : targetRecipientId,
        club_id: isClubChat ? clubData?.id : null
      });

      if (res.data.success) {
        setMessages(prev => mergeMessage(prev, res.data.message, tempId));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setSendError(err.response?.data?.message || 'Failed to send message. Please check connection.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg h-[620px] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base">
                  {isClubChat ? <Users className="w-5 h-5" /> : (recipientName.charAt(0) || <UserIcon className="w-5 h-5" />)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight flex items-center space-x-1.5">
                  <span className="truncate max-w-[240px]">{recipientName}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]">
                  {typingUser ? (
                    <span className="text-emerald-400 font-semibold">{typingUser} is typing...</span>
                  ) : (
                    recipientSubtitle
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {sendError && (
            <div className="px-4 py-2 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                <span className="text-xs">Loading conversation history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 text-indigo-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-200">
                  {isClubChat ? `Welcome to #${clubData.name}` : `Start chatting with ${recipientName}`}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {isClubChat
                    ? 'Connect with club coordinators and fellow members.'
                    : 'Ask for guidance on courses, internships, and project advice!'}
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
                    {!isMe && (
                      <span className="text-[10px] text-slate-400 font-semibold mb-1 ml-1">
                        {msg.sender?.name || recipientName}
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/20'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-black/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div
                        className={`text-[10px] mt-1 text-right font-medium ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isClubChat ? `Message #${clubData?.name || 'channel'}...` : `Message ${recipientName}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
