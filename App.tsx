import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { Logo } from './components/Logo';
import { analyzeVideoForClips, refineClip } from './services/geminiService';
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
const DragHandleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-zinc-600 cursor-grab active:cursor-grabbing hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ZoomInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const ZoomOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
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
  const [savingStatus, setSavingStatus] = useState("");

  // Caption Customization State
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF");
  const [captionBgColor, setCaptionBgColor] = useState("rgba(0,0,0,0.6)");
  const [captionFontSize, setCaptionFontSize] = useState(20);

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
    const updatedClip = await refineClip(clip);
    setClips(clips.map(c => c.id === clip.id ? updatedClip : c));
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
    
    // Reset style defaults when entering editor
    setCaptionTextColor("#FFFFFF");
    setCaptionBgColor("rgba(0,0,0,0.6)");
    setCaptionFontSize(20);
  };

  // Centralized function to update edited clip and auto-save to global state
  const saveClipChange = (updatedClip: Clip) => {
    setEditedClip(updatedClip);
    setSavingStatus("Salvando...");
    // Auto-save: Update the global clips array immediately
    setClips(prevClips => prevClips.map(c => c.id === updatedClip.id ? updatedClip : c));
    setTimeout(() => setSavingStatus("Salvo"), 800);
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

      <div className="w-full max-w-2xl bg-zinc-900/50 rounded-3xl p-2 border border-zinc-800 backdrop-blur-sm shadow-xl">
        {/* Tabs */}
        <div className="flex bg-zinc-950/50 rounded-2xl mb-6 p-1 relative">
             <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-zinc-800 rounded-xl transition-all duration-300 shadow-md ${activeTab === 'upload' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-[calc(0%+4px)]'}`}
             ></div>
             <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 relative z-10 font-medium transition-colors ${activeTab === 'upload' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
             >
                📁 Enviar Arquivo
             </button>
             <button 
                onClick={() => setActiveTab('youtube')}
                className={`flex-1 py-3 relative z-10 font-medium transition-colors ${activeTab === 'youtube' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
             >
                📺 YouTube Link
             </button>
        </div>

        <div className="p-4">
            {activeTab === 'upload' ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800/30 rounded-2xl p-10 cursor-pointer transition-all group flex flex-col items-center justify-center min-h-[300px]"
                >
                    <UploadIcon />
                    <span className="text-lg font-medium text-white group-hover:text-indigo-300">
                        Clique para enviar seu vídeo
                    </span>
                    <span className="text-sm text-zinc-500 mt-2">MP4, MOV ou AVI (Max 50MB)</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="video/*" 
                        className="hidden" 
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
                    {youtubePreview ? (
                        <div className="w-full animate-fade-in">
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-700 mb-6 group">
                                <img src={youtubePreview.thumb} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-red-600 text-white p-3 rounded-full shadow-lg">
                                        <PlayIcon />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setYoutubeUrl(""); setYoutubePreview(null); }}
                                    className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                                >
                                    <XIcon />
                                </button>
                            </div>
                            <button 
                                onClick={handleYoutubeConfirm}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02]"
                            >
                                ✨ Gerar Clipes com IA
                            </button>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                <LinkIcon />
                                <input 
                                    type="text" 
                                    placeholder="Cole o link do YouTube aqui..." 
                                    value={youtubeUrl}
                                    onChange={handleYoutubeChange}
                                    className="bg-transparent border-none outline-none text-white w-full placeholder-zinc-600"
                                    autoFocus
                                />
                            </div>
                            {youtubeError && <p className="text-red-400 text-sm text-left pl-2">{youtubeError}</p>}
                            <p className="text-zinc-500 text-sm">Cole um link válido para visualizar a prévia.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 w-full max-w-2xl justify-center">
         {Object.values(ClipStyle).map((style) => (
             <button
                key={style}
                onClick={() => setCurrentStyle(style)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${currentStyle === style ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
             >
                {style}
             </button>
         ))}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
         <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
         <Logo className="absolute inset-0 m-auto w-10 h-10 animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">{processingStatus}</h2>
      <p className="text-zinc-400 mb-8">Analisando áudio, vídeo e contexto...</p>
      
      <div className="w-full max-w-md bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${processingProgress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-zinc-500 font-mono text-sm">{Math.round(processingProgress)}%</p>
    </div>
  );

  const renderSelection = () => (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h2 className="text-3xl font-bold text-white mb-2">Clipes Gerados</h2>
            <p className="text-zinc-400">Arraste para reordenar ou clique para pré-visualizar.</p>
         </div>
         <button onClick={() => setScreen(AppScreen.UPLOAD)} className="text-sm text-zinc-500 hover:text-white underline">
            Novo Vídeo
         </button>
      </div>

      <div className="flex flex-col gap-4">
        {clips.map((clip, index) => {
            const isRefining = refiningClipId === clip.id;
            return (
              <div 
                key={clip.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col md:flex-row gap-6 transition-all hover:bg-zinc-800/30 ${isRefining ? 'opacity-70 pointer-events-none' : ''}`}
              >
                 {/* Drag Handle */}
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-zinc-600">
                    <DragHandleIcon />
                 </div>

                 {/* Thumbnail / Video Preview */}
                 <div className="relative w-full md:w-32 aspect-[9/16] bg-black rounded-lg overflow-hidden shrink-0 shadow-lg border border-zinc-800 self-center">
                    {videoMeta && (
                        <VideoPlayer 
                            videoUrl={videoMeta.url}
                            startTime={clip.startTime}
                            endTime={clip.endTime}
                            isPlaying={false}
                            aspectRatio="9:16"
                            showCaptions={false}
                            className="pointer-events-none opacity-80"
                        />
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                        {formatTime(clip.endTime - clip.startTime)}
                    </div>
                    {/* Hover Play Overlay */}
                    <div 
                        onClick={() => openPreview(clip)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                         <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white">
                            <PlayIcon />
                         </div>
                    </div>
                 </div>

                 {/* Content */}
                 <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-white leading-tight">{clip.title}</h3>
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide shrink-0 ${
                            clip.viralityScore >= 9 ? 'bg-green-500/20 text-green-400' : 
                            clip.viralityScore >= 7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700 text-zinc-400'
                        }`}>
                            Score {clip.viralityScore}
                        </div>
                    </div>
                    
                    <p className="text-zinc-300 text-sm bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 font-medium">
                        {clip.viralCaption}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </span>
                        <span className="text-xs text-indigo-400 bg-indigo-900/10 border border-indigo-900/20 px-2 py-1 rounded-md">
                           #{clip.category}
                        </span>
                    </div>
                 </div>

                 {/* Actions Stack */}
                 <div className="flex md:flex-col gap-2 items-stretch justify-center md:w-32 shrink-0">
                    <button 
                        onClick={() => { /* Logic to download would go here */ alert('Download iniciado!'); }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                        <DownloadIcon /> Baixar
                    </button>
                    <button 
                        onClick={() => handleEditClip(clip)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white rounded-lg transition-colors border border-zinc-700"
                    >
                        <ScissorsIcon /> Editar
                    </button>
                    <button 
                         onClick={() => handleSmartCut(clip)}
                         disabled={isRefining}
                         className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 text-sm font-medium rounded-lg transition-colors border border-indigo-500/20"
                    >
                         {isRefining ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/> : <MagicIcon />}
                         {isRefining ? 'Refinando' : 'Smart Cut'}
                    </button>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => regenerateClip(clip)}
                            title="Regenerar Clipe"
                            className="flex-1 flex items-center justify-center py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg border border-zinc-700"
                         >
                            <RefreshIcon />
                         </button>
                         <button 
                            onClick={() => deleteClip(clip.id)}
                            title="Excluir Clipe"
                            className="flex-1 flex items-center justify-center py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-700 hover:border-red-900/50"
                         >
                            <TrashIcon />
                         </button>
                    </div>
                 </div>
              </div>
            );
        })}
      </div>
    </div>
  );

  const renderEditor = () => {
    if (!editedClip || !videoMeta) return null;

    const clipDuration = editedClip.endTime - editedClip.startTime;

    return (
      <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden animate-fade-in">
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative bg-zinc-950">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/80 backdrop-blur rounded-full px-4 py-2 border border-white/10 shadow-xl">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-indigo-400 transition-colors">
                     {isPlaying ? <PauseIcon /> : <PlayIcon />}
                 </button>
                 <div className="w-px h-6 bg-white/20 mx-1"></div>
                 <button 
                    onClick={() => setExportRatio('9:16')} 
                    className={`text-xs font-bold px-2 py-1 rounded ${exportRatio === '9:16' ? 'bg-white text-black' : 'text-zinc-400'}`}
                 >9:16</button>
                 <button 
                    onClick={() => setExportRatio('1:1')} 
                    className={`text-xs font-bold px-2 py-1 rounded ${exportRatio === '1:1' ? 'bg-white text-black' : 'text-zinc-400'}`}
                 >1:1</button>
            </div>

            {/* Viewport */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative group">
                {isDetectingSubject && (
                    <div className="absolute z-30 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white/10 border border-white/20 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            <span className="text-white font-medium">Detectando sujeito com IA...</span>
                        </div>
                    </div>
                )}
                
                {/* Crop Instructions Overlay */}
                <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none">
                    Arraste o vídeo para ajustar o enquadramento
                </div>

                <div className={`relative shadow-2xl transition-all duration-500 ${exportRatio === '9:16' ? 'h-full aspect-[9/16]' : 'w-full max-w-2xl aspect-video'}`}>
                     <VideoPlayer 
                        videoUrl={videoMeta.url}
                        startTime={editedClip.startTime}
                        endTime={editedClip.endTime}
                        isPlaying={isPlaying}
                        aspectRatio={exportRatio}
                        captionText={editedClip.transcript} // Simplified transcript logic
                        showCaptions={showCaptions}
                        captionStyle={captionStyle}
                        captionTextColor={captionTextColor}
                        captionBgColor={captionBgColor}
                        captionFontSize={captionFontSize}
                        cropPosition={cropPosition}
                        className="rounded-lg bg-black"
                     />
                </div>
            </div>

            {/* Precise Timeline Trimmer */}
            <div className="h-48 bg-zinc-900 border-t border-zinc-800 p-4 flex flex-col gap-4 z-20">
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-mono text-zinc-500">{formatTime(editedClip.startTime)}</span>
                    <div className="flex gap-2 bg-black/50 rounded-lg p-1">
                        <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} className="p-1 hover:text-white text-zinc-400"><ZoomOutIcon/></button>
                        <span className="text-xs text-zinc-500 w-8 text-center my-auto">{zoomLevel}x</span>
                        <button onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))} className="p-1 hover:text-white text-zinc-400"><ZoomInIcon/></button>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{formatTime(editedClip.endTime)}</span>
                </div>

                {/* Timeline Track with Zoom Scroll */}
                <div className="relative h-12 w-full bg-zinc-950 rounded-lg overflow-x-auto overflow-y-hidden select-none custom-scrollbar">
                     <div className="relative h-full" style={{ width: `${zoomLevel * 100}%` }}>
                        {/* Background ticks */}
                        <div className="absolute inset-0 flex justify-between px-2 opacity-20 pointer-events-none">
                             {Array.from({length: 20 * zoomLevel}).map((_, i) => (
                                 <div key={i} className="w-px h-full bg-zinc-500"></div>
                             ))}
                        </div>
                        
                        {/* Active Region */}
                        <div 
                            className="absolute top-0 bottom-0 bg-indigo-500/20 border-x-2 border-indigo-500 h-full"
                            style={{
                                left: `${(editedClip.startTime / videoMeta.duration) * 100}%`,
                                width: `${((editedClip.endTime - editedClip.startTime) / videoMeta.duration) * 100}%`
                            }}
                        ></div>

                        {/* Range Inputs (Invisible but interactive) */}
                        <input 
                            type="range" 
                            min={0} 
                            max={videoMeta.duration} 
                            step={0.1}
                            value={editedClip.startTime}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val < editedClip.endTime - 1) saveClipChange({ ...editedClip, startTime: val });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 appearance-none pointer-events-auto"
                        />
                         <input 
                            type="range" 
                            min={0} 
                            max={videoMeta.duration} 
                            step={0.1}
                            value={editedClip.endTime}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > editedClip.startTime + 1) saveClipChange({ ...editedClip, endTime: val });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 appearance-none pointer-events-auto"
                        />
                     </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-2">
                        <button onClick={() => adjustTime('start', -0.1)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400"><MinusIcon/></button>
                        <button onClick={() => adjustTime('start', 0.1)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400"><PlusIcon/></button>
                        <span className="ml-2 text-zinc-400 text-xs my-auto">Ajuste Início</span>
                    </div>
                    <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{clipDuration.toFixed(1)}s</span>
                    <div className="flex gap-2">
                        <span className="mr-2 text-zinc-400 text-xs my-auto">Ajuste Fim</span>
                        <button onClick={() => adjustTime('end', -0.1)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400"><MinusIcon/></button>
                        <button onClick={() => adjustTime('end', 0.1)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400"><PlusIcon/></button>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto">
             <div className="p-6 border-b border-zinc-800">
                <h3 className="text-white font-bold mb-4">Aparência da Legenda</h3>
                
                <div className="flex items-center justify-between mb-4 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-sm text-zinc-400">Mostrar Legendas</span>
                    <button 
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${showCaptions ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showCaptions ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Style Selector */}
                <label className="text-xs text-zinc-500 mb-2 block uppercase font-bold tracking-wider">Estilo</label>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {Object.values(CaptionStyle).map((style) => (
                        <button 
                            key={style}
                            onClick={() => setCaptionStyle(style)}
                            className={`p-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                                captionStyle === style 
                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>

                {/* Colors & Size */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 mb-2 block uppercase font-bold tracking-wider">Cor do Texto</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={captionTextColor}
                                onChange={(e) => setCaptionTextColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs font-mono text-zinc-400">{captionTextColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 mb-2 block uppercase font-bold tracking-wider">Cor do Fundo</label>
                        <div className="flex items-center gap-2 mb-2">
                             {/* Presets for BG (Transparent, Semi-Black, Solid Blue, etc) */}
                             <button onClick={() => setCaptionBgColor("transparent")} className="w-6 h-6 rounded-full border border-zinc-700 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900" title="Transparente"></button>
                             <button onClick={() => setCaptionBgColor("rgba(0,0,0,0.6)")} className="w-6 h-6 rounded-full border border-zinc-700 bg-black/60" title="Preto Translúcido"></button>
                             <button onClick={() => setCaptionBgColor("#000000")} className="w-6 h-6 rounded-full border border-zinc-700 bg-black" title="Preto Sólido"></button>
                             <button onClick={() => setCaptionBgColor("#4f46e5")} className="w-6 h-6 rounded-full border border-zinc-700 bg-indigo-600" title="Indigo"></button>
                        </div>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={captionBgColor.startsWith('#') ? captionBgColor : "#000000"} // Fallback for rgba in color input
                                onChange={(e) => setCaptionBgColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs font-mono text-zinc-400 truncate max-w-[100px]">{captionBgColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 mb-2 block uppercase font-bold tracking-wider">Tamanho da Fonte: {captionFontSize}px</label>
                        <input 
                            type="range" 
                            min="12" 
                            max="48" 
                            step="1"
                            value={captionFontSize}
                            onChange={(e) => setCaptionFontSize(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                        />
                    </div>
                </div>
             </div>

             <div className="p-6 border-b border-zinc-800">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CropIcon /> Enquadramento
                 </h3>
                 <button 
                    onClick={handleAutoReframe}
                    disabled={isDetectingSubject}
                    className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center gap-2 transition-all"
                 >
                    {isDetectingSubject ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/> : <SparklesIcon />}
                    Auto Reframe (IA)
                 </button>
                 <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                    A IA detecta o sujeito principal e ajusta o recorte para 9:16 vertical.
                 </p>
             </div>

             <div className="p-6 flex-1">
                <h3 className="text-white font-bold mb-4">Transcrição</h3>
                <textarea 
                    value={editedClip.transcript}
                    onChange={(e) => saveClipChange({ ...editedClip, transcript: e.target.value })}
                    className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Edite a legenda aqui..."
                />
                <div className="flex items-center gap-2 mt-2 text-xs text-green-500 opacity-80">
                    <CheckIcon /> {savingStatus || "Salvo automaticamente"}
                </div>
             </div>

             <div className="p-6 border-t border-zinc-800">
                <button 
                    onClick={() => { setScreen(AppScreen.SELECTION); setIsPlaying(false); }}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                    Concluir Edição
                </button>
             </div>
        </div>
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!previewClip || !videoMeta) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in p-4 md:p-8">
            <button 
                onClick={closePreview}
                className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
                <ChevronLeftIcon /> Voltar
            </button>

            <div className="w-full max-w-6xl h-[85vh] flex flex-col md:flex-row gap-8 items-center">
                 {/* Player Section */}
                 <div className="flex-1 w-full h-full flex items-center justify-center relative">
                    <div className="relative h-full max-h-[80vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.2)] border border-white/10 group">
                        <VideoPlayer 
                            videoUrl={videoMeta.url}
                            startTime={previewClip.startTime}
                            endTime={previewClip.endTime}
                            isPlaying={isPlaying}
                            aspectRatio="9:16"
                            captionText={previewClip.transcript}
                            showCaptions={true}
                            className="h-full w-full object-cover"
                            onTimeUpdate={(t) => setPreviewCurrentTime(t)}
                        />
                        
                        {/* Immersive Play Control */}
                        <div 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {!isPlaying && (
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white pl-2 hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                             <div 
                                className="h-full bg-indigo-500"
                                style={{ 
                                    width: `${((previewCurrentTime - previewClip.startTime) / (previewClip.endTime - previewClip.startTime)) * 100}%` 
                                }}
                             ></div>
                        </div>
                    </div>
                 </div>

                 {/* Details Section */}
                 <div className="w-full md:w-96 flex flex-col h-full justify-center gap-6">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">VIRAL SCORE {previewClip.viralityScore}</span>
                            <span className="text-zinc-500 text-sm font-mono">{formatTime(previewClip.endTime - previewClip.startTime)}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight mb-4">{previewClip.title}</h2>
                        
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-4 group cursor-pointer hover:border-zinc-700 transition-colors">
                            <p className="text-zinc-300 text-sm italic">"{previewClip.viralCaption}"</p>
                            <span className="text-xs text-zinc-600 mt-2 block group-hover:text-indigo-400 transition-colors">Clique para copiar legenda</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-3">
                         <button 
                            onClick={() => { /* Logic to download would go here */ alert('Download iniciado!'); }}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                         >
                            <DownloadIcon /> Baixar Clipe
                         </button>
                         <button 
                            onClick={() => handleEditClip(previewClip)}
                            className="w-full py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                         >
                            <ScissorsIcon /> Editar Ajustes
                         </button>
                         <div className="flex gap-3">
                             <button 
                                onClick={() => regenerateClip(previewClip)}
                                className="flex-1 py-3 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-colors flex justify-center"
                             >
                                <RefreshIcon />
                             </button>
                             <button 
                                onClick={() => { deleteClip(previewClip.id); closePreview(); }}
                                className="flex-1 py-3 bg-red-900/10 text-red-400 hover:bg-red-900/20 rounded-xl border border-red-900/20 hover:border-red-900/40 transition-colors flex justify-center"
                             >
                                <TrashIcon />
                             </button>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="relative">
        {screen === AppScreen.UPLOAD && renderUpload()}
        {screen === AppScreen.PROCESSING && renderProcessing()}
        {screen === AppScreen.SELECTION && renderSelection()}
        {screen === AppScreen.EDITOR && renderEditor()}
      </main>

      {/* Modals */}
      {previewClip && renderPreviewModal()}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;