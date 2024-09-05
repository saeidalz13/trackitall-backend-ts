import { CorsOptions } from "cors";
import { constants } from "http2";

export const newCorsOption = (allowedOrigin: string): CorsOptions => {
  return {
    optionsSuccessStatus: constants.HTTP_STATUS_OK,
    origin: allowedOrigin,
    credentials: true,
  };
};

export class ApiLogger {
  public static log(msg: unknown) {
    console.log(
      `${new Date()
        .toLocaleString("en-GB", {
          hour12: false,
          timeZoneName: "short",
        })
        .replace(",", "")}: ${msg}`
    );
  }

  public static error(msg: unknown) {
    console.error(
      `${new Date()
        .toLocaleString("en-GB", {
          hour12: false,
          timeZoneName: "short",
        })
        .replace(",", "")}: ${msg}`
    );
  }

  private static getStackInfo(): string {
    // Create a new Error object to get access to the stack trace
    const err = new Error();
    const stack = err.stack;

    if (!stack) {
      return "unknown";
    }

    // Stack trace is platform-specific, so parsing it might vary slightly between browsers/environments
    const stackLines = stack.split("\n");

    // We typically want the third line of the stack trace (the first one after `Error` and `log`)
    const callerLine = stackLines[2].trim();

    // Example of parsing out the function and line information
    const matches =
      callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
      callerLine.match(/at\s+(.*):(\d+):(\d+)/);

    if (matches) {
      // For method calls
      if (matches.length === 5) {
        const functionName = matches[1];
        const fileName = matches[2];
        const lineNumber = matches[3];
        return `${functionName} (${fileName}:${lineNumber})`;
      }
      // For direct calls in the file
      else if (matches.length === 4) {
        const fileName = matches[1];
        const lineNumber = matches[2];
        return `(${fileName}:${lineNumber})`;
      }
    }

    return "unknown";
  }
}
