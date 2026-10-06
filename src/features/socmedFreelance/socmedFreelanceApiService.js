/**
 * Social Media Freelance API Service
 * 
 * Handles all Social Media Freelance automation API calls:
 * - List Periode (sheet: setting_website)
 * - Data By Periode (Produksi Konten, Tracking Instagram, Produksi Mingguan, Rekap Penggajian)
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const socmedFreelanceService = createApiService({
  endpoints: {
    socmedFreelance: API_CONFIG.endpoints.socmedFreelance
  },
  serviceName: 'SocmedFreelance'
});

/**
 * Get list of active periods from sheet "setting_website"
 * Endpoint: GET ?action=get-list-periode
 * @returns {Promise<string[]>} Array of period strings
 */
export const getListPeriode = async () => {
  try {
    logger.debug('[Socmed Freelance API] Fetching List Periode');
    const response = await socmedFreelanceService.get(
      'socmedFreelance',
      'get-list-periode',
      {},
      { injectUser: false }
    );
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getListPeriode', service: 'SocmedFreelance' });
    throw error;
  }
};

/**
 * Get 4 categories data for a specific period
 * Endpoint: GET ?action=get-data-by-periode&periode=...
 * @param {string} periode - e.g. "18 Sep - 17 Oct 2026"
 * @returns {Promise<Object>} { produksi_konten, tracking_instagram, produksi_mingguan, rekap_penggajian }
 */
export const getDataByPeriode = async (periode) => {
  if (!periode) return null;
  try {
    logger.debug('[Socmed Freelance API] Fetching Data By Periode', { periode });
    const response = await socmedFreelanceService.get(
      'socmedFreelance',
      'get-data-by-periode',
      { periode },
      { injectUser: false }
    );
    return response || {
      produksi_konten: [],
      tracking_instagram: [],
      produksi_mingguan: [],
      rekap_penggajian: []
    };
  } catch (error) {
    logError(error, { context: 'getDataByPeriode', service: 'SocmedFreelance', periode });
    throw error;
  }
};
