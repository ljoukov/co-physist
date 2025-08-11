import OpenAI from "openai";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import {
  fileManagementTools,
  handleToolCall,
  formatToolResult,
} from "./tools.js";

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

export const getCompletion = async (prompt, enableTools = false) => {
  if (!openai) {
    throw new Error(
      "OpenAI client not initialized. Call initializeOpenAI() first."
    );
  }

  try {
    const model = "gpt-5";
    const filesSummary = getOutputFilesSummary();

    // Build request parameters
    const requestParams = {
      model,
      input: [
        "You are Co-Physicist, an AI assistant specialized in helping with physics, mathematics, and scientific research.",
        "Provide clear, accurate, and helpful responses.",
        `You are using ${model} large language model.`,
        "",
        `This is what the agent has produced so far in the output directory:\n${filesSummary}`,
        "",
        `User: ${prompt}`,
      ].join("\n"),
      max_output_tokens: 9192,
    };

    // Add tools if enabled
    if (enableTools) {
      requestParams.tools = fileManagementTools;
      requestParams.tool_choice = "auto"; // Let the model decide when to use tools
    }

    const response = await openai.responses.create(requestParams);

    // Handle tool calls if present
    if (response && response.output && Array.isArray(response.output)) {
      const toolResults = [];
      let textContent = "";

      for (const item of response.output) {
        // Handle function calls (tool calls)
        if (item.type === "function_call") {
          const result = await handleToolCall(
            item.name,
            JSON.parse(item.arguments)
          );

          const formattedResult = formatToolResult(result);
          toolResults.push({
            toolCallId: item.call_id,
            toolName: item.name,
            result: formattedResult,
          });
        }
        // Handle text output
        else if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text" || content.type === "text") {
              textContent += content.text + "\n";
            }
          }
        }
      }

      // If we have tool results, return them with any text
      if (toolResults.length > 0) {
        return {
          text: textContent.trim() || "Tools executed successfully.",
          toolResults: toolResults,
        };
      }
    }

    // Prefer SDK helper if available
    if (response && typeof response.output_text === "string") {
      return response.output_text.trim();
    }

    // Fallback: attempt to join text parts from structured output
    if (response && Array.isArray(response.output)) {
      const text = response.output
        .flatMap((item) => item?.content ?? [])
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
