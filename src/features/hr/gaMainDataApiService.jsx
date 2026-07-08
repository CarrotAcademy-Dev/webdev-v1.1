/**
 * HRGA GA Main Data API Service
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const gaService = createApiService({
  endpoints: {
    ga: API_CONFIG.endpoints.hrgaGaMainData,
  },
  serviceName: 'HRGA GA Main Data'
});

export const getPurchaseRequest = async () => {
  try {
    logger.debug('[GA API] Fetching Purchase Request');
    const response = await gaService.get('ga', 'get-purchase-request');
    logger.info('[GA API] Purchase Request fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPurchaseRequest', service: 'HRGA GA' });
    throw error;
  }
};

export const editPurchaseRequest = async (payload) => {
  try {
    logger.debug('[GA API] Edit Purchase Request', { row: payload.row });
    const response = await gaService.post('ga', 'edit-purchase-request', payload);
    logger.info('[GA API] Edit Purchase Request success');
    return response;
  } catch (error) {
    logError(error, { context: 'editPurchaseRequest', service: 'HRGA GA' });
    throw error;
  }
};

export const deletePurchaseRequest = async (row) => {
  try {
    logger.debug('[GA API] Delete Purchase Request', { row });
    const response = await gaService.post('ga', 'delete-purchase-request', { row: String(row) });
    logger.info('[GA API] Delete Purchase Request success');
    return response;
  } catch (error) {
    logError(error, { context: 'deletePurchaseRequest', service: 'HRGA GA' });
    throw error;
  }
};

export const getRepairBarang = async () => {
  try {
    logger.debug('[GA API] Fetching Repair Barang');
    const response = await gaService.get('ga', 'get-repair-barang');
    logger.info('[GA API] Repair Barang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getRepairBarang', service: 'HRGA GA' });
    throw error;
  }
};

export const editRepairBarang = async (payload) => {
  try {
    logger.debug('[GA API] Edit Repair Barang', { row: payload.row });
    const response = await gaService.post('ga', 'edit-repair-barang', payload);
    logger.info('[GA API] Edit Repair Barang success');
    return response;
  } catch (error) {
    logError(error, { context: 'editRepairBarang', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteRepairBarang = async (row) => {
  try {
    logger.debug('[GA API] Delete Repair Barang', { row });
    const response = await gaService.post('ga', 'delete-repair-barang', { row: String(row) });
    logger.info('[GA API] Delete Repair Barang success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteRepairBarang', service: 'HRGA GA' });
    throw error;
  }
};

export const getDraftKasKeluar = async () => {
  try {
    logger.debug('[GA API] Fetching Draft Kas Keluar');
    const response = await gaService.get('ga', 'get-draft-kas-keluar');
    logger.info('[GA API] Draft Kas Keluar fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDraftKasKeluar', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteDraftKasKeluar = async (row) => {
  try {
    logger.debug('[GA API] Delete Draft Kas Keluar', { row });
    const response = await gaService.post('ga', 'delete-draft-kas-keluar', { row: String(row) });
    logger.info('[GA API] Delete Draft Kas Keluar success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteDraftKasKeluar', service: 'HRGA GA' });
    throw error;
  }
};

export const getPerizinanPerpanjang = async () => {
  try {
    logger.debug('[GA API] Fetching Perizinan Perpanjang');
    const response = await gaService.get('ga', 'get-perizinan-perpanjang');
    logger.info('[GA API] Perizinan Perpanjang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPerizinanPerpanjang', service: 'HRGA GA' });
    throw error;
  }
};

// Single edit
export const editPerizinanPerpanjang = async (payload) => {
  try {
    logger.debug('[GA API] Edit Perizinan Perpanjang', { row: payload.row });
    const response = await gaService.post('ga', 'edit-perizinan-perpanjang', payload);
    logger.info('[GA API] Edit Perizinan Perpanjang success');
    return response;
  } catch (error) {
    logError(error, { context: 'editPerizinanPerpanjang', service: 'HRGA GA' });
    throw error;
  }
};

export const deletePerizinanPerpanjang = async (row) => {
  try {
    logger.debug('[GA API] Delete Perizinan Perpanjang', { row });
    const response = await gaService.post('ga', 'delete-perizinan-perpanjang', { row: String(row) });
    logger.info('[GA API] Delete Perizinan Perpanjang success');
    return response;
  } catch (error) {
    logError(error, { context: 'deletePerizinanPerpanjang', service: 'HRGA GA' });
    throw error;
  }
};

export const getTicketingPerizinan = async () => {
  try {
    logger.debug('[GA API] Fetching Ticketing Perizinan');
    const response = await gaService.get('ga', 'get-ticketing-perizinan');
    logger.info('[GA API] Ticketing Perizinan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getTicketingPerizinan', service: 'HRGA GA' });
    throw error;
  }
};

export const inputTicketingPerizinan = async (payload) => {
  try {
    logger.debug('[GA API] Input Ticketing Perizinan', { id_ticket: payload.id_ticket });
    const response = await gaService.post('ga', 'input-ticketing-perizinan', payload);
    logger.info('[GA API] Input Ticketing Perizinan success');
    return response;
  } catch (error) {
    logError(error, { context: 'inputTicketingPerizinan', service: 'HRGA GA' });
    throw error;
  }
};

export const getSearchBarang = async (keyword) => {
  try {
    logger.debug('[GA API] Search Barang', { keyword });
    const response = await gaService.get('ga', 'get-search-barang', { keyword });
    logger.info('[GA API] Search Barang done');
    return response || [];
  } catch (error) {
    logError(error, { context: 'getSearchBarang', service: 'HRGA GA' });
    throw error;
  }
};

export const getMasterVendor = async () => {
  try {
    logger.debug('[GA API] Fetching Master Vendor');
    const response = await gaService.get('ga', 'get-master-vendor');
    logger.info('[GA API] Master Vendor fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const editMasterVendor = async (payload) => {
  try {
    logger.debug('[GA API] Edit Master Vendor', { id: payload.id });
    const response = await gaService.post('ga', 'edit-master-vendor', payload);
    logger.info('[GA API] Edit Master Vendor success');
    return response;
  } catch (error) {
    logError(error, { context: 'editMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const getInputMasterVendor = async () => {
  try {
    logger.debug('[GA API] Fetching Input Master Vendor');
    const response = await gaService.get('ga', 'get-input-master-vendor');
    logger.info('[GA API] Input Master Vendor fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getInputMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const tambahInputMasterVendor = async (payload) => {
  try {
    logger.debug('[GA API] Tambah Input Master Vendor', { nama_vendor: payload.nama_vendor });
    const response = await gaService.post('ga', 'tambah-input-master-vendor', payload);
    logger.info('[GA API] Tambah Input Master Vendor success');
    return response;
  } catch (error) {
    logError(error, { context: 'tambahInputMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const editInputMasterVendor = async (payload) => {
  try {
    logger.debug('[GA API] Edit Input Master Vendor', { id: payload.id });
    const response = await gaService.post('ga', 'edit-input-master-vendor', payload);
    logger.info('[GA API] Edit Input Master Vendor success');
    return response;
  } catch (error) {
    logError(error, { context: 'editInputMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteInputMasterVendor = async (id) => {
  try {
    logger.debug('[GA API] Delete Input Master Vendor', { id });
    const response = await gaService.post('ga', 'delete-input-master-vendor', { id: String(id) });
    logger.info('[GA API] Delete Input Master Vendor success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteInputMasterVendor', service: 'HRGA GA' });
    throw error;
  }
};

export const getTagihan = async () => {
  try {
    logger.debug('[GA API] Fetching Tagihan');
    const response = await gaService.get('ga', 'get-tagihan');
    logger.info('[GA API] Tagihan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getTagihan', service: 'HRGA GA' });
    throw error;
  }
};

// Single edit
export const editTagihan = async (payload) => {
  try {
    logger.debug('[GA API] Edit Tagihan', { row: payload.row });
    const response = await gaService.post('ga', 'edit-tagihan', payload);
    logger.info('[GA API] Edit Tagihan success');
    return response;
  } catch (error) {
    logError(error, { context: 'editTagihan', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteTagihan = async (row) => {
  try {
    logger.debug('[GA API] Delete Tagihan', { row });
    const response = await gaService.post('ga', 'delete-tagihan', { row: String(row) });
    logger.info('[GA API] Delete Tagihan success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteTagihan', service: 'HRGA GA' });
    throw error;
  }
};

export const getJenisMerchandise = async () => {
  try {
    logger.debug('[GA API] Fetching Jenis Merchandise');

    const user = gaService.getUserContext();
    const params = new URLSearchParams({ action: 'get-jenis-merchandise', email: user.email });
    const response = await gaService.client.get(`${API_CONFIG.endpoints.hrgaGaMainData}?${params.toString()}`);
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[GA API] Jenis Merchandise fetched');
    return { jenis_paket: raw.jenis_paket || [], detail_paket: raw.detail_paket || {} };
  } catch (error) {
    logError(error, { context: 'getJenisMerchandise', service: 'HRGA GA' });
    throw error;
  }
};

export const editJenisMerchandise = async (payload) => {
  try {
    logger.debug('[GA API] Edit Jenis Merchandise', { kolom: payload.kolom });
    // items harus dikirim sebagai JSON string
    const response = await gaService.post('ga', 'edit-jenis-merchandise', {
      kolom: payload.kolom,
      items: JSON.stringify(payload.items),
    });
    logger.info('[GA API] Edit Jenis Merchandise success');
    return response;
  } catch (error) {
    logError(error, { context: 'editJenisMerchandise', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteJenisMerchandise = async (payload) => {
  try {
    logger.debug('[GA API] Delete Jenis Merchandise', { kolom: payload.kolom });
    const response = await gaService.post('ga', 'delete-jenis-merchandise', payload);
    logger.info('[GA API] Delete Jenis Merchandise success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteJenisMerchandise', service: 'HRGA GA' });
    throw error;
  }
};

export const getJenisMap = async () => {
  try {
    logger.debug('[GA API] Fetching Jenis Map');

    const user = gaService.getUserContext();
    const params = new URLSearchParams({ action: 'get-jenis-map', email: user.email });
    const response = await gaService.client.get(`${API_CONFIG.endpoints.hrgaGaMainData}?${params.toString()}`);
    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data');

    logger.info('[GA API] Jenis Map fetched');
    return { jenis_paket: raw.jenis_paket || [], detail_paket: raw.detail_paket || {} };
  } catch (error) {
    logError(error, { context: 'getJenisMap', service: 'HRGA GA' });
    throw error;
  }
};

export const editJenisMap = async (payload) => {
  try {
    logger.debug('[GA API] Edit Jenis Map', { kolom: payload.kolom });
    const response = await gaService.post('ga', 'edit-jenis-map', {
      kolom: payload.kolom,
      items: JSON.stringify(payload.items),
    });
    logger.info('[GA API] Edit Jenis Map success');
    return response;
  } catch (error) {
    logError(error, { context: 'editJenisMap', service: 'HRGA GA' });
    throw error;
  }
};

export const deleteJenisMap = async (payload) => {
  try {
    logger.debug('[GA API] Delete Jenis Map', { kolom: payload.kolom });
    const response = await gaService.post('ga', 'delete-jenis-map', payload);
    logger.info('[GA API] Delete Jenis Map success');
    return response;
  } catch (error) {
    logError(error, { context: 'deleteJenisMap', service: 'HRGA GA' });
    throw error;
  }
};

export default gaService;