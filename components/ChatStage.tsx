"use client";

import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '@/lib/api';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { sfx } from '@/lib/sfx';
import { WarHornModal } from '@/components/WarHornModal';
import { STICKERS, formatStickerOrText } from '@/lib/stickers';
import { UserProfileModal } from '@/components/UserProfileModal';

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

const AVATAR_PRESETS_MAP: Record<string, string> = {
  bk: '/avatars/barbarian.png',
  aq: '/avatars/archer.png',
  pk: '/avatars/pekka.png',
  armored: '/avatars/armored.png',
  sorcerer: '/avatars/sorcerer.png',
  golem: '/avatars/golem.png',
  champion: '/avatars/champion.png',
  th: '/avatars/townhall.png',
  shield: '/avatars/barbarian.png',
};

export const getRecipientAvatarSrc = (avatar?: string, isGroup?: boolean) => {
  if (!avatar) {
    return isGroup ? '/avatars/townhall.png' : '/avatars/barbarian.png';
  }
  if (AVATAR_PRESETS_MAP[avatar]) {
    return AVATAR_PRESETS_MAP[avatar];
  }
  if (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:')) {
    return avatar;
  }
  return isGroup ? '/avatars/townhall.png' : '/avatars/barbarian.png';
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
  const [pickerMode, setPickerMode] = useState<'emojis' | 'stickers'>('emojis');
  const [emojiCategory, setEmojiCategory] = useState<'clash' | 'emotes' | 'tactics'>('clash');
  const [stickerCategory, setStickerCategory] = useState<'All' | 'Troops' | 'Emotes' | 'Reactions'>('All');
  const [isWarHornOpen, setIsWarHornOpen] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<{
    _id: string;
    text: string;
    senderName: string;
  } | null>(null);
  const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [chatWallpaper, setChatWallpaper] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coc_chat_wallpaper') || 'default';
      setChatWallpaper(saved);

      const handleWallpaperChange = (e: any) => {
        const wp = e.detail || localStorage.getItem('coc_chat_wallpaper') || 'default';
        setChatWallpaper(wp);
      };

      window.addEventListener('coc_wallpaper_change', handleWallpaperChange);
      return () => {
        window.removeEventListener('coc_wallpaper_change', handleWallpaperChange);
      };
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleStartReply = (msg: any, senderName: string) => {
    sfx.playClick();
    setReplyingToMessage({
      _id: msg._id,
      text: formatStickerOrText(msg.text),
      senderName,
    });
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    sfx.playClick();
    setReactingMessageId(null);
    try {
      const updatedMessage = await chatApi.reactMessage(messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? updatedMessage : m))
      );
      if (socket) {
        socket.emit('react_message', updatedMessage);
      }
    } catch (err) {
      console.error('[React Message Error]', err);
    }
  };

  const handleStickerClick = async (stickerUrl: string) => {
    if (!conversationId || !recipient) return;
    sfx.playClick();
    setShowEmojiPicker(false);

    try {
      const payload: any = {
        conversationId,
        text: stickerUrl,
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
    } catch (err) {
      console.error('[Send Sticker Error]', err);
    }
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
      chatApi.markAsRead(conversationId).catch(() => { });
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

  const [undoDeleteMessage, setUndoDeleteMessage] = useState<{
    msgId: string;
    originalText: string;
    secondsLeft: number;
  } | null>(null);
  const undoDeleteIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      if (undoDeleteIntervalRef.current) clearInterval(undoDeleteIntervalRef.current);
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

  const handleUndoDeleteMessage = async () => {
    if (!undoDeleteMessage) return;
    const { msgId, originalText } = undoDeleteMessage;

    if (undoDeleteIntervalRef.current) {
      clearInterval(undoDeleteIntervalRef.current);
      undoDeleteIntervalRef.current = null;
    }
    setUndoDeleteMessage(null);

    try {
      const restoredMsg = await chatApi.restoreMessage(msgId, originalText);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? restoredMsg : m))
      );
      if (socket) {
        socket.emit('message_edited', restoredMsg);
      }
    } catch (err) {
      console.error('[Undo Delete Message Error]', err);
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
    const targetMsg = messages.find((m) => m._id === msgId);
    if (!targetMsg || targetMsg.isDeleted) return;

    const originalText = targetMsg.text;

    try {
      const deletedMsg = await chatApi.deleteMessage(msgId);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? deletedMsg : m))
      );
      if (socket) {
        socket.emit('delete_message', deletedMsg);
      }

      // Initialize 5-Second Undo Delete Timer (5 -> 4 -> 3 -> 2 -> 1 -> 0)
      if (undoDeleteIntervalRef.current) clearInterval(undoDeleteIntervalRef.current);
      setUndoDeleteMessage({
        msgId,
        originalText,
        secondsLeft: 5,
      });

      undoDeleteIntervalRef.current = setInterval(() => {
        setUndoDeleteMessage((prev) => {
          if (!prev || prev.secondsLeft <= 1) {
            if (undoDeleteIntervalRef.current) clearInterval(undoDeleteIntervalRef.current);
            return null;
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
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
        chatApi.markAsRead(conversationId).catch(() => { });
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

    const handleMessageReacted = (updatedMsg: any) => {
      if (updatedMsg.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
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

    const handleMessagesReadUpdate = ({ conversationId: convId, readByUserId }: any) => {
      if (convId === conversationId && readByUserId !== user?._id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, read: true }))
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reacted', handleMessageReacted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_read_update', handleMessagesReadUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reacted', handleMessageReacted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_read_update', handleMessagesReadUpdate);
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

      if (replyingToMessage) {
        payload.replyTo = {
          messageId: replyingToMessage._id,
          text: replyingToMessage.text,
          senderName: replyingToMessage.senderName,
        };
        setReplyingToMessage(null);
      }

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

  const isOnline = recipient?.isGroup
    ? true
    : Boolean(recipient?._id && onlineUsers.some((uid: string) => String(uid) === String(recipient._id)));

  return (
    <main className="flex-1 flex flex-col bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] overflow-hidden relative">

      {/* Stationary Fixed Wallpaper Layer */}
      {chatWallpaper && chatWallpaper !== 'default' && chatWallpaper !== '' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), url("${chatWallpaper}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Stage Banner Header */}
      <div className="px-4 py-3 bg-gradient-to-b from-[#FBF2E5] to-[#F5E6D3] border-b-2 border-[#895333] flex items-center justify-between shadow-sm z-10 relative">
        <div
          onClick={() => {
            sfx.playClick();
            setIsProfileModalOpen(true);
          }}
          className="flex items-center gap-3 min-w-0 cursor-pointer group hover:bg-[#F2E5D4]/60 transition-all rounded-xl p-1 -m-1"
          title="Click to view warrior profile details"
        >
          {/* Dynamic Avatar Box */}
          <div className="w-12 h-12 rounded-xl bg-[#FAF3E8] border-2 border-[#D4A359] flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
            {getRecipientAvatarSrc(recipient.avatar, recipient.isGroup) ? (
              <img
                src={getRecipientAvatarSrc(recipient.avatar, recipient.isGroup)}
                alt={recipient.username}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <span className="font-headline-sm text-xl text-[#3E2415] font-black">
                {recipient.username?.charAt(0)?.toUpperCase() || 'W'}
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase tracking-wide font-black truncate group-hover:text-[#895333] transition-colors">
                {recipient.username}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] uppercase font-black shrink-0 flex items-center gap-1 border ${
                recipient.isGroup
                  ? 'bg-[#EBD8C1] border-[#CBAF90] text-[#693E1B]'
                  : isOnline
                    ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]'
                    : 'bg-[#ECEFF1] border-[#CFD8DC] text-[#546E7A]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${recipient.isGroup ? 'bg-[#C88421]' : isOnline ? 'bg-[#2E7D32] animate-pulse' : 'bg-[#78909C]'}`} />
                {recipient.isGroup ? 'CLAN WARBAND' : (isOnline ? 'ONLINE' : 'OFFLINE')}
              </span>
            </div>
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-[#6E4C38] truncate mt-0.5">
              <span className="font-semibold truncate">
                {recipient.description || (recipient.isGroup ? `${recipient.role || 'Warband Clan'}` : 'Fearless Clash warrior ready for battle.')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Icons & Options Menu */}
        <div className="flex items-center gap-1.5 relative shrink-0">
          {/* Header Search Box */}
          {isHeaderSearchOpen ? (
            <div className="flex items-center bg-[#FFFFFF] border border-[#CEB194] rounded-xl shadow-inner px-2.5 py-1 animate-fadeIn">
              <span className="material-symbols-outlined text-[#895333] text-sm mr-1.5">search</span>
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-36 sm:w-48 bg-transparent text-xs text-[#24140D] focus:outline-none font-body-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setHeaderSearchQuery('');
                  setIsHeaderSearchOpen(false);
                }}
                className="text-[#895333] hover:text-[#24140D] cursor-pointer ml-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setIsHeaderSearchOpen(true);
              }}
              className="w-9 h-9 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] flex items-center justify-center text-[#4A2D19] shadow-sm transition-colors cursor-pointer"
              title="Search Chat Messages"
            >
              <span className="material-symbols-outlined text-base">search</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setIsHeaderMenuOpen(!isHeaderMenuOpen);
              }}
              className="w-9 h-9 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] flex items-center justify-center text-[#4A2D19] shadow-sm transition-colors cursor-pointer"
              title="More Options"
            >
              <span className="material-symbols-outlined text-base">more_vert</span>
            </button>

            {/* Options Dropdown Menu */}
            {isHeaderMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF9] border-2 border-[#895333] rounded-xl shadow-[0_8px_20px_rgba(89,53,28,0.2)] p-1.5 z-30 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    sfx.playClick();
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F7EFE4] flex items-center gap-2 text-[#3E2415] font-body-sm text-xs transition-colors cursor-pointer font-bold border-b border-[#E7D6C3] mb-1"
                >
                  <span className="material-symbols-outlined text-[#895333] text-base">person</span>
                  <span>View {recipient.isGroup ? 'Clan Intel' : 'Warrior Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    navigator.clipboard.writeText(`#${recipient._id.substring(recipient._id.length - 6).toUpperCase()}`);
                    showToast('Tag Copied!');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F7EFE4] flex items-center gap-2 text-[#3E2415] font-body-sm text-xs transition-colors cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[#895333] text-base">content_copy</span>
                  <span>Copy #{recipient._id.substring(recipient._id.length - 6).toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    setIsHeaderSearchOpen(!isHeaderSearchOpen);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F7EFE4] flex items-center gap-2 text-[#3E2415] font-body-sm text-xs transition-colors cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[#895333] text-base">find_in_page</span>
                  <span>Find in Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Chat Theatre Log Stream */}
      <div
        className={`flex-1 overflow-y-auto p-4 xl:p-5 flex flex-col gap-4 shadow-[inset_0_2px_8px_rgba(100,60,30,0.06)] min-h-[400px] relative z-10 transition-all ${
          chatWallpaper && chatWallpaper !== 'default' && chatWallpaper !== ''
            ? 'bg-transparent'
            : 'bg-[#FBF7F0]'
        }`}
      >

        {loading ? (
          <div className="text-center p-8 text-[#8A6348] animate-pulse font-body-sm font-bold">
            Retrieving tactical scrolls from server...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8 text-[#8A6348] font-body-sm font-bold">
            No dispatches recorded yet. Speak into the war horn to begin!
          </div>
        ) : (
          messages
            .filter((msg) =>
              headerSearchQuery.trim()
                ? msg.text?.toLowerCase().includes(headerSearchQuery.toLowerCase())
                : true
            )
            .map((msg) => {
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

            const isSticker = Boolean(!msg.isDeleted && (msg.text?.startsWith('/stickers/') || msg.text?.endsWith('.png')));

            const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
            const senderName = isOutgoing
              ? (user?.username || 'You')
              : (senderObj?.username || recipient.username);

            const senderRole = isOutgoing
              ? (user?.role || 'Chieftain')
              : (senderObj?.role || 'Warrior');

            const senderAvatar = isOutgoing
              ? user?.avatar
              : (senderObj?.avatar || recipient.avatar);

            const isEditingThis = editingMessageId === msg._id;

            return (
              <div
                key={msg._id || Math.random()}
                className={`flex items-start gap-3 max-w-2xl w-full ${isOutgoing ? 'self-end flex-row-reverse justify-start' : 'self-start justify-start'
                  }`}
              >
                {/* Sender Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E8] border border-[#CFA067] flex items-center justify-center text-[#553013] font-headline-sm font-black shadow-sm flex-shrink-0 overflow-hidden">
                  {getRecipientAvatarSrc(senderAvatar, false) ? (
                    <img
                      src={getRecipientAvatarSrc(senderAvatar, false)}
                      alt={senderName}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span>{senderName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Message Bubble Card */}
                <div className={`flex flex-col gap-1 flex-1 min-w-0 ${isOutgoing ? 'items-end' : 'items-start'}`}>
                  {/* Top Line: Sender Name & Role Badge only */}
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-[#5B3317] font-bold">
                      {senderName}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#FBD46E] text-[#4A2F08] border border-[#DEC095] font-label-sm text-[10px] rounded uppercase font-black">
                      {senderRole}
                    </span>
                  </div>

                  {/* Message Bubble Body */}
                  <div
                    className={`relative p-3.5 rounded-2xl ${isOutgoing
                      ? 'rounded-tr-none bg-gradient-to-b from-[#E53935] via-[#C62828] to-[#9E1A1A] text-white border-2 border-[#7F0000] shadow-[0_4px_12px_rgba(186,26,26,0.35)]'
                      : 'rounded-tl-none bg-[#FFFFFF] text-[#24140D] border-2 border-[#D4A359] shadow-[0_4px_10px_rgba(120,80,30,0.08)]'
                      }`}
                  >
                    {/* Floating 4-Emoji Reaction Popover */}
                    {reactingMessageId === msg._id && (
                      <div className={`absolute -top-11 ${isOutgoing ? 'right-0' : 'left-0'} z-40 bg-[#FFFDF9] border-2 border-[#895333] rounded-full px-2 py-1 shadow-[0_6px_16px_rgba(89,53,28,0.35)] flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-150`}>
                        {['⚔️', '🔥', '😂', '👍'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg._id, emoji)}
                            className="w-7 h-7 rounded-full hover:bg-[#F2E5D6] hover:scale-125 text-base flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quoted Reply Box */}
                    {msg.replyTo && msg.replyTo.text && (
                      <div className={`mb-2 p-2 rounded-xl text-xs font-medium border-l-4 flex flex-col gap-0.5 ${isOutgoing
                          ? 'bg-[#000000]/25 border-[#F5B823] text-white'
                          : 'bg-[#F5EAD9] border-[#C88421] text-[#24140D]'
                        }`}>
                        <span className="font-bold flex items-center gap-1 text-[#FBD46E]">
                          <span className="material-symbols-outlined text-[13px]">reply</span>
                          {msg.replyTo.senderName}
                        </span>
                        <span className="truncate italic opacity-90 max-w-xs sm:max-w-sm">
                          {formatStickerOrText(msg.replyTo.text)}
                        </span>
                      </div>
                    )}

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
                        {!msg.isDeleted && (msg.text?.startsWith('/stickers/') || msg.text?.endsWith('.png')) ? (
                          <div className="py-1 flex items-center justify-center">
                            <img
                              src={msg.text}
                              alt="Battle Sticker"
                              className="max-w-[160px] max-h-[160px] sm:max-w-[200px] sm:max-h-[200px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-body-md text-body-md leading-relaxed whitespace-pre-wrap break-words ${msg.isDeleted ? (isOutgoing ? 'italic text-[#FFCDD2] opacity-90' : 'italic text-[#8A6348] opacity-80') : ''}`}>
                              {msg.isDeleted ? 'This msg is deleted' : msg.text}
                            </p>
                            {msg.isDeleted && isOutgoing && undoDeleteMessage?.msgId === msg._id && (
                              <button
                                type="button"
                                onClick={handleUndoDeleteMessage}
                                title="Undo delete message"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#E53935] hover:bg-[#C62828] text-white font-black text-xs uppercase shadow transition-all cursor-pointer animate-pulse ml-1"
                              >
                                <span className="material-symbols-outlined text-sm">undo</span>
                                <span>Undo Delete ({undoDeleteMessage?.secondsLeft}s)</span>
                              </button>
                            )}
                          </div>
                        )}
                        {msg.isEdited && !msg.isDeleted && (
                          <span className={`block text-[11px] font-bold mt-1 italic ${isOutgoing ? 'text-[#FFCDD2]' : 'text-[#8A6348]'}`}>
                            Edited Msg
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Reaction Badges */}
                  {msg.reactions && msg.reactions.length > 0 && !msg.isDeleted && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {msg.reactions.map((r: any, rIdx: number) => {
                        const hasReacted = r.users?.some((u: any) => String(u._id || u) === String(user?._id));
                        return (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleToggleReaction(msg._id, r.emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer shadow-xs ${hasReacted
                                ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] border border-[#AA770B]'
                                : 'bg-[#F2E5D6] hover:bg-[#E8D6C1] text-[#5C381E] border border-[#D9C4AE]'
                              }`}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.users?.length || 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* BOTTOM TOOLBAR: React, Reply, Edit (if not sticker), Delete, Undo, Time & Red Ticks */}
                  <div className={`flex flex-wrap items-center gap-2 mt-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isDeleted && !isEditingThis && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sfx.playClick();
                            setReactingMessageId(reactingMessageId === msg._id ? null : msg._id);
                          }}
                          title="React to message"
                          className="text-[#8A6348] hover:text-[#C88421] transition-colors p-0.5 cursor-pointer flex items-center gap-0.5 font-bold text-xs"
                        >
                          <span className="material-symbols-outlined text-sm">add_reaction</span>
                          <span>React</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartReply(msg, senderName)}
                          title="Reply to message"
                          className="text-[#8A6348] hover:text-[#C88421] transition-colors p-0.5 cursor-pointer flex items-center gap-0.5 font-bold text-xs"
                        >
                          <span className="material-symbols-outlined text-sm">reply</span>
                          <span>Reply</span>
                        </button>

                        {isOutgoing && (
                          <>
                            {!isSticker && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                title="Edit message"
                                className="text-[#8A6348] hover:text-[#C88421] transition-colors p-0.5 cursor-pointer flex items-center gap-0.5 font-bold text-xs"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete message"
                              className="text-[#8A6348] hover:text-[#E53935] transition-colors p-0.5 cursor-pointer flex items-center gap-0.5 font-bold text-xs"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Delete</span>
                            </button>
                          </>
                        )}

                        {isOutgoing && undoMessage?.msg._id === msg._id && (
                          <button
                            type="button"
                            onClick={handleUndoMessage}
                            title="Undo sent message"
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-[10px] uppercase shadow transition-all cursor-pointer animate-pulse ml-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">undo</span>
                            <span>Undo ({undoMessage?.secondsLeft}s)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Time & Red Ticks (Right side of Delete / Action Toolbar) */}
                    <div className="flex items-center gap-1 font-body-sm text-xs text-[#8A6348] font-bold ml-1">
                      <span>{timeStr}</span>
                      {isOutgoing && !msg.isDeleted && (
                        <span
                          className="text-[#E53935] font-black text-xs flex items-center ml-0.5 tracking-tighter select-none"
                          title={
                            msg.read
                              ? '3 ticks: Recipient saw message'
                              : isOnline
                                ? '2 ticks: Recipient is online'
                                : '1 tick: Recipient network is off'
                          }
                        >
                          {msg.read ? '✓✓✓' : isOnline ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="self-start my-1 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E53935] border-2 border-[#B71C1C] text-[#000000] font-headline-sm text-xs font-black uppercase shadow-[0_3px_8px_rgba(229,57,53,0.35)] animate-pulse">
            <span className="material-symbols-outlined text-sm text-[#000000]">edit</span>
            <span>{typingUser ? `${typingUser} is Typin...` : 'Typin...'}</span>
            <span className="flex items-center gap-1 ml-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#000000] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#000000] animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#000000] animate-bounce delay-300" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stage Bottom Console */}
      <div className="relative p-3 bg-[#FBF2E5] border-t-2 border-[#895333] flex flex-col gap-2">

        {/* Popover Emoji & Sticker Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-16 left-3 z-50 w-80 sm:w-96 bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_8px_24px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col p-3.5 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* TOP TOGGLE SWITCH: EMOJIS VS STICKERS */}
            <div className="flex items-center p-1 bg-[#EFE3D3] rounded-xl border border-[#D9C4AE]">
              <button
                type="button"
                onClick={() => { sfx.playClick(); setPickerMode('emojis'); }}
                className={`flex-1 py-1.5 rounded-lg font-headline-sm text-xs uppercase font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${pickerMode === 'emojis'
                  ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] shadow-sm border border-[#AA770B]'
                  : 'text-[#6E4C38] hover:text-[#24140D]'
                  }`}
              >
                <span>😊</span>
                <span>EMOJIS</span>
              </button>
              <button
                type="button"
                onClick={() => { sfx.playClick(); setPickerMode('stickers'); }}
                className={`flex-1 py-1.5 rounded-lg font-headline-sm text-xs uppercase font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${pickerMode === 'stickers'
                  ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] shadow-sm border border-[#AA770B]'
                  : 'text-[#6E4C38] hover:text-[#24140D]'
                  }`}
              >
                <span>🎨</span>
                <span>STICKERS</span>
              </button>
            </div>

            {/* EMOJIS TAB CONTENT */}
            {pickerMode === 'emojis' && (
              <>
                {/* Header / Category Filters */}
                <div className="flex items-center justify-between border-b border-[#E8DAC9] pb-2">
                  {/* <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase font-black tracking-wider flex items-center gap-1.5 text-xs">
                    <span>⚔️</span> BATTLE EMOTES
                  </span> */}
                  <div className="flex items-center gap-1">
                    {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((catKey) => (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setEmojiCategory(catKey)}
                        className={`px-2 py-1 rounded-lg font-label-sm text-[10px] uppercase font-bold transition-all cursor-pointer ${emojiCategory === catKey
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
                <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#FAF5ED] rounded-xl border border-[#E7D7C6]">
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
              </>
            )}

            {/* STICKERS TAB CONTENT */}
            {pickerMode === 'stickers' && (
              <>
                {/* Sticker Category Header */}
                <div className="flex items-center justify-between border-b border-[#E8DAC9] pb-2">
                  {/* <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase font-black tracking-wider flex items-center gap-1.5 text-xs">
                    <span>🏰</span> CLASH STICKERS
                  </span> */}
                  <div className="flex items-center gap-1">
                    {(['All', 'Troops', 'Emotes', 'Reactions'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setStickerCategory(cat)}
                        className={`px-2 py-1 rounded-lg font-label-sm text-[10px] uppercase font-bold transition-all cursor-pointer ${stickerCategory === cat
                          ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black border border-[#AA770B]'
                          : 'bg-[#F2E5D6] text-[#64422A] hover:bg-[#E5D5C2]'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sticker Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 bg-[#FAF5ED] rounded-xl border border-[#E7D7C6]">
                  {STICKERS.filter(s => stickerCategory === 'All' || s.category === stickerCategory).map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => handleStickerClick(sticker.url)}
                      title={sticker.name}
                      className="group relative p-1.5 rounded-xl bg-[#FFFDF9] border border-[#E3D1BE] hover:border-[#F5C242] hover:bg-[#FFF9EE] hover:scale-105 flex flex-col items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <img
                        src={sticker.url}
                        alt={sticker.name}
                        className="w-14 h-14 object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all"
                      />
                      <span className="text-[10px] font-bold text-[#6E4C38] group-hover:text-[#24140D] truncate max-w-full mt-1">
                        {sticker.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Replying To Banner */}
        {replyingToMessage && (
          <div className="flex items-center justify-between bg-[#EFE4D4] border-2 border-[#D5C2AD] px-3.5 py-2 rounded-xl shadow-inner text-xs font-bold text-[#553013] animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-base text-[#C88421]">reply</span>
              <span className="truncate">
                Replying to <strong className="text-[#24140D] font-black">{replyingToMessage.senderName}</strong>: &quot;{formatStickerOrText(replyingToMessage.text)}&quot;
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingToMessage(null)}
              className="text-[#8A6348] hover:text-[#C62828] p-0.5 rounded-md transition-colors cursor-pointer ml-2 flex-shrink-0"
              title="Cancel Reply"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Composer Main Input Trench */}
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#FFFFFF] border-2 border-[#C5A88B] p-2 rounded-xl shadow-[inset_0_2px_5px_rgba(100,60,30,0.1)]">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${showEmojiPicker
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

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={recipient}
        currentUser={user}
      />

    </main>
  );
};
