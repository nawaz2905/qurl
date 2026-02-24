export interface  RuleResult {
    score : number;
    reasons: string[];
}

export interface AiResult{
    score : number;
    explanation: string;
}

export interface FinaleResult{
    socre: number;
    reasons: string[];
}