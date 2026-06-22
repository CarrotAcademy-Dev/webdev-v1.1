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
 * Update Pendaftaran Full-Time Course
 * Endpoint: POST action=update-pendaftaran-fd
 * @param {Object} formData - { nama_siswa, angkatan, tahun, nomor, nomor_faktur }
 */
export const updatePendaftaranFullTime = async (formData) => {
  try {
    logger.debug('[Finance API] Update Pendaftaran Full-Time', { nama: formData.nama_siswa });
    const payload = {
      nama_siswa: formData.nama_siswa || '',
      angkatan: formData.angkatan || '',
      tahun: formData.tahun || '',
      nomor: formData.nomor || '',
      nomor_faktur: formData.nomor_faktur || '',
    };
    const response = await financeService.post('bersama', 'update-pendaftaran-fd', payload);
    logger.info('[Finance API] Update Pendaftaran Full-Time success', { nama: formData.nama_siswa });
    return response;
  } catch (error) {
    logError(error, { context: 'updatePendaftaranFullTime', service: 'Finance Bersama' });
    throw error;
  }
};

/**
 * Get Data Daftar Offboarding
 * Endpoint: GET action=data-daftar-offboarding
 * 
 * @returns {Promise<Array>} List of offboarding records
 */
export const getDataOffboardingFinance = async () => {
  try {
    logger.debug('[Finance API] Fetching Data Offboarding');
    
    const response = await financeService.get('bersama', 'data-daftar-offboarding');
    
    logger.info('[Finance API] Data Offboarding fetched', {
      count: response?.length || 0
    });
    
    return response || [];
  } catch (error) {
    logError(error, { 
      context: 'getDataOffboarding',
      service: 'Finance Bersama'
    });
    throw error;
  }
};

/**
 * Ceklis Daftar Offboarding
 * @param {Object} formData - Full form data dari component
 */
export const ceklisDaftarOffboardingFinance = async (formData) => {
  try {
    logger.debug('[Finance API] Ceklis Daftar Offboarding', { id: formData.id_offboarding });
    
    // DATA TRANSFORMATION (MAPPING PAYLOAD)
    // Sesuaikan key dan tipe data dengan ekspektasi Backend (e.parameter)
    const payload = {
      id_ticket: formData.id_offboarding, // Fix mismatch ID
      program: formData.program || "",
      modul: formData.modul || "",
      level: formData.level || "",
      keterangan: formData.keterangan || "",
      keterangan_detail: formData.keterangan_detail || "",
      // Cast boolean ke string uppercase biar aman di-parse sama backend
      sudah_ubah_tagihan: formData.sudah_ubah_tagihan ? "TRUE" : "FALSE",
      sudah_memberi_tagihan: formData.sudah_memberi_tagihan ? "TRUE" : "FALSE",
      sudah_lunas: formData.sudah_lunas ? "TRUE" : "FALSE",
    };

    // Pastikan baseApiService / financeService lo support URL-encoded/FormData
    // Karena GAS e.parameter BUKAN nerima raw JSON.
    const response = await financeService.post('bersama', 'ceklis-daftar-offboarding', payload);
    
    logger.info('[Finance API] Ceklis Daftar Offboarding success', { id: formData.id_offboarding });
    
    return response;
  } catch (error) {
    logError(error, { 
      context: 'ceklisDaftarOffboarding',
      service: 'Finance Bersama',
      payload: formData
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

/**
 * Get Daftar Kirim Merchandise
 * Endpoint: GET action=get-daftar-kirim-merchandise
 */
export const getDaftarKirimMerchandise = async () => {
  try {
    logger.debug('[Finance API] Fetching Daftar Kirim Merchandise');
    const response = await financeService.get('bersama', 'get-daftar-kirim-merchandise');
    logger.info('[Finance API] Daftar Kirim Merchandise fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDaftarKirimMerchandise', service: 'Finance Bersama' });
    throw error;
  }
};

/**
 * Update Biaya Pengiriman Merchandise
 * Endpoint: POST action=update-biaya-pengiriman-merch
 * @param {Object} formData - { nis_siswa, biaya_pengiriman }
 */
export const updateBiayaPengirimanMerch = async (formData) => {
  try {
    logger.debug('[Finance API] Updating Biaya Pengiriman Merch', { nis: formData.nis_siswa });
    const payload = {
      nis_siswa: formData.nis_siswa || "",
      biaya_pengiriman: formData.biaya_pengiriman || "",
    };
    const response = await financeService.post('bersama', 'update-biaya-pengiriman-merch', payload);
    logger.info('[Finance API] Update Biaya Pengiriman success', { nis: formData.nis_siswa });
    return response;
  } catch (error) {
    logError(error, { context: 'updateBiayaPengirimanMerch', service: 'Finance Bersama' });
    throw error;
  }
};

/**
 * Get Data Ticketing External Finance
 * Endpoint: GET action=data-ticket-external
 */
export const getDataTicketExternalFinance = async () => {
  try {
    logger.debug('[Finance API] Fetching Ticketing External');
    const response = await financeService.get('bersama', 'data-ticket-external');
    logger.info('[Finance API] Ticketing External fetched', { count: response?.length || 0 });

    const data = response || [];
    // Split open/close di sini, konsisten dengan ESO
    return {
      dataOpen: data.filter(item => item.status?.toLowerCase() !== 'close' && item.done_ceklis !== 'TRUE'),
      dataClose: data.filter(item => item.status?.toLowerCase() === 'close' || item.done_ceklis === 'TRUE'),
    };
  } catch (error) {
    logError(error, { context: 'getDataTicketExternalFinance', service: 'Finance Bersama' });
    throw error;
  }
};

/**
 * Done Ticket External Finance
 * Endpoint: POST action=done-ticketexternal
 */
export const doneTicketExternalFinance = async (data) => {
  try {
    logger.debug('[Finance API] Done Ticket External', { id_ticket: data.id_ticket });
    const payload = {
      id_ticket: data.id_ticket || '',
      result: data.result || '',
    };
    const response = await financeService.post('bersama', 'done-ticketexternal', payload);
    logger.info('[Finance API] Done Ticket External success', { id_ticket: data.id_ticket });
    return response;
  } catch (error) {
    logError(error, { context: 'doneTicketExternalFinance', service: 'Finance Bersama' });
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
 * Search Profil Siswa (Finance Personal)
 * Endpoint: POST action=search-profile-siswa
 */
export const searchProfilSiswaFinance = async (nama) => {
  try {
    logger.debug('[Finance API] Search Profil Siswa', { nama });

    const user = financeService.getUserContext();
    const endpoint = API_CONFIG.endpoints.financePersonal;
    const params = new URLSearchParams({ action: 'search-profile-siswa', nama, email: user.email });

    // Bypass validateResponse karena response punya multiple keys (result, finished_course, active_course)
    const response = await financeService.client.post(endpoint, params);
    const raw = response.data;

    if (raw.status === 'failed') throw new Error(raw.message || 'Data tidak ditemukan');
    if (raw.status !== 'success') throw new Error('Response tidak dikenali');

    logger.info('[Finance API] Search Profil Siswa success', { nama });
    return {
      result: raw.result?.[0] || null,
      finished_course: raw.finished_course || [],
      active_course: raw.active_course || [],
    };
  } catch (error) {
    logError(error, { context: 'searchProfilSiswaFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Submit / Update Profil Siswa (Finance Personal)
 * Endpoint: POST action=submit-profile-siswa
 */
export const submitProfilSiswaFinance = async (formData) => {
  try {
    const user = financeService.getUserContext();
    logger.debug('[Finance API] Submit Profil Siswa', { nis: formData.nis });

    const payload = { ...formData, pic: user.codeName };
    const response = await financeService.post('personal', 'submit-profile-siswa', payload);

    logger.info('[Finance API] Submit Profil Siswa success', { nis: formData.nis });
    return response;
  } catch (error) {
    logError(error, { context: 'submitProfilSiswaFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Get Statistik Tagihan (Finance Personal)
 * Endpoint: GET action=get-statistik-tagihan
 */
export const getStatistikTagihan = async () => {
  try {
    logger.debug('[Finance API] Fetching Statistik Tagihan');
    const response = await financeService.get('personal', 'get-statistik-tagihan');
    logger.info('[Finance API] Statistik Tagihan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getStatistikTagihan', service: 'Finance Personal' });
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

/**
 * Get Dashboard Pendapatan (Finance Personal)
 * Endpoint: POST action=get-dashboard-pendapatan
 * @param {string} tahun - Tahun yang dipilih
 */
export const getDashboardPendapatan = async (tahun) => {
  try {
    logger.debug('[Finance API] Fetching Dashboard Pendapatan', { tahun });
    const response = await financeService.post('personal', 'get-dashboard-pendapatan', { tahun });
    logger.info('[Finance API] Dashboard Pendapatan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDashboardPendapatan', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Get Daftar Harga (Finance Personal)
 * Endpoint: GET action=get-daftar-harga
 * Response: { status, data_product, data_discount }
 */
export const getDaftarHargaPersonal = async () => {
  try {
    logger.debug('[Finance API] Fetching Daftar Harga Personal');

    // Bypass validateResponse karena format response beda (bukan result/data key)
    const user = financeService.getUserContext();
    const queryParams = new URLSearchParams({ action: 'get-daftar-harga', email: user.email });
    
    const response = await financeService.client.get(
      `${API_CONFIG.endpoints.financePersonal}?${queryParams.toString()}`
    );

    const raw = response.data;
    if (raw.status !== 'success') {
      throw new Error(raw.message || 'Gagal mengambil data daftar harga');
    }

    logger.info('[Finance API] Daftar Harga Personal fetched', {
      product: raw.data_product?.length || 0,
      discount: raw.data_discount?.length || 0,
    });

    return {
      data_product: raw.data_product || [],
      data_discount: raw.data_discount || [],
    };
  } catch (error) {
    logError(error, { context: 'getDaftarHargaPersonal', service: 'Finance Personal' });
    throw error;
  }
};

export const getTrackTicketFromMeFinance = async () => {
  try {
    const user = financeService.getUserContext();
    const kode_nama = user.codeName;

    if (!kode_nama) throw new Error('User code name tidak ditemukan. Silakan login ulang.');

    logger.debug('[Finance API] Fetching Track Ticket From Me', { kode_nama });

    // POST bukan GET karena ada di doPost di GAS personal
    const response = await financeService.post('personal', 'track-ticket-fme', { kode_nama });

    logger.info('[Finance API] Track Ticket From Me fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getTrackTicketFromMeFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Get Ticketing Internal Finance
 * Endpoint: GET action=get-ticketing-internal
 */
export const getDataTicketInternalFinance = async () => {
  try {
    logger.debug('[Finance API] Fetching Ticketing Internal');
    const response = await financeService.get('personal', 'get-ticketing-internal');
    logger.info('[Finance API] Ticketing Internal fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getDataTicketInternalFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Create Ticketing Internal Finance
 * Endpoint: POST action=create-ticketing-internal
 */
export const createTicketingInternalFinance = async (formData) => {
  try {
    const user = financeService.getUserContext();
    logger.debug('[Finance API] Create Ticketing Internal', { title: formData.title });

    const payload = {
      person: user.codeName,
      title: formData.title || '',
      description: formData.description || '',
      deadline: formData.deadline || '',
      label: formData.label || '',
      responsible: formData.responsible || '',
      accountable: formData.accountable || '',
      consulted: formData.consulted || '',
      informed: formData.informed || '',
    };

    const response = await financeService.post('personal', 'create-ticketing-internal', payload);
    logger.info('[Finance API] Create Ticketing Internal success');
    return response;
  } catch (error) {
    logError(error, { context: 'createDataTicketInternalFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Submit (Done) Ticketing Internal Finance
 * Endpoint: POST action=submit-ticketing-internal
 */
export const doneTicketInternalFinance = async (formData) => {
  try {
    const user = financeService.getUserContext();
    logger.debug('[Finance API] Submit Ticketing Internal', { id_ticket: formData.id_ticket });

    const payload = {
      id_ticket: formData.id_ticket || '',
      result: formData.result || '',
      notes_input: formData.notes_input || '',
      pic: user.codeName,
    };

    const response = await financeService.post('personal', 'submit-ticketing-internal', payload);
    logger.info('[Finance API] Submit Ticketing Internal success', { id_ticket: formData.id_ticket });
    return response;
  } catch (error) {
    logError(error, { context: 'submitTicketingInternalFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Get Review Karyawan (Finance Personal)
 * Endpoint: GET action=get-review-karyawan
 */
export const getReviewKaryawanFinance = async (namaFilter) => {
  try {
    logger.debug('[Finance API] Fetching Review Karyawan', { namaFilter });
    const response = await financeService.get('personal', 'get-review-karyawan', {
      nama_filter: namaFilter,
    });
    logger.info('[Finance API] Review Karyawan fetched', { count: response?.length || 0 });
    return response || [];
  } catch (error) {
    logError(error, { context: 'getReviewKaryawanFinance', service: 'Finance Personal' });
    throw error;
  }
};

/**
 * Submit Review Karyawan (Finance Personal)
 * Endpoint: POST action=submit-review-karyawan
 */
export const submitReviewKaryawanFinance = async (reviewData) => {
  try {
    logger.debug('[Finance API] Submit Review Karyawan', { nama: reviewData.nama_karyawan });
    const payload = {
      reviewer: reviewData.reviewer || '',
      nama_karyawan: reviewData.nama_karyawan || '',
      id_karyawan: reviewData.id_karyawan || '',
      jabatan: reviewData.jabatan || '',
      tingkat_pekerjaan: reviewData.tingkat_pekerjaan || '',
      status: reviewData.status || '',
      disiplin: reviewData.disiplin || '',
      komunikasi: reviewData.komunikasi || '',
      kerja_sama_tim: reviewData.kerja_sama_tim || '',
      tanggung_jawab: reviewData.tanggung_jawab || '',
      inisiatif: reviewData.inisiatif || '',
      kinerja_umum: reviewData.kinerja_umum || '',
      review: reviewData.review || '',
    };
    const response = await financeService.post('personal', 'submit-review-karyawan', payload);
    logger.info('[Finance API] Submit Review Karyawan success', { nama: reviewData.nama_karyawan });
    return response;
  } catch (error) {
    logError(error, { context: 'submitReviewKaryawanFinance', service: 'Finance Personal' });
    throw error;
  }
};

// ============================================
// Export default service for advanced usage
// ============================================

export default financeService;
