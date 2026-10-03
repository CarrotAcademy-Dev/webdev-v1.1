/**
 * Marcom API Service
 * 
 * Handles all Marcom division API calls:
 * - Prospektif CRUD (Main DB & Staging)
 * - Cek Folder Dropbox
 * - Dashboard Daily (Birthday & Jadwal Kelas)
 * - Track Ticket From Me (Internal Tickets)
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const marcomService = createApiService({
  endpoints: {
    marcom: API_CONFIG.endpoints.marcom
  },
  serviceName: 'Marcom'
});

// ============================================
// 1. PROSPEKTIF APIS
// ============================================

/**
 * Get Prospektif data from main CSO DB
 * Endpoint: GET ?action=get-prospektif
 */
export const getProspektif = async () => {
  try {
    logger.debug('[Marcom API] Fetching Prospektif data');
    const response = await marcomService.get('marcom', 'get-prospektif', {}, { injectUser: false });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getProspektif', service: 'Marcom' });
    throw error;
  }
};

/**
 * Get Prospektif Staging data from Marcom sheet
 * Endpoint: GET ?action=get-prospektif-staging
 */
export const getProspektifStaging = async () => {
  try {
    logger.debug('[Marcom API] Fetching Prospektif Staging data');
    const response = await marcomService.get('marcom', 'get-prospektif-staging', {}, { injectUser: false });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getProspektifStaging', service: 'Marcom' });
    throw error;
  }
};

/**
 * Tambah Prospektif Baru langsung ke DB Utama CSO
 * Endpoint: POST action=tambah-prospektif
 * @param {Object} payload - { nama, nomor_hp, first_contact, media, program_yang_tertarik, referral, keterangan }
 */
export const tambahProspektif = async (payload) => {
  try {
    logger.debug('[Marcom API] Menambah Prospektif', { nama: payload.nama });
    const response = await marcomService.post('marcom', 'tambah-prospektif', payload, { injectUser: false });
    return response;
  } catch (error) {
    logError(error, { context: 'tambahProspektif', service: 'Marcom' });
    throw error;
  }
};

/**
 * Edit Prospektif
 * Endpoint: POST action=edit-prospektif
 * @param {Object} payload - { row, nama, nomor_hp, first_contact, media, program_yang_tertarik, referral, keterangan }
 */
export const editProspektif = async (payload) => {
  try {
    logger.debug('[Marcom API] Edit Prospektif', { row: payload.row });
    const response = await marcomService.post('marcom', 'edit-prospektif', payload, { injectUser: false });
    return response;
  } catch (error) {
    logError(error, { context: 'editProspektif', service: 'Marcom' });
    throw error;
  }
};

/**
 * Hapus Prospektif
 * Endpoint: POST action=delete-prospektif
 * @param {number|string} row - Row index in sheet
 */
export const deleteProspektif = async (row) => {
  try {
    logger.debug('[Marcom API] Hapus Prospektif', { row });
    const response = await marcomService.post('marcom', 'delete-prospektif', { row }, { injectUser: false });
    return response;
  } catch (error) {
    logError(error, { context: 'deleteProspektif', service: 'Marcom' });
    throw error;
  }
};

/**
 * Kirim Data Prospektif Staging ke CSO
 * Endpoint: POST action=send-prospektif-to-cso
 */
export const sendProspektifToCso = async () => {
  try {
    logger.debug('[Marcom API] Kirim Prospektif ke CSO');
    const response = await marcomService.post('marcom', 'send-prospektif-to-cso', {}, { injectUser: false });
    return response;
  } catch (error) {
    logError(error, { context: 'sendProspektifToCso', service: 'Marcom' });
    throw error;
  }
};

// ============================================
// 2. CEK FOLDER DROPBOX APIS
// ============================================

/**
 * Get Cek Folder Dropbox data
 * Endpoint: GET ?action=get-cek-folder-dropbox
 */
export const getCekFolderDropbox = async () => {
  try {
    logger.debug('[Marcom API] Fetching Cek Folder Dropbox');
    const response = await marcomService.get('marcom', 'get-cek-folder-dropbox', {}, { injectUser: false });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getCekFolderDropbox', service: 'Marcom' });
    throw error;
  }
};

/**
 * Edit Cek Folder Dropbox
 * Endpoint: POST action=edit-cek-folder-dropbox
 * @param {Object} payload - { row, target, checklist } ('TRUE'/'FALSE' or boolean)
 */
export const editCekFolderDropbox = async (payload) => {
  try {
    logger.debug('[Marcom API] Edit Cek Folder Dropbox', { row: payload.row });
    const cleanPayload = { ...payload };
    if (typeof cleanPayload.checklist === 'boolean') {
      cleanPayload.checklist = cleanPayload.checklist ? 'TRUE' : 'FALSE';
    }
    const response = await marcomService.post('marcom', 'edit-cek-folder-dropbox', cleanPayload, { injectUser: false });
    return response;
  } catch (error) {
    logError(error, { context: 'editCekFolderDropbox', service: 'Marcom' });
    throw error;
  }
};

// ============================================
// 3. DASHBOARD DAILY (BIRTHDAY SISWA) APIS
// ============================================

/**
 * Get Dashboard Daily (Birthday & Jadwal Siswa)
 * Endpoint: GET ?action=get-dashboard-daily
 */
export const getDashboardDaily = async () => {
  try {
    logger.debug('[Marcom API] Fetching Dashboard Daily');
    const response = await marcomService.get('marcom', 'get-dashboard-daily', {}, { injectUser: false });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getDashboardDaily', service: 'Marcom' });
    throw error;
  }
};

// ============================================
// 4. TRACK TICKET FROM ME APIS
// ============================================

/**
 * Get Track Ticket From Me for Marcom division
 * Endpoint: GET ?action=get-track-ticket-fme
 */
export const getTrackTicketFme = async () => {
  try {
    logger.debug('[Marcom API] Fetching Track Ticket From Me');
    const response = await marcomService.get('marcom', 'get-track-ticket-fme', {}, { injectUser: false });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    logError(error, { context: 'getTrackTicketFme', service: 'Marcom' });
    throw error;
  }
};
