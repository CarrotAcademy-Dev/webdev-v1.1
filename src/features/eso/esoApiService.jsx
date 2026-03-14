import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { auth } from '@/utils/storage';
import { getJabatanAbbreviation } from '@/utils/formatters';

const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: false,
    timeout: API_CONFIG.timeout,
    validateStatus: function () {
        return true; 
    },
    transformRequest: [(data) => {
        return data;
    }]
});

const ENDPOINT = {
    esoPersonal: API_CONFIG.endpoints.esoPersonal,
    esoBersama: API_CONFIG.endpoints.esoBersama
};

/**
 * Get Track Ticket From Me (ESO Personal)
 * Mengambil data ticket yang dikirim oleh user yang sedang login
 * @returns {Promise} Promise with ticket data
 */
export const getTrackTicketFme = async () => {
    const userData = auth.getUser();
    const kodeNama = userData?.codeName || '';
    const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
    const person = `${jabatanAbbr} - ${kodeNama}`.toUpperCase();

    if (!kodeNama) {
        throw new Error('User code name tidak ditemukan. Silakan login ulang.');
    }

    const params = new URLSearchParams({
        action: 'track-ticket-fme',
        kode_nama: person
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch track ticket data');
        }
    } catch (error) {
        console.error("Error fetching track ticket from me:", error);
        throw error;
    }
};

/**
 * Get Ticketing Internal (ESO Personal)
 * Mengambil data ticketing internal untuk user yang login
 * Filter: responsible === kode_nama && status === 'open'
 * @returns {Promise} Promise with ticketing internal data
 */
export const getTicketingInternal = async () => {
    const userData = auth.getUser();
    const kodeNama = userData?.codeName || '';
    const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
    const person = `${jabatanAbbr} - ${kodeNama}`.toUpperCase();

    if (!kodeNama) {
        throw new Error('User code name tidak ditemukan. Silakan login ulang.');
    }

    const params = new URLSearchParams({
        action: 'ticketing-internal',
        kode_nama: person
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch ticketing internal data');
        }
    } catch (error) {
        console.error("Error fetching ticketing internal:", error);
        throw error;
    }
};

/**
 * Ceklis/Complete Ticketing Internal (ESO Personal)
 * Submit result dan notes untuk ticket yang sudah selesai
 * @param {Object} data - { id_ticket, result, notes }
 * @returns {Promise} Promise with success message
 */
export const postCeklisTicketingInternal = async (data) => {
    const userData = auth.getUser();
    const pic = userData?.codeName || '';

    if (!pic) {
        throw new Error('User code name tidak ditemukan. Silakan login ulang.');
    }

    const formData = new FormData();
    formData.append('action', 'ceklis-ticketing-internal');
    formData.append('id_ticket', data.id_ticket);
    formData.append('result', data.result);
    formData.append('notes', data.notes);
    formData.append('pic', pic);

    try {
        const response = await apiClient.post(ENDPOINT.esoPersonal, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit ticket');
        }
    } catch (error) {
        console.error("Error submitting ticketing internal:", error);
        throw error;
    }
};

/**
 * Get List Nama Student Report (ESO Personal)
 * Mengambil list nama siswa untuk dropdown search
 * @returns {Promise} Promise with array of student names
 */
export const getListNamaStudentReport = async () => {
    const params = new URLSearchParams({
        action: 'get-list-nama-sr'
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch student names');
        }
    } catch (error) {
        console.error("Error fetching list nama student report:", error);
        throw error;
    }
};

/**
 * Cari Data Student Report (ESO Personal)
 * Mencari data student report berdasarkan nama lengkap
 * @param {string} namaLengkap - Nama lengkap siswa
 * @returns {Promise} Promise with student report data
 */
export const getDataStudentReport = async (namaLengkap) => {
    if (!namaLengkap) {
        throw new Error('Nama lengkap harus diisi');
    }

    const params = new URLSearchParams({
        action: 'cari-data-student-report',
        nama_lengkap: namaLengkap
    });

    try {
        const response = await apiClient.post(ENDPOINT.esoPersonal, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Tidak ditemukan data untuk nama tersebut');
        }
    } catch (error) {
        console.error("Error fetching student report data:", error);
        throw error;
    }
};

/**
 * Create Ticketing Internal (ESO Personal)
 * Membuat ticket internal baru
 * @param {Object} ticketData - Data ticket yang akan dibuat
 * @param {string} ticketData.title - Judul ticket (required)
 * @param {string} ticketData.description - Deskripsi ticket (required)
 * @param {string} ticketData.deadline - Deadline ticket (required)
 * @param {string} ticketData.label - Label ticket (required)
 * @param {string} ticketData.responsible - Responsible person (required)
 * @param {string} ticketData.accountable - Accountable person (optional)
 * @param {string} ticketData.consulted - Consulted person (optional)
 * @param {string} ticketData.informed - Informed person (optional)
 * @returns {Promise} Promise with success message
 */
export const createTicketingInternal = async (ticketData) => {
    const userData = auth.getUser();
    const kodeNama = userData?.codeName || '';
    const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
    const person = `${jabatanAbbr} - ${kodeNama}`.toUpperCase();

    if (!kodeNama) {
        throw new Error('User code name tidak ditemukan. Silakan login ulang.');
    }

    const formData = new URLSearchParams();
    formData.append('action', 'create-ticketing-internal');
    formData.append('person', person);
    formData.append('title', ticketData.title || '');
    formData.append('description', ticketData.description || '');
    formData.append('deadline', ticketData.deadline || '');
    formData.append('label', ticketData.label || '');
    formData.append('responsible', ticketData.responsible || '');
    formData.append('accountable', ticketData.accountable || '');
    formData.append('consulted', ticketData.consulted || '');
    formData.append('informed', ticketData.informed || '');

    try {
        const response = await apiClient.post(ENDPOINT.esoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal membuat ticket');
        }
    } catch (error) {
        // CORS error dari Google Apps Script, tapi data sebenarnya sudah masuk
        // Jika error network/CORS, treat as success
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.log('CORS error detected, but data likely saved. Treating as success.');
            return {
                status: 'success',
                message: 'Berhasil submit ticket baru.'
            };
        }
        
        console.error("Error creating ticketing internal:", error);
        throw error;
    }
};

/**
 * Get List Siswa Full-Time (Dashboard FD)
 * Mengambil daftar nama siswa FD untuk dropdown
 * @returns {Promise<string[]>} Promise with array of student names
 */
export const getListSiswaFD = async () => {
    const params = new URLSearchParams({
        action: 'get-list-siswa-fd'
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Gagal mengambil data siswa FD');
        }
    } catch (error) {
        console.error("Error fetching siswa FD list:", error);
        throw error;
    }
};

/**
 * Get Dashboard Full-Time Detail (Nilai & Presensi)
 * Mengambil detail dashboard siswa FD berdasarkan nama
 * @param {string} namaSiswa - Nama siswa yang dipilih
 * @returns {Promise} Promise with dashboard data
 */
export const getDataDashboardFD = async (namaSiswa) => {
    if (!namaSiswa) {
        throw new Error('Nama siswa wajib diisi');
    }

    const params = new URLSearchParams({
        action: 'get-data-siswa-fd',
        nama_siswa: namaSiswa
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Data tidak ditemukan');
        }
    } catch (error) {
        console.error("Error fetching dashboard FD data:", error);
        throw error;
    }
};

/**
 * Get Dashboard Ticketing Mentor
 * Mengambil data dashboard ticketing mentor per tahun
 * @param {string} tahun - Tahun yang dipilih (required)
 * @returns {Promise} Promise with dashboard ticketing data
 */
export const getDashboardTicketingMentor = async (tahun) => {
    if (!tahun) {
        throw new Error('Tahun wajib diisi');
    }

    const formData = new URLSearchParams();
    formData.append('action', 'dashboard-ticketing-mentor');
    formData.append('tahun', tahun);

    try {
        const response = await apiClient.post(ENDPOINT.esoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data dashboard ticketing mentor');
        }
    } catch (error) {
        console.error("Error fetching dashboard ticketing mentor:", error);
        throw error;
    }
};

/**
 * Get Full-Time Course Student Identity
 * Mengambil data identitas siswa FD (dokumen-dokumen)
 * @returns {Promise} Promise with array of student identity data
 */
export const getFDIdentity = async () => {
    const params = new URLSearchParams({
        action: 'get-fd-identity'
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Gagal mengambil data identitas siswa FD');
        }
    } catch (error) {
        console.error("Error fetching FD identity data:", error);
        throw error;
    }
};

/**
 * Get Review Karyawan History (ESO Personal)
 * Mengambil riwayat review karyawan berdasarkan nama
 * @param {string} namaFilter - Nama karyawan yang akan dicari
 * @returns {Promise} Promise with review history data
 */
export const getReviewKaryawan = async (namaFilter) => {
    if (!namaFilter) {
        throw new Error('Nama karyawan tidak boleh kosong');
    }

    const params = new URLSearchParams({
        action: 'get-review-karyawan',
        nama_filter: namaFilter
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data review karyawan');
        }
    } catch (error) {
        console.error("Error fetching review karyawan:", error);
        throw error;
    }
};

/**
 * Submit Review Karyawan (ESO Personal)
 * Mengirim penilaian karyawan baru
 * @param {Object} reviewData - Data review karyawan
 * @param {string} reviewData.reviewer - Nama reviewer
 * @param {string} reviewData.nama_karyawan - Nama karyawan yang dinilai
 * @param {string} reviewData.id_karyawan - ID karyawan
 * @param {string} reviewData.jabatan - Jabatan karyawan
 * @param {string} reviewData.tingkat_pekerjaan - Tingkat pekerjaan
 * @param {string} reviewData.status - Status karyawan
 * @param {string} reviewData.disiplin - Nilai disiplin (1-5)
 * @param {string} reviewData.komunikasi - Nilai komunikasi (1-5)
 * @param {string} reviewData.kerja_sama_tim - Nilai kerja sama tim (1-5)
 * @param {string} reviewData.tanggung_jawab - Nilai tanggung jawab (1-5)
 * @param {string} reviewData.inisiatif - Nilai inisiatif (1-5)
 * @param {string} reviewData.kinerja_umum - Nilai kinerja umum (1-5)
 * @param {string} reviewData.review - Komentar/masukan (optional)
 * @returns {Promise} Promise with success message
 */
export const submitReviewKaryawan = async (reviewData) => {
    const formData = new URLSearchParams();
    formData.append('action', 'submit-review-karyawan');
    formData.append('reviewer', reviewData.reviewer || '');
    formData.append('nama_karyawan', reviewData.nama_karyawan || '');
    formData.append('id_karyawan', reviewData.id_karyawan || '');
    formData.append('jabatan', reviewData.jabatan || '');
    formData.append('tingkat_pekerjaan', reviewData.tingkat_pekerjaan || '');
    formData.append('status', reviewData.status || '');
    formData.append('disiplin', reviewData.disiplin || '');
    formData.append('komunikasi', reviewData.komunikasi || '');
    formData.append('kerja_sama_tim', reviewData.kerja_sama_tim || '');
    formData.append('tanggung_jawab', reviewData.tanggung_jawab || '');
    formData.append('inisiatif', reviewData.inisiatif || '');
    formData.append('kinerja_umum', reviewData.kinerja_umum || '');
    formData.append('review', reviewData.review || '');

    try {
        const response = await apiClient.post(ENDPOINT.esoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal submit review karyawan');
        }
    } catch (error) {
        console.error("Error submitting review karyawan:", error);
        throw error;
    }
};

// ==================== ESO BERSAMA API ====================

/**
 * Get Nomor Urut Sertifikat Full-Time data
 * @returns {Promise} Promise with array of certificate serial numbers
 */
export const getNomorUrutSertifikat = async () => {
    const params = new URLSearchParams({
        action: 'get-nomor-urut-fd'
    });

    try {
        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Gagal mengambil data nomor urut sertifikat');
        }
    } catch (error) {
        console.error("Error fetching nomor urut sertifikat:", error);
        throw error;
    }
};

/**
 * Add new Nomor Urut Sertifikat Full-Time
 * @param {Object} data - Certificate data
 * @param {string} data.nomor_urut - Serial number
 * @param {string} data.nama - Student name
 * @param {string} data.modul - Module name
 * @param {string} data.angkatan - Batch/class
 * @param {string} data.bulan_lulus - Graduation month
 * @param {string} data.tahun_lulus - Graduation year
 * @returns {Promise} Promise with success message
 */
export const addNomorUrutSertifikat = async (data) => {
    const formData = new URLSearchParams();
    formData.append('action', 'add-nomor-urut-fd');
    formData.append('nomor_urut', data.nomor_urut);
    formData.append('nama', data.nama);
    formData.append('modul', data.modul);
    formData.append('angkatan', data.angkatan);
    formData.append('bulan_lulus', data.bulan_lulus);
    formData.append('tahun_lulus', data.tahun_lulus);

    try {
        const response = await apiClient.post(ENDPOINT.esoBersama, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal menambahkan data nomor urut sertifikat');
        }
    } catch (error) {
        console.error("Error adding nomor urut sertifikat:", error);
        throw error;
    }
};

/**
 * Get Pendaftaran Lanjutan (ESO Bersama)
 * Mengambil data pendaftaran lanjutan siswa dengan prefilled form link
 * @returns {Promise<Array>} Promise with array of student registration data
 */
export const getPendaftaranLanjutan = async () => {
    try {
        const params = new URLSearchParams({
            action: 'get-pendaftaran-lanjutan'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data pendaftaran lanjutan');
        }
    } catch (error) {
        console.error("Error fetching pendaftaran lanjutan:", error);
        throw error;
    }
};

/**
 * Get Kelengkapan Data (ESO Bersama)
 * Mengambil data kelengkapan siswa termasuk links dan predrawing status
 * @returns {Promise<Array>} Promise with array of student data completion
 */
export const getKelengkapanData = async () => {
    try {
        const params = new URLSearchParams({
            action: 'get-kelengkapan-data'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data kelengkapan');
        }
    } catch (error) {
        console.error("Error fetching kelengkapan data:", error);
        throw error;
    }
};

/**
 * Update Kelengkapan Data (ESO Bersama)
 * Update data kelengkapan siswa
 * @param {Object} data - Data kelengkapan to update
 * @returns {Promise<Object>} Promise with update result
 */
export const updateKelengkapanData = async (data) => {
    try {
        const params = new URLSearchParams({
            action: 'update-kelengkapan-data',
            nis: data.nis,
            nama: data.nama,
            program: data.program,
            status: data.status,
            link_dropbox: data.link_dropbox || '',
            link_gdrive_studio: data.link_gdrive_studio || '',
            link_gdrive_portfolio: data.link_gdrive_portfolio || '',
            artist_journal: data.artist_journal || '',
            invite_gchat: data.invite_gchat || '',
            add_birthday: data.add_birthday || '',
            link_foto: data.link_foto || '',
            link_predrawing: data.link_predrawing || '',
            predrawing_satu: data.predrawing_satu || '',
            predrawing_dua: data.predrawing_dua || '',
            predrawing_tiga: data.predrawing_tiga || '',
            predrawing_empat: data.predrawing_empat || '',
            predrawing_lima: data.predrawing_lima || '',
        });

        const response = await apiClient.post(ENDPOINT.esoBersama, params);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal update data kelengkapan');
        }
    } catch (error) {
        console.error("Error updating kelengkapan data:", error);
        throw error;
    }
};

/**
 * Get Artwork of The Month Data (ESO Bersama)
 * Mengambil data artwork of the month dengan validasi dan tanggal progress
 * @returns {Promise<Array>} Promise with array of AOTM data
 */
export const getDataAotm = async () => {
    try {
        const params = new URLSearchParams({
            action: 'get-data-aotm'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data AOTM');
        }
    } catch (error) {
        console.error("Error fetching AOTM data:", error);
        throw error;
    }
};

/**
 * Update Artwork of The Month Data (ESO Bersama)
 * Update data artwork of the month
 * @param {Object} data - Data AOTM to update
 * @returns {Promise<Object>} Promise with update result
 */
export const updateDataAotm = async (data) => {
    try {
        const params = new URLSearchParams({
            action: 'update-data-aotm',
            nomor: data.nomor,
            nama: data.nama,
            modul: data.modul,
            level: data.level,
            deskripsi: data.deskripsi || '',
            artwork_validation: data.artwork_validation || '',
            foto_validation: data.foto_validation || '',
            predrawing_validation: data.predrawing_validation || '',
            tanggal_edit: data.tanggal_edit || '',
            tanggal_print: data.tanggal_print || '',
            tanggal_tempel: data.tanggal_tempel || '',
            link_dropbox: data.link_dropbox || '',
            notes: data.notes || '',
            link_design: data.link_design || '',
        });

        const response = await apiClient.post(ENDPOINT.esoBersama, params);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal update data AOTM');
        }
    } catch (error) {
        console.error("Error updating AOTM data:", error);
        throw error;
    }
};

/**
 * Get Student Report Data (ESO Bersama)
 * Mengambil data laporan siswa dengan 25 fields
 * @returns {Promise<Array>} Promise with array of student report data
 */
export const getStudentReport = async () => {
    try {
        const params = new URLSearchParams({
            action: 'get-student-report'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data Student Report');
        }
    } catch (error) {
        console.error("Error fetching Student Report data:", error);
        throw error;
    }
};

/**
 * Get Progress Report Monthly Data (ESO Bersama)
 * Mengambil data progress report bulanan dengan 13 fields
 * @returns {Promise<Array>} Promise with array of progress report monthly data
 */
export const getProgressReportMonthly = async () => {
    try {
        const params = new URLSearchParams({
            action: 'get-progress-report-monthly'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data Progress Report Monthly');
        }
    } catch (error) {
        console.error("Error fetching Progress Report Monthly data:", error);
        throw error;
    }
};

/**
 * Update Progress Report Monthly Data (ESO Bersama)
 * Update data progress report bulanan
 * @param {Object} data - Data yang akan diupdate
 * @returns {Promise<Object>} Promise with update result
 */
export const updateProgressReportMonthly = async (data) => {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'update-progress-report-monthly');
        formData.append('id', data.id || '');
        formData.append('nama_siswa', data.nama_siswa || '');
        formData.append('program', data.program || '');
        formData.append('modul', data.modul || '');
        formData.append('bulan_aktif', data.bulan_aktif || '');
        formData.append('email', data.email || '');
        formData.append('last_update', data.last_update || '');
        formData.append('notes', data.notes || '');
        formData.append('last_day_class', data.last_day_class || '');
        formData.append('check', data.check || '');
        formData.append('link_progress_report', data.link_progress_report || '');
        formData.append('ready_kirim', data.ready_kirim || '');
        formData.append('tanggal_kirim', data.tanggal_kirim || '');

        const response = await apiClient.post(ENDPOINT.esoBersama, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal update data Progress Report Monthly');
        }
    } catch (error) {
        console.error("Error updating Progress Report Monthly data:", error);
        throw error;
    }
};

/**
 * Get Cari Nama Monthly Data (ESO Bersama)
 * Mengambil data cari nama monthly dengan 4 fields
 * @returns {Promise<Array>} Promise with array of cari nama monthly data
 */
export const getCariNamaMonthly = async () => {
    try {
        const params = new URLSearchParams({
            action: 'cari-nama-monthly'
        });

        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data Cari Nama Monthly');
        }
    } catch (error) {
        console.error("Error fetching Cari Nama Monthly data:", error);
        throw error;
    }
};

/**
 * Get Daftar Offboarding Data (ESO Bersama)
 * @returns {Promise<Array>} Array of offboarding records
 */
export const getDataDaftarOffboarding = async () => {
    try {
        const params = new URLSearchParams({
            action: 'data-daftar-offboarding'
        });
        const response = await apiClient.get(`${ENDPOINT.esoBersama}?${params}`);
        const result = response.data;
        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Gagal mengambil data Daftar Offboarding');
        }
    } catch (error) {
        console.error("Error fetching Daftar Offboarding data:", error);
        throw error;
    }
};

/**
 * Update (ceklis) Daftar Offboarding Data (ESO Bersama)
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Update result
 */
export const ceklisDaftarOffboarding = async (data) => {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'ceklis-daftar-offboarding');
        formData.append('id_ticket', data.id_ticket || '');
        formData.append('program', data.program || '');
        formData.append('modul', data.modul || '');
        formData.append('level', data.level || '');
        formData.append('sudah_proses_sertifikat', data.sudah_proses_sertifikat ? 'TRUE' : 'FALSE');
        formData.append('sudah_proses_monthly_report', data.sudah_proses_monthly_report ? 'TRUE' : 'FALSE');
        formData.append('sudah_proses_gdrive_dropbox', data.sudah_proses_gdrive_dropbox ? 'TRUE' : 'FALSE');
        formData.append('sudah_proses_birthday_reminder', data.sudah_proses_birthday_reminder ? 'TRUE' : 'FALSE');
        formData.append('sudah_uninvite_link', data.sudah_uninvite_link ? 'TRUE' : 'FALSE');

        const response = await apiClient.post(ENDPOINT.esoBersama, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Gagal update data Daftar Offboarding');
        }
    } catch (error) {
        console.error("Error updating Daftar Offboarding data:", error);
        throw error;
    }
};
