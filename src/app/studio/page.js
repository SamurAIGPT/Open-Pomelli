"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/studio/Header";
import { InspectorPanel } from "@/components/studio/InspectorPanel";
import { PlayerWrapper } from "@/components/video/PlayerWrapper";
import { TimelineBar } from "@/components/studio/TimelineBar";
import { TemplatesModal } from "@/components/studio/TemplatesModal";
import { ExportModal } from "@/components/studio/ExportModal";
import { VIRAL_REMIX_CARDS, MUSIC_TRACKS } from "@/lib/constants";
import { saveProject, getProjects, supabase } from "@/lib/supabase";

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  // Initial template selection
  const initialTemplate =
    VIRAL_REMIX_CARDS.find((c) => c.id === templateId) || VIRAL_REMIX_CARDS[0];

  const [projectTitle, setProjectTitle] = useState(initialTemplate.title);
  const [projectId, setProjectId] = useState(`proj-${Date.now()}`);
  const [aspectRatio, setAspectRatio] = useState(initialTemplate.aspectRatio || "9:16");
  const [captionStyle, setCaptionStyle] = useState(initialTemplate.captionStyle || "hormozi");
  const [musicTrack, setMusicTrack] = useState("trap-hustle");
  const [musicVolume, setMusicVolume] = useState(0.25);
  const [voice, setVoice] = useState(initialTemplate.voice || "marcus");
  const [scenes, setScenes] = useState(initialTemplate.scenes);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Modals & Generation State
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Check Supabase connection and handle incoming prompt or remix on load
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    const durationParam = searchParams.get("duration");
    const remixParam = searchParams.get("remix");

    if (remixParam === "active" && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("revid_pending_remix");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.scenes && parsed.scenes.length > 0) {
            setProjectTitle(parsed.title || "Remixed Video");
            setScenes(parsed.scenes);
            setCurrentSceneIndex(0);
            sessionStorage.removeItem("revid_pending_remix");
          }
        }
      } catch (e) {
        console.error("Failed to load remix script:", e);
      }
    } else if (promptParam) {
      handleGenerateAiScript(promptParam, Number(durationParam) || 30);
    }

    if (supabase) {
      supabase
        .from("video_projects")
        .select("count", { count: "exact", head: true })
        .then(({ error }) => {
          if (!error) setIsSupabaseConnected(true);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  // Save changes to Supabase & localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      await saveProject({
        id: projectId,
        title: projectTitle,
        aspect_ratio: aspectRatio,
        caption_style: captionStyle,
        music_track: musicTrack,
        music_volume: musicVolume,
        voice: voice,
        scenes: scenes,
      });
      setIsSaving(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [projectId, projectTitle, aspectRatio, captionStyle, musicTrack, musicVolume, voice, scenes]);

  // Handle AI Script Generation
  const handleGenerateAiScript = async (prompt, targetDuration = 30) => {
    setIsGenerating(true);
    setGenerationStep("Drafting viral script...");

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration: targetDuration }),
      });

      setGenerationStep("Selecting high-energy visuals...");

      if (res.ok) {
        const data = await res.json();
        setProjectId(`proj-${Date.now()}`);
        setProjectTitle(data.title || `Video: ${prompt.slice(0, 24)}`);
        setScenes(data.scenes);
        setCurrentSceneIndex(0);
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Load a Pre-made Template
  const handleLoadTemplate = (tpl) => {
    setProjectId(`proj-${Date.now()}`);
    setProjectTitle(tpl.title);
    setAspectRatio(tpl.aspectRatio || "9:16");
    setCaptionStyle(tpl.captionStyle || "hormozi");
    setMusicTrack(tpl.musicTrack || "lofi");
    setVoice(tpl.voice || "marcus");
    setScenes(tpl.scenes);
    setCurrentSceneIndex(0);
  };

  // New Blank Project
  const handleNewProject = () => {
    setProjectId(`proj-${Date.now()}`);
    setProjectTitle("Untitled Viral Video");
    setScenes([
      {
        id: `sc-${Date.now()}-1`,
        badge: "VIRAL HOOK ⚡",
        narration: "Start with an unexpected revelation that stops the scroll immediately.",
        visualId: "clip-1",
        durationSeconds: 5,
      },
      {
        id: `sc-${Date.now()}-2`,
        badge: "CORE LESSON 💡",
        narration: "Deliver your highest-value insight directly without fluff or unnecessary filler words.",
        visualId: "clip-2",
        durationSeconds: 6,
      },
      {
        id: `sc-${Date.now()}-3`,
        badge: "CALL TO ACTION 🔥",
        narration: "Follow for daily high-impact strategies and save this video for your future self.",
        visualId: "clip-3",
        durationSeconds: 5,
      },
    ]);
    setCurrentSceneIndex(0);
  };

  // Add Scene
  const handleAddScene = () => {
    const newScene = {
      id: `sc-${Date.now()}`,
      badge: `SCENE ${scenes.length + 1}`,
      narration: "Enter narration text here for animated word-by-word subtitles.",
      visualId: "clip-1",
      durationSeconds: 5,
    };
    setScenes((prev) => [...prev, newScene]);
    setCurrentSceneIndex(scenes.length);
  };

  const selectedMusicObj = MUSIC_TRACKS.find((t) => t.id === musicTrack);
  const musicTrackUrl = selectedMusicObj?.url || "";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Top Studio Header with navigation back to Home */}
      <Header
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onNewProject={handleNewProject}
        onOpenExport={() => setIsExportOpen(true)}
        onBackToHome={() => router.push("/")}
        isSaving={isSaving}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Inspector Sidebar */}
        <InspectorPanel
          scenes={scenes}
          setScenes={setScenes}
          captionStyle={captionStyle}
          setCaptionStyle={setCaptionStyle}
          musicTrack={musicTrack}
          setMusicTrack={setMusicTrack}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          voice={voice}
          setVoice={setVoice}
          currentSceneIndex={currentSceneIndex}
          setCurrentSceneIndex={setCurrentSceneIndex}
          onGenerateAiScript={handleGenerateAiScript}
          isGenerating={isGenerating}
          generationStep={generationStep}
        />

        {/* Video Canvas Preview */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-900 to-black relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

          <PlayerWrapper
            scenes={scenes}
            captionStyle={captionStyle}
            musicTrackUrl={musicTrackUrl}
            musicVolume={musicVolume}
            aspectRatio={aspectRatio}
            currentSceneIndex={currentSceneIndex}
          />
        </main>
      </div>

      {/* Bottom Interactive Timeline */}
      <TimelineBar
        scenes={scenes}
        currentSceneIndex={currentSceneIndex}
        setCurrentSceneIndex={setCurrentSceneIndex}
        onAddScene={handleAddScene}
      />

      {/* Modals */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={{
          id: projectId,
          title: projectTitle,
          aspectRatio,
          captionStyle,
          musicTrack,
          voice,
          scenes,
        }}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
