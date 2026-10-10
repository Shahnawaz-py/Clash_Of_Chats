"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { useSocket } from '@/context/SocketContext';
import { sfx } from '@/lib/sfx';
import { friendApi } from '@/lib/api';
import { WarHornModal } from '@/components/WarHornModal';
import { ClansListModal } from '@/components/ClansListModal';
import { UserSettingsModal } from '@/components/UserSettingsModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { UserProfile } from '@/context/AuthContext';

export const NavigationHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSfxEnabled, toggleSfx } = useAudio();
  const { socket } = useSocket();
  const pathname = usePathname();

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isWarHornOpen, setIsWarHornOpen] = useState(false);
  const [isClansOpen, setIsClansOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<UserProfile | null>(null);

  const fetchFriendRequests = async () => {
    if (!user) return;
    try {
      setRequestsLoading(true);
      const data = await friendApi.getRequests();
      setIncomingRequests(data.incoming || []);
      setOutgoingRequests(data.outgoing || []);
    } catch (err) {
      console.error('[Fetch Friend Requests Error]', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendUpdate = () => {
      fetchFriendRequests();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    };

    socket.on('friend_request_received', handleFriendUpdate);
    socket.on('friend_request_accepted', handleFriendUpdate);
    socket.on('friend_request_rejected', handleFriendUpdate);

    return () => {
      socket.off('friend_request_received', handleFriendUpdate);
      socket.off('friend_request_accepted', handleFriendUpdate);
      socket.off('friend_request_rejected', handleFriendUpdate);
    };
  }, [socket]);

  const handleAcceptRequest = async (reqId: string, senderId: string) => {
    sfx.playClick();
    try {
      await friendApi.acceptRequest(reqId);
      if (socket) {
        socket.emit('accept_friend_request', { senderId, requestId: reqId });
      }
      fetchFriendRequests();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err) {
      console.error('[Accept Request Error]', err);
    }
  };

  const handleRejectRequest = async (reqId: string, senderId: string) => {
    sfx.playClick();
    try {
      await friendApi.rejectRequest(reqId);
      if (socket) {
        socket.emit('reject_friend_request', { senderId, requestId: reqId });
      }
      fetchFriendRequests();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err) {
      console.error('[Reject Request Error]', err);
    }
  };

  const handleLogout = () => {
    sfx.playLogout();
    logout();
  };

  const activeClass = "font-label-md px-4 py-2 uppercase tracking-wider transition-all bg-gradient-to-b from-[#FCD66D] to-[#E5A323] text-[#3E2207] font-black rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] border-b-2 border-[#9F650A]";
  const inactiveClass = "font-label-md text-label-md px-4 py-2 uppercase tracking-wider text-[#E8CDB2] hover:text-[#FFFFFF] hover:bg-[#482816] rounded-lg transition-all cursor-pointer font-bold";

  const isChatsActive = (pathname === '/chats' || pathname === '/') && activeTab === null;
  const isClansActive = activeTab === 'clans' || isClansOpen;
  const isWarHornActive = activeTab === 'warhorn' || isWarHornOpen;
  const isCallToArmsActive = activeTab === 'calltoarms';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#3C2314] border-b-4 border-[#C89437] shadow-[0_6px_18px_rgba(40,20,10,0.35)]">
      <div className="h-20 w-full px-4 lg:px-8 flex items-center justify-between">

        {/* Left Branding */}
        <Link href="/" onClick={() => { sfx.playClick(); setActiveTab(null); }} className="flex items-center gap-3 group">
          <div className="h-12 w-12 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
            <img src="/images/coc-logo.png" alt="Clash of Chats Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-[#FBD46E] uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              CLASH
            </span>
            <span className="font-label-sm text-label-sm text-[#E2C5A5] uppercase tracking-widest font-extrabold">
              Clash of Chats
            </span>
          </div>
        </Link>

        {/* Center Nav Pills - Positioned in the Middle */}
        <nav className="hidden xl:flex items-center justify-center gap-1.5 bg-[#2B180D] p-1.5 rounded-xl border border-[#5A3822] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] mx-auto">
          <Link
            href="/chats"
            onClick={() => { sfx.playClick(); setActiveTab(null); }}
            className={isChatsActive ? activeClass : inactiveClass}
          >
            War Room Chat
          </Link>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('clans');
              setIsClansOpen(true);
            }}
            className={isClansActive ? activeClass : inactiveClass}
          >
            Clans
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playWarHorn();
              setActiveTab('warhorn');
              setIsWarHornOpen(true);
            }}
            className={isWarHornActive ? activeClass : inactiveClass}
          >
            War Horn
          </button>
          <button
            type="button"
            onClick={() => { sfx.playClick(); setActiveTab('calltoarms'); }}
            className={isCallToArmsActive ? activeClass : inactiveClass}
          >
            Call to Arms
          </button>
        </nav>

        {/* Right User & Audio Bar */}
        <div className="flex items-center gap-3">

          {/* Tap SFX ON/OFF Volume Toggle Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSfx();
            }}
            aria-label="Toggle UI Tap Sound Effects"
            title={isSfxEnabled ? "Mute UI Tap Sound Effects" : "Enable UI Tap Sound Effects"}
            className="w-10 h-10 rounded-xl bg-[#53301B] border-2 border-[#7A4B2E] hover:border-[#C89437] flex items-center justify-center hover:bg-[#683C22] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
          >
            <span className={`material-symbols-outlined text-lg ${isSfxEnabled ? 'text-[#FBD46E]' : 'text-[#8A6348]'}`}>
              {isSfxEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Notification Bell Icon & Dropdown - JUST NEXT TO VOLUME */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sfx.playClick();
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) {
                  fetchFriendRequests();
                }
              }}
              aria-label="Notifications"
              title="Warband Tavern Notifications & Friend Requests"
              className="relative w-10 h-10 rounded-xl bg-[#53301B] border-2 border-[#7A4B2E] hover:border-[#C89437] flex items-center justify-center hover:bg-[#683C22] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-[#FBD46E]">
                notifications
              </span>
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 bg-[#D32F2F] text-white font-label-sm text-[11px] rounded-full flex items-center justify-center font-black border-2 border-[#3C2314] shadow-md animate-pulse">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            {/* Notification Bell Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFDF9] rounded-xl shadow-2xl border-2 border-[#895333] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b-2 border-[#E7D6C3] pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#C89437] text-xl">notifications</span>
                    <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase font-extrabold">
                      WARBAND NOTIFICATIONS
                    </span>
                  </div>
                  {incomingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E53935] text-white font-label-sm text-[10px] font-black uppercase">
                      {incomingRequests.length} PENDING
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto flex flex-col gap-2 p-1">
                  {requestsLoading ? (
                    <p className="text-center py-4 font-body-sm text-[#895333] animate-pulse">
                      Checking tavern dispatches...
                    </p>
                  ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                    <div className="py-6 text-center text-[#8A6348] font-body-sm flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-[#C89437]">mark_email_read</span>
                      <p className="font-bold text-[#4A2F08]">No Pending Friend Requests</p>
                      <p className="text-xs text-[#825336]">Search for registered warriors in the realm to form alliances!</p>
                    </div>
                  ) : (
                    <>
                      {incomingRequests.map((req) => (
                        <div
                          key={req._id}
                          className="bg-[#FFFBF2] border border-[#E7D6C3] p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm"
                        >
                          <div
                            onClick={() => {
                              sfx.playClick();
                              setSelectedUserForView({
                                ...req.sender,
                                friendStatus: 'pending_received',
                                friendRequestId: req._id,
                              });
                            }}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                            title="Click to view full warrior details"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#53301B] border border-[#C89437] flex items-center justify-center text-[#FBD46E] flex-shrink-0 group-hover:scale-105 transition-transform">
                              <span className="material-symbols-outlined text-lg">person</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-label-md text-label-md text-[#3E2415] font-bold truncate group-hover:text-[#895333] transition-colors">
                                {req.sender?.username || 'Warrior'}
                              </p>
                              <p className="font-body-sm text-[11px] text-[#895333]">
                                Wants to join your war party!
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setSelectedUserForView({
                                  ...req.sender,
                                  friendStatus: 'pending_received',
                                  friendRequestId: req._id,
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-gradient-to-b from-[#6A4023] to-[#4F2B14] hover:from-[#7C4C2B] hover:to-[#5E351A] text-[#FFE8C2] font-label-sm text-[10px] font-black uppercase tracking-wider shadow border border-[#8C5E39] cursor-pointer flex items-center gap-0.5"
                              title="View Warrior Profile"
                            >
                              <span className="material-symbols-outlined text-[13px]">visibility</span>
                              VIEW
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptRequest(req._id, req.sender?._id)}
                              className="px-2 py-1 rounded-lg bg-gradient-to-b from-[#4E8B3A] to-[#386728] hover:from-[#5DA346] hover:to-[#427A30] text-white font-label-sm text-[10px] font-black uppercase tracking-wider shadow border border-[#76B85F] cursor-pointer"
                            >
                              ACCEPT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(req._id, req.sender?._id)}
                              className="px-2 py-1 rounded-lg bg-gradient-to-b from-[#B71C1C] to-[#880E4F] hover:from-[#D32F2F] hover:to-[#A21540] text-white font-label-sm text-[10px] font-black uppercase tracking-wider shadow border border-[#E53935] cursor-pointer"
                            >
                              REJECT
                            </button>
                          </div>
                        </div>
                      ))}

                      {outgoingRequests.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#E7D6C3]">
                          <p className="font-label-sm text-[11px] text-[#895333] uppercase font-bold mb-1.5 px-1">
                            Sent Requests ({outgoingRequests.length})
                          </p>
                          {outgoingRequests.map((req) => (
                            <div
                              key={req._id}
                              className="bg-[#F6EFE6] border border-[#DFD1C0] p-2 rounded-lg flex items-center justify-between text-xs mb-1"
                            >
                              <span className="font-bold text-[#3E2415] truncate">
                                {req.recipient?.username}
                              </span>
                              <span className="text-[10px] bg-[#E2D4C3] text-[#6A472E] px-2 py-0.5 rounded font-bold uppercase">
                                PENDING...
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Dropdown */}
          <div className="relative pl-1">
            <button
              onClick={() => {
                sfx.playClick();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#53301B] flex items-center justify-center text-[#FBD46E] border-2 border-[#C89437] shadow-[0_2px_6px_rgba(0,0,0,0.4)] overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={
                        user.avatar === 'bk' ? '/avatars/barbarian.png' :
                        user.avatar === 'aq' ? '/avatars/archer.png' :
                        user.avatar === 'pk' ? '/avatars/pekka.png' :
                        user.avatar === 'armored' ? '/avatars/armored.png' :
                        user.avatar === 'sorcerer' ? '/avatars/sorcerer.png' :
                        user.avatar === 'golem' ? '/avatars/golem.png' :
                        user.avatar === 'champion' ? '/avatars/champion.png' :
                        user.avatar === 'th' ? '/avatars/townhall.png' :
                        (user.avatar.startsWith('/') || user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? user.avatar : '/avatars/barbarian.png'
                      }
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-xl">person</span>
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-[#3C2314]"
                  title="Active in Barracks"
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-md text-label-md text-[#FFF3E3] leading-tight font-bold group-hover:text-[#FBD46E] transition-colors">
                  {user?.username || 'Chieftain'}
                </span>
                <span className="font-label-sm text-label-sm text-[#FBD46E] uppercase font-extrabold tracking-wider">
                  {user?.role || 'Clan Leader'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#E2C5A5] text-base">
                arrow_drop_down
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-[#FFFDF9] rounded-xl shadow-2xl border-2 border-[#895333] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#E7D6C3] mb-1">
                  <p className="font-label-md text-label-md text-[#3E2415] font-bold">{user?.username}</p>
                  <p className="font-body-sm text-body-sm text-[#6E4C38] truncate">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => {
                    sfx.playClick();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#553013] hover:bg-[#F5EAD9] font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer font-black mb-1"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  SETTINGS (PROFILE)
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B71C1C] hover:bg-[#FEECEC] font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer font-black"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  RETREAT (LOGOUT)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      <WarHornModal
        isOpen={isWarHornOpen}
        onClose={() => setIsWarHornOpen(false)}
      />

      <ClansListModal
        isOpen={isClansOpen}
        onClose={() => setIsClansOpen(false)}
      />

      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <UserProfileModal
        isOpen={Boolean(selectedUserForView)}
        onClose={() => setSelectedUserForView(null)}
        userProfile={selectedUserForView}
        currentUser={user}
      />
    </header>
  );
};
