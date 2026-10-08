"use client";

import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '@/lib/api';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { sfx } from '@/lib/sfx';
import { WarHornModal } from '@/components/WarHornModal';

interface ChatStageProps {
  conversationId: string | null;
  recipient: UserProfile | null;
}

const EMOJI_CATEGORIES = {
  clash: {
    label: '⚔️ Clash',
    emojis: ['⚔️', '🛡️', '👑', '🔥', '💥', '⚡', '💣', '🏹', '🧙', '🗡️', '📜', '🏆', '💀', '💎', '🍖', '🐗', '🐉', '👹', '👺', '🧟', '🪵', '🪙'],
  },
  emotes: {
    label: '😀 Emotes',
    emojis: ['😂', '🤣', '😃', '😎', '🥳', '😈', '😡', '🤯', '😱', '👿', '👍', '👎', '👊', '✌️', '💪', '🤝', '💯', '✨', '🤩', '😤', '🙌', '🫡'],
  },
  tactics: {
    label: '🏰 Tactics',
    emojis: ['🏰', '⛳', '🚨', '🎯', '🛠️', '🧱', '🔮', '🩸', '📦', '🔔', '🌟', '⭐', '💫', '⏳', '🎯', '🗺️', '📢', '🚀', '🔮', '📍'],
  },
};

export const ChatStage: React.FC<ChatStageProps> = ({ conversationId, recipient }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<'clash' | 'emotes' | 'tactics'>('clash');
  const [isWarHornOpen, setIsWarHornOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);
      chatApi.markAsRead(conversationId).catch(() => {});
      if (socket && user) {
        socket.emit('message_read', { conversationId, readByUserId: user._id });
      }
    } catch (err) {
      console.error('[Load Messages Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Load message history when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    if (socket) {
      socket.emit('join_conversation', conversationId);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId, socket, user?._id]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const [undoMessage, setUndoMessage] = useState<{
    msg: any;
    originalText: string;
    secondsLeft: number;
  } | null>(null);
  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  const handleUndoMessage = async () => {
    if (!undoMessage) return;
    const targetMsg = undoMessage.msg;
    const textToRestore = undoMessage.originalText;

    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }
    setUndoMessage(null);

    try {
      setInputText(textToRestore);
      const res = await chatApi.deleteMessage(targetMsg._id, true);
      const undonePayload = { _id: targetMsg._id, conversationId: targetMsg.conversationId, isUndone: true };
      setMessages((prev) => prev.filter((m) => m._id !== targetMsg._id));
      if (socket) {
        socket.emit('delete_message', undonePayload);
      }
    } catch (err) {
      console.error('[Undo Message Error]', err);
    }
  };

  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg._id);
    setEditingText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim()) return;
    try {
      const updatedMsg = await chatApi.editMessage(msgId, editingText.trim());
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? updatedMsg : m))
      );
      if (socket) {
        socket.emit('edit_message', updatedMsg);
      }
      setEditingMessageId(null);
      setEditingText('');
    } catch (err) {
      console.error('[Save Edit Error]', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Are you sure you want to delete this dispatch?')) return;
    try {
      const deletedMsg = await chatApi.deleteMessage(msgId);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? deletedMsg : m))
      );
      if (socket) {
        socket.emit('delete_message', deletedMsg);
      }
    } catch (err) {
      console.error('[Delete Message Error]', err);
    }
  };

  // Listen for real-time messages & typing events & edits/deletions
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleReceiveMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
        if (senderId !== user?._id) {
          sfx.playReceiveMessage();
        }
        chatApi.markAsRead(conversationId).catch(() => {});
        if (user) {
          socket.emit('message_read', { conversationId, readByUserId: user._id });
        }
      }
    };

    const handleMessageEdited = (updatedMsg: any) => {
      if (updatedMsg.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
      }
    };

    const handleMessageDeleted = (deletedMsg: any) => {
      if (deletedMsg.conversationId === conversationId) {
        if (deletedMsg.isUndone) {
          setMessages((prev) => prev.filter((m) => m._id !== deletedMsg._id));
        } else {
          setMessages((prev) =>
            prev.map((m) => (m._id === deletedMsg._id ? deletedMsg : m))
          );
        }
      }
    };

    const handleUserTyping = ({ userId, username }: any) => {
      if (userId !== user?._id) {
        setTypingUser(username);
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ userId }: any) => {
      if (userId !== user?._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, conversationId, user?._id]);

  // Handle Typing Indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!socket || !conversationId || !user) return;

    socket.emit('typing', {
      conversationId,
      userId: user._id,
      username: user.username,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        conversationId,
        userId: user._id,
      });
    }, 2000);
  };

  // Send Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !conversationId || !recipient) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket && user) {
      socket.emit('stop_typing', { conversationId, userId: user._id });
    }

    try {
      const payload: any = {
        conversationId,
        text: textToSend,
      };

      if (!recipient.isGroup) {
        payload.recipientId = recipient._id;
      }

      const sentMessage = await chatApi.sendMessage(payload);

      sfx.playSendMessage();
      setMessages((prev) => [...prev, sentMessage]);

      if (socket) {
        socket.emit('send_message', sentMessage);
      }

      // Initialize 5-Second Undo Option
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      setUndoMessage({
        msg: sentMessage,
        originalText: textToSend,
        secondsLeft: 5,
      });

      undoIntervalRef.current = setInterval(() => {
        setUndoMessage((prev) => {
          if (!prev || prev.secondsLeft <= 1) {
            if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
            return null;
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    } catch (err) {
      console.error('[Send Message Error]', err);
    }
  };

  // Empty state if no conversation selected
  if (!recipient || !conversationId) {
    return (
      <main className="flex-1 flex flex-col bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] overflow-hidden items-center justify-center p-8 text-center select-none min-h-[500px]">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#FFF2D7] to-[#F5DDB3] border-2 border-[#D4A359] flex items-center justify-center text-[#4A2F08] mb-4 shadow-[0_4px_15px_rgba(190,130,30,0.25)] p-4 overflow-hidden">
          <img src="/images/coc-logo.png" alt="Clash of Chats Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="font-headline-md text-headline-md text-[#3E2415] uppercase tracking-wider mb-2 font-black">
          SELECT A WARRIOR OR CLAN TO CLASH
        </h2>
        <p className="font-body-md text-body-md text-[#6E4C38] max-w-md">
          Choose a warrior or warband clan from the roster on the left to start sending tactical dispatches in real time.
        </p>
      </main>
    );
  }

  const isOnline = onlineUsers.includes(recipient._id) || recipient.isOnline;

  return (
    <main className="flex-1 flex flex-col bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] overflow-hidden">

      {/* Stage Banner Header */}
      <div className="h-20 px-4 bg-gradient-to-b from-[#FBF2E5] to-[#F5E6D3] border-b-2 border-[#895333] flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#FFF2D7] to-[#F5DDB3] border-2 border-[#D4A359] flex items-center justify-center text-2xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)]">
            {recipient.isGroup ? '🛡️' : '🔥'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase tracking-wide font-black">
                {recipient.username}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBD8C1] border border-[#CBAF90] text-[#693E1B] font-label-sm text-[11px] uppercase font-black">
                {recipient.isGroup ? 'CLAN WARBAND CHAT' : (recipient.role || 'Warrior')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-body-sm text-body-sm text-[#6E4C38]">
              <span className="font-semibold">
                {recipient.isGroup ? `${recipient.role || 'Warband Clan'}` : 'Warband Active'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${recipient.isGroup || isOnline ? 'text-[#E53935]' : 'text-[#8A6348]'}`}>
                <span className={`w-2 h-2 rounded-full ${recipient.isGroup || isOnline ? 'bg-[#E53935] animate-pulse' : 'bg-[#A8988B]'}`} />
                {recipient.isGroup ? 'Group Active' : (isOnline ? 'Online' : 'Offline')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] flex items-center justify-center text-[#4A2D19] shadow-sm transition-colors cursor-pointer"
            title="Search Chat"
          >
            <span className="material-symbols-outlined text-base">search</span>
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] flex items-center justify-center text-[#4A2D19] shadow-sm transition-colors cursor-pointer"
            title="More Options"
          >
            <span className="material-symbols-outlined text-base">more_vert</span>
          </button>
        </div>
      </div>

      {/* Live Chat Theatre Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 xl:p-5 flex flex-col gap-4 bg-[#FBF7F0] shadow-[inset_0_2px_8px_rgba(100,60,30,0.06)] min-h-[400px]">

        {loading ? (
          <div className="text-center p-8 text-[#8A6348] animate-pulse font-body-sm font-bold">
            Retrieving tactical scrolls from server...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8 text-[#8A6348] font-body-sm font-bold">
            No dispatches recorded yet. Speak into the war horn to begin!
          </div>
        ) : (
          messages.map((msg) => {
            const getSenderId = (s: any) => {
              if (!s) return '';
              if (typeof s === 'string') return s;
              if (typeof s === 'object') return s._id || s.id || '';
              return String(s);
            };

            const senderId = getSenderId(msg.sender);
            const currentUserId = user?._id || (user as any)?.id || '';
            const isOutgoing = Boolean(senderId && currentUserId && String(senderId) === String(currentUserId));

            const timeStr = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
            const senderName = isOutgoing
              ? (user?.username || 'You')
              : (senderObj?.username || recipient.username);

            const senderRole = isOutgoing
              ? (user?.role || 'Chieftain')
              : (senderObj?.role || 'Warrior');

            const isEditingThis = editingMessageId === msg._id;

            return (
              <div
                key={msg._id || Math.random()}
                className={`flex items-start gap-3 max-w-2xl w-full ${isOutgoing ? 'self-end flex-row-reverse justify-start' : 'self-start justify-start'
                  }`}
              >
                {/* Sender Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#FADDB7] to-[#E8BE88] border border-[#CFA067] flex items-center justify-center text-[#553013] font-headline-sm font-black shadow-sm flex-shrink-0">
                  <span>{senderName.charAt(0).toUpperCase()}</span>
                </div>

                {/* Message Bubble Card */}
                <div className={`flex flex-col gap-1.5 flex-1 min-w-0 ${isOutgoing ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-[#5B3317] font-bold">
                      {senderName}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#FBD46E] text-[#4A2F08] border border-[#DEC095] font-label-sm text-[10px] rounded uppercase font-black">
                      {senderRole}
                    </span>
                    <span className="font-body-sm text-body-sm text-[#8A6348]">{timeStr}</span>

                    {/* Edit, Delete, and Undo Buttons for Outgoing Messages */}
                    {isOutgoing && !msg.isDeleted && !isEditingThis && (
                      <div className="flex items-center gap-1.5 ml-2">
                        {undoMessage?.msg._id === msg._id && (
                          <button
                            onClick={handleUndoMessage}
                            title="Undo sent message"
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-[10px] uppercase shadow transition-all cursor-pointer animate-pulse"
                          >
                            <span className="material-symbols-outlined text-[12px]">undo</span>
                            <span>Undo ({undoMessage?.secondsLeft}s)</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(msg)}
                          title="Edit message"
                          className="text-[#8A6348] hover:text-[#C88421] transition-colors p-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          title="Delete message"
                          className="text-[#8A6348] hover:text-[#E53935] transition-colors p-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl ${isOutgoing
                      ? 'rounded-tr-none bg-gradient-to-b from-[#E53935] via-[#C62828] to-[#9E1A1A] text-white border-2 border-[#7F0000] shadow-[0_4px_12px_rgba(186,26,26,0.35)]'
                      : 'rounded-tl-none bg-[#FFFFFF] text-[#24140D] border-2 border-[#D4A359] shadow-[0_4px_10px_rgba(120,80,30,0.08)]'
                      }`}
                  >
                    {isEditingThis ? (
                      <div className="flex flex-col gap-2 min-w-[240px]">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(msg._id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="bg-[#FFFDF6] border-2 border-[#C88421] text-[#24140D] px-2.5 py-1.5 rounded-lg focus:outline-none font-body-md text-body-md w-full"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className={`px-2.5 py-1 text-xs font-bold transition-colors ${isOutgoing ? 'text-[#FFCDD2] hover:text-white' : 'text-[#8A6348] hover:text-[#553013]'}`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg._id)}
                            className="px-3 py-1 text-xs font-bold bg-[#F5B823] hover:bg-[#D49810] text-[#3E2207] rounded-md transition-colors shadow-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`font-body-md text-body-md leading-relaxed whitespace-pre-wrap break-words ${msg.isDeleted ? (isOutgoing ? 'italic text-[#FFCDD2] opacity-90' : 'italic text-[#8A6348] opacity-80') : ''}`}>
                          {msg.isDeleted ? 'This msg is deleted' : msg.text}
                        </p>
                        {msg.isEdited && !msg.isDeleted && (
                          <span className={`block text-[11px] font-bold mt-1 italic ${isOutgoing ? 'text-[#FFCDD2]' : 'text-[#8A6348]'}`}>
                            Edited Msg
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Outgoing status checkmarks */}
                  {isOutgoing && !msg.isDeleted && (
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-[#8A6348]">
                      <span className="text-[#E53935] font-extrabold flex items-center">
                        {msg.read ? '✓✓ Read' : '✓ Delivered'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#7C5A42] font-label-sm text-label-sm py-1 font-bold">
            <span className="material-symbols-outlined text-base text-[#C88421] animate-bounce">
              edit_note
            </span>
            <span>{typingUser || recipient.username} is forging a message</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C88421] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C88421] animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C88421] animate-pulse delay-300" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stage Bottom Console */}
      <div className="relative p-3 bg-[#FBF2E5] border-t-2 border-[#895333] flex flex-col gap-2">

        {/* Popover Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-16 left-3 z-50 w-72 sm:w-80 bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_8px_24px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col p-3 gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-[#E8DAC9] pb-2">
              <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase font-black tracking-wider flex items-center gap-1.5">
                <span>⚔️</span> BATTLE EMOTES
              </span>
              <div className="flex items-center gap-1">
                {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((catKey) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setEmojiCategory(catKey)}
                    className={`px-2 py-1 rounded-lg font-label-sm text-label-sm uppercase font-bold transition-all cursor-pointer ${
                      emojiCategory === catKey
                        ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black border border-[#AA770B]'
                        : 'bg-[#F2E5D6] text-[#64422A] hover:bg-[#E5D5C2]'
                    }`}
                  >
                    {EMOJI_CATEGORIES[catKey].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-1 bg-[#FAF5ED] rounded-xl border border-[#E7D7C6]">
              {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-9 h-9 rounded-lg hover:bg-[#F2DFCD] hover:scale-110 text-xl flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer Main Input Trench */}
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#FFFFFF] border-2 border-[#C5A88B] p-2 rounded-xl shadow-[inset_0_2px_5px_rgba(100,60,30,0.1)]">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showEmojiPicker
                ? 'bg-[#F5C242] text-[#361E05] shadow-sm'
                : 'hover:bg-[#F6EBE0] text-[#7A563D] hover:text-[#3E2415]'
            }`}
            title="Add Battle Emote / Emoji"
          >
            <span className="material-symbols-outlined text-xl">mood</span>
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-lg hover:bg-[#F6EBE0] text-[#7A563D] hover:text-[#3E2415] flex items-center justify-center transition-colors cursor-pointer"
            title="Attach Battle Plan Scroll"
          >
            <span className="material-symbols-outlined text-xl">attach_file</span>
          </button>

          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg bg-[#F5EAD9] hover:bg-[#EFE0CB] border border-[#DAC2A8] text-[#5C381E] hover:text-[#24140D] font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 font-black shadow-sm transition-all cursor-pointer"
            title="Schedule Attack Order Message"
          >
            <span className="material-symbols-outlined text-base">schedule</span>
            <span className="hidden sm:inline">Schedule</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Speak into the War Horn..."
            className="flex-1 bg-transparent px-2 font-body-md text-body-md text-[#24140D] placeholder:text-[#9A7D69] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-10 px-4 rounded-xl bg-gradient-to-b from-[#E53935] to-[#B71C1C] hover:brightness-110 active:translate-y-0.5 text-white font-headline-sm text-[16px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_3px_6px_rgba(180,20,20,0.35)] border-b-2 border-[#7F0E0E] transition-all font-black cursor-pointer disabled:opacity-40"
          >
            <span className="hidden sm:inline">SEND</span>
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </form>

      </div>

      <WarHornModal
        isOpen={isWarHornOpen}
        onClose={() => setIsWarHornOpen(false)}
        socket={socket}
        onBroadcastSuccess={() => {
          if (conversationId) fetchMessages();
        }}
      />

    </main>
  );
};
