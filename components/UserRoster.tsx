"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { userApi, chatApi, clanApi } from '@/lib/api';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { CreateClanModal } from '@/components/CreateClanModal';
import { sfx } from '@/lib/sfx';

const bannerGradients: Record<string, string> = {
  'crimson-fire': 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]',
  'royal-dragon': 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]',
  'emerald-axes': 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]',
  'golden-lion': 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]',
};

const emblemIcons: Record<string, string> = {
  shield: 'shield',
  skull: 'skull',
  crown: 'crown',
  target: 'adjust',
};

interface UserRosterProps {
  activeConversationId: string | null;
  activeRecipient: UserProfile | null;
  onSelectConversation: (conversation: any, recipient: UserProfile) => void;
  onCreateClan?: () => void;
}

export const UserRoster: React.FC<UserRosterProps> = ({
  activeConversationId,
  activeRecipient,
  onSelectConversation,
  onCreateClan,
}) => {
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'clans'>('all');
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [clansList, setClansList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateClanModalOpen, setIsCreateClanModalOpen] = useState(false);

  // Calculate total unread messages across all conversations
  const totalUnreadCount = conversations.reduce((acc, c) => {
    if (activeConversationId && c._id === activeConversationId) return acc;
    const count = c.unreadCounts?.[user?._id || ''] || 0;
    return acc + count;
  }, 0);

  // Load conversations, user directory & real clans
  const loadRoster = async () => {
    try {
      setLoading(true);
      const [convList, userList, realClans] = await Promise.all([
        chatApi.getConversations().catch(() => []),
        userApi.getUsers(searchQuery).catch(() => []),
        clanApi.getClans(searchQuery).catch(() => []),
      ]);
      setConversations(convList || []);
      setAvailableUsers(userList || []);
      setClansList(realClans || []);
    } catch (err) {
      console.error('[Roster Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [searchQuery]);

  // Listen for socket events to update roster live
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      loadRoster();
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('new_message_notification', handleNewMessage);
    socket.on('messages_read_update', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('new_message_notification', handleNewMessage);
      socket.off('messages_read_update', handleNewMessage);
    };
  }, [socket]);

  // Helper to check if a user is online
  const isUserOnline = (userId: string, isOnlineInDb?: boolean) => {
    return onlineUsers.includes(userId) || Boolean(isOnlineInDb);
  };

  // Helper to open conversation with user
  const handleUserClick = async (targetUser: UserProfile) => {
    try {
      const conv = await chatApi.createOrGetConversation(targetUser._id);
      chatApi.markAsRead(conv._id).catch(() => {});
      if (socket && user) {
        socket.emit('message_read', { conversationId: conv._id, readByUserId: user._id });
      }
      onSelectConversation(conv, targetUser);
      loadRoster();
    } catch (err) {
      console.error('[Open Conversation Error]', err);
    }
  };

  // Helper to open clan group conversation
  const handleClanClick = async (clan: any) => {
    try {
      const conv = await chatApi.getClanConversation(clan._id);
      chatApi.markAsRead(conv._id).catch(() => {});
      if (socket && user) {
        socket.emit('message_read', { conversationId: conv._id, readByUserId: user._id });
      }
      const groupTarget: UserProfile = {
        _id: clan._id,
        username: clan.name,
        email: '',
        avatar: clan.shieldEmblem || 'shield',
        avatarName: `Level ${clan.level || 1} Warband Clan`,
        trophies: clan.trophies || 2450,
        level: clan.level || 1,
        role: `${clan.members?.length || 1} Warriors`,
        isOnline: true,
        isGroup: true,
        clan: clan,
      };
      onSelectConversation(conv, groupTarget);
      loadRoster();
    } catch (err) {
      console.error('[Open Clan Conversation Error]', err);
    }
  };

  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 flex flex-col bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] overflow-hidden h-full">

      {/* Top Carved Search & Title Strip */}
      <div className="p-3.5 bg-gradient-to-b from-[#FBF2E5] to-[#F5E6D3] border-b-2 border-[#895333] flex flex-col gap-2.5">

        {/* Carved Inset Search Field */}
        <div className="relative w-full flex items-center bg-[#FFFFFF] border border-[#CEB194] rounded-xl shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] px-3 py-2">
          <span className="material-symbols-outlined text-[#8C6B51] text-base mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clans and warriors..."
            className="w-full bg-transparent font-body-sm text-body-sm text-[#24140D] placeholder:text-[#9F826D] focus:outline-none"
          />
        </div>

        {/* Filter Pill Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#EBDBC9] p-1 rounded-xl border border-[#D5BEA8]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-1 px-2 rounded-lg font-label-md text-label-md text-center uppercase tracking-wider transition-all cursor-pointer ${filter === 'all'
              ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black shadow-[0_2px_3px_rgba(0,0,0,0.15)] border-b-2 border-[#AA770B]'
              : 'text-[#64422A] hover:text-[#24140D] hover:bg-[#F2E5D6] font-bold'
              }`}
          >
            ALL ({availableUsers.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`py-1 px-2 rounded-lg font-label-md text-label-md text-center uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${filter === 'unread'
              ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black shadow-[0_2px_3px_rgba(0,0,0,0.15)] border-b-2 border-[#AA770B]'
              : 'text-[#64422A] hover:text-[#24140D] hover:bg-[#F2E5D6] font-bold'
              }`}
          >
            <span>UNREAD</span>
            {totalUnreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E53935] text-white text-[10px] flex items-center justify-center font-black">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter('clans')}
            className={`py-1 px-2 rounded-lg font-label-md text-label-md text-center uppercase tracking-wider transition-all cursor-pointer ${filter === 'clans'
              ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black shadow-[0_2px_3px_rgba(0,0,0,0.15)] border-b-2 border-[#AA770B]'
              : 'text-[#64422A] hover:text-[#24140D] hover:bg-[#F2E5D6] font-bold'
              }`}
          >
            CLANS ({clansList.length})
          </button>
        </div>
      </div>

      {/* Scrollable Clan & DM Roster */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 bg-[#FAF5ED]">
        {loading ? (
          <div className="p-8 text-center text-[#8A6348] animate-pulse font-body-sm font-bold">
            Searching tavern scrolls for warriors...
          </div>
        ) : filter === 'clans' ? (
          /* Real Database Clans List */
          <div className="flex flex-col gap-2">
            {clansList.length === 0 ? (
              <div className="p-8 text-center text-[#8A6348] font-body-sm flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-[#C89437]">shield</span>
                <span className="font-headline-sm text-headline-sm uppercase text-[#4A2F08]">No Clans Found</span>
                <span className="font-body-sm text-body-sm text-[#825336]">
                  {searchQuery ? `No clans matching "${searchQuery}"` : 'Forge the first clan in the realm!'}
                </span>
              </div>
            ) : (
              clansList.map((clan) => {
                const bgGrad = bannerGradients[clan.bannerPattern] || bannerGradients['crimson-fire'];
                const emblem = emblemIcons[clan.shieldEmblem] || 'shield';
                const memberCount = clan.members?.length || 1;
                const isSelected = activeRecipient?._id === clan._id && activeRecipient?.isGroup;
                const clanConv = conversations.find((c) => c.isGroup && String(c.clan?._id || c.clan) === String(clan._id));

                return (
                  <div
                    key={clan._id}
                    onClick={() => handleClanClick(clan)}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFF4DF] to-[#FFFBF5] border-2 border-[#D4A359] shadow-[0_3px_6px_rgba(150,90,30,0.15)]'
                        : 'bg-[#FFFFFF] border border-[#E7D6C3] hover:border-[#C59B6A] hover:bg-[#FFFBF2] shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-8 absolute left-1 bg-[#D4A359] rounded-full" />
                    )}

                    {/* Banner Emblem Badge */}
                    <div className={`relative w-11 h-11 rounded-xl ${bgGrad} border-2 border-[#FFE8C2] flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden`}>
                      <span className="material-symbols-outlined text-[#FBD46E] text-xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                        {emblem}
                      </span>
                      <span className="absolute -bottom-1 -right-1 px-1 bg-[#3C2314] text-[#FBD46E] border border-[#C89437] font-label-sm text-[9px] rounded font-black">
                        L{clan.level || 1}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-headline-sm text-headline-sm text-[#3E2415] truncate font-extrabold group-hover:text-[#895333] transition-colors">
                          {clan.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-[#C89437] font-black flex items-center gap-0.5 flex-shrink-0">
                          <span className="material-symbols-outlined text-xs text-[#FBD46E]">shield</span>
                          {clan.trophies || 2450}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-label-sm text-label-sm text-[#895333] font-bold bg-[#F5E8D7] px-1.5 py-0.2 rounded border border-[#E0CFB9]">
                          {clan.tag}
                        </span>
                        <span className="font-body-sm text-body-sm text-[#6E4C38] truncate flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-xs text-[#895333]">groups</span>
                          {memberCount} {memberCount === 1 ? 'Warrior' : 'Warriors'}
                        </span>
                      </div>

                      <p className="font-body-sm text-body-sm text-[#6E4C38] truncate mt-1 italic">
                        {clanConv?.lastMessage?.text || 'No clan dispatches yet.'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (() => {
          const filteredUsers = availableUsers.filter((u) => {
            if (filter === 'unread') {
              const conv = conversations.find((c) =>
                !c.isGroup && c.participants.some((p: any) => String(p._id || p) === String(u._id))
              );
              const unreadCount = conv?.unreadCounts?.[user?._id || ''] || 0;
              return unreadCount > 0;
            }
            return true;
          });

          if (filteredUsers.length === 0) {
            return (
              <div className="p-8 text-center text-[#8A6348] font-body-sm font-bold">
                {filter === 'unread'
                  ? 'No unread war dispatches.'
                  : 'No warriors found in this realm.'}
              </div>
            );
          }

          return filteredUsers.map((warrior) => {
            const online = isUserOnline(warrior._id, warrior.isOnline);
            const conv = conversations.find((c) =>
              !c.isGroup && c.participants.some((p: any) => String(p._id || p) === String(warrior._id))
            );
            const isSelected = activeRecipient?._id === warrior._id && !activeRecipient?.isGroup;
            const unreadCount = conv?.unreadCounts?.[user?._id || ''] || 0;

            return (
              <div
                key={warrior._id}
                onClick={() => handleUserClick(warrior)}
                className={`relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group ${isSelected
                  ? 'bg-gradient-to-r from-[#FFF4DF] to-[#FFFBF5] border-2 border-[#D4A359] shadow-[0_3px_6px_rgba(150,90,30,0.15)]'
                  : 'bg-[#FFFFFF] border border-[#E7D6C3] hover:border-[#C59B6A] hover:bg-[#FFFBF2] shadow-sm'
                  }`}
              >
                {isSelected && (
                  <div className="w-1.5 h-8 absolute left-1 bg-[#D4A359] rounded-full" />
                )}

                {/* Avatar */}
                <div className="relative w-11 h-11 rounded-xl bg-[#F6DFC9] border border-[#DFBF9F] flex-shrink-0 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[#895333] text-xl">
                    {warrior.avatar === 'Knight'
                      ? 'shield_person'
                      : warrior.avatar === 'Archer'
                        ? 'target'
                        : warrior.avatar === 'Wizard'
                          ? 'auto_awesome'
                          : warrior.avatar === 'Tinkerer'
                            ? 'engineering'
                            : 'swords'}
                  </span>
                  {online && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E53935] ring-2 ring-[#FFFFFF]" title="Online in Realm" />
                  )}
                </div>

                {/* Information */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`font-label-lg text-label-lg truncate ${isSelected ? 'text-[#3E2415] font-black' : 'text-[#3E2415] group-hover:text-[#895333] font-bold'}`}>
                        {warrior.username}
                      </span>
                      <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-[#F8E3C2] text-[#7A4B1A] uppercase font-black border border-[#DEC095] flex-shrink-0">
                        {warrior.role || 'Warrior'}
                      </span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#6E4C38] truncate mt-0.5">
                    {conv?.lastMessage?.text || `Start dispatch with ${warrior.username}...`}
                  </p>
                </div>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#E53935] to-[#B71C1C] text-white flex items-center justify-center font-label-sm text-[11px] font-black shadow-[0_2px_4px_rgba(180,20,20,0.4)] flex-shrink-0">
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Quick Action: Create Clan Button */}
      <div className="p-2.5 bg-[#F9F1E5] border-t-2 border-[#895333]">
        <button
          type="button"
          onClick={() => {
            if (onCreateClan) {
              onCreateClan();
            } else {
              setIsCreateClanModalOpen(true);
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#6A4023] to-[#4F2B14] hover:from-[#7C4C2B] hover:to-[#5E351A] text-[#FFE8C2] font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_3px_6px_rgba(80,40,15,0.3)] active:translate-y-0.5 border border-[#8C5E39] border-b-2 border-b-[#321708] transition-all font-black cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-[#FBD46E]">add_circle</span>
          + CREATE CLAN
        </button>
      </div>

      {/* Bottom Profile Bar: Chieftain Status */}
      <div className="p-3 bg-[#F0E3D1] border-t border-[#D9C4AC] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#53301B] flex items-center justify-center text-[#FBD46E] border-2 border-[#895333] shadow-sm overflow-hidden">
              <span className="material-symbols-outlined text-lg">person</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-[#F0E3D1]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-[#24140D] font-bold">{user?.username || 'Shahnawaz'}</span>
              <span className="px-1.5 py-0.2 bg-[#FBD46E] text-[#4A2F08] border border-[#DEB03A] font-label-sm text-[10px] rounded font-black uppercase">
                LVL 72
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-[#E53935] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E53935]" /> {user?.role || 'Chieftain'} (Online)
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          onClick={() => sfx.playClick()}
          className="w-8 h-8 rounded-lg bg-[#E3D2BE] hover:bg-[#D5C1A9] text-[#55351E] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          title="Warrior & Clan Settings"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </Link>
      </div>

      {/* Create Clan Pop-Up Modal */}
      <CreateClanModal
        isOpen={isCreateClanModalOpen}
        onClose={() => setIsCreateClanModalOpen(false)}
        onClanCreated={loadRoster}
      />

    </aside>
  );
};
