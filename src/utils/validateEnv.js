/**
 * Environment Variable Validator
 * Validates required environment variables at application startup
 * Prevents silent failures from missing configuration
 */

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
  'VITE_API_CSO_BERSAMA_ENDPOINT',
  'VITE_API_CSO_PERSONAL_ENDPOINT',
  'VITE_API_ESO_BERSAMA_ENDPOINT',
  'VITE_API_ESO_PERSONAL_ENDPOINT',
  'VITE_API_FINANCE_BERSAMA_ENDPOINT',
  'VITE_API_FINANCE_PERSONAL_ENDPOINT',
  'VITE_HR_RECRUITMENT_ENDPOINT',
  'VITE_HRGA_ASSET_ENDPOINT',
  'VITE_API_AUTH_ENDPOINT',
];

const OPTIONAL_ENV_VARS = [
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
  'VITE_ENABLE_DEBUG_MODE',
];

/**
 * Validates all required environment variables
 * @throws {Error} If any required variable is missing
 */
export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  // Check optional variables (warn only)
  OPTIONAL_ENV_VARS.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      warnings.push(key);
    }
  });

  // Throw error if required variables missing
  if (missing.length > 0) {
    const errorMessage = `
╔═══════════════════════════════════════════════════════════╗
║  ❌ MISSING REQUIRED ENVIRONMENT VARIABLES                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  The following environment variables are required but     ║
║  not found in your .env file:                             ║
║                                                           ║
${missing.map(key => `║  • ${key.padEnd(55, ' ')}║`).join('\n')}
║                                                           ║
║  Please check:                                            ║
║  1. .env file exists in project root                      ║
║  2. All required variables are defined                    ║
║  3. Values are not empty                                  ║
║                                                           ║
║  See .env.example for reference                           ║
╚═══════════════════════════════════════════════════════════╝
    `.trim();

    throw new Error(errorMessage);
  }

  // Warn about optional variables
  if (warnings.length > 0 && import.meta.env.MODE === 'development') {
    console.warn('⚠️  Optional environment variables not set:', warnings);
  }

  // Success message in development
  if (import.meta.env.MODE === 'development') {
    console.log('✅ Environment variables validated successfully');
  }
};

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value if not found
 * @returns {string}
 */
export const getEnv = (key, fallback = '') => {
  return import.meta.env[key] || fallback;
};

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export const isProduction = () => {
  return import.meta.env.MODE === 'production';
};

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export const isDebugMode = () => {
  return import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';
};
