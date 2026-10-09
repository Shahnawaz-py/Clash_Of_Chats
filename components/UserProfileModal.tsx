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

const bannerGradients: Record<string, string> = {
  'crimson-fire': 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]',
  'royal-dragon': 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]',
  'emerald-axes': 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]',
  'golden-lion': 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]',
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  onFriendRequestSent,
}) => {
  const { socket } = useSocket();
  const [detailedUser, setDetailedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string>('none');
  const [requestSending, setRequestSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userProfile && !userProfile.isGroup) {
      setDetailedUser(userProfile);
      setFriendStatus(userProfile.friendStatus || 'none');
      setStatusMsg(null);

      // Fetch fresh details from backend
      setLoading(true);
      userApi
        .getUserById(userProfile._id)
        .then((freshData) => {
          setDetailedUser((prev) => ({
            ...prev,
            ...freshData,
          }));
        })
        .catch((err) => console.error('[Fetch User Profile Modal Error]', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userProfile?._id]);

  if (!isOpen || !userProfile) return null;

  const isGroup = userProfile.isGroup;
  const targetUser = detailedUser || userProfile;

  const isSelf = currentUser?._id === targetUser._id;
  const isSelfRegistered = currentUser && !currentUser.isDemoUser;
  const isTargetRegistered = targetUser && !targetUser.isDemoUser;

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
    if (!targetUser.friendRequestId) return;
    sfx.playClick();
    try {
      await friendApi.acceptRequest(targetUser.friendRequestId);
      if (socket) {
        socket.emit('accept_friend_request', {
          senderId: targetUser._id,
          requestId: targetUser.friendRequestId,
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
    if (!targetUser.friendRequestId) return;
    sfx.playClick();
    try {
      await friendApi.rejectRequest(targetUser.friendRequestId);
      if (socket) {
        socket.emit('reject_friend_request', {
          senderId: targetUser._id,
          requestId: targetUser.friendRequestId,
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


  const bgGrad = bannerGradients[targetUser.bannerPattern || 'crimson-fire'] || bannerGradients['crimson-fire'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] border-4 border-[#895333] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Banner Header */}
        <div className={`relative h-32 w-full ${bgGrad} border-b-4 border-[#C89437] flex items-center justify-between px-6 overflow-hidden`}>
          {targetUser.bannerUrl && (
            <img
              src={targetUser.bannerUrl}
              alt="War Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}

          <div className="relative z-10 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#FBD46E] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {isGroup ? 'shield' : 'shield_person'}
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-[#FFF3E3] uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-black">
                {isGroup ? 'WARBAND CLAN INTEL' : 'WARRIOR INTEL'}
              </h3>
              <p className="font-label-sm text-label-sm text-[#FBD46E] uppercase font-bold tracking-widest">
                {isGroup ? 'Clan Overview' : 'Warrior Profile Dossier'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="relative z-10 w-9 h-9 rounded-xl bg-[#3C2314]/80 hover:bg-[#3C2314] text-[#FBD46E] border-2 border-[#C89437] flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 bg-[#FAF5ED]">

          {/* User Header Profile Badge */}
          <div className="flex items-start gap-4 bg-[#FFFFFF] p-4 rounded-2xl border-2 border-[#E7D6C3] shadow-sm">
            
            {/* Avatar Box */}
            <div className="relative w-20 h-20 rounded-2xl bg-[#F6DFC9] border-3 border-[#C89437] shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={getRecipientAvatarSrc(targetUser.avatar, isGroup)}
                alt={targetUser.username}
                className="w-full h-full object-cover object-center"
              />
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white ${
                  targetUser.isGroup ? 'bg-[#C88421]' : targetUser.isOnline ? 'bg-[#2E7D32] animate-pulse' : 'bg-[#78909C]'
                }`}
                title={targetUser.isOnline ? 'Online in Realm' : 'Offline'}
              />
            </div>

            {/* Info details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-headline-sm text-headline-sm text-[#3E2415] uppercase tracking-wide font-black truncate">
                  {targetUser.username}
                </h4>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] uppercase font-black border ${
                    targetUser.isGroup
                      ? 'bg-[#EBD8C1] border-[#CBAF90] text-[#693E1B]'
                      : targetUser.isOnline
                        ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]'
                        : 'bg-[#ECEFF1] border-[#CFD8DC] text-[#546E7A]'
                  }`}
                >
                  {targetUser.isGroup ? 'CLAN' : targetUser.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <p className="font-label-sm text-label-sm text-[#895333] font-extrabold uppercase mt-0.5">
                {targetUser.avatarName || targetUser.role || 'Clash Warrior'}
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 bg-[#FFF4DF] border border-[#DEB03A] px-2.5 py-0.5 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-[#FBD46E]">shield</span>
                  <span className="font-label-md text-label-md text-[#3E2415] font-black">
                    {targetUser.trophies || 2450} TROPHIES
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#F5E8D7] border border-[#D5BEA8] px-2.5 py-0.5 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-[#895333]">military_tech</span>
                  <span className="font-label-md text-label-md text-[#4A2F08] font-extrabold">
                    LVL {targetUser.level || 72}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description / War Status */}
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E7D6C3] shadow-xs">
            <h5 className="font-label-sm text-label-sm text-[#895333] uppercase font-black mb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">chat_bubble</span>
              WARRIOR MOTTO & STATUS
            </h5>
            <p className="font-body-md text-body-md text-[#3E2415] italic bg-[#FAF3E8] p-3 rounded-xl border border-[#EBE0CF]">
              "{targetUser.description || 'Fearless Clash warrior ready for battle.'}"
            </p>
          </div>

          {/* Additional Metadata / Account Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E7D6C3] flex flex-col">
              <span className="font-label-sm text-[10px] text-[#895333] uppercase font-extrabold">
                ACCOUNT TYPE
              </span>
              <span className="font-label-md text-label-md text-[#3E2415] font-black mt-0.5">
                {targetUser.isDemoUser ? '🛡️ Demo Legend' : '⚔️ Registered Warrior'}
              </span>
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E7D6C3] flex flex-col">
              <span className="font-label-sm text-[10px] text-[#895333] uppercase font-extrabold">
                WARBAND ROLE
              </span>
              <span className="font-label-md text-label-md text-[#3E2415] font-black mt-0.5">
                {targetUser.role || 'Clan Leader'}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 bg-[#FFF4DF] border-2 border-[#D4A359] rounded-xl text-[#3E2415] font-label-sm text-xs font-bold text-center animate-in fade-in">
              {statusMsg}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 mt-1 pt-3 border-t border-[#E7D6C3]">
            {!isSelf && !isGroup && isSelfRegistered && isTargetRegistered && (
              <>
                {friendStatus === 'friend' && (
                  <button
                    type="button"
                    onClick={handleRemoveFriend}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#B71C1C] to-[#880E4F] hover:from-[#D32F2F] hover:to-[#A21540] text-white font-label-md text-label-md uppercase font-black tracking-wider shadow border border-[#E53935] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">person_remove</span>
                    REMOVE FRIEND
                  </button>
                )}


                {friendStatus === 'pending_sent' && (
                  <span className="px-3 py-1.5 rounded-xl bg-[#EBDBC9] text-[#64422A] border border-[#D5BEA8] font-label-md text-label-md uppercase font-black flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">hourglass_top</span>
                    REQUEST PENDING
                  </span>
                )}

                {friendStatus === 'pending_received' && targetUser.friendRequestId && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptRequest}
                      className="px-3 py-2 rounded-xl bg-gradient-to-b from-[#4E8B3A] to-[#386728] hover:from-[#5DA346] hover:to-[#427A30] text-white font-label-md text-label-md uppercase font-black tracking-wider shadow border border-[#76B85F] cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      ACCEPT
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectRequest}
                      className="px-3 py-2 rounded-xl bg-gradient-to-b from-[#B71C1C] to-[#880E4F] hover:from-[#D32F2F] hover:to-[#A21540] text-white font-label-md text-label-md uppercase font-black tracking-wider shadow border border-[#E53935] cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      REJECT
                    </button>
                  </div>
                )}

                {friendStatus === 'none' && (
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={requestSending}
                    className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#F5C242] to-[#E3A61E] hover:from-[#FCD66D] hover:to-[#E8B228] text-[#361E05] font-label-md text-label-md uppercase font-black tracking-wider shadow border border-[#AA770B] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    {requestSending ? 'SENDING...' : 'SEND FRIEND REQUEST'}
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#6A4023] hover:bg-[#7C4C2B] text-[#FFE8C2] font-label-md text-label-md uppercase font-black tracking-wider shadow border border-[#8C5E39] cursor-pointer active:translate-y-0.5 transition-all"
            >
              CLOSE
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
