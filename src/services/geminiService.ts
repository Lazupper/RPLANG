import { GoogleGenAI, Type } from "@google/genai";
import { Challenge, ChallengeType, Module } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChallenge(language: string, level: number): Promise<Challenge> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere um desafio de programação em ${language} para o nível ${level}. 
    O desafio deve ser no estilo Duolingo. 
    Retorne um JSON com: title, type (multiple_choice, fill_in_blank, code_fix), question, code (opcional), options (opcional), correctAnswer, explanation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["multiple_choice", "fill_in_blank", "code_fix"] },
          question: { type: Type.STRING },
          code: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["title", "type", "question", "correctAnswer", "explanation"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    language,
    ...data
  };
}

export async function explainCode(code: string, language: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explique este código ${language} de forma simples e didática, como se fosse para um iniciante: \n\n${code}`,
  });
  return response.text || "Não foi possível explicar o código no momento.";
}

export async function generateModule(language: string, level: number): Promise<Module> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere um módulo de aprendizado de programação em ${language} para o nível ${level}. 
    O módulo deve conter um título e uma explicação teórica (conceito) em Markdown.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING }
        },
        required: ["title", "concept"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    language,
    difficulty: level,
    ...data
  };
}

