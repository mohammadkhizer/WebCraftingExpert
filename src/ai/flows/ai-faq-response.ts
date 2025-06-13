
// Genkit AI FAQ Response flow has been removed.
// This file is kept to prevent import errors if referenced elsewhere.
'use server';

console.warn("Genkit AI FAQ Response flow has been removed from this project.");

export type AiFAQResponseInput = { question: string };
export type AiFAQResponseOutput = { answer: string; useCannedResponse: boolean };

export async function aiFAQResponse(input: AiFAQResponseInput): Promise<AiFAQResponseOutput> {
  return {
    answer: "AI FAQ functionality has been removed.",
    useCannedResponse: true,
  };
}
