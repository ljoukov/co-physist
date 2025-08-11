# File Management Tools for OpenAI Responses API

This implementation provides file management tools that can be used with the OpenAI Responses API to create, read, execute, and list Python files within a restricted workspace directory.

## Features

### Security

- **Workspace Isolation**: All file operations are restricted to the `workspace/` directory
- **Path Traversal Prevention**: Blocks attempts to access files outside the workspace using `../` or similar patterns
- **Absolute Path Protection**: Prevents use of absolute paths like `/etc/passwd`
- **File Type Validation**: Only `.py` files can be created/replaced for Python file operations

### Tools Available

1. **create_or_replace_python_file**

   - Creates a new Python file or replaces existing content
   - Parameters: `path` (relative path within workspace), `content` (Python code)

2. **run_python_file**

   - Executes a Python file and returns stdout/stderr
   - Parameters: `path` (Python file to execute)
   - 30-second timeout for execution

3. **read_file**

   - Reads and returns file contents
   - Parameters: `path` (file to read)

4. **list_files**
   - Lists files and directories in workspace or subdirectory
   - Parameters: `path` (optional, defaults to workspace root)

## File Structure

```
src/
├── fileManager.js    # Core file management logic with security
├── tools.js         # OpenAI tool definitions and handlers
└── openai.js        # OpenAI API integration with tool support

workspace/           # All file operations restricted to this directory
└── (user files)

test-tools.js        # Test suite for validation
```

## Usage

### Direct Tool Usage

```javascript
import { handleToolCall, formatToolResult } from "./src/tools.js";

// Create a Python file
const result = await handleToolCall("create_or_replace_python_file", {
  path: "hello.py",
  content: "print('Hello, World!')",
});
console.log(formatToolResult(result));

// Run the Python file
const runResult = await handleToolCall("run_python_file", {
  path: "hello.py",
});
console.log(formatToolResult(runResult));
```

### With OpenAI API

```javascript
import { initializeOpenAI, getCompletion } from "./src/openai.js";

// Initialize OpenAI
initializeOpenAI();

// Use with tools enabled
const response = await getCompletion(
  "Create a Python script that calculates fibonacci numbers",
  true // Enable tools
);

// Response includes both text and tool results
if (response.toolResults) {
  console.log("Text:", response.text);
  console.log("Tools used:", response.toolResults);
}
```

### Tool Definition Format (OpenAI Responses API)

The tools are formatted according to OpenAI's specification:

```javascript
{
  type: "function",
  function: {
    name: "tool_name",
    description: "Tool description",
    parameters: {
      type: "object",
      properties: {
        param_name: {
          type: "string",
          description: "Parameter description"
        }
      },
      required: ["param_name"]
    }
  }
}
```

## Testing

Run the test suite to verify functionality:

```bash
# Test direct tool usage and security features
node test-tools.js

# Test with OpenAI integration (requires API key)
OPENAI_API_KEY=your_key_here node test-tools.js
```

## Security Considerations

1. **Path Validation**: Every file path is validated to ensure it stays within the workspace
2. **No Shell Injection**: Python files are executed using `execFile` with proper argument passing
3. **Timeout Protection**: Python execution has a 30-second timeout
4. **File Type Restrictions**: Only Python files can be created through the Python-specific tool

## Example Workspace Structure

After using the tools, your workspace might look like:

```
workspace/
├── hello.py
├── factorial.py
└── modules/
    ├── math_utils.py
    └── string_utils.py
```

## Error Handling

All tools return a consistent result format:

```javascript
// Success
{
  success: true,
  message: "Operation completed",
  // Additional data (content, stdout, files, etc.)
}

// Error
{
  success: false,
  error: "Error description"
}
```

## Integration with OpenAI Responses API

When integrated with the OpenAI Responses API, the model can:

1. Automatically choose which tool to use based on the user's request
2. Execute multiple tools in sequence
3. Use tool outputs to inform subsequent responses
4. Combine natural language responses with tool execution

This provides a powerful interface for programmatic file management through natural language instructions.
