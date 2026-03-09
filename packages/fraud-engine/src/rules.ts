import { whoisDomain } from "whoiser";
import { RuleResult } from "./types";

const suspiciousKeywords = [
    "login", "verify", "secure", "update", "account", "bank", "crypto",
    "password", "otp", "wallet", "bonus", "free", "claim", "reward"
];

const whitelistDomains = ["google.com", "github.com", "microsoft.com", "apple.com", "amazon.com", "facebook.com", "twitter.com", "linkedin.com"];
const suspiciousTLDs = [".top", ".xyz", ".club", ".link", ".click", ".win", ".biz", ".icu", ".loan"];

export async function ruleCheck(url: string): Promise<RuleResult> {
    let score = 0;
    const reasons: string[] = [];

    const lower = url.toLowerCase();
    let domain = "";
    try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
    } catch (e) {
        // Fallback or simple extraction
        domain = url.split('/')[2] || "";
    }

    // 1. Whitelist Check (Early Exit if safe)
    if (whitelistDomains.some(d => domain === d || domain.endsWith("." + d))) {
        return { score: 0, reasons: ["Whitelisted domain"] };
    }

    // 2. Suspicious Keywords
    for (const keyword of suspiciousKeywords) {
        if (lower.includes(keyword)) {
            score += 10;
            reasons.push(`Suspicious keyword detected: ${keyword}`);
        }
    }

    // 3. URL Length
    if (url.length > 120) {
        score += 15;
        reasons.push("URL is too long");
    }

    // 4. IP based domain
    const ipRegex = /https?:\/\/\d+\.\d+\.\d+\.\d+/;
    if (ipRegex.test(url)) {
        score += 30;
        reasons.push("IP based domain detected");
    }

    // 5. Excess hyphens
    const hyphenCount = (url.match(/-/g) || []).length;
    if (hyphenCount > 5) {
        score += 10;
        reasons.push("Too many hyphens in URL");
    }

    // 6. Punycode check
    if (domain.includes("xn--")) {
        score += 25;
        reasons.push("Punycode (homograph attack) candidate detected");
    }

    // 7. Suspicious TLD
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
        score += 20;
        reasons.push(`Suspicious TLD detected: ${domain.split('.').pop()}`);
    }

    // 8. Subdomain Nesting (Regex)
    const subdomainCount = (domain.match(/\./g) || []).length;
    if (subdomainCount > 3) {
        score += 20;
        reasons.push(`High number of subdomains (${subdomainCount}) detected`);
    }

    // 9. Hidden Redirects (@ symbol)
    if (url.includes("@")) {
        score += 30;
        reasons.push("Hidden redirect (@ symbol) detected");
    }

    // 10. Unusual Ports
    try {
        const urlObj = new URL(url);
        if (urlObj.port && urlObj.port !== "80" && urlObj.port !== "443") {
            score += 20;
            reasons.push(`Unusual port detected: ${urlObj.port}`);
        }
    } catch (e) { }

    // 11. Excessive Encoding
    const encodingCount = (url.match(/%/g) || []).length;
    if (encodingCount > 10) {
        score += 15;
        reasons.push("Excessive URL encoding detected");
    }

    // 12. Domain Age Check (whoiser v2)
    if (domain && !ipRegex.test(url)) {
        try {
            const whoisData = await whoisDomain(domain);
            // whoiser v2 returns an object with server names as keys
            const firstEntry = Object.values(whoisData)[0] as any;
            const creationDateStr = firstEntry?.["Created Date"] || firstEntry?.["creation date"] || firstEntry?.["Creation Date"];

            if (creationDateStr) {
                const creationDate = new Date(creationDateStr);
                const ageInDays = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);

                if (ageInDays < 30) {
                    score += 40;
                    reasons.push(`Domain is very young (${Math.round(ageInDays)} days old)`);
                } else if (ageInDays < 90) {
                    score += 15;
                    reasons.push(`Domain is relatively new (${Math.round(ageInDays)} days old)`);
                }
            }
        } catch (error) {
            console.error(`[RuleCheck] WHOIS lookup failed for ${domain}:`, error);
        }
    }

    return {
        score: Math.min(score, 100),
        reasons
    };
}