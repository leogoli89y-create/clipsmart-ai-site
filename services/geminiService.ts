import { GoogleGenAI, Type } from "@google/genai";
import { Clip, ClipStyle } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result) {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new DOMException("Falha ao ler dados do arquivo.", "NotReadableError"));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new DOMException("Erro desconhecido na leitura do arquivo.", "UnknownError"));
    };

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
          transcript: "Vocês não vão acreditar no que aconteceu aqui! É simplesmente insano e mudou completamente a nossa percepção."
        },
        {
          title: "Segredo Revelado 🤫",
          summary: "A dica de ouro que estava escondida no vídeo.",
          viralCaption: "Quem mais sabia disso? Salva pra não esquecer! 👇 #dicas #lifehack #segredo",
          startTime: 120,
          endTime: 135,
          viralityScore: 9.2,
          transcript: "O segredo fundamental para entender isso é olhar para os detalhes minúsculos que a maioria das pessoas ignora."
        },
        {
          title: "Plot Twist do Ano 🔥",
          summary: "O desfecho surpreendente que ninguém esperava.",
          viralCaption: "Eu NÃO estava esperando por essa! 💀 Comenta se você adivinhou! #plottwist #surpresa",
          startTime: 200,
          endTime: 215,
          viralityScore: 9.5,
          transcript: "E foi exatamente nesse momento que tudo mudou para sempre. A resposta estava na nossa frente o tempo todo."
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
      Atue como um Especialista em Edição de Vídeo com IA e Engenharia de Áudio Avançada.
      
      Sua tarefa é analisar o vídeo e gerar clipes virais.
      
      DIRETRIZES DE ÁUDIO E LEGENDA (CRÍTICO):
      1. Transcrição de Alta Fidelidade: Realize uma transcrição Speech-to-Text precisa.
      2. Correção de Ruído/Sotaque: Ignore ruídos de fundo. Se houver sotaques fortes ou fala rápida, transcreva a INTENÇÃO correta das palavras, corrigindo leves erros gramaticais para que a legenda seja legível e profissional.
      3. Limpeza: Remova vícios de linguagem como "hmmm", "é...", "tipo assim", deixando o texto direto.
      4. Sincronização: Certifique-se de que o texto transcrito pertence EXATAMENTE ao intervalo de tempo (startTime/endTime) selecionado.
      
      ${styleInstruction}
      
      Sua missão: Encontrar 3 a 4 trechos com potencial EXTREMO de viralização.
      Critérios de corte:
      - Gancho (Hook) forte nos primeiros 3 segundos.
      - Conteúdo que gera retenção.
      
      Para cada clipe, gere JSON com:
      - title: Título curto e apelativo (clickbait saudável).
      - summary: Descrição técnica do que acontece.
      - viralCaption: Uma legenda pronta para postar, usando gatilhos mentais, emojis e 3 hashtags relevantes.
      - startTime / endTime: Segundos exatos.
      - viralityScore: Nota 1-10 baseada no potencial de engajamento.
      - transcript: Transcrição limpa e corrigida da fala neste trecho exato.
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
    // Use DOMException for better error semantics in web environments
    if (error instanceof DOMException) {
      throw error;
    }
    throw new DOMException(
      "Falha ao analisar o vídeo. Tente um arquivo menor ou verifique sua conexão.",
      "OperationError"
    );
  }
};

// Function for smart cut refinement
export const refineClip = async (clip: Clip): Promise<Clip> => {
    // In a real scenario, this would re-send the clip context to Gemini to ask for better start/end times
    // For this demo, we mock the intelligence or could re-call generateContent with just timestamps if needed.
    
    // Simulating "AI Thinking" about audio waves and visual cues
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(clip);
        }, 1000);
    });
};
