import OpenAI from "openai";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();

let openai;

// Recursively gather file names and contents from the `output` directory
const getOutputFilesSummary = (dir = path.resolve("output")) => {
  if (!fs.existsSync(dir)) {
    return "No output directory found.";
  }

  let summary = "";

  const walk = (currentDir) => {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        walk(itemPath);
      } else {
        try {
          const contents = fs.readFileSync(itemPath, "utf8");
          const relativePath = path.relative(process.cwd(), itemPath);
          summary += `\n--- File: ${relativePath} ---\n${contents}\n--- End of ${relativePath} ---\n`;
        } catch (err) {
          // Skip unreadable or binary files
        }
      }
    }
  };

  walk(dir);
  return summary;
};

export const initializeOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
};

export const getCompletion = async (prompt) => {
  if (!openai) {
    throw new Error(
      "OpenAI client not initialized. Call initializeOpenAI() first."
    );
  }

  try {
    const model = "gpt-5";
    const filesSummary = getOutputFilesSummary();
    const response = await openai.responses.create({
      model,
      input: [
        'You are Co-Physicist, an AI assistant specialized in helping with physics, mathematics, and scientific research.',
        'Provide clear, accurate, and helpful responses.',
        `You are using ${model} large language model.`,
        '',
        `This is what the agent has produced so far in the output directory:\n${filesSummary}`,
        '',
        `User: ${prompt}`,
      ].join('\n'),
      max_output_tokens: 9192,
    });

    // Prefer SDK helper if available
    if (response && typeof response.output_text === "string") {
      return response.output_text.trim();
    }

    // Fallback: attempt to join text parts from structured output
    if (response && Array.isArray(response.output)) {
      const text = response.output
        .flatMap((item) => (item?.content ?? []))
        .filter((part) => part?.type === "output_text" || part?.type === "text")
        .map((part) => part?.text ?? "")
        .join("")
        .trim();
      if (text) return text;
    }

    // Last resort: stringify
    return JSON.stringify(response);
  } catch (error) {
    if (error.status === 401) {
      throw new Error(
        "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable."
      );
    } else if (error.status === 429) {
      throw new Error(
        "OpenAI API rate limit exceeded. Please try again later."
      );
    } else if (error.status === 500) {
      throw new Error("OpenAI API server error. Please try again later.");
    } else {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
};
