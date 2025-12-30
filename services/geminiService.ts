
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzePipelineSecurity = async (codeSnippet: string): Promise<ScanResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this CI/CD configuration or Python security script for vulnerabilities and performance issues: \n\n${codeSnippet}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Overall security score from 0 to 100" },
          summary: { type: Type.STRING, description: "High-level summary of findings" },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                recommendation: { type: Type.STRING }
              },
              required: ["severity", "title", "description", "recommendation"]
            }
          },
          performanceInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "summary", "findings", "performanceInsights"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as ScanResult;
};
