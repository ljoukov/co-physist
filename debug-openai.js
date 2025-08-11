#!/usr/bin/env node
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testSimpleTool() {
  console.log("Testing OpenAI Responses API with a simple tool...\n");

  // Try a simpler tool structure first
  const simpleTool = {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state",
          },
        },
        required: ["location"],
      },
    },
  };

  try {
    console.log("Tool being sent:", JSON.stringify(simpleTool, null, 2));

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: "What's the weather in San Francisco?",
      tools: [simpleTool],
      tool_choice: "auto",
    });

    console.log("\nResponse received!");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error details:");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

async function testAlternativeStructure() {
  console.log("\n\nTesting with alternative tool structure...\n");

  // Try an alternative structure
  const alternativeTool = {
    name: "get_weather",
    type: "function",
    description: "Get the weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state",
        },
      },
      required: ["location"],
    },
  };

  try {
    console.log("Tool being sent:", JSON.stringify(alternativeTool, null, 2));

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: "What's the weather in San Francisco?",
      tools: [alternativeTool],
      tool_choice: "auto",
    });

    console.log("\nResponse received!");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error details:");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
  }
}

// Run tests
async function main() {
  await testSimpleTool();
  await testAlternativeStructure();
}

main().catch(console.error);
