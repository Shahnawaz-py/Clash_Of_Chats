"use client";

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { userApi, friendApi } from '@/lib/api';
import { sfx } from '@/lib/sfx';
import { useSocket } from '@/context/SocketContext';
import { getRecipientAvatarSrc } from '@/components/ChatStage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  currentUser: UserProfile | null;
  onFriendRequestSent?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  onFriendRequestSent,
}) => {
  const { socket } = useSocket();
  const [detailedUser, setDetailedUser] = useState<UserProfile | null>(null);
  const [friendStatus, setFriendStatus] = useState<string>('none');
  const [requestSending, setRequestSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userProfile && !userProfile.isGroup) {
      setDetailedUser(userProfile);
      setFriendStatus(userProfile.friendStatus || 'none');
      setStatusMsg(null);

      // Fetch fresh details from backend
      userApi
        .getUserById(userProfile._id)
        .then((freshData) => {
          setDetailedUser((prev) => ({
            ...prev,
            ...freshData,
          }));
        })
        .catch((err) => console.error('[Fetch User Profile Modal Error]', err));
    }
  }, [isOpen, userProfile?._id]);

  if (!isOpen || !userProfile) return null;

  const isGroup = userProfile.isGroup;
  const targetUser = detailedUser || userProfile;

  const isSelf = currentUser?._id === targetUser._id;
  const isSelfRegistered = currentUser && !currentUser.isDemoUser;
  const isTargetRegistered = targetUser && !targetUser.isDemoUser;

  const playerTag =
    targetUser.tag ||
    targetUser.playerTag ||
    `#${(targetUser._id || '9YQQ88V').slice(-7).toUpperCase()}`;

  const copyPlayerTag = () => {
    sfx.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(playerTag);
    }
    setStatusMsg(`Copied player tag ${playerTag} to clipboard!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSendRequest = async () => {
    sfx.playClick();
    try {
      setRequestSending(true);
      const res = await friendApi.sendRequest(targetUser._id);
      if (socket) {
        socket.emit('send_friend_request', {
          recipientId: targetUser._id,
          request: res.request,
        });
      }
      setFriendStatus('pending_sent');
      setStatusMsg('⚔️ Friend request dispatched to warrior!');
      if (onFriendRequestSent) onFriendRequestSent();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to send friend request.');
    } finally {
      setRequestSending(false);
    }
  };

  const handleAcceptRequest = async () => {
    const reqId = targetUser.friendRequestId || targetUser._id;
    if (!reqId) return;
    sfx.playClick();
    try {
      await friendApi.acceptRequest(reqId);
      if (socket) {
        socket.emit('accept_friend_request', {
          senderId: targetUser._id,
          requestId: reqId,
        });
      }
      setFriendStatus('friend');
      setStatusMsg('🛡️ Friend request accepted! You are now comrades in battle.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error accepting friend request.');
    }
  };

  const handleRejectRequest = async () => {
    const reqId = targetUser.friendRequestId || targetUser._id;
    if (!reqId) return;
    sfx.playClick();
    try {
      await friendApi.rejectRequest(reqId);
      if (socket) {
        socket.emit('reject_friend_request', {
          senderId: targetUser._id,
          requestId: reqId,
        });
      }
      setFriendStatus('none');
      setStatusMsg('Friend request removed.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error rejecting friend request.');
    }
  };

  const handleRemoveFriend = async () => {
    sfx.playClick();
    try {
      await friendApi.removeFriend(targetUser._id);
      setFriendStatus('none');
      setStatusMsg('Friend removed from your comrades list.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coc_friend_update'));
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error removing friend.');
    }
  };

  const bannerImgSrc =
    targetUser.bannerUrl ||
    (targetUser.bannerPattern === 'royal-dragon'
      ? '/banners/dark-fortress.png'
      : targetUser.bannerPattern === 'emerald-axes'
      ? '/banners/war-battlefield.png'
      : targetUser.bannerPattern === 'golden-lion'
      ? '/banners/daytime-village.png'
      : '/banners/legendary-league.png');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-[0_20px_50px_rgba(89,53,28,0.4)] overflow-hidden flex flex-col border-4 border-[#C89437]">

        {/* Hero Banner Header */}
        <div className="relative w-full h-44 sm:h-48 bg-[#EFE0CE] overflow-hidden">
          <img
            src={bannerImgSrc}
            alt="War Banner"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/coc-cloud.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />

          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer shadow-md z-20 transition-transform active:scale-95"
            title="Close Profile"
          >
            <span className="material-symbols-outlined text-base font-bold">close</span>
          </button>
        </div>

        {/* Overlapping Avatar and Profile Details */}
        <div className="px-5 pb-6 -mt-14 flex flex-col items-center text-center bg-[#FFFDF9] relative z-10">

          {/* Circular Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-[#FAF3E8] shadow-[0_8px_20px_rgba(89,53,28,0.3)] border-4 border-[#FFFDF9] ring-3 ring-[#C89437] relative z-10 flex-shrink-0 flex items-center justify-center">
            <img
              src={getRecipientAvatarSrc(targetUser.avatar, isGroup)}
              alt={targetUser.username}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Display Name with Verified Badge */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="font-headline-sm text-lg sm:text-xl text-[#3E2415] font-black uppercase tracking-wide">
              {targetUser.username}
            </span>
            <span
              className="material-symbols-outlined text-[#895333] text-lg font-bold"
              title="Verified Clash Warrior"
            >
              verified
            </span>
          </div>

          {/* Handle & Tag */}
          <span className="font-label-sm text-xs text-[#895333] font-bold tracking-wide mt-0.5">
            @{targetUser.username?.toLowerCase() || 'warrior'} • {playerTag}
          </span>

          {/* Motto / Bio Quote */}
          <p className="mt-2.5 font-body-sm text-xs text-[#6E4C38] italic px-2 max-w-sm leading-relaxed">
            “{targetUser.description || targetUser.bio || 'Building. Fighting. Coding. Defending the Northern Citadel with valkyrie strikes and socket streams.'}”
          </p>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-[#FAF5ED] border-2 border-[#E7D6C3] text-center shadow-xs">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold tracking-wider">
                RANK
              </span>
              <span className="font-headline-sm text-xs text-[#24140D] font-black uppercase mt-0.5 truncate">
                {targetUser.role || 'WARRIOR'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold tracking-wider">
                TROPHIES
              </span>
              <span className="font-headline-sm text-xs text-[#895333] font-black mt-0.5 flex items-center justify-center gap-0.5">
                {targetUser.trophies || 2450} ★
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold tracking-wider">
                CLAN
              </span>
              <span className="font-headline-sm text-xs text-[#673C21] font-bold truncate mt-0.5">
                {targetUser.clanName || (targetUser.clan as any)?.name || 'Valhalla'}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="w-full mt-3 p-2.5 bg-[#FFF4DF] border-2 border-[#D4A359] rounded-xl text-[#3E2415] font-label-sm text-xs font-bold text-center animate-in fade-in">
              {statusMsg}
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="w-full mt-4 flex gap-2.5 items-center flex-wrap">

            {/* If there is a pending request received */}
            {friendStatus === 'pending_received' && targetUser.friendRequestId && (
              <>
                <button
                  type="button"
                  onClick={handleAcceptRequest}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#4E8B3A] to-[#386728] hover:from-[#5DA346] hover:to-[#427A30] text-white font-label-md text-xs uppercase font-black tracking-wider shadow-sm border border-[#76B85F] cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  ACCEPT
                </button>
                <button
                  type="button"
                  onClick={handleRejectRequest}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#B71C1C] to-[#880E4F] hover:from-[#D32F2F] hover:to-[#A21540] text-white font-label-md text-xs uppercase font-black tracking-wider shadow-sm border border-[#E53935] cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  REJECT
                </button>
              </>
            )}

            {/* Friend action buttons if not self & registered */}
            {!isSelf && !isGroup && isSelfRegistered && isTargetRegistered && (
              <>
                {friendStatus === 'friend' && (
                  <button
                    type="button"
                    onClick={handleRemoveFriend}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#B71C1C] to-[#880E4F] hover:from-[#D32F2F] hover:to-[#A21540] text-white font-label-md text-xs uppercase font-black tracking-wider shadow-sm border border-[#E53935] cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">person_remove</span>
                    REMOVE
                  </button>
                )}

                {friendStatus === 'pending_sent' && (
                  <span className="flex-1 py-2.5 rounded-xl bg-[#EBDBC9] text-[#64422A] border border-[#D5BEA8] font-label-md text-xs uppercase font-black flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">hourglass_top</span>
                    PENDING
                  </span>
                )}

                {friendStatus === 'none' && (
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={requestSending}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#F5C242] to-[#E3A61E] hover:from-[#FCD66D] hover:to-[#E8B228] text-[#361E05] font-label-md text-xs uppercase font-black tracking-wider shadow-sm border border-[#AA770B] cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    {requestSending ? 'SENDING...' : 'ADD FRIEND'}
                  </button>
                )}
              </>
            )}

            {/* Default Close & Copy Tag Buttons */}
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] font-label-md text-xs uppercase font-extrabold cursor-pointer shadow-xs active:scale-98 transition-all"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={copyPlayerTag}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] hover:from-[#FDE797] hover:to-[#F2B831] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase font-black shadow-sm cursor-pointer active:scale-98 transition-all"
            >
              COPY TAG
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
