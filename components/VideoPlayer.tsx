import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio } from '../types';
import { getAspectRatioClass } from '../utils/videoUtils';

interface VideoPlayerProps {
  videoUrl: string;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  aspectRatio: AspectRatio;
  captionText?: string;
  showCaptions?: boolean;
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
  onTimeUpdate,
  onEnded,
  className = "",
  muted = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  useEffect(() => {
    if (videoRef.current && !isYoutube) {
      if (isPlaying) {
        // If we are far from start time, seek.
        // Epsilon of 0.5s to avoid seeking loop if video lags slightly
        if (Math.abs(videoRef.current.currentTime - startTime) > 0.5 && videoRef.current.currentTime < startTime) {
             videoRef.current.currentTime = startTime;
        }
        videoRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, startTime, isYoutube]);

  // Sync volume/mute
  useEffect(() => {
    if(videoRef.current && !isYoutube) {
        videoRef.current.muted = muted;
    }
  }, [muted, isYoutube]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isYoutube) return;
    const now = videoRef.current.currentTime;
    
    if (onTimeUpdate) onTimeUpdate(now);

    // Loop logic for preview
    if (now >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
      if (onEnded) onEnded();
    }
  };

  // Simplified YouTube handling for Demo
  // Note: For precise control of YouTube (start/end/loop), the YouTube IFrame API is needed.
  // We use standard embed params here for simplicity.
  const getYoutubeEmbedUrl = () => {
      // Extract basic URL if it is embed
      const baseUrl = videoUrl;
      const start = Math.floor(startTime);
      const end = Math.ceil(endTime);
      // autoplay=1 to simulate playing when 'isPlaying' is true, though browser policy might block unmuted autoplay
      return `${baseUrl}?start=${start}&end=${end}&autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1`;
  };

  return (
    <div className={`relative bg-black overflow-hidden shadow-2xl rounded-xl ${getAspectRatioClass(aspectRatio)} ${className}`}>
      {isYoutube ? (
        <div className="w-full h-full relative pointer-events-none">
            {/* Pointer events none to prevent user interaction with YT controls, keeping simple editor feel */}
            <iframe 
                width="100%" 
                height="100%" 
                src={getYoutubeEmbedUrl()} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full object-cover scale-[1.35]" // Zoom in to fill aspect ratio roughly
            ></iframe>
        </div>
      ) : (
        <video
            ref={videoRef}
            src={videoUrl}
            className={`w-full h-full object-cover transition-all duration-300`} // object-cover simulates the crop
            onTimeUpdate={handleTimeUpdate}
            playsInline
        />
      )}
      
      {/* Captions Overlay */}
      {showCaptions && captionText && (
        <div className="absolute bottom-12 left-0 right-0 px-4 text-center pointer-events-none z-10">
          <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-lg md:text-xl font-bold rounded-lg shadow-lg border border-white/10">
            {captionText}
          </span>
        </div>
      )}
    </div>
  );
};