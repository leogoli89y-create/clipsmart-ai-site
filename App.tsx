import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { Logo } from './components/Logo';
import { analyzeVideoForClips } from './services/geminiService';
import { formatTime } from './utils/videoUtils';
import { AppScreen, Clip, ClipStyle, VideoMetadata, AspectRatio, CaptionStyle } from './types';

// Icons
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const ScissorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-8.486a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243z" /></svg>;
const MagicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-1.815a1 1 0 000-1.74l-3-1.815z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const DragHandleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-zinc-400 cursor-grab active:cursor-grabbing" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ZoomInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const ZoomOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
const CropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l3.293 3.293a1 1 0 01-1.414 1.414L13 3.414 11.414 5l-1.414-1.414L12 1.586A1 1 0 0112.707 1zM14 10a1 1 0 100-2 1 1 0 000 2zM8.707 15.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6 16.586l1.293-1.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.UPLOAD);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null); // For editor
  const [previewClip, setPreviewClip] = useState<Clip | null>(null); // For selection/preview modal
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Iniciando...");
  const [currentStyle, setCurrentStyle] = useState<ClipStyle>(ClipStyle.DYNAMIC);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  
  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const [youtubePreview, setYoutubePreview] = useState<{id: string, thumb: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');

  // Editor State
  const [editedClip, setEditedClip] = useState<Clip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exportRatio, setExportRatio] = useState<AspectRatio>('9:16');
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(CaptionStyle.MODERN);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [isDetectingSubject, setIsDetectingSubject] = useState(false);

  // Drag and Drop State
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);

  // Smart Cut state
  const [refiningClipId, setRefiningClipId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Para esta demo, por favor use vídeos menores que 50MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setVideoMeta({ file, url, duration: video.duration, type: 'file' });
        startProcessing(file, currentStyle);
      };
    }
  };

  const validateYoutubeUrl = (url: string) => {
    if (!url) return false;
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const match = url.match(regExp);
    return match ? match[1] : false;
  };

  const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    if (!url.trim()) {
      setYoutubePreview(null);
      setYoutubeError("");
      return;
    }
    const videoId = validateYoutubeUrl(url);
    if (videoId) {
      setYoutubePreview({
        id: videoId,
        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
      setYoutubeError("");
    } else {
      setYoutubePreview(null);
      if (url.length > 20) setYoutubeError("Link inválido.");
      else setYoutubeError("");
    }
  };

  const handleYoutubeConfirm = () => {
    if (!youtubePreview) return;
    const embedUrl = `https://www.youtube.com/embed/${youtubePreview.id}`;
    setVideoMeta({ file: null, url: embedUrl, duration: 600, type: 'youtube' });
    startProcessing(youtubeUrl, currentStyle);
  };

  const startProcessing = async (videoInput: File | string, style: ClipStyle) => {
    setScreen(AppScreen.PROCESSING);
    setProcessingProgress(10);
    setProcessingStatus("Enviando dados para IA...");

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      setProcessingStatus("Detectando momentos virais...");
      const generatedClips = await analyzeVideoForClips(videoInput, style);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setProcessingStatus("Concluído!");
      setClips(generatedClips);
      setTimeout(() => setScreen(AppScreen.SELECTION), 500);
    } catch (error) {
      console.error(error);
      clearInterval(progressInterval);
      alert("Ocorreu um erro ao processar o vídeo. " + (error as Error).message);
      setScreen(AppScreen.UPLOAD);
    }
  };

  const deleteClip = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este clipe?")) {
      setClips(clips.filter(c => c.id !== id));
      if (previewClip?.id === id) setPreviewClip(null);
    }
  };

  const regenerateClip = async (clip: Clip) => {
    setRefiningClipId(clip.id);
    const newId = `regen-${Date.now()}`;
    const newClip = { 
        ...clip, 
        id: newId, 
        title: "Novo " + clip.title, 
        startTime: Math.max(0, clip.startTime - 5),
        summary: "Versão regenerada com foco diferente."
    };
    // Mock regeneration delay
    await new Promise(r => setTimeout(r, 1500));
    setClips(clips.map(c => c.id === clip.id ? newClip : c));
    if (previewClip?.id === clip.id) setPreviewClip(newClip);
    setRefiningClipId(null);
  };

  const handleSmartCut = async (clip: Clip) => {
    setRefiningClipId(clip.id);
    await new Promise(r => setTimeout(r, 1500));
    const duration = clip.endTime - clip.startTime;
    const newStart = Math.max(0, clip.startTime - 2.5); 
    const newEnd = newStart + duration;
    const refinedClip = {
        ...clip,
        startTime: newStart,
        endTime: newEnd,
        title: clip.title + " (Refinado)"
    };
    setClips(clips.map(c => c.id === clip.id ? refinedClip : c));
    setRefiningClipId(null);
  };

  const handleAutoReframe = async () => {
    setIsDetectingSubject(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate detection
    setExportRatio('9:16');
    setCropPosition({ x: 50, y: 50 }); // Center subject
    setIsDetectingSubject(false);
  };

  const openPreview = (clip: Clip) => {
    setPreviewClip(clip);
    setIsPlaying(true);
  };

  const closePreview = () => {
    setPreviewClip(null);
    setIsPlaying(false);
    setPreviewCurrentTime(0);
  };

  const handleEditClip = (clip: Clip) => {
    setSelectedClip(clip);
    // Find latest version from clips array in case it was edited before
    const currentClipVersion = clips.find(c => c.id === clip.id) || clip;
    setEditedClip({ ...currentClipVersion }); 
    setZoomLevel(1); // Reset zoom
    setScreen(AppScreen.EDITOR);
    setIsPlaying(true);
    setPreviewClip(null);
  };

  // Centralized function to update edited clip and auto-save to global state
  const saveClipChange = (updatedClip: Clip) => {
    setEditedClip(updatedClip);
    // Auto-save: Update the global clips array immediately
    setClips(prevClips => prevClips.map(c => c.id === updatedClip.id ? updatedClip : c));
  };

  const adjustTime = (type: 'start' | 'end', amount: number) => {
    if(!editedClip || !videoMeta) return;
    const newClip = { ...editedClip };
    
    if (type === 'start') {
        const newVal = Math.max(0, Math.min(newClip.startTime + amount, newClip.endTime - 1));
        newClip.startTime = newVal;
    } else {
        const newVal = Math.min(videoMeta.duration, Math.max(newClip.endTime + amount, newClip.startTime + 1));
        newClip.endTime = newVal;
    }
    saveClipChange(newClip);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null) return;
    if (draggedClipIndex === dropIndex) return;

    const newClips = [...clips];
    const [draggedItem] = newClips.splice(draggedClipIndex, 1);
    newClips.splice(dropIndex, 0, draggedItem);

    setClips(newClips);
    setDraggedClipIndex(null);
  };

  // --- Components ---

  const Header = () => (
    <header className="flex justify-between items-center p-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-800">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(AppScreen.UPLOAD)}>
        <Logo className="w-10 h-10" />
        <span className="text-xl font-bold tracking-tight text-white hidden md:block">ClipSmart AI</span>
      </div>
    </header>
  );

  // --- Screens ---

  const renderUpload = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center animate-fade-in">
      <div className="mb-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Crie Clipes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Virais</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
          Nossa IA identifica os melhores momentos do seu vídeo e cria cortes perfeitos para TikTok e Reels automaticamente.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-zinc-900/50 rounded-3xl p-2 border border-zinc-800 backdrop-blur-sm">
        <div className="flex bg-zinc-900 rounded-2xl mb-6 p-1 relative">
             <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-zinc-800 rounded-xl transition-all duration-300 ${activeTab === 'youtube' ? 'translate-x-full' : 'translate-x-0'}`}
             ></div>
             <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${activeTab === 'upload' ? 'text-white' : 'text-zinc-500'}`}
             >
                Arquivo de Vídeo
             </button>
             <button 
                onClick={() => setActiveTab('youtube')}
                className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${activeTab === 'youtube' ? 'text-white' : 'text-zinc-500'}`}
             >
                Link do YouTube
             </button>
        </div>

        <div className="min-h-[250px] flex flex-col justify-center">
            {activeTab === 'upload' ? (
                <div 
                    className="flex-1 border-2 border-dashed border-zinc-700/50 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-zinc-800/50 hover:border-indigo-500/50 transition-all cursor-pointer group m-4"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon />
                    <h3 className="text-lg font-semibold text-white mb-1">Upload do Computador</h3>
                    <p className="text-zinc-500 text-sm">MP4, MOV (Até 50MB)</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center p-8">
                     <div className="relative mb-4">
                        <input 
                            type="text" 
                            placeholder="Cole o link do YouTube aqui..." 
                            className={`w-full pl-12 pr-4 py-4 bg-black/40 border ${youtubeError ? 'border-red-500' : 'border-zinc-700 focus:border-indigo-500'} rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all`}
                            value={youtubeUrl}
                            onChange={handleYoutubeChange}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                            <LinkIcon />
                        </div>
                     </div>
                     
                     {youtubePreview && (
                         <div className="animate-fade-in space-y-4">
                             <div className="flex gap-4 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                <img src={youtubePreview.thumb} className="w-20 h-12 object-cover rounded-lg" alt="thumb" />
                                <div className="text-left overflow-hidden">
                                    <p className="text-white text-sm font-bold truncate">Vídeo Detectado</p>
                                    <p className="text-xs text-zinc-500">Pronto para processar</p>
                                </div>
                             </div>
                             <button 
                                onClick={handleYoutubeConfirm}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                            >
                                Gerar Clipes
                            </button>
                         </div>
                     )}
                     {youtubeError && <p className="text-red-500 text-sm">{youtubeError}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center animate-fade-in">
        <Logo className="w-20 h-20 mb-8 animate-pulse" />
        <h2 className="text-3xl font-bold text-white mb-4">A IA está trabalhando</h2>
        <p className="text-zinc-400 mb-8">{processingStatus}</p>
        <div className="w-64 h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300 rounded-full" style={{ width: `${processingProgress}%` }}></div>
        </div>
    </div>
  );

  // Immersive Preview Modal
  const PreviewModal = () => {
    if (!previewClip) return null;

    const clipDuration = previewClip.endTime - previewClip.startTime;
    const currentProgress = Math.max(0, Math.min(100, ((previewCurrentTime - previewClip.startTime) / clipDuration) * 100));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 animate-fade-in">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={closePreview}></div>
             
             {/* Use dvh for mobile browser bar compatibility */}
             <div className="relative w-full max-w-6xl h-[90vh] md:h-[90dvh] flex flex-col md:flex-row bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-scale-up">
                
                {/* Close Button */}
                <button 
                    onClick={closePreview}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                    <ChevronLeftIcon />
                </button>

                {/* Left: Immersive Video Player */}
                <div className="flex-1 bg-black relative flex items-center justify-center group">
                    {/* Background Blur Effect for Video Ambience */}
                    <div className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none">
                         <img 
                            src={videoMeta?.type === 'youtube' 
                                ? `https://img.youtube.com/vi/${youtubeUrl.match(/v=([\w-]+)/)?.[1] || youtubeUrl.split('/').pop()}/hqdefault.jpg` 
                                : 'placeholder' 
                            } 
                            className="w-full h-full object-cover" 
                         />
                    </div>
                    
                    <VideoPlayer
                        videoUrl={videoMeta?.url || ''}
                        startTime={previewClip.startTime}
                        endTime={previewClip.endTime}
                        isPlaying={isPlaying}
                        aspectRatio="9:16"
                        captionText={previewClip.transcript}
                        showCaptions={true}
                        captionStyle={captionStyle}
                        className="h-full w-auto aspect-[9/16] max-h-full shadow-2xl z-10"
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={(t) => setPreviewCurrentTime(t)}
                    />

                    {/* Center Play Button Overlay */}
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 bg-black/20'}`}
                    >
                        <div className="p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white shadow-xl transform group-hover:scale-110 transition-transform">
                             {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </div>
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-30">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-linear"
                            style={{ width: `${currentProgress}%` }}
                        />
                    </div>
                </div>

                {/* Right: Controls & Info */}
                <div className="w-full md:w-[380px] bg-zinc-950 flex flex-col border-l border-zinc-800">
                    <div className="p-6 md:p-8 overflow-y-auto flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                Viral Score {previewClip.viralityScore}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                                {formatTime(clipDuration)}s
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{previewClip.title}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8">{previewClip.summary}</p>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Legenda Viral
                            </label>
                            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-300 text-sm italic relative group hover:border-indigo-500/50 transition-colors">
                                "{previewClip.viralCaption}"
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(previewClip.viralCaption)}
                                        className="text-xs text-indigo-400 hover:underline"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="p-6 md:p-8 border-t border-zinc-800 bg-zinc-950 space-y-3">
                         <button 
                            onClick={() => handleEditClip(previewClip)}
                            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                        >
                            <ScissorsIcon /> Editar & Exportar
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => regenerateClip(previewClip)}
                                className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <RefreshIcon /> Regenerar
                            </button>
                            <button 
                                onClick={() => deleteClip(previewClip.id)}
                                className="py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 font-medium rounded-xl border border-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <TrashIcon /> Excluir
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
  };

  const renderSelection = () => (
    <div className="min-h-[90vh] p-6 md:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Clipes Prontos</h2>
            <p className="text-zinc-400">Arraste os clipes para reordenar ou clique para visualizar.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setScreen(AppScreen.UPLOAD)} className="text-zinc-500 hover:text-white px-4">Novo Vídeo</button>
          </div>
        </header>

        {clips.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
                <p className="text-zinc-500">Nenhum clipe disponível. Tente processar novamente.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clips.map((clip, index) => (
                <div 
                    key={clip.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={() => openPreview(clip)}
                    className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-indigo-500 transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-indigo-900/20 transform hover:-translate-y-1 relative
                        ${draggedClipIndex === index ? 'opacity-50 scale-95 border-dashed border-indigo-500' : ''}
                    `}
                >
                <div className="aspect-[9/16] bg-black relative overflow-hidden">
                     {videoMeta?.type === 'file' ? (
                        <video 
                        src={videoMeta.url} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = clip.startTime; }}
                        />
                    ) : (
                        <img 
                        src={`https://img.youtube.com/vi/${youtubeUrl.match(/v=([\w-]+)/)?.[1] || youtubeUrl.split('/').pop()}/hqdefault.jpg`}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        alt="Thumbnail"
                        />
                    )}
                    
                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-[2px]">
                         {refiningClipId === clip.id ? (
                             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                         ) : (
                             <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleEditClip(clip); }}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl"
                                >
                                    <ScissorsIcon /> Editar
                                </button>
                                <div className="flex gap-3 mt-2">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleSmartCut(clip); }}
                                        className="p-3 bg-zinc-800 text-indigo-400 rounded-full hover:bg-indigo-500 hover:text-white transition-colors"
                                        title="Corte Inteligente"
                                     >
                                         <MagicIcon />
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); regenerateClip(clip); }}
                                        className="p-3 bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 hover:text-white transition-colors"
                                        title="Regenerar"
                                     >
                                         <RefreshIcon />
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); deleteClip(clip.id); }}
                                        className="p-3 bg-zinc-800 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                        title="Excluir"
                                     >
                                         <TrashIcon />
                                     </button>
                                </div>
                             </>
                         )}
                    </div>

                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10 pointer-events-none">
                        {clip.viralityScore} Viral Score
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded-lg z-10 pointer-events-none">
                        {formatTime(clip.endTime - clip.startTime)}
                    </div>
                </div>
                
                <div className="p-6 relative">
                    {/* Drag Handle */}
                    <div className="absolute top-4 right-4 text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                         onMouseDown={(e) => e.stopPropagation()} // Prevent card click when clicking handle
                    >
                         <DragHandleIcon />
                    </div>

                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors pr-8">{clip.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">{clip.viralCaption}</p>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
      <PreviewModal />
    </div>
  );

  const renderEditor = () => {
    if (!editedClip || !videoMeta) return null;

    // Calculate percentages for timeline
    const totalDuration = videoMeta.duration || 600; // Default if not avail
    const startPct = (editedClip.startTime / totalDuration) * 100;
    const endPct = (editedClip.endTime / totalDuration) * 100;
    const widthPct = endPct - startPct;

    return (
      <div className="h-[90vh] md:h-[90dvh] flex flex-col md:flex-row bg-black">
        {/* CSS for Range Inputs - Cross Browser Compatible */}
        <style>{`
          /* Standard and WebKit */
          input[type=range] {
            -webkit-appearance: none;
            background: transparent;
          }
          
          /* WebKit Slider Thumb */
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: auto;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            border: 2px solid #6366f1; /* indigo-500 */
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            margin-top: -10px; /* Aligns middle of thumb with middle of track */
            position: relative;
            z-index: 50;
          }
          
          /* Firefox Slider Thumb */
          input[type=range]::-moz-range-thumb {
            pointer-events: auto;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            border: 2px solid #6366f1;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            transform: translateY(0px); /* Firefox doesn't need margin hack usually if track is standard */
            z-index: 50;
          }

          /* Track Cleanup to remove default borders */
          input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
          }
          input[type=range]::-moz-range-track {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
          }

           /* Custom scrollbar for horizontal scrolling timeline */
           .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #18181b;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46;
            border-radius: 3px;
          }
        `}</style>

        <div className="flex-1 flex flex-col items-center justify-center relative p-8 gap-6">
             <button 
                onClick={() => { setScreen(AppScreen.SELECTION); setIsPlaying(false); }}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-zinc-400 hover:text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-md"
            >
                <ChevronLeftIcon /> Voltar
            </button>
            
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-xs text-green-500 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none animate-fade-in">
                <CheckIcon /> Salvo automaticamente
            </div>
            
            {/* Video Player Container */}
            <div className="relative flex-1 w-full max-h-[55vh] flex items-center justify-center group">
                 <VideoPlayer
                    videoUrl={videoMeta.url}
                    startTime={editedClip.startTime}
                    endTime={editedClip.endTime}
                    isPlaying={isPlaying}
                    aspectRatio={exportRatio}
                    captionText={editedClip.transcript}
                    showCaptions={showCaptions}
                    captionStyle={captionStyle}
                    cropPosition={cropPosition}
                    className="h-full shadow-2xl"
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Drag hint overlay */}
                {exportRatio !== '16:9' && !isPlaying && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            Arraste para ajustar o enquadramento
                         </div>
                    </div>
                )}

                <div className="absolute bottom-10 flex gap-4 z-20 pointer-events-none">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl pointer-events-auto">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                </div>
            </div>

            {/* Timeline Tools */}
            <div className="w-full max-w-4xl flex items-center justify-between px-2">
                 <div className="text-zinc-400 text-xs font-mono">
                     <span>Início: <span className="text-white">{formatTime(editedClip.startTime)}</span></span>
                     <span className="mx-3 text-zinc-600">|</span>
                     <span>Fim: <span className="text-white">{formatTime(editedClip.endTime)}</span></span>
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                      <button 
                         onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                         className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                         title="Zoom Out"
                      >
                         <ZoomOutIcon />
                      </button>
                      <span className="text-xs text-zinc-500 font-mono w-8 text-center">{zoomLevel}x</span>
                      <button 
                         onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))}
                         className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                         title="Zoom In"
                      >
                         <ZoomInIcon />
                      </button>
                      <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                      <button 
                         onClick={() => setZoomLevel(1)}
                         className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                         title="Ajustar à tela"
                      >
                         <SearchIcon />
                      </button>
                 </div>
            </div>

            {/* Visual Timeline Trimmer */}
            <div className="w-full max-w-4xl px-2 pb-2 overflow-hidden">
                 <div className="w-full overflow-x-auto custom-scrollbar pb-4">
                     <div 
                        className="relative h-14 bg-zinc-900/50 rounded-xl border border-zinc-800/50 transition-all duration-300"
                        style={{ width: `${zoomLevel * 100}%` }}
                     >
                          {/* Background Track / Waveform Sim */}
                          <div className="absolute inset-0 flex items-center px-2 opacity-20">
                               <div className="w-full h-1/2 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 49%, #52525b 50%, transparent 51%)', backgroundSize: '10px 100%' }}></div>
                          </div>

                          <div className="absolute w-full h-full flex items-center">
                               {/* Highlighted Region */}
                               <div 
                                  className="absolute h-full bg-indigo-500/20 border-x-2 border-indigo-500 box-border z-10"
                                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                               >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
                               </div>

                                {/* Start Slider Input */}
                                <input 
                                   type="range"
                                   min={0}
                                   max={totalDuration}
                                   step={0.1 / zoomLevel} // Finer step when zoomed in
                                   value={editedClip.startTime}
                                   onChange={(e) => {
                                       const val = Number(e.target.value);
                                       if(val < editedClip.endTime - 0.5) {
                                           saveClipChange({...editedClip, startTime: val});
                                           setIsPlaying(false);
                                       }
                                   }}
                                   className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto z-20 opacity-0 cursor-ew-resize"
                                   style={{ pointerEvents: 'none' }} // Let container handle clicks, but thumbs need pointer events. Done via CSS above.
                                />
                                
                                {/* End Slider Input */}
                                <input 
                                   type="range"
                                   min={0}
                                   max={totalDuration}
                                   step={0.1 / zoomLevel}
                                   value={editedClip.endTime}
                                   onChange={(e) => {
                                       const val = Number(e.target.value);
                                       if(val > editedClip.startTime + 0.5) {
                                           saveClipChange({...editedClip, endTime: val});
                                           setIsPlaying(false);
                                       }
                                   }}
                                   className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto z-20 opacity-0 cursor-ew-resize"
                                    style={{ pointerEvents: 'none' }}
                                />
                          </div>
                     </div>
                 </div>

                 {/* Fine Tuning Controls */}
                 <div className="flex justify-between items-center mt-4 px-1">
                      <div className="flex gap-2 items-center">
                           <span className="text-zinc-500 text-xs font-bold uppercase mr-2">Início</span>
                           <button onClick={() => adjustTime('start', -0.1)} className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800" title="-0.1s"><MinusIcon /></button>
                           <button onClick={() => adjustTime('start', 0.1)} className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800" title="+0.1s"><PlusIcon /></button>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                           <span className="text-zinc-500 text-xs font-bold uppercase mr-2">Fim</span>
                           <button onClick={() => adjustTime('end', -0.1)} className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800" title="-0.1s"><MinusIcon /></button>
                           <button onClick={() => adjustTime('end', 0.1)} className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800" title="+0.1s"><PlusIcon /></button>
                      </div>
                 </div>
            </div>
        </div>

        <div className="w-full md:w-96 bg-zinc-900 border-l border-zinc-800 p-8 flex flex-col gap-8 overflow-y-auto">
             <div>
                <h2 className="text-2xl font-bold text-white mb-1">Ajuste Final</h2>
                <p className="text-zinc-500 text-sm">Prepare seu clipe para postar.</p>
            </div>

            {/* Smart Crop Section */}
            <div className="space-y-4">
                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                     <CropIcon /> Enquadramento Inteligente
                 </label>
                 <button 
                    onClick={handleAutoReframe}
                    disabled={isDetectingSubject}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isDetectingSubject ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Detectando sujeito...
                        </>
                    ) : (
                        <>
                            <SparklesIcon /> Auto Reframe (IA)
                        </>
                    )}
                 </button>
            </div>
            
            <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Formato</label>
                <div className="grid grid-cols-3 gap-2">
                    {['9:16', '1:1', '16:9'].map((ratio) => (
                        <button key={ratio} onClick={() => setExportRatio(ratio as AspectRatio)} className={`py-3 text-sm rounded-xl font-medium transition-all ${exportRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{ratio}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Legendas</label>
                    <button onClick={() => setShowCaptions(!showCaptions)} className={`w-10 h-6 rounded-full p-1 transition-colors ${showCaptions ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showCaptions ? 'translate-x-4' : ''}`} />
                    </button>
                 </div>
                 
                 {/* Caption Style Selector */}
                 {showCaptions && (
                     <div className="grid grid-cols-2 gap-2 mt-2">
                         {[
                             { id: CaptionStyle.MODERN, label: 'Moderno' },
                             { id: CaptionStyle.CLASSIC, label: 'Clássico' },
                             { id: CaptionStyle.HIGHLIGHT, label: 'Destaque' },
                             { id: CaptionStyle.BOX, label: 'Box' },
                         ].map((style) => (
                             <button
                                key={style.id}
                                onClick={() => setCaptionStyle(style.id)}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                    captionStyle === style.id 
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                                    : 'bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700'
                                }`}
                             >
                                 {style.label}
                             </button>
                         ))}
                     </div>
                 )}

                 <textarea 
                    className="w-full bg-zinc-800 border-transparent focus:border-indigo-500 rounded-xl p-4 text-sm text-white resize-none h-32"
                    value={editedClip.transcript}
                    onChange={(e) => saveClipChange({...editedClip, transcript: e.target.value})}
                 />
            </div>

            <button onClick={() => setScreen(AppScreen.EXPORT)} className="mt-auto w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                <DownloadIcon /> Exportar Vídeo
            </button>
        </div>
      </div>
    );
  };

  const renderExport = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30 animate-bounce-slow">
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">Pronto para viralizar!</h2>
        <p className="text-zinc-400 mb-10">O clipe foi processado com sucesso.</p>
        
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all" onClick={() => alert("Download iniciado.")}>
                Baixar MP4
            </button>
            <button className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all" onClick={() => setScreen(AppScreen.SELECTION)}>
                Criar Outro
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Header />
      {screen === AppScreen.UPLOAD && renderUpload()}
      {screen === AppScreen.PROCESSING && renderProcessing()}
      {screen === AppScreen.SELECTION && renderSelection()}
      {screen === AppScreen.EDITOR && renderEditor()}
      {screen === AppScreen.EXPORT && renderExport()}
    </div>
  );
};

export default App;