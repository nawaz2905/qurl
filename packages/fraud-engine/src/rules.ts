import { RuleResult } from "./types";


const suspiciousKeywords = [
    "login",
    "verify",
    "secure",
    "update",
    "account",
    "bank",
    "crypto",
    "password",
    "otp",
    "wallet",
    "bonus",
    "free"
];

export function ruleCheck(url: string): RuleResult {
    let score = 0;
    const reasons: string[] = [];

    const lower = url.toLowerCase();

    //check suspicious keywords
    for (const keyword of suspiciousKeywords) {
        if (lower.includes(keyword)) {
            score += 8;
            reasons.push(`Suspicious keyword detected: ${keyword}`);
        }
    }

    //for url too long
    if (url.length > 120) {
        score += 10;
        reasons.push("URL is too long");
    }
    //Ip based domain  ---we can add domain age check in future ---
    const ipRegex = /https?:\/\/\d+\.\d+\.\d+\.\d+/;
    if (ipRegex.test(url)) {
        score += 25;
        reasons.push("IP based domain detected");
    }
    // Excess hyphens
    const hyphenCount = (url.match(/-/g) || []).length;
    if (hyphenCount > 5) {
        score += 10;
        reasons.push("Too many hyphens in URL");
    }

    return {
        score: Math.min(score, 100),
        reasons
    };
}