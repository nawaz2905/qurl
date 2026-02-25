import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { AiResult } from "./types";

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!
});

export async function aiCheck(url: string): Promise<AiResult> {
    const prompt = `
        You are a cybersecurity assistant.
        
        Analyze this URL for phishing, scam, or malware risk.
        
        Return ONLY valid JSON in this format:
        
        {
          "score": number,
          "reasons": string[]
        }
        
        Score range:
        0 = completely safe
        100 = definitely malicious
        
        URL: ${url}
        `;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        // Remove markdown if model wraps JSON in ```
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
            score: Math.min(parsed.score ?? 0, 100),
            reasons: Array.isArray(parsed.reasons) ? parsed.reasons : []
        };

    } catch (error) {
        return {
            score: 0,
            reasons: ["AI analysis failed"]
        };
    }
}