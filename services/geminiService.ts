import { GoogleGenAI, Type } from "@google/genai";
import { Clip, ClipStyle } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to ensure DOMException compatibility across environments (Browser vs Node)
// This avoids "ReferenceError: DOMException is not defined" if the environment doesn't support it globally.
function createDOMException(message: string, name: string): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(message, name);
  }
  const error = new Error(message);
  error.name = name;
  return error;
}

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
        reject(createDOMException("Falha ao ler dados do arquivo.", "NotReadableError"));
      }
    };

    reader.onerror = () => {
      reject(reader.error || createDOMException("Erro desconhecido na leitura do arquivo.", "UnknownError"));
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
      Atue como um Engenheiro de Áudio Sênior e Especialista em Conteúdo Viral.
      
      Sua tarefa é analisar o vídeo (visual e áudio) para extrair clipes de altíssima qualidade.

      DIRETRIZES RIGOROSAS DE ÁUDIO E TRANSCRIÇÃO:
      1. **Isolamento Vocal**: O vídeo pode ter ruído de fundo, música ou interferências. Sua prioridade é isolar a voz principal. Utilize o contexto visual (leitura labial) para desambiguar palavras se o áudio estiver confuso.
      2. **Correção de Dicção e Sotaque**: Se houver sotaques fortes, fala muito rápida ou gírias, transcreva o texto em português padrão claro, mantendo a intenção original. O objetivo é legibilidade total.
      3. **Sincronia Exata**: O 'transcript' deve conter APENAS o que é dito entre 'startTime' e 'endTime'. Não inclua palavras cortadas no início ou no fim.
      4. **Limpeza Editorial**: Remova hesitações ("é...", "hum", "tipo assim") e repetições gaguejadas. A legenda deve ser limpa, profissional e direta.

      ${styleInstruction}
      
      Sua missão: Identificar 3 a 4 trechos (Golden Moments) com potencial viral.
      Critérios de corte:
      - Gancho (Hook) forte nos primeiros 3 segundos.
      - Conteúdo que gera retenção.
      
      Para cada clipe, gere JSON com:
      - title: Título curto e apelativo.
      - summary: Descrição técnica do que acontece.
      - viralCaption: Uma legenda pronta para postar, usando gatilhos mentais, emojis e 3 hashtags relevantes.
      - startTime / endTime: Segundos exatos (float).
      - viralityScore: Nota 1-10 baseada no potencial de engajamento.
      - transcript: Transcrição limpa, corrigida e perfeitamente sincronizada.
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

  } catch (error: any) {
    console.error("Error analyzing video:", error);
    
    // Check if error is a DOMException (either native or our fallback)
    // We check name property to be generic across implementations
    const isDOMException = (typeof DOMException !== 'undefined' && error instanceof DOMException) || 
                           (error instanceof Error && (error.name === 'NotReadableError' || error.name === 'OperationError'));

    if (isDOMException) {
      throw error;
    }
    
    throw createDOMException(
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