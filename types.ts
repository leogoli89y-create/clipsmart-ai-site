export enum AppScreen {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  SELECTION = 'SELECTION',
  EDITOR = 'EDITOR',
  EXPORT = 'EXPORT'
}

export interface Clip {
  id: string;
  title: string;
  summary: string;
  viralCaption: string; // New field for social media caption
  startTime: number; // in seconds
  endTime: number; // in seconds
  viralityScore: number; // 1-10
  category: string;
  transcript: string;
}

export enum ClipStyle {
  DYNAMIC = 'Dinâmico',
  FUNNY = 'Engraçado',
  EMOTIONAL = 'Emocionante',
  INFORMATIVE = 'Informativo',
  SHORT = 'Curtos (10s)',
  LONG = 'Longos (50s)'
}

export enum CaptionStyle {
  MODERN = 'modern',     // Semi-transparent blur box
  CLASSIC = 'classic',   // White text with shadow
  HIGHLIGHT = 'highlight', // Yellow/Bold text (TikTok style)
  BOX = 'box'           // Solid color box
}

export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface VideoMetadata {
  file: File | null;
  url: string;
  duration: number;
  type: 'file' | 'youtube';
}