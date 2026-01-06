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
    esoPersonal: API_CONFIG.endpoints.esoPersonal
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
