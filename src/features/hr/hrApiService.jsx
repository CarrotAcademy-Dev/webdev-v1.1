/**
 * HR API Service
 * 
 * Handles all HR/HRGA division API calls
 * Uses baseApiService factory for standardized patterns
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const hrService = createApiService({
  endpoints: {
    recruitment: API_CONFIG.endpoints.hrRecruitment,
  },
  serviceName: 'HR'
});

/**
 * Get Dashboard Report Recruitment
 * Endpoint: POST action=get-data-dbreport
 * @param {string} year - Tahun yang dipilih
 */
export const getDashboardReportHR = async (year) => {
  try {
    logger.debug('[HR API] Fetching Dashboard Report', { year });

    // Bypass validateResponse karena response punya multiple keys
    // (dataScreening, dataInterview) bukan standard result/data
    const user = hrService.getUserContext();
    const params = new URLSearchParams({
      action: 'get-data-dbreport',
      year,
      email: user.email,
    });

    const response = await hrService.client.post(
      API_CONFIG.endpoints.hrRecruitment,
      params
    );

    const raw = response.data;
    if (raw.status === 'failed') throw new Error(raw.message || 'Gagal mengambil data');
    if (raw.status !== 'success') throw new Error('Response tidak dikenali');

    logger.info('[HR API] Dashboard Report fetched', {
      screening: raw.dataScreening?.length || 0,
      interview: raw.dataInterview?.length || 0,
    });

    return {
      dataScreening: raw.dataScreening || [],
      dataInterview: raw.dataInterview || [],
    };
  } catch (error) {
    logError(error, { context: 'getDashboardReportHR', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get Jam Kerja
 * Endpoint: GET action=get-jam-kerja
 * Response: { status, data } — bukan result, jadi bypass validateResponse
 */
export const getJamKerja = async () => {
  try {
    logger.debug('[HR API] Fetching Jam Kerja');

    const user = hrService.getUserContext();
    const params = new URLSearchParams({ action: 'get-jam-kerja', email: user.email });
    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] Jam Kerja fetched', { count: raw.data?.length || 0 });
    return raw.data || [];
  } catch (error) {
    logError(error, { context: 'getJamKerja', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Add Jam Kerja
 * Endpoint: POST action=add-jam-kerja
 */
export const addJamKerja = async (formData) => {
  try {
    logger.debug('[HR API] Add Jam Kerja', { divisi: formData.divisi });
    const payload = {
      divisi: formData.divisi || '',
      jam_masuk: formData.jam_masuk || '',
      jam_keluar: formData.jam_keluar || '',
      shift: formData.shift || '',
    };
    const response = await hrService.post('recruitment', 'add-jam-kerja', payload);
    logger.info('[HR API] Add Jam Kerja success');
    return response;
  } catch (error) {
    logError(error, { context: 'addJamKerja', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Edit Jam Kerja
 * Endpoint: POST action=edit-jam-kerja
 */
export const editJamKerja = async (formData) => {
  try {
    logger.debug('[HR API] Edit Jam Kerja', { uniqueId: formData.uniqueId });
    const payload = {
      divisi: formData.divisi || '',
      jam_masuk: formData.jam_masuk || '',
      jam_keluar: formData.jam_keluar || '',
      shift: formData.shift || '',
      uniqueId: formData.uniqueId || '',
    };
    const response = await hrService.post('recruitment', 'edit-jam-kerja', payload);
    logger.info('[HR API] Edit Jam Kerja success');
    return response;
  } catch (error) {
    logError(error, { context: 'editJamKerja', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get Tugas Interview
 * Endpoint: GET action=get-tugas-interview
 */
export const getTugasInterview = async () => {
  try {
    logger.debug('[HR API] Fetching Tugas Interview');

    const user = hrService.getUserContext();
    const params = new URLSearchParams({ action: 'get-tugas-interview', email: user.email });
    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] Tugas Interview fetched', { count: raw.data?.length || 0 });
    return raw.data || [];
  } catch (error) {
    logError(error, { context: 'getTugasInterview', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Add Tugas Interview
 * Endpoint: POST action=add-tugas-interview
 */
export const addTugasInterview = async (formData) => {
  try {
    logger.debug('[HR API] Add Tugas Interview', { posisi: formData.posisi });
    const payload = {
      posisi: formData.posisi || '',
      nama_tugas: formData.nama_tugas || '',
      deskripsi_tugas: formData.deskripsi_tugas || '',
      submit_soal: formData.submit_soal || '',
    };
    const response = await hrService.post('recruitment', 'add-tugas-interview', payload);
    logger.info('[HR API] Add Tugas Interview success');
    return response;
  } catch (error) {
    logError(error, { context: 'addTugasInterview', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Edit Tugas Interview
 * Endpoint: POST action=edit-tugas-interview
 */
export const editTugasInterview = async (formData) => {
  try {
    logger.debug('[HR API] Edit Tugas Interview', { uniqueId: formData.uniqueId });
    const payload = {
      posisi: formData.posisi || '',
      nama_tugas: formData.nama_tugas || '',
      deskripsi_tugas: formData.deskripsi_tugas || '',
      submit_soal: formData.submit_soal || '',
      uniqueId: formData.uniqueId || '',
    };
    const response = await hrService.post('recruitment', 'edit-tugas-interview', payload);
    logger.info('[HR API] Edit Tugas Interview success');
    return response;
  } catch (error) {
    logError(error, { context: 'editTugasInterview', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get Hasil Interview by posisi
 * Endpoint: GET action=get-hasil-interview&action={posisi}
 * Note: Backend pakai e.parameter.action untuk routing posisi juga
 */
export const getHasilInterview = async (posisi) => {
  try {
    logger.debug('[HR API] Fetching Hasil Interview', { posisi });

    const user = hrService.getUserContext();
    // Backend routing: action=get-hasil-interview, tapi posisi juga pakai param action
    // Sesuai doGet: if (action === 'get-hasil-interview') { return hasilTestMap[position]?.() }
    // dan const position = e.parameter.action — ini bug di backend, tapi ikuti aja
    const params = new URLSearchParams({
      action: 'get-hasil-interview',
      position: posisi,
      email: user.email,
    });

    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] Hasil Interview fetched', { posisi, count: raw.data?.length || 0 });
    return raw.data || [];
  } catch (error) {
    logError(error, { context: 'getHasilInterview', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get Applicant Data
 * Endpoint: GET action=get-applicant-data
 */
export const getApplicantData = async () => {
  try {
    logger.debug('[HR API] Fetching Applicant Data');

    const user = hrService.getUserContext();
    const params = new URLSearchParams({ action: 'get-applicant-data', email: user.email });
    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] Applicant Data fetched', { count: raw.data?.length || 0 });
    return raw.data || [];
  } catch (error) {
    logError(error, { context: 'getApplicantData', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Edit Applicant Data
 * Endpoint: POST action=edit-applicant-data
 * @param {Object} payload - { name, position, ...fieldsToUpdate }
 */
export const editApplicantData = async (payload) => {
  try {
    logger.debug('[HR API] Edit Applicant Data', { name: payload.name, position: payload.position });
    const response = await hrService.post('recruitment', 'edit-applicant-data', payload);
    logger.info('[HR API] Edit Applicant Data success', { name: payload.name });
    return response;
  } catch (error) {
    logError(error, { context: 'editApplicantData', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get HR Request Data
 * Endpoint: GET action=get-data-hr-request
 */
export const getDataHRRequest = async () => {
  try {
    logger.debug('[HR API] Fetching HR Request Data');

    const user = hrService.getUserContext();
    const params = new URLSearchParams({ action: 'get-data-hr-request', email: user.email });
    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] HR Request fetched', {
      open: raw.dataOpen?.length || 0,
      close: raw.dataClose?.length || 0,
    });

    return {
      dataOpen: raw.dataOpen || [],
      dataClose: raw.dataClose || [],
    };
  } catch (error) {
    logError(error, { context: 'getDataHRRequest', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Edit Status HR Request
 * Endpoint: POST action=edit-status-hrr
 * @param {{ id: string, status: 'OPENED' | 'CLOSED' }} payload
 */
export const editStatusHRRequest = async (payload) => {
  try {
    logger.debug('[HR API] Edit Status HR Request', { id: payload.id, status: payload.status });
    const response = await hrService.post('recruitment', 'edit-status-hrr', {
      id: payload.id,
      status: payload.status,
    });
    logger.info('[HR API] Edit Status HR Request success', { id: payload.id });
    return response;
  } catch (error) {
    logError(error, { context: 'editStatusHRRequest', service: 'HR Recruitment' });
    throw error;
  }
};

/**
 * Get Penilaian Kandidat
 * Endpoint: GET action=get-penilaian-kandidat
 */
export const getPenilaianKandidat = async () => {
  try {
    logger.debug('[HR API] Fetching Penilaian Kandidat');

    const user = hrService.getUserContext();
    const params = new URLSearchParams({ action: 'get-penilaian-kandidat', email: user.email});
    const response = await hrService.client.get(
      `${API_CONFIG.endpoints.hrRecruitment}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[HR API] Penilaian Kandidat fetched', { count: raw.data?.length || 0});
    return raw.data || [];
  } catch (error) {
    logError(error, { context: 'getPenilaianKandidat', service: 'HR Recruitment'});
    throw error;
  }
}

export default hrService;