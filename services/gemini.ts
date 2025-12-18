
import { GoogleGenAI, Type } from "@google/genai";
import { DataItem, AnalysisResponse } from "../types";

// The Google GenAI SDK always requires direct use of process.env.API_KEY
// and creating a new instance before making an API call ensures the latest configuration is used.

export const analyzeDataset = async (data: DataItem[]): Promise<AnalysisResponse> => {
  // Initialize GoogleGenAI right before the call as per coding guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Limit data sample to avoid token limits if dataset is huge
  const dataSample = data.slice(0, 50); 
  const dataStr = JSON.stringify(dataSample);

  const prompt = `
    你是一位专业的足球助理教练和数据分析师。请分析以下业余足球队的比赛数据。
    
    数据结构包括：日期、对手、我方进球、对手进球等。
    
    请提供（必须使用中文回答）：
    1. 球队近期状态和表现的总结 (summary)。
    2. 关键统计趋势 (keyTrends)（例如：“主场防守稳固”、“比赛末段容易失球”、“连胜”）。
    3. 下一次训练课的可行战术建议 (recommendations)（例如：“练习定位球防守”、“加强临门一脚”）。
    
    比赛数据: ${dataStr}
  `;

  try {
    const response = await ai.models.generateContent({
      // Use 'gemini-3-flash-preview' for basic text/analysis tasks
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "球队表现的执行摘要（中文）。" },
            keyTrends: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "胜负或进球的重要模式列表（中文）。" 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "给球队的战术和训练建议（中文）。"
            }
          },
          required: ["summary", "keyTrends", "recommendations"]
        }
      }
    });

    // Access the text property directly (not as a method)
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const askFollowUpQuestion = async (data: DataItem[], question: string, previousContext: string): Promise<string> => {
   // Initialize GoogleGenAI right before the call
   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
   
   const dataSample = data.slice(0, 50);
   const context = `
     Match Data: ${JSON.stringify(dataSample)}
     Previous Report: ${previousContext}
   `;

   const response = await ai.models.generateContent({
     model: "gemini-3-flash-preview",
     contents: `角色：足球教练。语境：${context}\n\n教练提问：${question}\n\n请根据统计数据简洁地用中文回答。`
   });

   // Access the text property directly
   return response.text || "我无法生成具体的回答。";
};
