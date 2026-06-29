/**
 * HRGA Asset API Service
 * 
 * Handles all HRGA Asset management API calls
 * Uses baseApiService factory for standardized patterns
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const assetService = createApiService({
  endpoints: {
    asset: API_CONFIG.endpoints.hrgaAsset,
  },
  serviceName: 'HRGA Asset'
});

/**
 * Get Data Asset
 * Endpoint: GET action=get-asset-data
 */
export const getAssetData = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Asset Data');
    const response = await assetService.get('asset', 'get-asset-data');
    logger.info('[HRGA Asset API] Asset Data fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getAssetData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Edit Data Asset (Dinamis)
 * Endpoint: POST action=edit-asset-data
 * @param {Object} payload - { kode_barang, ...fieldsToUpdate }
 */
export const editAssetData = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Edit Asset Data', { kode_barang: payload.kode_barang });
    const response = await assetService.post('asset', 'edit-asset-data', payload);
    logger.info('[HRGA Asset API] Edit Asset Data success', { kode_barang: payload.kode_barang });
    return response;
  } catch (error) {
    logError(error, { context: 'editAssetData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Dashboard Data
 * Endpoint: GET action=get-dashboard-data
 * Response: { status, data: { reminder_service, asset_habis_pakai, reminder_maintenance, jumlah_reminder_service, jumlah_asset_habis_pakai } }
 */
export const getDashboardData = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Dashboard Data');

    const user = assetService.getUserContext();
    const params = new URLSearchParams({ action: 'get-dashboard-data', email: user.email });
    const response = await assetService.client.get(
      `${API_CONFIG.endpoints.hrgaAsset}?${params.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') throw new Error(raw.message || 'Gagal mengambil data dashboard');

    logger.info('[HRGA Asset API] Dashboard Data fetched');
    return raw.data || {};
  } catch (error) {
    logError(error, { context: 'getDashboardData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Daily Asset
 * Endpoint: POST action=get-daily-asset
 * @param {string} date - Tanggal yang dipilih (format sesuai sheet, biasanya DD/MM/YYYY)
 */
export const getDailyAsset = async (date) => {
  try {
    logger.debug('[HRGA Asset API] Fetching Daily Asset', { date });
    const response = await assetService.post('asset', 'get-daily-asset', { date });
    logger.info('[HRGA Asset API] Daily Asset fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDailyAsset', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Penyusutan
 * Endpoint: POST action=get-data-penyusutan
 * @param {string} bulan - WAJIB bahasa Inggris (January, February, dst)
 * @param {string} tahun
 */
export const getDataPenyusutan = async (bulan, tahun) => {
  try {
    logger.debug('[HRGA Asset API] Fetching Data Penyusutan', { bulan, tahun });
    const response = await assetService.post('asset', 'get-data-penyusutan', { bulan, tahun });
    logger.info('[HRGA Asset API] Data Penyusutan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDataPenyusutan', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Edit Keterangan Penyusutan
 * Endpoint: POST action=edit-penyusutan-barang
 * @param {{ kode_barang: string, keterangan: string }} payload
 */
export const editPenyusutanBarang = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Edit Penyusutan', { kode_barang: payload.kode_barang });
    const response = await assetService.post('asset', 'edit-penyusutan-barang', payload);
    logger.info('[HRGA Asset API] Edit Penyusutan success', { kode_barang: payload.kode_barang });
    return response;
  } catch (error) {
    logError(error, { context: 'editPenyusutanBarang', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Services
 * Endpoint: GET action=get-services
 */
export const getServicesData = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Services Data');
    const response = await assetService.get('asset', 'get-services');
    logger.info('[HRGA Asset API] Services Data fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getServicesData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Edit Data Services
 * Endpoint: POST action=edit-services-data
 * @param {{ nama_barang: string, status?: string, send_to_bkk?: 'TRUE'|'FALSE' }} payload
 */
export const editServicesData = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Edit Services Data', { nama_barang: payload.nama_barang });
    const response = await assetService.post('asset', 'edit-services-data', payload);
    logger.info('[HRGA Asset API] Edit Services Data success', { nama_barang: payload.nama_barang });
    return response;
  } catch (error) {
    logError(error, { context: 'editServicesData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Maintenance
 * Endpoint: GET action=get-maintenance
 */
export const getMaintenanceData = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Maintenance Data');
    const response = await assetService.get('asset', 'get-maintenance');
    logger.info('[HRGA Asset API] Maintenance Data fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getMaintenanceData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Edit Data Maintenance (Dinamis)
 * Endpoint: POST action=edit-maintenance-data
 * @param {Object} payload - { kode_barang, ...fieldsToUpdate }
 */
export const editMaintenanceData = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Edit Maintenance Data', { kode_barang: payload.kode_barang });
    const response = await assetService.post('asset', 'edit-maintenance-data', payload);
    logger.info('[HRGA Asset API] Edit Maintenance Data success', { kode_barang: payload.kode_barang });
    return response;
  } catch (error) {
    logError(error, { context: 'editMaintenanceData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Tambah Data Maintenance
 * Endpoint: POST action=add-maintenance-data
 * @param {Object} payload - { kode_barang, nama_barang, tanggal_mulai, tanggal_selesai, durasi, status_pemeliharaan, catatan }
 */
export const addMaintenanceData = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Add Maintenance Data', { kode_barang: payload.kode_barang });
    const response = await assetService.post('asset', 'add-maintenance-data', payload);
    logger.info('[HRGA Asset API] Add Maintenance Data success', { kode_barang: payload.kode_barang });
    return response;
  } catch (error) {
    logError(error, { context: 'addMaintenanceData', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Peminjaman Barang
 * Endpoint: GET action=get-peminjaman-barang
 */
export const getPeminjamanBarang = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Peminjaman Barang');
    const response = await assetService.get('asset', 'get-peminjaman-barang');
    logger.info('[HRGA Asset API] Peminjaman Barang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPeminjamanBarang', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Edit Peminjaman Barang (Rusak)
 * Endpoint: POST action=edit-peminjaman-barang
 * @param {{ index_peminjaman: string, rusak: 'Pribadi' | 'Pekerjaan' }} payload
 */
export const editPeminjamanBarang = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Edit Peminjaman Barang', { index_peminjaman: payload.index_peminjaman });
    const response = await assetService.post('asset', 'edit-peminjaman-barang', payload);
    logger.info('[HRGA Asset API] Edit Peminjaman Barang success', { index_peminjaman: payload.index_peminjaman });
    return response;
  } catch (error) {
    logError(error, { context: 'editPeminjamanBarang', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Detail Barang
 * Endpoint: POST action=get-detail-barang
 * @param {string} namaBarang
 * Response: { status, data: { nama_barang, kode_barang, sisa_stock, sisa_umur_manfaat, lokasi_barang, tanggal_instalasi, history_services } }
 */
export const getDetailBarang = async (namaBarang) => {
  try {
    logger.debug('[HRGA Asset API] Fetching Detail Barang', { namaBarang });

    const user = assetService.getUserContext();
    const params = new URLSearchParams({
      action: 'get-detail-barang',
      nama_barang: namaBarang,
      email: user.email,
    });

    const response = await assetService.client.post(API_CONFIG.endpoints.hrgaAsset, params);
    const raw = response.data;

    if (raw.status === 'failed') throw new Error(raw.message || 'Barang tidak ditemukan');
    if (raw.status !== 'success') throw new Error('Response tidak dikenali');

    logger.info('[HRGA Asset API] Detail Barang fetched', { namaBarang });
    return raw.data || null;
  } catch (error) {
    logError(error, { context: 'getDetailBarang', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Asset History
 * Endpoint: GET action=get-asset-history
 */
export const getAssetHistory = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Asset History');
    const response = await assetService.get('asset', 'get-asset-history');
    logger.info('[HRGA Asset API] Asset History fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getAssetHistory', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Kelompok Barang
 * Endpoint: GET action=get-kelompok-barang
 * Response: { status, data: [{ kode_kategori, nama_kategori, items: [{ no, nama_barang }] }] }
 */
export const getKelompokBarang = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Kelompok Barang');
    const response = await assetService.get('asset', 'get-kelompok-barang');
    logger.info('[HRGA Asset API] Kelompok Barang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getKelompokBarang', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Tambah Kategori Kelompok Barang
 * Endpoint: POST action=add-kelompok-barang-kategori
 * @param {{ nama_kategori: string, items: string }} payload
 * items dikirim sebagai daftar nama barang dipisah newline
 */
export const addKelompokBarangKategori = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Add Kelompok Barang Kategori', { nama_kategori: payload.nama_kategori });
    const response = await assetService.post('asset', 'add-kelompok-barang-kategori', payload);
    logger.info('[HRGA Asset API] Add Kelompok Barang Kategori success');
    return response;
  } catch (error) {
    logError(error, { context: 'addKelompokBarangKategori', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Get Data Pengkodean
 * Endpoint: GET action=get-pengkodean
 * Response: { status, data: [{ deskripsi, kode_header, items: [{ nama, kode }] }] }
 */
export const getPengkodean = async () => {
  try {
    logger.debug('[HRGA Asset API] Fetching Pengkodean');
    const response = await assetService.get('asset', 'get-pengkodean');
    logger.info('[HRGA Asset API] Pengkodean fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPengkodean', service: 'HRGA Asset' });
    throw error;
  }
};

/**
 * Tambah Data Pengkodean
 * Endpoint: POST action=add-pengkodean
 * @param {{ deskripsi: string, nama: string, kode?: string }} payload
 */
export const addPengkodean = async (payload) => {
  try {
    logger.debug('[HRGA Asset API] Add Pengkodean', { deskripsi: payload.deskripsi, nama: payload.nama });
    const response = await assetService.post('asset', 'add-pengkodean', payload);
    logger.info('[HRGA Asset API] Add Pengkodean success');
    return response;
  } catch (error) {
    logError(error, { context: 'addPengkodean', service: 'HRGA Asset' });
    throw error;
  }
};

export default assetService;