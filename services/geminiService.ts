import { GoogleGenAI, Type } from "@google/genai";
import { Clip, ClipStyle } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeVideoForClips = async (
  videoInput: File | string, 
  style: ClipStyle
): Promise<Clip[]> => {
  try {
    // If input is a URL (YouTube), simulate response
    if (typeof videoInput === 'string') {
      console.log("Processing YouTube URL simulation...");
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      const mockClips = [
        {
          title: "POV: Você não vai acreditar 😱",
          summary: "Um momento insano que prende a atenção do início ao fim.",
          viralCaption: "Isso mudou tudo! 🤯 Espere até o final... #viral #shocking #mustwatch",
          startTime: 30,
          endTime: 45,
          viralityScore: 9.8,
          transcript: "Vocês não vão acreditar no que aconteceu aqui! É simplesmente insano."
        },
        {
          title: "Segredo Revelado 🤫",
          summary: "A dica de ouro que estava escondida no vídeo.",
          viralCaption: "Quem mais sabia disso? Salva pra não esquecer! 👇 #dicas #lifehack #segredo",
          startTime: 120,
          endTime: 150,
          viralityScore: 9.2,
          transcript: "O segredo para entender isso é olhar para os detalhes que ninguém percebe."
        },
        {
          title: "Plot Twist do Ano 🔥",
          summary: "O desfecho surpreendente que ninguém esperava.",
          viralCaption: "Eu NÃO estava esperando por essa! 💀 Comenta se você adivinhou! #plottwist #surpresa",
          startTime: 200,
          endTime: 215,
          viralityScore: 9.5,
          transcript: "E foi assim que tudo mudou para sempre. Incrível, não é?"
        }
      ];

      return mockClips.map((c, index) => ({
        id: `yt-clip-${Date.now()}-${index}`,
        title: c.title,
        summary: c.summary,
        viralCaption: c.viralCaption,
        startTime: c.startTime,
        endTime: c.endTime,
        viralityScore: c.viralityScore,
        category: style,
        transcript: c.transcript
      }));
    }

    // Normal File Processing
    const videoPart = await fileToGenerativePart(videoInput);

    let styleInstruction = "";
    switch (style) {
      case ClipStyle.FUNNY:
        styleInstruction = "Priorize humor, risadas e situações inusitadas.";
        break;
      case ClipStyle.EMOTIONAL:
        styleInstruction = "Priorize emoção, inspiração e conexão humana.";
        break;
      case ClipStyle.INFORMATIVE:
        styleInstruction = "Priorize fatos, 'sabia que?', e dicas úteis.";
        break;
      default:
        styleInstruction = "Priorize alta energia, cortes rápidos e momentos chocantes.";
    }

    const prompt = `
      Atue como um Especialista em Viralização de Conteúdo para TikTok, Instagram Reels e YouTube Shorts.
      Analise este vídeo.
      ${styleInstruction}
      
      Sua missão: Encontrar 3 a 4 trechos com potencial EXTREMO de viralização.
      
      Critérios:
      1. Gancho (Hook) forte nos primeiros 3 segundos.
      2. Conteúdo que gera retenção.
      3. Loop perfeito se possível.
      
      Para cada clipe, gere JSON com:
      - title: Título curto e apelativo (clickbait saudável).
      - summary: Descrição técnica do que acontece.
      - viralCaption: Uma legenda pronta para postar, usando gatilhos mentais, emojis e 3 hashtags relevantes.
      - startTime / endTime: Segundos exatos.
      - viralityScore: Nota 1-10 baseada no potencial de engajamento.
      - transcript: Transcrição da fala.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [videoPart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              viralCaption: { type: Type.STRING, description: "Social media caption with emojis and hashtags" },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              viralityScore: { type: Type.NUMBER },
              transcript: { type: Type.STRING },
            },
            required: ["title", "summary", "viralCaption", "startTime", "endTime", "viralityScore", "transcript"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const rawClips = JSON.parse(jsonText);

    return rawClips.map((c: any, index: number) => ({
      id: `clip-${Date.now()}-${index}`,
      title: c.title,
      summary: c.summary,
      viralCaption: c.viralCaption || c.summary,
      startTime: Number(c.startTime),
      endTime: Number(c.endTime),
      viralityScore: c.viralityScore,
      category: style,
      transcript: c.transcript
    }));

  } catch (error) {
    console.error("Error analyzing video:", error);
    throw new Error("Falha ao analisar o vídeo. Tente um arquivo menor ou verifique sua conexão.");
  }
};