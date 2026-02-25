import { ruleCheck } from "./rules";
import { aiCheck } from "./ai";
import { FinalResult } from "./types";

export async function fraudScore(url: string): Promise<FinalResult> {
    const RuleResult = await ruleCheck(url);
    const AiResult = await aiCheck(url);

    const finalScore = Math.round(
        RuleResult.score * 0.6 + AiResult.score * 0.4
    );

    const block = finalScore >= 75;

    return {
        score: finalScore,
        block,
        reasons: [
            ...RuleResult.reasons,
            ...AiResult.reasons
        ]
    };
}