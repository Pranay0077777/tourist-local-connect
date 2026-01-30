import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const key = process.env.GEMINI_API_KEY || "";

const candidateModels = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-pro-vision",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-flash-latest",
    "gemini-pro-latest"
];

async function testModel(modelName: string) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });

        const data = await response.json() as any;
        if (response.status === 200) {
            console.log(`✅ SUCCESS: ${modelName} works!`);
            return true;
        } else {
            console.log(`❌ FAILED: ${modelName} (${response.status}): ${data.error?.message || 'Unknown error'}`);
            return false;
        }
    } catch (e: any) {
        console.log(`❌ ERROR: ${modelName}: ${e.message}`);
        return false;
    }
}

async function runTests() {
    for (const model of candidateModels) {
        if (await testModel(model)) break;
    }
}

runTests();
