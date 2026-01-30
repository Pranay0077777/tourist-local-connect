import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateAIResponse = async (prompt: string, context: string = "") => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent([context, prompt].filter(Boolean));
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
};

export const translateWithAI = async (text: string, targetLanguage: string) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text: "${text}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        return null;
    }
};

export const planTripWithAI = async (city: string, days: number, interests: string[]) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Create a highly detailed, day-by-day travel itinerary for ${city} (Duration: ${days} days).
        Focus interests: ${interests.join(", ")}.
    
        Format Requirements (Strict Markdown):
        - Use H2 (##) for Day headers (e.g., "## Day 1: [Theme]").
        - Use H3 (###) for Time Sections with Emojis:
          - "### 🌅 Morning: [Activity Name]"
          - "### 🍛 Lunch: [Restaurant/Food]"
          - "### 🌆 Evening: [Activity Name]"
        - Include specific timings (e.g., "**09:00 AM** - ...")
        - Use bullet points for details.
        - Add a "💡 Pro Tip" block for each day.
        - Keep the tone engaging, professional, and exciting (like a top-tier travel blogger).
        - Do NOT output generic text blocks. Divide into clear, readable chunks.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Trip Planning Error:", error);
        return null;
    }
};
