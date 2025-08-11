#!/usr/bin/env node
import dotenv from "dotenv";
import { initializeOpenAI, getCompletion } from "./src/openai.js";
import {
  fileManagementTools,
  handleToolCall,
  formatToolResult,
} from "./src/tools.js";

// Load environment variables from .env file
dotenv.config();

// Test the tools directly
async function testDirectToolUsage() {
  console.log("=== Testing Direct Tool Usage ===\n");

  // Test 1: Create a Python file
  console.log("1. Creating a Python file...");
  const createResult = await handleToolCall("create_or_replace_python_file", {
    path: "hello.py",
    content: `# Simple Hello World script
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
    print("This is a test from the workspace!")
`,
  });
  console.log("Result:", formatToolResult(createResult));
  console.log();

  // Test 2: List files
  console.log("2. Listing files in workspace...");
  const listResult = await handleToolCall("list_files", { path: "." });
  console.log("Result:", formatToolResult(listResult));
  console.log();

  // Test 3: Read the file
  console.log("3. Reading the Python file...");
  const readResult = await handleToolCall("read_file", { path: "hello.py" });
  console.log("Result:", formatToolResult(readResult));
  console.log();

  // Test 4: Run the Python file
  console.log("4. Running the Python file...");
  const runResult = await handleToolCall("run_python_file", {
    path: "hello.py",
  });
  console.log("Result:", formatToolResult(runResult));
  console.log();

  // Test 5: Create a file in a subdirectory
  console.log("5. Creating a file in subdirectory...");
  const subdirResult = await handleToolCall("create_or_replace_python_file", {
    path: "modules/math_utils.py",
    content: `# Math utilities
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

if __name__ == "__main__":
    print(f"2 + 3 = {add(2, 3)}")
    print(f"4 * 5 = {multiply(4, 5)}")
`,
  });
  console.log("Result:", formatToolResult(subdirResult));
  console.log();

  // Test 6: List files again to see the new structure
  console.log("6. Listing files to see new structure...");
  const listResult2 = await handleToolCall("list_files", { path: "." });
  console.log("Result:", formatToolResult(listResult2));
  console.log();
}

// Test with OpenAI integration (requires API key)
async function testOpenAIIntegration() {
  console.log("\n=== Testing OpenAI Integration ===\n");

  try {
    // Initialize OpenAI client
    initializeOpenAI();

    console.log("Sending request to OpenAI with tools enabled...");
    console.log(
      "Prompt: 'Create a Python script that calculates factorial of a number'\n"
    );

    // Test with tools enabled
    const result = await getCompletion(
      "Create a Python script that calculates factorial of a number and save it as factorial.py in the workspace",
      true // Enable tools
    );

    console.log("OpenAI Response:");
    if (typeof result === "object" && result.toolResults) {
      console.log("Text response:", result.text);
      console.log("\nTool calls made:");
      result.toolResults.forEach((tr) => {
        console.log(`- ${tr.toolName}:`, tr.result);
      });
    } else {
      console.log(result);
    }
  } catch (error) {
    console.log("Note: OpenAI integration test skipped (requires API key)");
    console.log("Error:", error.message);
  }
}

// Security test
async function testSecurityFeatures() {
  console.log("\n=== Testing Security Features ===\n");

  // Test path traversal prevention
  console.log("1. Testing path traversal prevention...");
  const traversalResult = await handleToolCall("read_file", {
    path: "../package.json",
  });
  console.log("Result:", formatToolResult(traversalResult));
  console.log();

  // Test absolute path prevention
  console.log("2. Testing absolute path prevention...");
  const absoluteResult = await handleToolCall("read_file", {
    path: "/etc/passwd",
  });
  console.log("Result:", formatToolResult(absoluteResult));
  console.log();

  // Test non-Python file creation
  console.log("3. Testing non-Python file creation prevention...");
  const nonPythonResult = await handleToolCall(
    "create_or_replace_python_file",
    {
      path: "test.txt",
      content: "This should fail",
    }
  );
  console.log("Result:", formatToolResult(nonPythonResult));
  console.log();
}

// Main test runner
async function main() {
  console.log("File Management Tools Test Suite");
  console.log("================================\n");

  // Run direct tool tests
  await testDirectToolUsage();

  // Run security tests
  await testSecurityFeatures();

  // Run OpenAI integration test (optional, requires API key)
  if (process.env.OPENAI_API_KEY) {
    await testOpenAIIntegration();
  } else {
    console.log("\n=== OpenAI Integration Test Skipped ===");
    console.log(
      "Set OPENAI_API_KEY environment variable to test OpenAI integration\n"
    );
  }

  console.log("\n=== All Tests Complete ===");
}

// Run tests
main().catch(console.error);
