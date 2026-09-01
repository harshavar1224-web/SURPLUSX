import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Check,
  ShieldCheck,
  Building2,
  User,
  HeartHandshake,
  Store,
  Clock,
  Sparkles,
  Phone,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConversationThread, UserRole, isAdminRole } from '../../types';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    threads,
    chatMessages,
    activeThreadId,
    setActiveThreadId,
    sendChatMessage,
    markThreadAsRead,
    createConversationThread,
    triggerToast,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter threads for current user (or all if admin)
  const userThreads = threads.filter(
    (t) =>
      isAdminRole(currentUser?.role) ||
      t.participantIds.includes(currentUser?.id || 'user-consumer-1')
  );

  const filteredThreads = userThreads.filter((t) => {
    const participantNames = t.participants.map((p) => p.name).join(' ');
    const title = t.contextTitle || '';
    return (
      participantNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeThread =
    userThreads.find((t) => t.id === activeThreadId) || userThreads[0] || null;

  const currentMessages = activeThread ? chatMessages[activeThread.id] || [] : [];

  // Find recipient participant in active thread
  const otherParticipant = activeThread?.participants.find(
    (p) => p.id !== (currentUser?.id || 'user-consumer-1')
  ) || {
    id: 'support-agent',
    name: 'SurplusX Support',
    role: 'ADMIN' as UserRole,
  };

  useEffect(() => {
    if (activeThread) {
      markThreadAsRead(activeThread.id);
    }
  }, [activeThread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeThread || isSending) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      await sendChatMessage(activeThread.id, content);
    } catch (err) {
      triggerToast('Failed to send message', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'CONSUMER':
        return <User className="w-3.5 h-3.5 text-emerald-600" />;
      case 'BUSINESS':
        return <Store className="w-3.5 h-3.5 text-blue-600" />;
      case 'NGO':
        return <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const cannedQuickReplies = [
    'I am on my way to collect the package.',
    'Is the temperature cooler bag ready?',
    'Please confirm the OTP at the counter.',
    'Thank you for your partnership in zero-waste!',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              SurplusX Messages
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Secure, end-to-end authorized communication between verified platform participants.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Verified Authorized Channels</span>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-[640px]">
        {/* Left Side: Threads List */}
        <div className="lg:col-span-4 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/40">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-200/80 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No conversation threads found</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const other = thread.participants.find(
                  (p) => p.id !== (currentUser?.id || 'user-consumer-1')
                ) || thread.participants[0];

                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      markThreadAsRead(thread.id);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={
                            other.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={other.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                          {getRoleIcon(other.role)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {other.organizationName || other.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatMessageTime(thread.lastMessage?.timestamp || thread.updatedAt)}
                          </span>
                        </div>

                        <div className="text-[11px] font-medium text-emerald-700 truncate mb-1">
                          {thread.contextTitle}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <p className="truncate text-[11px] text-slate-600">
                            {thread.lastMessage?.content || 'No messages yet'}
                          </p>
                          {thread.unreadCount && thread.unreadCount > 0 ? (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        otherParticipant.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                      {getRoleIcon(otherParticipant.role)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {otherParticipant.organizationName || otherParticipant.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {otherParticipant.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      <span>{activeThread.authRelationReason || 'Active SurplusX Relation'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    {activeThread.contextType} #{activeThread.contextId || 'Active'}
                  </span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {/* Security encryption banner */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified relationship channel: {activeThread.authRelationReason}
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isMine =
                    msg.senderId === (currentUser?.id || 'user-consumer-1') ||
                    msg.senderRole === currentUser?.role;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        {!isMine && (
                          <div className="font-bold text-[11px] text-emerald-700 mb-1 flex items-center gap-1">
                            <span>{msg.senderName}</span>
                            <span className="text-[9px] font-normal text-slate-400">
                              ({msg.senderRole})
                            </span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMine ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isMine && (
                            <span>
                              {msg.read ? (
                                <CheckCheck className="w-3 h-3 text-emerald-200" />
                              ) : (
                                <Check className="w-3 h-3 text-emerald-200" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Suggestions */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Quick:
                </span>
                {cannedQuickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputMessage(reply);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-600 text-[11px] transition-colors cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${otherParticipant.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a conversation from the left to coordinate food surplus collections, orders, or support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
