/**
 * HR Main Data API Service
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const hrMainDataService = createApiService({
  endpoints: {
    hrMainData: API_CONFIG.endpoints.hrgaHrMainData,
  },
  serviceName: 'HRGA HR Main Data'
});

// Database Karyawan
export const getDatabaseKaryawan = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Database Karyawan');
    const response = await hrMainDataService.get('hrMainData', 'get-database-karyawan');
    logger.info('[HR Main Data API] Database Karyawan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDatabaseKaryawan', service: 'HR Main Data' });
    throw error;
  }
};

export const getKaryawan = async (nama) => {
  try {
    logger.debug('[HR Main Data API] Get Karyawan', { nama });
    const response = await hrMainDataService.post('hrMainData', 'get-karyawan', { nama });
    logger.info('[HR Main Data API] Get Karyawan success');
    return response || null;
  } catch (error) {
    logError(error, { context: 'getKaryawan', service: 'HR Main Data' });
    throw error;
  }
};

export const editDatabaseKaryawan = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Database Karyawan', { id_karyawan: payload.id_karyawan });
    const response = await hrMainDataService.post('hrMainData', 'edit-database-karyawan', payload);
    logger.info('[HR Main Data API] Edit Database Karyawan success');
    return response;
  } catch (error) {
    logError(error, { context: 'editDatabaseKaryawan', service: 'HR Main Data' });
    throw error;
  }
};

export const deleteDatabaseKaryawan = async (id_karyawan) => {
  try {
    logger.debug('[HR Main Data API] Delete Database Karyawan', { id_karyawan });
    const response = await hrMainDataService.post('hrMainData', 'delete-database-karyawan', { id_karyawan });
    logger.info('[HR Main Data API] Delete Database Karyawan success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteDatabaseKaryawan', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahDatabaseKaryawan = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah Database Karyawan', { id_karyawan: payload.id_karyawan });
    const response = await hrMainDataService.post('hrMainData', 'tambah-database-karyawan', payload);
    logger.info('[HR Main Data API] Tambah Database Karyawan success');
    return response;
  } catch (error) {
    logError(error, { context: 'tambahDatabaseKaryawan', service: 'HR Main Data' });
    throw error;
  }
};

// Probation Training
export const searchProbationTraining = async (nama) => {
  try {
    logger.debug('[HR Main Data API] Search Probation Training', { nama });
    const user = hrMainDataService.getUserContext();
    const params = new URLSearchParams({ action: 'search-probation-training', nama, email: user.email });
    const response = await hrMainDataService.client.post(
      API_CONFIG.endpoints.hrgaHrMainData, params
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Karyawan tidak ditemukan');
    logger.info('[HR Main Data API] Search Probation Training success');
    return raw;
  } catch (error) {
    logError(error, { context: 'searchProbationTraining', service: 'HR Main Data' });
    throw error;
  }
};

export const saveProbationTraining = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Save Probation Training', { nama: payload.nama });
    const response = await hrMainDataService.post('hrMainData', 'save-probation-training', {
      nama: payload.nama,
      data: JSON.stringify(payload.data),
    });
    logger.info('[HR Main Data API] Save Probation Training success');
    return response;
  } catch (error) {
    logError(error, { context: 'saveProbationTraining', service: 'HR Main Data' });
    throw error;
  }
};

export const clearProbationTraining = async () => {
  try {
    logger.debug('[HR Main Data API] Clear Probation Training');
    const response = await hrMainDataService.post('hrMainData', 'clear-probation-training', {});
    logger.info('[HR Main Data API] Clear Probation Training success');
    return response;
  } catch (error) {
    logError(error, { context: 'clearProbationTraining', service: 'HR Main Data' });
    throw error;
  }
};

// Data Ticket ESO
export const getDataTicketEso = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Data Ticket ESO');
    const user = hrMainDataService.getUserContext();
    const params = new URLSearchParams({ action: 'get-data-ticket-eso', email: user.email });
    const response = await hrMainDataService.client.get(
      `${API_CONFIG.endpoints.hrgaHrMainData}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');
    logger.info('[HR Main Data API] Data Ticket ESO fetched', { count: raw.data?.length || 0 });
    return { summary: raw.summary || {}, data: raw.data || [] };
  } catch (error) {
    logError(error, { context: 'getDataTicketEso', service: 'HR Main Data' });
    throw error;
  }
};

// Database Slip Gaji
export const getDatabaseSlipGaji = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Database Slip Gaji');
    const response = await hrMainDataService.get('hrMainData', 'get-database-slip-gaji');
    logger.info('[HR Main Data API] Database Slip Gaji fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDatabaseSlipGaji', service: 'HR Main Data' });
    throw error;
  }
};

export const editDatabaseSlipGaji = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Database Slip Gaji', { id_karyawan: payload.id_karyawan });
    const response = await hrMainDataService.post('hrMainData', 'edit-database-slip-gaji', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editDatabaseSlipGaji', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahDatabaseSlipGaji = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah Database Slip Gaji');
    const response = await hrMainDataService.post('hrMainData', 'tambah-database-slip-gaji', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'tambahDatabaseSlipGaji', service: 'HR Main Data' });
    throw error;
  }
};

export const deleteDatabaseSlipGaji = async (id_karyawan) => {
  try {
    logger.debug('[HR Main Data API] Delete Database Slip Gaji', { id_karyawan });
    const response = await hrMainDataService.post('hrMainData', 'delete-database-slip-gaji', { id_karyawan });
    return response;
  } catch (error) {
    logError(error, { context: 'deleteDatabaseSlipGaji', service: 'HR Main Data' });
    throw error;
  }
};

// Onboarding
export const getOnboarding = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Onboarding');
    const user = hrMainDataService.getUserContext();
    const params = new URLSearchParams({ action: 'get-onboarding', email: user.email });
    const response = await hrMainDataService.client.get(
      `${API_CONFIG.endpoints.hrgaHrMainData}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');
    return { finished: raw.finished || [], unfinished: raw.unfinished || [] };
  } catch (error) {
    logError(error, { context: 'getOnboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const editOnboarding = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Onboarding', { unique_id: payload.unique_id });
    const response = await hrMainDataService.post('hrMainData', 'edit-onboarding', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editOnboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahOnboarding = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah Onboarding');
    const response = await hrMainDataService.post('hrMainData', 'tambah-onboarding', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'tambahOnboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const deleteOnboarding = async (unique_id) => {
  try {
    logger.debug('[HR Main Data API] Delete Onboarding', { unique_id });
    const response = await hrMainDataService.post('hrMainData', 'delete-onboarding', { unique_id });
    return response;
  } catch (error) {
    logError(error, { context: 'deleteOnboarding', service: 'HR Main Data' });
    throw error;
  }
};

// Offboarding
export const getOffboarding = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Offboarding');
    const response = await hrMainDataService.get('hrMainData', 'get-offboarding');
    return response || [];
  } catch (error) {
    logError(error, { context: 'getOffboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const editOffboarding = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Offboarding', { row: payload.row });
    const response = await hrMainDataService.post('hrMainData', 'edit-offboarding', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editOffboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahOffboarding = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah Offboarding');
    const response = await hrMainDataService.post('hrMainData', 'tambah-offboarding', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'tambahOffboarding', service: 'HR Main Data' });
    throw error;
  }
};

export const deleteOffboarding = async (row) => {
  try {
    logger.debug('[HR Main Data API] Delete Offboarding', { row });
    const response = await hrMainDataService.post('hrMainData', 'delete-offboarding', { row: String(row) });
    return response;
  } catch (error) {
    logError(error, { context: 'deleteOffboarding', service: 'HR Main Data' });
    throw error;
  }
};

// Pengajuan Cuti
export const getPengajuanCuti = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Pengajuan Cuti');
    const response = await hrMainDataService.get('hrMainData', 'get-pengajuan-cuti');
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPengajuanCuti', service: 'HR Main Data' });
    throw error;
  }
};

export const editPengajuanCuti = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Pengajuan Cuti', { row: payload.row });
    const response = await hrMainDataService.post('hrMainData', 'edit-pengajuan-cuti', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editPengajuanCuti', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahPengajuanCuti = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah Pengajuan Cuti');
    const response = await hrMainDataService.post('hrMainData', 'tambah-pengajuan-cuti', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'tambahPengajuanCuti', service: 'HR Main Data' });
    throw error;
  }
};

export const deletePengajuanCuti = async (row) => {
  try {
    logger.debug('[HR Main Data API] Delete Pengajuan Cuti', { row });
    const response = await hrMainDataService.post('hrMainData', 'delete-pengajuan-cuti', { row: String(row) });
    return response;
  } catch (error) {
    logError(error, { context: 'deletePengajuanCuti', service: 'HR Main Data' });
    throw error;
  }
};

// Pengajuan Izin
export const getPengajuanIzin = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching Pengajuan Izin');
    const response = await hrMainDataService.get('hrMainData', 'get-pengajuan-izin');
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export const editPengajuanIzin = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit Pengajuan Izin');
    const response = await hrMainDataService.post('hrMainData', 'edit-pengajuan-izin', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export const getDbPengajuanIzin = async () => {
  try {
    logger.debug('[HR Main Data API] Fetching DB Pengajuan Izin');
    const response = await hrMainDataService.get('hrMainData', 'get-db-pengajuan-izin');
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDbPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export const editDbPengajuanIzin = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Edit DB Pengajuan Izin');
    const response = await hrMainDataService.post('hrMainData', 'edit-db-pengajuan-izin', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'editDbPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export const tambahDbPengajuanIzin = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Tambah DB Pengajuan Izin');
    const response = await hrMainDataService.post('hrMainData', 'tambah-db-pengajuan-izin', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'tambahDbPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export const deleteDbPengajuanIzin = async (payload) => {
  try {
    logger.debug('[HR Main Data API] Delete DB Pengajuan Izin');
    const response = await hrMainDataService.post('hrMainData', 'delete-db-pengajuan-izin', payload);
    return response;
  } catch (error) {
    logError(error, { context: 'deleteDbPengajuanIzin', service: 'HR Main Data' });
    throw error;
  }
};

export default hrMainDataService;