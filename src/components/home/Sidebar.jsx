"use client";

import React from "react";
import {
  Home,
  Send,
  BarChart2,
  Video,
  Repeat,
  Bookmark,
  Eye,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  Plus,
  PanelLeftClose,
} from "lucide-react";

export function Sidebar({
  activeNav = "home",
  setActiveNav,
  onOpenCreate,
  userCredits = -10,
}) {
  return (
    <aside className="w-60 h-screen bg-[#fcfcfc] border-r border-[#ececec] flex flex-col justify-between p-3 select-none flex-shrink-0 z-30 font-sans text-[13px]">
      {/* Top Header & Logo */}
      <div className="space-y-4">
        {/* Logo and control icons */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveNav("home")}>
            {/* Revid.ai Logo mark */}
            <div className="w-5 h-5 rounded-lg border-2 border-emerald-500 flex items-center justify-center p-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-zinc-950">
              revid.ai
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <button className="p-1 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 px-1">
          {/* Black "+ Create" Pill button */}
          <button
            onClick={onOpenCreate}
            className="w-full h-9 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-medium flex items-center justify-between px-3.5 shadow-sm transition active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span>Create</span>
            </div>
            <kbd className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
              C
            </kbd>
          </button>

          {/* Mint green "All tools >" Pill */}
          <button
            onClick={onOpenCreate}
            className="w-full h-8 bg-[#eefaf3] hover:bg-[#e3f6ea] text-emerald-800 rounded-full font-medium flex items-center justify-between px-3 transition text-[12px]"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>All tools</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-0.5 px-1">
          <button
            onClick={() => setActiveNav("home")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition text-left ${
              activeNav === "home"
                ? "bg-[#efefef] text-zinc-950 font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveNav("publish")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition text-left ${
              activeNav === "publish"
                ? "bg-[#efefef] text-zinc-950 font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Send className="w-4 h-4 text-zinc-500" />
            <span>Publish</span>
          </button>

          <button
            onClick={() => setActiveNav("results")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition text-left ${
              activeNav === "results"
                ? "bg-[#efefef] text-zinc-950 font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-zinc-500" />
            <span>Results</span>
          </button>

          <button
            onClick={() => setActiveNav("videos")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition text-left ${
              activeNav === "videos"
                ? "bg-[#efefef] text-zinc-950 font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Video className="w-4 h-4 text-zinc-500" />
            <span>Videos</span>
          </button>
        </nav>

        {/* Inspiration Section */}
        <div className="space-y-0.5 px-1 pt-2">
          <p className="px-3 text-[11px] font-semibold text-zinc-400 mb-1">
            Inspiration
          </p>

          <button
            onClick={() => setActiveNav("repurpose")}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl font-medium transition text-left ${
              activeNav === "repurpose"
                ? "bg-[#efefef] text-zinc-950 font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Repeat className="w-4 h-4 text-zinc-500" />
            <span>Repurpose</span>
          </button>

          <button
            onClick={() => setActiveNav("saved")}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition text-left font-medium"
          >
            <Bookmark className="w-4 h-4 text-zinc-500" />
            <span>Saved Videos</span>
          </button>

          <button
            onClick={() => setActiveNav("watcher")}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition text-left font-medium"
          >
            <Eye className="w-4 h-4 text-zinc-500" />
            <span>Channel Watcher</span>
          </button>

          <button
            onClick={() => setActiveNav("viral-search")}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition text-left font-medium"
          >
            <Search className="w-4 h-4 text-zinc-500" />
            <span>Viral Search & Ads</span>
          </button>
        </div>

        {/* Create Section */}
        <div className="space-y-0.5 px-1 pt-2">
          <p className="px-3 text-[11px] font-semibold text-zinc-400 mb-1">
            Create
          </p>

          <button
            onClick={onOpenCreate}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-zinc-700 hover:bg-zinc-100 transition text-left font-medium"
          >
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-zinc-500" />
              <span>Series Maker</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              New
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Upgrade */}
      <div className="space-y-2 px-1 pt-4 border-t border-[#ececec]">
        {/* Upgrade Button */}
        <button className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Upgrade now</span>
        </button>

        {/* User Card */}
        <div className="p-2 rounded-2xl bg-zinc-100/70 border border-zinc-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 leading-tight">Personal</p>
              <p className="text-[10px] text-zinc-500 truncate">jaiprasadkowru@gm...</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Credits Row */}
        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{userCredits} credits</span>
          </div>
          <button className="hover:text-zinc-800" title="Manage billing">
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
