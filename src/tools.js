import {
  createOrReplacePythonFile,
  runPythonFile,
  readFile,
  listFiles,
} from "./fileManager.js";

/**
 * OpenAI tool definitions for file management
 * These tools can be used with the OpenAI Responses API
 */
export const fileManagementTools = [
  {
    name: "create_or_replace_python_file",
    type: "function",
    description:
      "Create a new Python file or replace an existing one in the workspace directory",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            'Relative path within workspace directory (e.g., "script.py" or "subfolder/module.py")',
        },
        content: {
          type: "string",
          description: "Python code content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_python_file",
    type: "function",
    description:
      "Execute a Python file from the workspace directory and return the output",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Python file path within workspace directory to execute",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "read_file",
    type: "function",
    description: "Read the contents of a file from the workspace directory",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path within workspace directory to read",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    type: "function",
    description:
      "List files and directories in the workspace or a subdirectory",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            'Directory path within workspace to list (use "." for root workspace)',
          default: ".",
        },
      },
      required: [],
    },
  },
];

/**
 * Tool handler that executes the appropriate function based on tool name
 * @param {string} toolName - Name of the tool to execute
 * @param {object} args - Arguments for the tool
 * @returns {Promise<object>} - Tool execution result
 */
export async function handleToolCall(toolName, args) {
  try {
    switch (toolName) {
      case "create_or_replace_python_file":
        return await createOrReplacePythonFile(args.path, args.content);

      case "run_python_file":
        return await runPythonFile(args.path);

      case "read_file":
        return await readFile(args.path);

      case "list_files":
        return await listFiles(args.path || ".");

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format tool result for OpenAI response
 * @param {object} result - Tool execution result
 * @returns {object} - Formatted result for OpenAI API
 */
export function formatToolResult(result) {
  if (result.success) {
    // Format successful results
    if (result.content !== undefined) {
      // For read_file
      return {
        type: "text",
        text: result.content,
      };
    } else if (result.stdout !== undefined) {
      // For run_python_file
      let output = "";
      if (result.stdout) {
        output += `Output:\n${result.stdout}`;
      }
      if (result.stderr) {
        output += `\nErrors/Warnings:\n${result.stderr}`;
      }
      return {
        type: "text",
        text: output || "Script executed successfully with no output.",
      };
    } else if (result.files !== undefined) {
      // For list_files
      let listing = `Files in ${result.path}:\n`;
      if (result.directories.length > 0) {
        listing += "\nDirectories:\n";
        result.directories.forEach((dir) => {
          listing += `  📁 ${dir}/\n`;
        });
      }
      if (result.files.length > 0) {
        listing += "\nFiles:\n";
        result.files.forEach((file) => {
          listing += `  📄 ${file}\n`;
        });
      }
      if (result.files.length === 0 && result.directories.length === 0) {
        listing += "  (empty)\n";
      }
      return {
        type: "text",
        text: listing,
      };
    } else {
      // For create_or_replace_python_file and other success messages
      return {
        type: "text",
        text: result.message || "Operation completed successfully.",
      };
    }
  } else {
    // Format error results
    return {
      type: "text",
      text: `Error: ${result.error}`,
      isError: true,
    };
  }
}
