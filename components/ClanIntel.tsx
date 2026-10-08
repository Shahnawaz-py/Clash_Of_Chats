"use client";

import React from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface ClanIntelProps {
  recipient: UserProfile | null;
}

export const ClanIntel: React.FC<ClanIntelProps> = ({ recipient }) => {
  const { logout } = useAuth();
  const { onlineUsers } = useSocket();

  if (!recipient) {
    return (
      <aside className="w-full lg:w-[290px] xl:w-[310px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto">
        <div className="bg-[#FFFDF9] border-2 border-[#895333] p-4 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] text-center text-[#6E4C38] font-body-sm font-bold">
          Select a warrior from the roster to inspect tactical clan intelligence.
        </div>
      </aside>
    );
  }

  const isOnline = onlineUsers.includes(recipient._id) || recipient.isOnline;

  return (
    <aside className="w-full lg:w-[290px] xl:w-[310px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* War Intelligence Overview Card */}
      <div className="bg-[#FFFDF9] border-2 border-[#895333] p-3.5 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] flex flex-col gap-3 overflow-y-auto">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase tracking-wider font-extrabold">
            CLAN INTEL
          </span>
          <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#FCE58D] border border-[#DEB03A] text-[#633C08] uppercase font-black">
            WAR MODE
          </span>
        </div>

        {/* Clan / Warrior Banner Plate */}
        <div className="p-3 rounded-xl bg-gradient-to-b from-[#FFF5E4] to-[#F8E7D1] border border-[#DDBF9B] shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFFFFF] border-2 border-[#D4A359] flex items-center justify-center text-2xl shadow-sm">
              🔥
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-lg text-label-lg text-[#24140D] font-black leading-tight truncate">
                {recipient.username}
              </span>
              <span className="font-label-sm text-label-sm text-[#895333] uppercase font-bold">
                {recipient.role || 'Level 14 Warband'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5D2BF] shadow-inner flex flex-col">
              <span className="font-label-sm text-label-sm text-[#8A6348] uppercase font-bold">
                TROPHIES
              </span>
              <span className="font-headline-sm text-headline-sm text-[#24140D] font-black">
                {recipient.trophies || 2450} ★
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5D2BF] shadow-inner flex flex-col">
              <span className="font-label-sm text-label-sm text-[#8A6348] uppercase font-bold">
                STATUS
              </span>
              <span className={`font-headline-sm text-headline-sm font-black ${isOnline ? 'text-[#E53935]' : 'text-[#8A6348]'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* War Preparedness Gauge (SVG Chart) */}
        <div className="p-2.5 bg-[#FAF3E8] border border-[#DFCAAE] rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E7D6C3]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-[#C88421]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="84, 100"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <span className="absolute font-label-md text-label-md text-[#663A0F] font-black">84%</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-[#24140D] font-black">Siege Deck Ready</span>
            <span className="font-body-sm text-body-sm text-[#775239]">21/25 defense bases verified</span>
          </div>
        </div>

        {/* Roster Status Strip */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-[#694228] uppercase tracking-wider font-extrabold">
              ROSTER STATUS
            </span>
            <span className="font-label-sm text-label-sm text-[#9A5A1B] uppercase font-black cursor-pointer hover:underline">
              {recipient.isGroup ? `${recipient.clan?.members?.length || 0} MEMBERS` : 'SEE ALL'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {recipient.clan?.members?.length > 0 ? (
              recipient.clan.members.map((m: any, idx: number) => {
                const memberUser = typeof m.user === 'object' ? m.user : null;
                const mName = memberUser?.username || `Warrior #${idx + 1}`;
                const mRole = m.role || memberUser?.role || 'Member';
                const mLevel = memberUser?.level || 50;
                const mOnline = memberUser?._id ? onlineUsers.includes(memberUser._id) || memberUser.isOnline : false;

                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FFFFFF] border border-[#E7D7C6] hover:bg-[#FFFBF5] transition-colors shadow-sm">
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${mOnline ? 'bg-[#E53935]' : 'bg-[#A8988B]'}`} />
                      <span className="font-label-md text-label-md text-[#24140D] font-bold truncate">{mName}</span>
                      <span className="font-label-sm text-label-sm text-[#895333] uppercase font-black flex-shrink-0">{mRole}</span>
                    </div>
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-[#F8E3C2] text-[#693E1B] font-bold border border-[#DEC095] flex-shrink-0">
                      LVL {mLevel}
                    </span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFFFF] border border-[#E7D7C6] hover:bg-[#FFFBF5] transition-colors shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                    <span className="font-label-md text-label-md text-[#24140D] font-bold">Ahmed</span>
                    <span className="font-label-sm text-label-sm text-[#895333] uppercase font-black">Co-Leader</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-[#F8E3C2] text-[#693E1B] font-bold border border-[#DEC095]">
                    LVL 64
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFFFF] border border-[#E7D7C6] hover:bg-[#FFFBF5] transition-colors shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                    <span className="font-label-md text-label-md text-[#24140D] font-bold">Sara</span>
                    <span className="font-label-sm text-label-sm text-[#7A4B1A] uppercase font-bold">Elder</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-[#F8E3C2] text-[#693E1B] font-bold border border-[#DEC095]">
                    LVL 58
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tactical Media & War Scrolls */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-[#694228] uppercase tracking-wider font-extrabold">
              TACTICAL SCROLLS
            </span>
            <span className="font-label-sm text-label-sm text-[#8A6348] font-bold">2 ITEMS</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2D0BE] hover:bg-[#FFFBF5] hover:border-[#C59B6A] transition-colors flex items-center justify-between cursor-pointer shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#B71C1C] text-xl">description</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-[#24140D] font-bold truncate">
                  tactical_briefing.pdf
                </span>
                <span className="font-label-sm text-label-sm text-[#8A6348]">1.4 MB</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#895333] text-base">download</span>
          </div>
        </div>

        {/* Quick Clan Utility Actions */}
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            className="w-full py-2 px-3 rounded-xl bg-[#FAF1E4] hover:bg-[#F3E5D4] border border-[#DFCCA8] text-[#55351E] hover:text-[#24140D] font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-between transition-colors font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">notifications_off</span>
              MUTE BATTLE HORNS
            </span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl bg-[#FEECEC] hover:bg-[#FCD8D8] border border-[#F3BABA] text-[#B71C1C] font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-between transition-colors mt-0.5 font-black cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">logout</span>
              RETREAT FROM CLAN
            </span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
