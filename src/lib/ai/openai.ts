interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

interface CallOpenAIOptions {
  jsonMode?: boolean; // Use response_format: { type: "json_object" }
  temperature?: number;
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
}

/**
 * Calls OpenAI API with retry logic and error handling
 */
export async function callOpenAI(
  prompt: string,
  options: CallOpenAIOptions = {}
): Promise<string> {
  const {
    jsonMode = false,
    temperature = 0.7,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const requestBody: any = {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature,
  };

  // Enable JSON mode if requested
  if (jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle non-200 responses
      if (!res.ok) {
        let errorMessage = `OpenAI API error: ${res.status} ${res.statusText}`;
        let errorType = 'api_error';

        try {
          const errorData: OpenAIResponse = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage;
            errorType = errorData.error.type || errorType;
          }
        } catch {
          // If we can't parse the error, use the status text
        }

        // Determine if this is a retryable error
        const isRetryable = isRetryableError(res.status, errorType);

        if (!isRetryable || attempt === maxRetries - 1) {
          const error: any = new Error(errorMessage);
          error.status = res.status;
          error.type = errorType;
          throw error;
        }

        // Wait before retrying
        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      const json: OpenAIResponse = await res.json();

      // Check for API-level errors in response
      if (json.error) {
        const error: any = new Error(json.error.message || 'OpenAI API error');
        error.type = json.error.type;
        error.code = json.error.code;
        throw error;
      }

      // Extract response content
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      return content;
    } catch (error: any) {
      lastError = error;

      // Don't retry on non-retryable errors
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Failed to call OpenAI API after retries');
}

/**
 * Determine if an error is retryable based on status code and error type
 */
function isRetryableError(status: number, errorType: string): boolean {
  // Retry on server errors (5xx) and rate limits (429)
  if (status >= 500 || status === 429) {
    return true;
  }

  // Retry on certain error types
  const retryableTypes = ['server_error', 'rate_limit_error', 'timeout'];
  if (retryableTypes.includes(errorType)) {
    return true;
  }

  // Don't retry on client errors (4xx except 429)
  return false;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
