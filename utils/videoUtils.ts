export const formatTime = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

// Formats time for SRT files (HH:MM:SS,ms)
export const formatSRTTime = (seconds: number): string => {
  const date = new Date(0);
  date.setMilliseconds(seconds * 1000);
  const isoString = date.toISOString();
  // Extracts HH:MM:SS.mmm from ISO string (11-23) and replaces dot with comma
  return isoString.substring(11, 23).replace('.', ',');
};

export const generateSRTContent = (transcript: string, startTime: number, endTime: number): string => {
  // Simple SRT generator. In a real app with word-level timestamps, this would loop through segments.
  // Here we treat the whole clip as one segment for the MVP.
  
  // Index
  let srt = "1\n";
  // Time range
  srt += `${formatSRTTime(0)} --> ${formatSRTTime(endTime - startTime)}\n`;
  // Text
  srt += `${transcript}\n\n`;
  
  return srt;
};

export const getAspectRatioClass = (ratio: string) => {
  switch (ratio) {
    case '9:16': return 'aspect-[9/16]';
    case '1:1': return 'aspect-square';
    case '16:9': return 'aspect-video';
    default: return 'aspect-[9/16]';
  }
};