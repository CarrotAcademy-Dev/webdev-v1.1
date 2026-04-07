/**
 * Finance API Service
 * 
 * Handles all Finance division API calls (Bersama & Personal)
 * Uses baseApiService factory for standardized patterns
 * 
 * Backend Response Format:
 * - GET: { status: 'success', result: [...] }
 * - POST: { status: 'success'|'failed', message: '...' }
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

// ============================================
// Finance Service Instance
// ============================================

const financeService = createApiService({
  endpoints: {
    bersama: API_CONFIG.endpoints.financeBersama,
    personal: API_CONFIG.endpoints.financePersonal
  },
  serviceName: 'Finance'
});

// ============================================
// Finance Bersama APIs
// ============================================

/**
 * Get Approval Pendaftaran data
 * Endpoint: GET action=get-approval-pendaftaran
 * 
 * @returns {Promise<Array>} List of approval pendaftaran records
 */
export const getApprovalPendaftaran = async () => {
  try {
    logger.debug('[Finance API] Fetching Approval Pendaftaran data');
    
    const response = await financeService.get('bersama', 'get-approval-pendaftaran');
    
    logger.info('[Finance API] Approval Pendaftaran data fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getApprovalPendaftaran',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Approve (ceklis) pendaftaran by PSID
 * Endpoint: POST action=ceklis-approval-pendaftaran
 * 
 * @param {string} psid - PSID to approve
 * @returns {Promise<Object>} Success/failed response with message
 */
export const ceklisApprovalPendaftaran = async (psid) => {
  try {
    logger.debug('[Finance API] Approving pendaftaran', { psid });
    
    const response = await financeService.post('bersama', 'ceklis-approval-pendaftaran', {
      psid
    });
    
    logger.info('[Finance API] Approval pendaftaran success', { psid });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'ceklisApprovalPendaftaran',
      service: 'Finance Bersama',
      psid
    });
    throw error;
  }
};

/**
 * Get Daftar Harga data
 * Endpoint: GET action=get-daftar-harga
 * 
 * @returns {Promise<Array>} List of price records
 */
export const getDaftarHarga = async () => {
  try {
    logger.debug('[Finance API] Fetching Daftar Harga data');
    
    const response = await financeService.get('bersama', 'get-daftar-harga');
    
    logger.info('[Finance API] Daftar Harga data fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getDaftarHarga',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Get Daftar Diskon data
 * Endpoint: GET action=get-daftar-diskon
 * 
 * @returns {Promise<Array>} List of discount records
 */
export const getDaftarDiskon = async () => {
  try {
    logger.debug('[Finance API] Fetching Daftar Diskon data');
    
    const response = await financeService.get('bersama', 'get-daftar-diskon');
    
    logger.info('[Finance API] Daftar Diskon data fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getDaftarDiskon',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Get Bukti Pembayaran data
 * Endpoint: GET action=get-bukti-pembayaran
 * 
 * @returns {Promise<Array>} List of payment proof records
 */
export const getBuktiPembayaran = async () => {
  try {
    logger.debug('[Finance API] Fetching Bukti Pembayaran data');
    
    const response = await financeService.get('bersama', 'get-bukti-pembayaran');
    
    logger.info('[Finance API] Bukti Pembayaran data fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getBuktiPembayaran',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Ceklis Bukti Pembayaran by PSID
 * Endpoint: POST action=ceklis-bukti-pembayaran
 * 
 * @param {string} psid - PSID to check
 * @returns {Promise<Object>} Success/failed response with message
 */
export const ceklisBuktiPembayaran = async (psid) => {
  try {
    logger.debug('[Finance API] Ceklis Bukti Pembayaran', { psid });
    
    const response = await financeService.post('bersama', 'ceklis-bukti-pembayaran', {
      psid
    });
    
    logger.info('[Finance API] Ceklis Bukti Pembayaran success', { psid });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'ceklisBuktiPembayaran',
      service: 'Finance Bersama',
      psid
    });
    throw error;
  }
};

/**
 * Get Pendaftaran Full Time data
 * Endpoint: GET action=get-pendaftaran-fulltime
 * 
 * @returns {Promise<Array>} List of full time registration records
 */
export const getPendaftaranFullTime = async () => {
  try {
    logger.debug('[Finance API] Fetching Pendaftaran Full Time data');
    
    const response = await financeService.get('bersama', 'get-pendaftaran-fulltime');
    
    logger.info('[Finance API] Pendaftaran Full Time data fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getPendaftaranFullTime',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Get Data Daftar Offboarding
 * Endpoint: GET action=data-daftar-offboarding
 * 
 * @returns {Promise<Array>} List of offboarding records
 */
export const getDataOffboarding = async () => {
  try {
    logger.debug('[Finance API] Fetching Data Offboarding');
    
    const response = await financeService.get('bersama', 'data-daftar-offboarding');
    
    logger.info('[Finance API] Data Offboarding fetched', {
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getDataOffboarding',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Ceklis Daftar Offboarding by PSID
 * Endpoint: POST action=ceklis-daftar-offboarding
 * 
 * @param {string} psid - PSID to check
 * @returns {Promise<Object>} Success/failed response with message
 */
export const ceklisDaftarOffboarding = async (psid) => {
  try {
    logger.debug('[Finance API] Ceklis Daftar Offboarding', { psid });
    
    const response = await financeService.post('bersama', 'ceklis-daftar-offboarding', {
      psid
    });
    
    logger.info('[Finance API] Ceklis Daftar Offboarding success', { psid });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'ceklisDaftarOffboarding',
      service: 'Finance Bersama',
      psid
    });
    throw error;
  }
};

// ============================================
// Finance Personal APIs
// ============================================

/**
 * Get Tagihan Siswa data by PSID
 * Endpoint: POST action=get-tagihan-siswa
 * 
 * @param {string} psid - Student PSID
 * @returns {Promise<Array>} List of student billing records
 */
export const getTagihanSiswa = async (psid) => {
  try {
    logger.debug('[Finance API] Fetching Tagihan Siswa', { psid });
    
    const response = await financeService.post('personal', 'get-tagihan-siswa', {
      psid
    });
    
    logger.info('[Finance API] Tagihan Siswa fetched', { 
      psid,
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getTagihanSiswa',
      service: 'Finance Personal',
      psid
    });
    throw error;
  }
};

/**
 * Get Data BKM (Bukti Kas Masuk) by Nama Lengkap
 * Endpoint: POST action=get-data-bkm
 * 
 * @param {string} namaLengkap - Student full name
 * @returns {Promise<Array>} List of BKM records
 */
export const getDataBKM = async (namaLengkap) => {
  try {
    logger.debug('[Finance API] Fetching Data BKM', { namaLengkap });
    
    const response = await financeService.post('bersama', 'get-data-bkm', {
      nama_lengkap: namaLengkap
    });
    
    logger.info('[Finance API] Data BKM fetched', { 
      namaLengkap,
      count: response?.length || 0
    });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'getDataBKM',
      service: 'Finance Bersama',
      namaLengkap
    });
    throw error;
  }
};

// ============================================
// Export default service for advanced usage
// ============================================

export default financeService;
