"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sfx } from '@/lib/sfx';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, error, clearError } = useAuth();

  // Auth Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form States
  const [emailOrTag, setEmailOrTag] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  const handleToggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setFormError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (mode === 'login') {
      if (!emailOrTag.trim()) {
        setFormError('Please enter your Warrior Tag or Email');
        return;
      }
      if (!password) {
        setFormError('Please enter your secret passphrase');
        return;
      }

      try {
        setSubmitting(true);
        await login({ emailOrTag: emailOrTag.trim(), password });
        sfx.playSuccess();
        router.push('/chats');
      } catch (err: any) {
        setSubmitting(false);
        sfx.playError();
        setFormError(err.message || 'Login failed. Verify credentials.');
      }
    } else {
      // Signup mode validation
      if (!username.trim()) {
        sfx.playError();
        setFormError('Please choose a Warrior Name / Handle');
        return;
      }
      if (!email.trim()) {
        sfx.playError();
        setFormError('Please enter your Warband Email');
        return;
      }
      if (!password || password.length < 6) {
        sfx.playError();
        setFormError('War Cipher must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        sfx.playError();
        setFormError('War Ciphers do not match');
        return;
      }

      try {
        setSubmitting(true);
        await signup({
          username: username.trim(),
          email: email.trim(),
          password,
          avatar: 'Chieftain',
          avatarName: 'Barbarian Chieftain',
        });
        sfx.playSuccess();
        router.push('/chats');
      } catch (err: any) {
        setSubmitting(false);
        sfx.playError();
        setFormError(err.message || 'Registration failed. Try another handle or email.');
      }
    }
  };

  return (
    <main
      className="w-full min-h-screen bg-cover bg-center bg-fixed text-on-background selection:bg-secondary-container selection:text-secondary flex items-center justify-center relative py-8"
      style={{ backgroundImage: "url('/images/coc-login-gemini.svg')" }}
    >
      {/* Subtle Transparent Vignette with Warm Crimson Overlay */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Ambient Crimson Red Torchlight Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-on-tertiary-container/25 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-error-container/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 right-10 w-[500px] h-64 bg-on-tertiary-container/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT PANEL: Visual Battlefield Arena */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-14 relative">

          {/* Mid-Section: Parchment Glassmorphic Backdrop Card */}
          <div className="my-auto space-y-5 bg-[#FFFDF9]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border-2 border-[#895333] shadow-[0_12px_40px_rgba(89,53,28,0.25)] max-w-xl">

            <h1 className="font-headline-xl text-headline-xl text-[#3E2415] tracking-tight font-black">
              {mode === 'login' ? 'WELCOME BACK, CLASHER.' : 'FORGE YOUR WARBAND.'}
            </h1>

            <p className="font-body-lg text-body-lg text-[#5B3E2B] leading-relaxed font-medium">
              {mode === 'login'
                ? 'Your clan is waiting on the battle line. Ready your communications, review tactical orders, and rejoin your warband before the horn sounds.'
                : 'Enlist as a new champion, pledge honor to your guild, and lead real-time battlefield dispatches across kingdoms.'}
            </p>
          </div>

          {/* Bottom Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[#895333] mt-auto">
            <div className="flex items-center gap-4">
              <span className="font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-sm text-[#895333]">verified_user</span>
                End-to-End War Crypt
              </span>
              <span className="text-[#895333]/60">•</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-sm text-[#895333]">speed</span>
                12ms Latency
              </span>
            </div>
            <span className="font-label-sm text-label-sm tracking-wider uppercase text-[#895333] font-bold">v2.8.4-PROD</span>
          </div>

        </div>

        {/* RIGHT PANEL: Clear Background with Glassmorphic Form Card */}
        <div className="lg:col-span-5 flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-8 lg:py-10 relative">
          <div className="w-full max-w-md mx-auto space-y-5 relative z-10 bg-[#FFFDF9]/95 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border-2 border-[#895333] shadow-[0_12px_40px_rgba(89,53,28,0.25)]">

            {/* APP NAME HEADER DIRECTLY ABOVE LOGIN/SIGNUP */}
            <div className="flex flex-col items-center text-center pb-3 border-b border-[#D5BEA8] mb-1">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-11 h-11 rounded-xl bg-[#F6E1C3] border-2 border-[#D4A359] shadow-sm flex items-center justify-center overflow-hidden p-0.5">
                  <img src="/images/coc-logo.png" alt="Clash of Chats Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="font-headline-md text-headline-md text-[#3E2415] tracking-wider uppercase font-extrabold">
                  CLASH OF CHATS
                </h1>
              </div>
              <p className="font-label-sm text-label-sm text-[#895333] uppercase tracking-widest font-extrabold">
                Where Conversations Collide
              </p>
            </div>

            {/* TOGGLE BUTTON FOR LOGIN / SIGNUP */}
            <div className="bg-[#EBDBC9] p-1.5 rounded-xl border border-[#D5BEA8] grid grid-cols-2 gap-2 mb-1 items-center">
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className={`h-12 px-4 rounded-lg font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'login'
                  ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b-2 border-[#AA770B]'
                  : 'text-[#64422A] hover:text-[#24140D] hover:bg-[#F2E5D6] font-bold'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">swords</span>
                <span>LOGIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('signup')}
                className={`h-12 px-4 rounded-lg font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'signup'
                  ? 'bg-gradient-to-b from-[#F5C242] to-[#E3A61E] text-[#361E05] font-black shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b-2 border-[#AA770B]'
                  : 'text-[#64422A] hover:text-[#24140D] hover:bg-[#F2E5D6] font-bold'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">shield_person</span>
                <span>SIGNUP</span>
              </button>
            </div>

            {/* Error Display */}
            {(formError || error) && (
              <div className="p-3.5 rounded-xl bg-[#FEECEC] border-2 border-[#F3BABA] text-[#B71C1C] flex items-start gap-3 shadow-sm">
                <span className="material-symbols-outlined text-xl mt-0.5">warning</span>
                <p className="font-body-sm text-body-sm leading-snug font-bold">{formError || error}</p>
              </div>
            )}

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Form Input Fields Container */}
              <div className="min-h-[230px] flex flex-col justify-start space-y-3.5">
                {/* LOGIN MODE FIELDS */}
                {mode === 'login' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold" htmlFor="warrior-tag">
                        EMAIL OR WARRIOR TAG
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#8C6B51] pointer-events-none text-xl">badge</span>
                        <input
                          id="warrior-tag"
                          type="text"
                          value={emailOrTag}
                          onChange={(e) => setEmailOrTag(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md pl-12 pr-4 py-3 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] placeholder:text-[#9F826D] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="chieftain@clanwar.io or Ragnar"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold" htmlFor="clan-password">
                          SECRET PASSPHRASE
                        </label>
                        <span className="font-label-sm text-label-sm text-[#895333] tracking-wide font-bold">
                          Rune Sealed
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#8C6B51] pointer-events-none text-xl">lock</span>
                        <input
                          id="clan-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md pl-12 pr-12 py-3 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] placeholder:text-[#9F826D] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-[#8C6B51] hover:text-[#3E2415] transition-colors p-1 flex items-center justify-center cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* SIGNUP MODE FIELDS */}
                {mode === 'signup' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold">
                        WARRIOR HANDLE / NAME
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#8C6B51] pointer-events-none text-xl">badge</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md pl-12 pr-4 py-2.5 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] placeholder:text-[#9F826D] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="IroncladRagnar"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold">
                        WARBAND EMAIL
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#8C6B51] pointer-events-none text-xl">mail</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md pl-12 pr-4 py-2.5 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] placeholder:text-[#9F826D] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="chieftain.ragnar@ironforge.gg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold">
                          WAR CIPHER
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md px-3 py-2 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-label-md text-label-md uppercase tracking-wider text-[#5B3E2B] font-bold">
                          CONFIRM CIPHER
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#FFFFFF] text-[#24140D] font-body-md text-body-md px-3 py-2 rounded-xl border-2 border-[#CEB194] shadow-[inset_0_2px_4px_rgba(100,60,30,0.12)] focus:outline-none focus:border-[#D4A359] transition-all font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full relative group overflow-hidden bg-gradient-to-b from-[#E53935] to-[#B71C1C] hover:brightness-110 active:translate-y-0.5 transition-all duration-150 rounded-xl py-4 px-6 text-center shadow-[0_4px_25px_rgba(180,20,20,0.4)] border border-[#A81717] border-b-2 border-b-[#7F0E0E] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mt-2 text-white font-black"
              >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-200">
                  swords
                </span>
                <span className="font-headline-sm text-headline-sm tracking-wider uppercase font-black">
                  {submitting
                    ? 'COMMUNING WITH REALM...'
                    : mode === 'login'
                      ? 'ENTER THE CLASH'
                      : 'JOIN THE WARBAND'}
                </span>
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

            </form>

            {/* Toggle Mode Footer Link */}
            <div className="pt-2 text-center">
              {mode === 'login' ? (
                <p className="font-body-md text-body-md text-[#6E4C38]">
                  New to the battlefield?{' '}
                  <button
                    type="button"
                    onClick={() => handleToggleMode('signup')}
                    className="font-label-md text-label-md text-[#895333] hover:text-[#3E2415] font-black uppercase tracking-wider ml-1 underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    ENLIST RECRUIT
                  </button>
                </p>
              ) : (
                <p className="font-body-md text-body-md text-[#6E4C38]">
                  Already sworn to a banner?{' '}
                  <button
                    type="button"
                    onClick={() => handleToggleMode('login')}
                    className="font-label-md text-label-md text-[#895333] hover:text-[#3E2415] font-black uppercase tracking-wider ml-1 underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    RETURN TO LOGIN
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
