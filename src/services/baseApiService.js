/**
 * Base API Service Factory
 * 
 * Creates standardized API service with common patterns:
 * - Axios client with timeout & error handling
 * - URLSearchParams for POST (avoid preflight OPTIONS)
 * - User context injection
 * - Consistent error handling
 * - Response validation
 * 
 * Usage:
 * import { createApiService } from '@/services/baseApiService';
 * 
 * const csoService = createApiService({
 *   endpoints: {
 *     bersama: API_CONFIG.endpoints.csoBersama,
 *     personal: API_CONFIG.endpoints.csoPersonal
 *   },
 *   serviceName: 'CSO'
 * });
 * 
 * // Use the service
 * const data = await csoService.get('bersama', 'getData', { param1: 'value' });
 * const result = await csoService.post('personal', 'submitData', { field: 'value' });
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { ApiError, logError } from '@/utils/errorHandler';
import { auth } from '@/utils/storage';

/**
 * Create axios client with standard configuration
 */
const createClient = () => {
  return axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: false,
    timeout: API_CONFIG.timeout,
    validateStatus: () => true, // Handle all status codes manually
    transformRequest: [(data) => data] // Don't auto-transform
  });
};

/**
 * Get current user context for API calls
 */
const getUserContext = () => {
  const user = auth.getUser();
  if (!user) {
    throw new ApiError('User not authenticated. Please login again.');
  }
  return {
    email: user.email || '',
    codeName: user.codeName || '',
    nama: user.nama || '',
    jabatan: user.jabatan || '',
    role: user.role || ''
  };
};

/**
 * Validate API response and extract data
 */
const validateResponse = (response, context) => {
  const result = response.data;

  // Check for HTTP errors
  if (response.status >= 400) {
    logger.error(`HTTP ${response.status} error`, new Error(result.message || 'HTTP error'), context);
    throw new ApiError(result.message || `HTTP error: ${response.status}`, response.status);
  }

  // Check for backend errors
  if (result.status === 'error' || result.success === false) {
    logger.error('Backend error', new Error(result.message || 'Backend error'), context);
    throw new ApiError(result.message || 'Backend returned error status');
  }

  // Success response (handle both 'result' and 'data' keys)
  if (result.status === 'success' || result.success === true) {
    return result.result || result.data || result;
  }

  // Unknown response format
  logger.warn('Unknown response format', result, context);
  return result;
};

/**
 * Build URLSearchParams from object (for POST requests)
 */
const buildParams = (data) => {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params;
};

/**
 * Create API service with standard methods
 * 
 * @param {Object} config - Service configuration
 * @param {Object} config.endpoints - Endpoint URLs (e.g., { bersama: '...', personal: '...' })
 * @param {string} config.serviceName - Service name for logging (e.g., 'CSO', 'ESO', 'Finance')
 * @returns {Object} API service with get/post methods
 */
export const createApiService = ({ endpoints, serviceName }) => {
  const client = createClient();
  const context = serviceName || 'API';

  return {
    /**
     * GET request
     * 
     * @param {string} endpointKey - Key from endpoints object (e.g., 'bersama', 'personal')
     * @param {string} action - Action parameter for backend
     * @param {Object} params - Additional query parameters
     * @param {Object} options - Additional options (injectUser: boolean)
     * @returns {Promise} Response data
     */
    async get(endpointKey, action, params = {}, options = {}) {
      const endpoint = endpoints[endpointKey];
      if (!endpoint) {
        throw new Error(`Endpoint '${endpointKey}' not found in ${serviceName} service`);
      }

      logger.debug(`GET ${endpointKey}/${action}`, { params }, context);

      try {
        // Inject user context if needed
        const queryParams = { action, ...params };
        if (options.injectUser !== false) {
          const user = getUserContext();
          queryParams.email = queryParams.email || user.email;
        }

        const queryString = new URLSearchParams(queryParams).toString();
        const response = await client.get(`${endpoint}?${queryString}`);

        const data = validateResponse(response, context);
        logger.debug(`GET ${endpointKey}/${action} success`, { count: Array.isArray(data) ? data.length : 'N/A' }, context);
        
        return data;
      } catch (error) {
        logError(error, { context, action, endpointKey });
        throw error;
      }
    },

    /**
     * POST request (using URLSearchParams to avoid preflight)
     * 
     * @param {string} endpointKey - Key from endpoints object
     * @param {string} action - Action parameter for backend
     * @param {Object} data - Data to submit
     * @param {Object} options - Additional options (injectUser: boolean)
     * @returns {Promise} Response data
     */
    async post(endpointKey, action, data = {}, options = {}) {
      const endpoint = endpoints[endpointKey];
      if (!endpoint) {
        throw new Error(`Endpoint '${endpointKey}' not found in ${serviceName} service`);
      }

      logger.debug(`POST ${endpointKey}/${action}`, { dataKeys: Object.keys(data) }, context);

      try {
        // Inject user context if needed
        const postData = { action, ...data };
        if (options.injectUser !== false) {
          const user = getUserContext();
          postData.email = postData.email || user.email;
        }

        const params = buildParams(postData);
        const response = await client.post(endpoint, params);

        const result = validateResponse(response, context);
        logger.debug(`POST ${endpointKey}/${action} success`, null, context);
        
        return result;
      } catch (error) {
        logError(error, { context, action, endpointKey });
        throw error;
      }
    },

    /**
     * Batch GET requests (parallel execution)
     * 
     * @param {Array} requests - Array of request configs: [{ endpointKey, action, params }, ...]
     * @returns {Promise<Array>} Array of responses
     */
    async batchGet(requests) {
      logger.debug(`Batch GET ${requests.length} requests`, null, context);
      
      try {
        const promises = requests.map(req => 
          this.get(req.endpointKey, req.action, req.params, req.options)
        );
        return await Promise.all(promises);
      } catch (error) {
        logError(error, { context: `${context}/batch` });
        throw error;
      }
    },

    /**
     * Get current user context
     * Useful for getting user info without making API call
     */
    getUserContext,

    /**
     * Direct access to axios client (for advanced usage)
     */
    client
  };
};

/**
 * Common data transformation utilities
 * These are helper functions that services can use
 */
export const transformers = {
  /**
   * Transform 2D array from Google Sheets to objects
   * @param {Array} rawData - 2D array from backend
   * @param {Array} headers - Header configuration: [{ key: 'fieldName', type: 'string|boolean' }, ...]
   * @returns {Array} Array of objects
   */
  sheetsToObjects(rawData, headers) {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((row, index) => {
      const dataObject = { no: index + 1 };
      
      headers.forEach((header, colIndex) => {
        if (header.key) {
          const value = row[colIndex];
          
          // Handle boolean conversion
          if (header.type === 'boolean') {
            dataObject[header.key] = String(value).toUpperCase() === 'TRUE';
          } else {
            dataObject[header.key] = value || '';
          }
        }
      });

      return dataObject;
    });
  },

  /**
   * Sort by timestamp (descending - newest first)
   * @param {Array} data - Array of objects with timestamp field
   * @param {string} timestampKey - Key name for timestamp field
   * @returns {Array} Sorted array
   */
  sortByTimestampDesc(data, timestampKey = 'timestamp') {
    return [...data].sort((a, b) => {
      const parseTimestamp = (ts) => {
        if (!ts) return new Date(0);
        
        // Try standard date parse
        const date = new Date(ts);
        if (!isNaN(date)) return date;
        
        // Parse DD/MM/YYYY HH:mm:ss format
        const [datePart, timePart] = String(ts).split(' ');
        if (datePart) {
          const parts = datePart.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
          }
        }
        
        return new Date(0);
      };
      
      return parseTimestamp(b[timestampKey]) - parseTimestamp(a[timestampKey]);
    });
  },

  /**
   * Filter by status
   * @param {Array} data - Array of objects
   * @param {string} status - Status to filter
   * @param {string} statusKey - Key name for status field
   * @returns {Array} Filtered array
   */
  filterByStatus(data, status, statusKey = 'status') {
    return data.filter(item => 
      String(item[statusKey]).toLowerCase() === String(status).toLowerCase()
    );
  }
};

/**
 * Example: Creating Finance Service
 * 
 * // src/features/finance/financeApiService.js
 * import { createApiService } from '@/services/baseApiService';
 * import { API_CONFIG } from '@/config/api.config';
 * 
 * const financeService = createApiService({
 *   endpoints: {
 *     bersama: API_CONFIG.endpoints.financeBersama,
 *     personal: API_CONFIG.endpoints.financePersonal
 *   },
 *   serviceName: 'Finance'
 * });
 * 
 * // Export specific functions
 * export const getInvoiceData = () => {
 *   return financeService.get('bersama', 'getInvoices');
 * };
 * 
 * export const submitPayment = (data) => {
 *   return financeService.post('personal', 'submitPayment', data);
 * };
 * 
 * // Use transformers for data manipulation
 * import { transformers } from '@/services/baseApiService';
 * 
 * export const getInvoiceDataTransformed = async () => {
 *   const rawData = await financeService.get('bersama', 'getInvoices');
 *   return transformers.sortByTimestampDesc(rawData, 'invoiceDate');
 * };
 */
