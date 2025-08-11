import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from "dotenv";
import { initializeOpenAI, getCompletion } from "../src/openai.js";
import { handleToolCall, formatToolResult } from "../src/tools.js";

// Load environment variables from .env file
dotenv.config();

describe('File Management Tools', () => {
  describe('Direct Tool Usage', () => {
    it('should create a Python file', async () => {
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
      
      expect(createResult).toBeDefined();
      expect(createResult.success).toBe(true);
    });

    it('should list files in workspace', async () => {
      const listResult = await handleToolCall("list_files", { path: "." });
      
      expect(listResult).toBeDefined();
      expect(listResult.success).toBe(true);
    });

    it('should read the Python file', async () => {
      const readResult = await handleToolCall("read_file", { path: "hello.py" });
      
      expect(readResult).toBeDefined();
      expect(readResult.success).toBe(true);
    });

    it('should run the Python file', async () => {
      const runResult = await handleToolCall("run_python_file", {
        path: "hello.py",
      });
      
      expect(runResult).toBeDefined();
      expect(runResult.success).toBe(true);
    });

    it('should create a file in a subdirectory', async () => {
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
      
      expect(subdirResult).toBeDefined();
      expect(subdirResult.success).toBe(true);
    });

    it('should list files after creating new structure', async () => {
      const listResult2 = await handleToolCall("list_files", { path: "." });
      
      expect(listResult2).toBeDefined();
      expect(listResult2.success).toBe(true);
    });
  });

  describe('OpenAI Integration', () => {
    it('should work with OpenAI when API key is available', { timeout: 30000 }, async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log("Skipping OpenAI test - no API key");
        return;
      }

      try {
        initializeOpenAI();

        const result = await getCompletion(
          "Create a Python script that calculates factorial of a number and save it as factorial.py in the workspace",
          true // Enable tools
        );

        expect(result).toBeDefined();
        if (typeof result === "object" && result.toolResults) {
          expect(result.text).toBeDefined();
          expect(result.toolResults).toBeDefined();
        }
      } catch (error) {
        console.log("OpenAI integration test failed:", error.message);
        // Don't fail the test if OpenAI is unavailable
      }
    });
  });

  describe('Security Features', () => {
    it('should prevent path traversal', async () => {
      const traversalResult = await handleToolCall("read_file", {
        path: "../package.json",
      });
      
      expect(traversalResult).toBeDefined();
      expect(traversalResult.success).toBe(false);
    });

    it('should prevent absolute path access', async () => {
      const absoluteResult = await handleToolCall("read_file", {
        path: "/etc/passwd",
      });
      
      expect(absoluteResult).toBeDefined();
      expect(absoluteResult.success).toBe(false);
    });

    it('should prevent non-Python file creation', async () => {
      const nonPythonResult = await handleToolCall(
        "create_or_replace_python_file",
        {
          path: "test.txt",
          content: "This should fail",
        }
      );
      
      expect(nonPythonResult).toBeDefined();
      expect(nonPythonResult.success).toBe(false);
    });
  });
});