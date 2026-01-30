import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const key = process.env.GEMINI_API_KEY || "";

async function listAllModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json() as any;

        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("Filtered models (generateContent):");
        data.models
            .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
            .forEach((m: any) => {
                console.log(`- ${m.name}`);
            });
    } catch (error: any) {
        console.error("Error listing models:", error.message);
    }
}

listAllModels();
