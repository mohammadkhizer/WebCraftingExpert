
// Genkit functionality has been removed.
// This file is kept to prevent import errors if referenced elsewhere,
// but it no longer initializes Genkit.
console.warn("Genkit AI functionality has been removed from this project.");

// @ts-ignore
export const ai = {
    defineFlow: () => () => Promise.resolve({}),
    definePrompt: () => () => Promise.resolve({ output: {} }),
    defineTool: () => () => Promise.resolve({}),
    generate: () => Promise.resolve({ text: "", output: {} }),
    generateStream: () => ({ stream: async function*() {}, response: Promise.resolve({}) }),
};
