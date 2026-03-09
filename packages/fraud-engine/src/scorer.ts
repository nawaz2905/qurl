import { ruleCheck } from "./rules";
import { aiCheck } from "./ai";
import { FinalResult } from "./types";

export async function fraudScore(url: string): Promise<FinalResult> {
    const RuleResult = await ruleCheck(url);
    const AiResult = await aiCheck(url);

    console.log(`[Fraud Scorer] URL: ${url}`);
    console.log(`[Fraud Scorer] Rule Score: ${RuleResult.score}, Reasons: ${RuleResult.reasons.join(", ")}`);
    console.log(`[Fraud Scorer] AI Score: ${AiResult.score}, Reasons: ${AiResult.reasons.join(", ")}`);

    const finalScore = Math.round(
        RuleResult.score * 0.6 + AiResult.score * 0.4
    );
    console.log(`[Fraud Scorer] Final Score: ${finalScore}`);

    const block = finalScore > 50;

    return {
        score: finalScore,
        block,
        reasons: [
            ...RuleResult.reasons,
            ...AiResult.reasons
        ]
    };
}