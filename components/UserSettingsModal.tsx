"use client";

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { sfx } from '@/lib/sfx';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'Chieftain', name: 'Barbarian Chieftain', icon: 'shield' },
  { id: 'Archer', name: 'Master Archer', icon: 'adjust' },
  { id: 'Wizard', name: 'Grand Wizard', icon: 'auto_awesome' },
  { id: 'Pekka', name: 'PEKKA Overlord', icon: 'sports_mma' },
  { id: 'Dragon', name: 'Electro Dragon', icon: 'local_fire_department' },
  { id: 'King', name: 'Barbarian King', icon: 'crown' },
  { id: 'Queen', name: 'Archer Queen', icon: 'female' },
  { id: 'Skull', name: 'Shadow Warrior', icon: 'skull' },
];

const BANNER_PATTERNS = [
  { id: 'crimson-fire', name: 'Crimson Fire', class: 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]' },
  { id: 'royal-dragon', name: 'Royal Dragon', class: 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]' },
  { id: 'emerald-axes', name: 'Emerald Axes', class: 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]' },
  { id: 'golden-lion', name: 'Golden Lion', class: 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]' },
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('Chieftain');
  const [avatarName, setAvatarName] = useState('Barbarian Chieftain');
  const [bannerPattern, setBannerPattern] = useState('crimson-fire');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || 'Chieftain');
      setAvatarName(user.avatarName || 'Barbarian Chieftain');
      setBannerPattern(user.bannerPattern || 'crimson-fire');
      setDescription(user.description || 'Fearless Clash warrior ready for battle.');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setLoading(true);
      setStatusMessage(null);

      const updatedData = await userApi.updateProfile({
        username: username.trim(),
        avatar,
        avatarName,
        bannerPattern,
        description: description.trim(),
      });

      updateUser(updatedData);
      sfx.playClanReward();
      setStatusMessage('⚔️ Warrior Profile Updated Successfully!');

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      sfx.playError();
      setStatusMessage(`⚠️ ${err.message || 'Failed to update settings'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#FFFDF9] border-4 border-[#C89437] rounded-3xl overflow-hidden flex flex-col shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
        
        {/* Header Banner */}
        <div className="bg-[#3C2314] px-6 py-4 border-b-4 border-[#C89437] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#53301B] border-2 border-[#C89437] flex items-center justify-center text-[#FBD46E] shadow-inner">
              <span className="material-symbols-outlined text-2xl font-black">settings</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-black uppercase text-[#FBD46E] tracking-wider">
                WARRIOR SETTINGS
              </h2>
              <p className="font-label-sm text-label-sm text-[#E2C5A5] uppercase font-bold tracking-widest">
                Customize Avatar, Banner & Profile Dispatches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sfx.playClick(); onClose(); }}
            className="w-9 h-9 rounded-xl bg-[#53301B] hover:bg-[#683C22] border-2 border-[#7A4B2E] text-[#FBD46E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl font-bold">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSettings} className="p-6 flex flex-col gap-5 bg-[#FAF3E8] max-h-[80vh] overflow-y-auto">

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-[#FDF2DB] border-2 border-[#C88421] text-[#3E2415] font-label-md font-bold text-center text-sm shadow-sm animate-pulse">
              {statusMessage}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              WARRIOR NAME (USERNAME)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your warrior handle..."
              className="w-full bg-[#FFFDF6] border-2 border-[#895333] rounded-xl px-4 py-2.5 font-body-md text-body-md text-[#24140D] focus:outline-none focus:border-[#C88421] shadow-inner font-bold"
              required
            />
          </div>

          {/* Avatar Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              SELECT WARRIOR AVATAR
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = avatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setAvatar(opt.id);
                      setAvatarName(opt.name);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#FFF2D7] to-[#F5DDB3] border-[#C88421] shadow-[0_4px_12px_rgba(150,90,30,0.3)] scale-105'
                        : 'bg-[#FFFDF6] border-[#D8C7B5] hover:border-[#C88421] text-[#895333]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#3C2314] text-[#FBD46E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                    </div>
                    <span className="font-label-sm text-xs font-bold text-[#24140D] text-center leading-tight">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner Pattern Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              SELECT CLAN BANNER PATTERN
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BANNER_PATTERNS.map((bp) => {
                const isSelected = bannerPattern === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setBannerPattern(bp.id);
                    }}
                    className={`h-12 rounded-xl ${bp.class} p-2 flex items-center justify-center border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-[#F5B823] ring-2 ring-[#F5B823] scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="font-label-sm text-xs text-white uppercase font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {bp.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio / Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              WARRIOR BIO & DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief tactical bio or battle motto about your chieftain..."
              rows={3}
              className="w-full bg-[#FFFDF6] border-2 border-[#895333] rounded-xl p-3 font-body-md text-body-md text-[#24140D] placeholder:text-[#9A7D69] focus:outline-none focus:border-[#C88421] shadow-inner"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8DAC9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { sfx.playClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl bg-[#E8DAC9] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase hover:bg-[#DCC8B0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#5C4200] hover:brightness-105 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <span>SAVE WARRIOR PROFILE</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
