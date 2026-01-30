import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from the current directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const key = process.env.GEMINI_API_KEY;
console.log("Checking API Key:", key ? `${key.substring(0, 5)}...${key.substring(key.length - 5)}` : "MISSING");

if (!key || key === 'your_gemini_api_key_here') {
    console.error("Error: Valid GEMINI_API_KEY not found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);

async function testAI() {
    try {
        console.log("Testing Gemini API connection (gemini-pro-latest)...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const result = await model.generateContent("Say 'AI is working' if you can read this.");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS: Gemini API is responsive!");
    } catch (error: any) {
        console.error("FAILURE: Gemini API error:", error.message);
        if (error.message.includes("API_KEY_INVALID")) {
            console.error("The API key provided is invalid.");
        }
    }
}

testAI();
