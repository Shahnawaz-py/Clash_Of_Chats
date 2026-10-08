"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clanApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CreateClanModal } from '@/components/CreateClanModal';
import { sfx } from '@/lib/sfx';

interface Clan {
  _id: string;
  name: string;
  description: string;
  tag: string;
  bannerPattern: string;
  shieldEmblem: string;
  trophies: number;
  level: number;
  leader: {
    _id: string;
    username: string;
    avatar?: string;
  };
  members: Array<{
    user: {
      _id: string;
      username: string;
    };
    role: string;
  }>;
}

const bannerGradients: Record<string, string> = {
  'crimson-fire': 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]',
  'royal-dragon': 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]',
  'emerald-axes': 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]',
  'golden-lion': 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]',
};

const avatarIcons: Record<string, string> = {
  shield: 'shield',
  skull: 'skull',
  crown: 'crown',
  target: 'adjust',
};

interface ClansListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClansListModal: React.FC<ClansListModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClans();
    }
  }, [isOpen, search]);

  const loadClans = async () => {
    try {
      setLoading(true);
      const data = await clanApi.getClans(search);
      setClans(data);
    } catch (err) {
      console.error('[Load Clans Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClan = async (clanId: string) => {
    try {
      await clanApi.joinClan(clanId);
      sfx.playClanReward();
      loadClans();
    } catch (err: any) {
      sfx.playError();
      alert(err.message || 'Failed to join clan');
    }
  };

  const handleLeaveClan = async (clanId: string) => {
    try {
      await clanApi.leaveClan(clanId);
      loadClans();
    } catch (err: any) {
      alert(err.message || 'Failed to leave clan');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#F6EFE6] border-4 border-[#C89437] rounded-3xl overflow-hidden flex flex-col shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
        
        {/* Header Strip */}
        <div className="bg-[#3C2314] px-6 py-4 border-b-4 border-[#C89437] flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#53301B] border-2 border-[#C89437] flex items-center justify-center text-[#FBD46E] font-black text-xl">
              ⚔️
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-black uppercase text-[#FBD46E] tracking-wider drop-shadow-sm">
                WARBAND CLANS
              </h2>
              <p className="font-label-sm text-label-sm text-[#E2C5A5] uppercase font-bold tracking-widest">
                Discover & Join Active Clan Fortresses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sfx.playClick(); onClose(); }}
            className="w-10 h-10 rounded-xl bg-[#53301B] hover:bg-[#683C22] border-2 border-[#7A4B2E] text-[#FBD46E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl font-bold">close</span>
          </button>
        </div>

        {/* Search & Forge Bar */}
        <div className="p-4 bg-[#EADCCB] border-b-2 border-[#D4C3AD] flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          <div className="flex-1 bg-[#FFFDF9] p-2 rounded-xl border border-[#CBAF90] shadow-inner flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-[#825336] text-2xl ml-2">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clans by name or tag (e.g. Valhalla, #8Y9QQ9P)..."
              className="w-full bg-transparent border-0 focus:ring-0 text-[#24140D] font-body-md text-body-md placeholder:text-[#895333] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => { sfx.playClick(); setIsCreateModalOpen(true); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#EF5350] via-[#E53935] to-[#C62828] text-white font-headline-sm text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#7F0000] hover:brightness-110 active:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Forge New Clan</span>
          </button>
        </div>

        {/* Scrollable Clan Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F6EFE6]">
          {loading ? (
            <div className="text-center py-16 text-[#895333] font-headline-sm animate-pulse">
              Retrieving active clan banners from the fortress...
            </div>
          ) : clans.length === 0 ? (
            <div className="bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl p-12 text-center flex flex-col items-center gap-4 shadow-md">
              <span className="material-symbols-outlined text-6xl text-[#C89437]">shield</span>
              <h3 className="font-headline-md text-headline-md text-[#3E2415] uppercase font-extrabold">
                No Clans Discovered Yet
              </h3>
              <p className="font-body-md text-body-md text-[#6E4C38] max-w-md">
                Be the first chieftain to forge a clan and assemble your comrades in victory!
              </p>
              <button
                type="button"
                onClick={() => { sfx.playClick(); setIsCreateModalOpen(true); }}
                className="px-6 py-3 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm uppercase font-black shadow-[0_3px_0_#5C4200] hover:brightness-105 cursor-pointer"
              >
                ⚔️ FORGE THE FIRST CLAN
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {clans.map((clan) => {
                const gradient = bannerGradients[clan.bannerPattern] || bannerGradients['crimson-fire'];
                const icon = avatarIcons[clan.shieldEmblem] || 'shield';
                const isMember = clan.members.some((m) => m.user && String(m.user._id) === String(user?._id));

                return (
                  <div
                    key={clan._id}
                    className="bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl overflow-hidden shadow-[0_6px_14px_rgba(89,53,28,0.12)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner header */}
                      <div className={`h-20 ${gradient} p-4 flex items-center justify-between text-white relative`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#3F2010] border-2 border-[#F5B823] flex items-center justify-center text-[#FBD46E]">
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-headline-sm text-headline-sm font-black uppercase text-[#FFF2A8] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                              {clan.name}
                            </h3>
                            <span className="font-label-sm text-label-sm text-[#E2C5A5] uppercase font-bold">
                              {clan.tag} • LVL {clan.level}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-md text-label-md bg-[#3C2314] text-[#FBD46E] px-3 py-1 rounded-full border border-[#C89437] font-black">
                          ★ {clan.trophies}
                        </span>
                      </div>

                      {/* Details body */}
                      <div className="p-4 flex flex-col gap-2.5">
                        <p className="font-body-md text-body-md text-[#3E2415] leading-relaxed line-clamp-2">
                          {clan.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E8DAC9]">
                          <div className="flex items-center gap-2 font-label-sm text-label-sm text-[#895333]">
                            <span className="material-symbols-outlined text-base">groups</span>
                            <span className="font-bold">{clan.members.length} Comrades</span>
                          </div>
                          <div className="font-label-sm text-label-sm text-[#895333]">
                            Leader: <span className="font-bold text-[#24140D]">{clan.leader?.username || 'Chieftain'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="p-3.5 bg-[#F8E7D1] border-t border-[#E8DAC9] flex items-center justify-between gap-2">
                      {isMember ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              sfx.playClick();
                              onClose();
                              router.push(`/chats?clanId=${clan._id}`);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-label-md text-label-md uppercase font-black text-center shadow-[0_2px_0_#5C4200] hover:brightness-105 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>⚔️ Open Clan Chat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLeaveClan(clan._id)}
                            className="px-3 py-2 rounded-xl bg-[#FEECEC] border border-[#F3BABA] text-[#B71C1C] font-label-md text-label-md uppercase font-black hover:bg-[#FCD8D8] cursor-pointer"
                          >
                            Leave
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinClan(clan._id)}
                          className="w-full py-2 rounded-xl bg-gradient-to-b from-[#EF5350] via-[#E53935] to-[#C62828] text-white font-label-md text-label-md uppercase font-black shadow-[0_2px_0_#7F0000] hover:brightness-105 cursor-pointer"
                        >
                          ⚔️ Join Warband
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateClanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClanCreated={loadClans}
      />
    </div>
  );
};
