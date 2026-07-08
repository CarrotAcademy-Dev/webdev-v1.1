/**
 * HRGA Personal API Service
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const hrgaPersonalService = createApiService({
  endpoints: {
    personal: API_CONFIG.endpoints.hrgaPersonal,
  },
  serviceName: 'HRGA Personal'
});

export const getDataFriendship = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Data Friendship');
    const response = await hrgaPersonalService.get('personal', 'get-data-friendship');
    logger.info('[HRGA Personal API] Data Friendship fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDataFriendship', service: 'HRGA Personal' });
    throw error;
  }
};

export const getInterview = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Interview');
    const response = await hrgaPersonalService.get('personal', 'get-interview');
    logger.info('[HRGA Personal API] Interview fetched');
    return response || { upcoming: [], completed: [] };
  } catch (error) {
    logError(error, { context: 'getInterview', service: 'HRGA Personal' });
    throw error;
  }
};

export const getTugasInterviewKandidat = async (namaKandidat, pic) => {
  try {
    logger.debug('[HRGA Personal API] Fetching Tugas Interview', { namaKandidat, pic });
    const response = await hrgaPersonalService.post('personal', 'get-tugas-interview', {
      nama_kandidat: namaKandidat,
      pic,
    });
    logger.info('[HRGA Personal API] Tugas Interview fetched');
    return response || null;
  } catch (error) {
    logError(error, { context: 'getTugasInterviewKandidat', service: 'HRGA Personal' });
    throw error;
  }
};

export const tambahTugasInterview = async (payload) => {
  try {
    logger.debug('[HRGA Personal API] Tambah Tugas Interview', { nama_kandidat: payload.nama_kandidat });
    const response = await hrgaPersonalService.post('personal', 'tambah-tugas-interview', {
      data: JSON.stringify(payload),
    });
    logger.info('[HRGA Personal API] Tambah Tugas Interview success');
    return response;
  } catch (error) {
    logError(error, { context: 'tambahTugasInterview', service: 'HRGA Personal' });
    throw error;
  }
};

export const getDashboardRecruitmentPersonal = async (tahun) => {
  try {
    logger.debug('[HRGA Personal API] Fetching Dashboard Recruitment', { tahun });

    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({ action: 'get-dashboard-recruitment', tahun, email: user.email });
    const response = await hrgaPersonalService.client.post(API_CONFIG.endpoints.hrgaPersonal, params);

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data dashboard');

    logger.info('[HRGA Personal API] Dashboard Recruitment fetched');
    return raw.data || { submit_test: [], interview: [], offering: [], totals: {} };
  } catch (error) {
    logError(error, { context: 'getDashboardRecruitmentPersonal', service: 'HRGA Personal' });
    throw error;
  }
};

export const getOffering = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Offering');
    const response = await hrgaPersonalService.get('personal', 'get-offering');
    logger.info('[HRGA Personal API] Offering fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getOffering', service: 'HRGA Personal' });
    throw error;
  }
};

export const editOffering = async (payload) => {
  try {
    logger.debug('[HRGA Personal API] Edit Offering', { unique_id: payload.unique_id });
    const response = await hrgaPersonalService.post('personal', 'edit-offering', {
      data: JSON.stringify(payload),
    });
    logger.info('[HRGA Personal API] Edit Offering success');
    return response;
  } catch (error) {
    logError(error, { context: 'editOffering', service: 'HRGA Personal' });
    throw error;
  }
};

export const getDataTicketingInternal = async (kodeNama) => {
  try {
    logger.debug('[HRGA Personal API] Fetching Ticketing Internal', { kodeNama });
    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({
      action: 'get-data-ticketing-internal',
      kode_nama: kodeNama,
      email: user.email,
    });
    const response = await hrgaPersonalService.client.get(
      `${API_CONFIG.endpoints.hrgaPersonal}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');
    logger.info('[HRGA Personal API] Ticketing Internal fetched', { count: raw.result?.length || 0 });
    return raw.result || [];
  } catch (error) {
    logError(error, { context: 'getDataTicketingInternal', service: 'HRGA Personal' });
    throw error;
  }
};

export const getUtilsTicketingInternal = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Utils Ticketing Internal');
    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({ action: 'get-utils-ticketing-internal', email: user.email });
    const response = await hrgaPersonalService.client.get(
      `${API_CONFIG.endpoints.hrgaPersonal}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil utils');
    logger.info('[HRGA Personal API] Utils Ticketing Internal fetched');
    return raw.result || {};
  } catch (error) {
    logError(error, { context: 'getUtilsTicketingInternal', service: 'HRGA Personal' });
    throw error;
  }
};

export const createTicketingInternal = async (payload) => {
  try {
    logger.debug('[HRGA Personal API] Create Ticketing Internal', { title: payload.title });
    const response = await hrgaPersonalService.post('personal', 'create-ticketing-internal', payload);
    logger.info('[HRGA Personal API] Create Ticketing Internal success');
    return response;
  } catch (error) {
    logError(error, { context: 'createTicketingInternal', service: 'HRGA Personal' });
    throw error;
  }
};

export const doneTicketingInternal = async (payload) => {
  try {
    logger.debug('[HRGA Personal API] Done Ticketing Internal', { id_ticket: payload.id_ticket });
    const response = await hrgaPersonalService.post('personal', 'done-ticketing-internal', payload);
    logger.info('[HRGA Personal API] Done Ticketing Internal success');
    return response;
  } catch (error) {
    logError(error, { context: 'doneTicketingInternal', service: 'HRGA Personal' });
    throw error;
  }
};

export const trackTicketFromMe = async (kodeNama) => {
  try {
    logger.debug('[HRGA Personal API] Track Ticket From Me', { kodeNama });
    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({
      action: 'track-ticket-from-me',
      kode_nama: kodeNama,
      email: user.email,
    });
    const response = await hrgaPersonalService.client.get(
      `${API_CONFIG.endpoints.hrgaPersonal}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');
    logger.info('[HRGA Personal API] Track Ticket From Me fetched', { count: raw.result?.length || 0 });
    return raw.result || [];
  } catch (error) {
    logError(error, { context: 'trackTicketFromMe', service: 'HRGA Personal' });
    throw error;
  }
};

export const getDataTicket = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Data Ticket Utils');
    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({ action: 'get-data-ticket', email: user.email });
    const response = await hrgaPersonalService.client.get(
      `${API_CONFIG.endpoints.hrgaPersonal}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');
    logger.info('[HRGA Personal API] Data Ticket Utils fetched');
    return {
      internal: raw.result_internal || {},
      external: raw.result_external || {},
    };
  } catch (error) {
    logError(error, { context: 'getDataTicket', service: 'HRGA Personal' });
    throw error;
  }
};

export const getUtilsTicketingExternal = async () => {
  try {
    logger.debug('[HRGA Personal API] Fetching Utils Ticketing External');
    const user = hrgaPersonalService.getUserContext();
    const params = new URLSearchParams({ action: 'get-utils-ticketing-external', email: user.email });
    const response = await hrgaPersonalService.client.get(
      `${API_CONFIG.endpoints.hrgaPersonal}?${params.toString()}`
    );
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil utils');
    logger.info('[HRGA Personal API] Utils Ticketing External fetched');
    return raw.result || {};
  } catch (error) {
    logError(error, { context: 'getUtilsTicketingExternal', service: 'HRGA Personal' });
    throw error;
  }
};

export const createTicketExternal = async (payload) => {
  try {
    logger.debug('[HRGA Personal API] Create Ticket External', { nama: payload.nama });
    const response = await hrgaPersonalService.post('personal', 'create-ticket-external', payload);
    logger.info('[HRGA Personal API] Create Ticket External success');
    return response;
  } catch (error) {
    logError(error, { context: 'createTicketExternal', service: 'HRGA Personal' });
    throw error;
  }
};

export default hrgaPersonalService;