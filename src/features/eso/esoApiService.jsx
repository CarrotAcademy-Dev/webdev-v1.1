import { apiClient, API_CONFIG } from '@/config/api.config';
import auth from '@/features/auth/authService';

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

    if (!kodeNama) {
        throw new Error('User code name tidak ditemukan. Silakan login ulang.');
    }

    const params = new URLSearchParams({
        action: 'track-ticket-fme',
        kode_nama: kodeNama
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
