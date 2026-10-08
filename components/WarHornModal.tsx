"use client";

import React, { useState } from 'react';
import { chatApi } from '@/lib/api';
import { sfx } from '@/lib/sfx';

interface WarHornModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSuccess?: () => void;
  socket?: any;
}

export const WarHornModal: React.FC<WarHornModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSuccess,
  socket,
}) => {
  const [broadcastText, setBroadcastText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    '⚔️ All Clan Chieftains & Warriors, prepare for immediate War!',
    '🛡️ Reinforcement troops & artillery requested across all fortresses!',
    '🏆 Victory celebration in the main hall! Assemble for the feast!',
    '🔥 Emergency rally call! Defend our clan borders at once!',
  ];

  const handleBroadcast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcastText.trim()) return;

    try {
      setLoading(true);
      setStatusMessage(null);
      sfx.playWarHorn();

      const result = await chatApi.broadcastWarHorn(broadcastText.trim());

      if (socket) {
        socket.emit('broadcast_warhorn', {
          messages: result.messages || [],
          text: broadcastText,
        });
      }

      setStatusMessage(`🔊 ${result.message || 'War Horn sounded across all clan fortresses!'}`);
      setBroadcastText('');

      if (onBroadcastSuccess) {
        onBroadcastSuccess();
      }

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1800);
    } catch (err: any) {
      sfx.playError();
      setStatusMessage(`⚠️ ${err.message || 'Failed to sound the War Horn'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-[#00000080] inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-[#FFFDF9] border-4 border-[#C89437] rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000] p-5 text-white flex items-center justify-between border-b-2 border-[#590000]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3A0000] border-2 border-[#F5B823] flex items-center justify-center text-[#FBD46E] shadow-inner">
              <span className="material-symbols-outlined text-2xl font-black">campaign</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-black uppercase text-[#FFF2A8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                SOUND THE WAR HORN
              </h2>
              <p className="font-label-sm text-label-sm text-[#FADDB7] uppercase font-bold tracking-wider">
                Broadcast dispatch to ALL Clan Fortresses
              </p>
            </div>
          </div>

          <button
            onClick={() => { sfx.playClick(); onClose(); }}
            className="w-9 h-9 rounded-xl bg-[#4A0000] hover:bg-[#660000] border border-[#800000] text-[#FADDB7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl font-bold">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 bg-[#FAF3E8]">

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-[#FDF2DB] border-2 border-[#C88421] text-[#3E2415] font-label-md font-bold text-center text-sm animate-pulse shadow-sm">
              {statusMessage}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black flex items-center gap-1.5">
              <span>BROADCAST ANNOUNCEMENT</span>
            </label>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Type your war horn message to broadcast across all clan warbands..."
              rows={4}
              className="w-full bg-[#FFFDF6] border-2 border-[#895333] rounded-2xl p-4 font-body-md text-body-md text-[#24140D] placeholder:text-[#9A7D69] focus:outline-none focus:border-[#C88421] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-[#895333] uppercase font-extrabold">
              Quick Tactical Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { sfx.playClick(); setBroadcastText(preset); }}
                  className="p-2.5 text-left rounded-xl bg-[#EFE3D3] border border-[#D5C0A7] hover:bg-[#E5D4C0] hover:border-[#C88421] text-[#3E2415] font-body-sm text-xs font-bold transition-all cursor-pointer truncate"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#E8DAC9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { sfx.playClick(); onClose(); }}
              className="px-5 py-3 rounded-xl bg-[#E8DAC9] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase hover:bg-[#DCC8B0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || !broadcastText.trim()}
              onClick={handleBroadcast}
              className="px-7 py-3 rounded-xl bg-gradient-to-b from-[#EF5350] via-[#E53935] to-[#C62828] text-white font-headline-sm text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#7F0000] hover:brightness-110 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span>Sounding Horn...</span>
              ) : (
                <span>SOUND WAR HORN</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
