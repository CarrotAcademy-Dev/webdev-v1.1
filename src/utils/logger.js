/**
 * Centralized Logging Utility
 * Provides conditional logging based on environment
 * 
 * Usage:
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('Debug info', data);  // Only in dev/debug mode
 * logger.info('Info message');        // Always logged
 * logger.warn('Warning');             // Always logged
 * logger.error('Error', error);       // Always logged
 */

import { logError as errorHandlerLog } from './errorHandler';

const isDev = import.meta.env.DEV;
const isDebugMode = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';
const isDebugEnabled = isDev || isDebugMode;

/**
 * Sanitize sensitive data from logs
 * Removes passwords, tokens, and other sensitive fields
 */
const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = ['password', 'token', 'authorization', 'apiKey', 'secret'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  });
  
  return sanitized;
};

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  return `[${timestamp}]${contextStr} ${level}: ${message}`;
};

/**
 * Logger class with conditional logging
 */
class Logger {
  /**
   * Debug level - only in development/debug mode
   * Use for detailed debugging information
   */
  debug(message, data, context) {
    if (!isDebugEnabled) return;
    
    const sanitizedData = data ? sanitize(data) : undefined;
    console.log(formatMessage('DEBUG', message, context), sanitizedData || '');
  }

  /**
   * Info level - always logged
   * Use for general informational messages
   */
  info(message, data, context) {
    const sanitizedData = data ? sanitize(data) : undefined;
    console.info(formatMessage('INFO', message, context), sanitizedData || '');
  }

  /**
   * Warning level - always logged
   * Use for potential issues that don't break functionality
   */
  warn(message, data, context) {
    const sanitizedData = data ? sanitize(data) : undefined;
    console.warn(formatMessage('WARN', message, context), sanitizedData || '');
  }

  /**
   * Error level - always logged and tracked
   * Use for errors that need attention
   */
  error(message, error, context) {
    const errorMessage = formatMessage('ERROR', message, context);
    console.error(errorMessage, error);
    
    // Also log to error tracking system
    if (error instanceof Error) {
      errorHandlerLog(error, { context, message });
    }
  }

  /**
   * Group logs together (for debugging complex flows)
   */
  group(label) {
    if (!isDebugEnabled) return;
    console.group(label);
  }

  /**
   * End log group
   */
  groupEnd() {
    if (!isDebugEnabled) return;
    console.groupEnd();
  }

  /**
   * Log table data (useful for arrays of objects)
   */
  table(data) {
    if (!isDebugEnabled) return;
    console.table(sanitize(data));
  }

  /**
   * Time measurement start
   */
  time(label) {
    if (!isDebugEnabled) return;
    console.time(label);
  }

  /**
   * Time measurement end
   */
  timeEnd(label) {
    if (!isDebugEnabled) return;
    console.timeEnd(label);
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Legacy debug functions for backward compatibility
 * @deprecated Use logger.debug() instead
 */
export const debugLog = (...args) => {
  if (isDebugEnabled) console.log(...args);
};

export const debugError = (...args) => {
  if (isDebugEnabled) console.error(...args);
};

export const debugWarn = (...args) => {
  if (isDebugEnabled) console.warn(...args);
};

// Export for external use
export const isDebugLoggingEnabled = isDebugEnabled;
