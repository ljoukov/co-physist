import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Base workspace directory - all operations restricted to this directory
const WORKSPACE_DIR = path.join(process.cwd(), "workspace");

/**
 * Validates and normalizes a file path to ensure it's within the workspace
 * @param {string} filePath - The file path to validate
 * @returns {string} - The normalized absolute path
 * @throws {Error} - If the path is invalid or outside workspace
 */
function validatePath(filePath) {
  // Remove any leading/trailing whitespace
  filePath = filePath.trim();

  // Prevent absolute paths
  if (path.isAbsolute(filePath)) {
    throw new Error(
      "Absolute paths are not allowed. Please use relative paths within workspace/"
    );
  }

  // Resolve the path relative to workspace
  const resolvedPath = path.resolve(WORKSPACE_DIR, filePath);

  // Ensure the resolved path is within workspace
  if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
    throw new Error(
      "Path traversal detected. All files must be within workspace/ directory"
    );
  }

  return resolvedPath;
}

/**
 * Ensures the workspace directory exists
 */
async function ensureWorkspaceExists() {
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating workspace directory:", error);
    throw error;
  }
}

/**
 * Creates or replaces a Python file
 * @param {string} filePath - Relative path within workspace
 * @param {string} content - File content
 * @returns {object} - Success status and message
 */
export async function createOrReplacePythonFile(filePath, content) {
  try {
    await ensureWorkspaceExists();

    // Validate file has .py extension
    if (!filePath.endsWith(".py")) {
      throw new Error("File must have .py extension");
    }

    const fullPath = validatePath(filePath);

    // Create directory if needed
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, "utf8");

    return {
      success: true,
      message: `Python file created/replaced: ${filePath}`,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Runs a Python file
 * @param {string} filePath - Relative path within workspace
 * @returns {object} - Execution result with stdout, stderr
 */
export async function runPythonFile(filePath) {
  try {
    await ensureWorkspaceExists();

    // Validate file has .py extension
    if (!filePath.endsWith(".py")) {
      throw new Error("File must have .py extension");
    }

    const fullPath = validatePath(filePath);

    // Check file exists
    await fs.access(fullPath);

    // Execute Python file
    const { stdout, stderr } = await execFileAsync("python3", [fullPath], {
      cwd: WORKSPACE_DIR,
      timeout: 30000, // 30 second timeout
    });

    return {
      success: true,
      stdout: stdout || "",
      stderr: stderr || "",
      message: `Executed: ${filePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    };
  }
}

/**
 * Reads a file
 * @param {string} filePath - Relative path within workspace
 * @returns {object} - File content or error
 */
export async function readFile(filePath) {
  try {
    await ensureWorkspaceExists();

    const fullPath = validatePath(filePath);

    // Check file exists
    await fs.access(fullPath);

    const content = await fs.readFile(fullPath, "utf8");

    return {
      success: true,
      content: content,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Lists files in the workspace or a subdirectory
 * @param {string} dirPath - Relative directory path within workspace (optional)
 * @returns {object} - List of files or error
 */
export async function listFiles(dirPath = ".") {
  try {
    await ensureWorkspaceExists();

    const fullPath = dirPath === "." ? WORKSPACE_DIR : validatePath(dirPath);

    // Read directory with file types
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    // Process entries
    const files = [];
    const directories = [];

    for (const entry of entries) {
      const relativePath = path.relative(
        WORKSPACE_DIR,
        path.join(fullPath, entry.name)
      );

      if (entry.isDirectory()) {
        directories.push(relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }

    return {
      success: true,
      files: files,
      directories: directories,
      path: dirPath === "." ? "workspace/" : dirPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Initialize workspace on module load
ensureWorkspaceExists().catch(console.error);
