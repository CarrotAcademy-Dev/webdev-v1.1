/**
 * HRGA Stock API Service
 *
 * Handles all HRGA Stock management API calls
 */

import { createApiService } from '@/services/baseApiService';
import { API_CONFIG } from '@/config/api.config';
import { logger } from '@/utils/logger';
import { logError } from '@/utils/errorHandler';

const stockService = createApiService({
  endpoints: {
    stock: API_CONFIG.endpoints.hrgaStock,
  },
  serviceName: 'HRGA Stock'
});


export const getStockData = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching Stock Data');
    const response = await stockService.get('stock', 'get-stock-data');
    logger.info('[HRGA Stock API] Stock Data fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getStockData', service: 'HRGA Stock' });
    throw error;
  }
};

export const getStockNamaBarang = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching Nama Barang');
    const response = await stockService.get('stock', 'get-stock-nama-barang');
    logger.info('[HRGA Stock API] Nama Barang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getStockNamaBarang', service: 'HRGA Stock' });
    throw error;
  }
};

export const editStockData = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Edit Stock Data', { kode_barang: payload.kode_barang });
    const response = await stockService.post('stock', 'edit-stock-data', payload);
    logger.info('[HRGA Stock API] Edit Stock Data success');
    return response;
  } catch (error) {
    logError(error, { context: 'editStockData', service: 'HRGA Stock' });
    throw error;
  }
};

export const addStockData = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Add Stock Data');
    const response = await stockService.post('stock', 'add-stock-data', payload);
    logger.info('[HRGA Stock API] Add Stock Data success');
    return response;
  } catch (error) {
    logError(error, { context: 'addStockData', service: 'HRGA Stock' });
    throw error;
  }
};


export const getStockHistory = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching Stock History');
    const response = await stockService.get('stock', 'get-stock-history');
    logger.info('[HRGA Stock API] Stock History fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getStockHistory', service: 'HRGA Stock' });
    throw error;
  }
};

export const editStockHistory = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Edit Stock History', { row: payload.row });
    const response = await stockService.post('stock', 'edit-stock-history', payload);
    logger.info('[HRGA Stock API] Edit Stock History success');
    return response;
  } catch (error) {
    logError(error, { context: 'editStockHistory', service: 'HRGA Stock' });
    throw error;
  }
};

export const addStockHistory = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Add Stock History');
    const response = await stockService.post('stock', 'add-stock-history', payload);
    logger.info('[HRGA Stock API] Add Stock History success');
    return response;
  } catch (error) {
    logError(error, { context: 'addStockHistory', service: 'HRGA Stock' });
    throw error;
  }
};


export const getMonthlyStockHistory = async (bulan, tahun) => {
  try {
    logger.debug('[HRGA Stock API] Fetching Monthly Stock History', { bulan, tahun });
    const response = await stockService.post('stock', 'get-monthly-stock-history', { bulan, tahun });
    logger.info('[HRGA Stock API] Monthly Stock History fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getMonthlyStockHistory', service: 'HRGA Stock' });
    throw error;
  }
};

export const getListBarangJual = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching List Barang Jual');
    const response = await stockService.get('stock', 'get-list-barang-jual');
    logger.info('[HRGA Stock API] List Barang Jual fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getListBarangJual', service: 'HRGA Stock' });
    throw error;
  }
};

export const editListBarangJual = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Edit List Barang Jual', { row: payload.row });
    const response = await stockService.post('stock', 'edit-list-barang-jual', payload);
    logger.info('[HRGA Stock API] Edit List Barang Jual success');
    return response;
  } catch (error) {
    logError(error, { context: 'editListBarangJual', service: 'HRGA Stock' });
    throw error;
  }
};

export const addListBarangJual = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Add List Barang Jual');
    const response = await stockService.post('stock', 'add-list-barang-jual', payload);
    logger.info('[HRGA Stock API] Add List Barang Jual success');
    return response;
  } catch (error) {
    logError(error, { context: 'addListBarangJual', service: 'HRGA Stock' });
    throw error;
  }
};

export const getKelompokBarangStock = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching Kelompok Barang');
    const response = await stockService.get('stock', 'get-kelompok-barang');
    logger.info('[HRGA Stock API] Kelompok Barang fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getKelompokBarangStock', service: 'HRGA Stock' });
    throw error;
  }
};

export const addKelompokBarangKategoriStock = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Add Kelompok Barang Kategori', { nama_kategori: payload.nama_kategori });
    const response = await stockService.post('stock', 'add-kelompok-barang-kategori', payload);
    logger.info('[HRGA Stock API] Add Kelompok Barang Kategori success');
    return response;
  } catch (error) {
    logError(error, { context: 'addKelompokBarangKategoriStock', service: 'HRGA Stock' });
    throw error;
  }
};

export const getPengkodeanStock = async () => {
  try {
    logger.debug('[HRGA Stock API] Fetching Pengkodean');
    const response = await stockService.get('stock', 'get-pengkodean');
    logger.info('[HRGA Stock API] Pengkodean fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getPengkodeanStock', service: 'HRGA Stock' });
    throw error;
  }
};

export const addPengkodeanStock = async (payload) => {
  try {
    logger.debug('[HRGA Stock API] Add Pengkodean', { deskripsi: payload.deskripsi });
    const response = await stockService.post('stock', 'add-pengkodean', payload);
    logger.info('[HRGA Stock API] Add Pengkodean success');
    return response;
  } catch (error) {
    logError(error, { context: 'addPengkodeanStock', service: 'HRGA Stock' });
    throw error;
  }
};

export default stockService;