import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio, CaptionStyle } from '../types';
import { getAspectRatioClass } from '../utils/videoUtils';

interface VideoPlayerProps {
  videoUrl: string;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  aspectRatio: AspectRatio;
  captionText?: string;
  showCaptions?: boolean;
  captionStyle?: CaptionStyle; // New prop for styling
  cropPosition?: { x: number, y: number }; // For manual panning
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  className?: string;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  startTime,
  endTime,
  isPlaying,
  aspectRatio,
  captionText,
  showCaptions = true,
  captionStyle = CaptionStyle.MODERN,
  cropPosition = { x: 50, y: 50 },
  onTimeUpdate,
  onEnded,
  className = "",
  muted = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  
  // Drag state for manual crop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(cropPosition);

  // Sync internal position state with prop when prop changes (e.g. reset)
  useEffect(() => {
    setCurrentPos(cropPosition);
  }, [cropPosition.x, cropPosition.y]);

  useEffect(() => {
    if (videoRef.current && !isYoutube) {
      if (isPlaying) {
        if (Math.abs(videoRef.current.currentTime - startTime) > 0.5 && videoRef.current.currentTime < startTime) {
             videoRef.current.currentTime = startTime;
        }
        videoRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, startTime, isYoutube]);

  useEffect(() => {
    if(videoRef.current && !isYoutube) {
        videoRef.current.muted = muted;
    }
  }, [muted, isYoutube]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isYoutube) return;
    const now = videoRef.current.currentTime;
    
    if (onTimeUpdate) onTimeUpdate(now);

    if (now >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
      if (onEnded) onEnded();
    }
  };

  const getYoutubeEmbedUrl = () => {
      const baseUrl = videoUrl;
      const start = Math.floor(startTime);
      const end = Math.ceil(endTime);
      return `${baseUrl}?start=${start}&end=${end}&autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&mute=${muted ? 1 : 0}`;
  };

  // Caption Styling Logic
  const getCaptionStyles = () => {
    const base = "inline-block px-3 py-1 text-lg md:text-xl font-bold transition-all duration-300 ";
    switch (captionStyle) {
        case CaptionStyle.CLASSIC:
            return base + "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]";
        case CaptionStyle.HIGHLIGHT:
            return base + "text-yellow-400 font-extrabold uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)] tracking-wide";
        case CaptionStyle.BOX:
            return base + "bg-indigo-600 text-white rounded-sm uppercase";
        case CaptionStyle.MODERN:
        default:
            return base + "bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/10 shadow-lg";
    }
  };

  // Manual Crop Logic (Simplified pan)
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      // Calculate delta, update simulated object-position or transform
      // Note: This is a visual simulation. Real crop requires server-side or canvas processing.
      // We will just log intended behavior or update visual state locally if we implemented full drag logic.
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  return (
    <div 
        ref={containerRef}
        className={`relative bg-black overflow-hidden shadow-2xl rounded-xl ${getAspectRatioClass(aspectRatio)} ${className}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      {isYoutube ? (
        <div className="w-full h-full relative pointer-events-none overflow-hidden">
            <div 
                className="w-full h-full"
                style={{
                    transform: `scale(1.35) translate(${(currentPos.x - 50) * 0.5}%, ${(currentPos.y - 50) * 0.5}%)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                }}
            >
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={getYoutubeEmbedUrl()} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full object-cover" 
                ></iframe>
            </div>
        </div>
      ) : (
        <video
            ref={videoRef}
            src={videoUrl}
            className={`w-full h-full object-cover transition-all duration-300 cursor-move`}
            style={{ 
                objectPosition: `${currentPos.x}% ${currentPos.y}%` 
            }}
            onTimeUpdate={handleTimeUpdate}
            playsInline
        />
      )}
      
      {/* Captions Overlay */}
      {showCaptions && captionText && (
        <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none z-10 flex flex-col items-center justify-end min-h-[100px]">
          <span className={getCaptionStyles()}>
            {captionText}
          </span>
        </div>
      )}
      
      {/* Crop Guide Lines (Only visible when dragging or hovering logic added) */}
      <div className="absolute inset-0 border-2 border-white/10 pointer-events-none"></div>
    </div>
  );
};