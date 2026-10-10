"use client";

import React, { useState, useEffect } from 'react';
import { AuthProtected } from '@/components/AuthProtected';
import { NavigationHeader } from '@/components/NavigationHeader';
import { UserRoster } from '@/components/UserRoster';
import { ChatStage } from '@/components/ChatStage';
import { ClanIntel } from '@/components/ClanIntel';
import { UserProfile } from '@/context/AuthContext';
import { CloudLoadingScreen } from '@/components/CloudLoadingScreen';

import { chatApi, clanApi } from '@/lib/api';

export default function ChatsPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);

  // Cloud screen transition before showing chat interface
  const [showCloudOverlay, setShowCloudOverlay] = useState<boolean>(true);
  const [isCloudFading, setIsCloudFading] = useState<boolean>(false);

  useEffect(() => {
    // Cloud transition effect when user logs in / opens chat interface
    const timerFade = setTimeout(() => {
      setIsCloudFading(true);
    }, 1200);

    const timerRemove = setTimeout(() => {
      setShowCloudOverlay(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('coc_cloud_transition');
      }
    }, 1900);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  useEffect(() => {
    // Auto-open clan chat if clanId URL parameter exists
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const clanId = params.get('clanId');
      if (clanId) {
        Promise.all([
          chatApi.getClanConversation(clanId),
          clanApi.getClanById(clanId),
        ])
          .then(([conv, clan]) => {
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
            setActiveConversationId(conv._id);
            setActiveRecipient(groupTarget);
          })
          .catch((err) => console.error('[Auto Clan Chat Error]', err));
      }
    }
  }, []);

  const handleSelectConversation = (conversation: any, recipient: UserProfile) => {
    setActiveConversationId(conversation._id);
    setActiveRecipient(recipient);
  };

  return (
    <AuthProtected>
      {showCloudOverlay && (
        <CloudLoadingScreen
          message="ENTERING CHAT INTERFACE..."
          isFading={isCloudFading}
        />
      )}
      <div className="h-screen max-h-screen overflow-hidden bg-background text-on-background flex flex-col select-none">
        <NavigationHeader />

        <main className="w-full pt-20 bg-background h-screen overflow-hidden flex flex-col flex-1">
          <div className="w-full flex flex-col lg:flex-row gap-3 p-3 xl:p-4 max-w-[1920px] mx-auto h-[calc(100vh-5rem)] overflow-hidden flex-1">

            {/* COLUMN 1: LEFT ROSTER & WARBAND SELECTION */}
            <UserRoster
              activeConversationId={activeConversationId}
              activeRecipient={activeRecipient}
              onSelectConversation={handleSelectConversation}
            />

            {/* COLUMN 2: CENTER ACTIVE CHAT & WAR STAGE */}
            <ChatStage
              conversationId={activeConversationId}
              recipient={activeRecipient}
            />

            {/* COLUMN 3: RIGHT CLAN WAR INTEL & ROSTER */}
            <ClanIntel recipient={activeRecipient} />

          </div>
        </main>
      </div>
    </AuthProtected>
  );
}
