import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy to get the list
        // There isn't a direct 'listModels' on the main class in some versions, 
        // but let's try calling with different names.

        console.log("Testing 'gemini-1.5-flash-latest'...");
        try {
            const m1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const r1 = await m1.generateContent("test");
            console.log("gemini-1.5-flash-latest works!");
        } catch (e: any) { console.log("gemini-1.5-flash-latest failed:", e.message); }

        console.log("Testing 'gemini-pro'...");
        try {
            const m2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const r2 = await m2.generateContent("test");
            console.log("gemini-pro works!");
        } catch (e: any) { console.log("gemini-pro failed:", e.message); }

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
