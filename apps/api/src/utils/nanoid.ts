import {customAlphabet} from 'nanoid'

const alphabet = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const nano = customAlphabet(alphabet, 6)

export function generateShortCode(): string{
    return nano();
}