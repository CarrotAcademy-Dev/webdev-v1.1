import axios from 'axios';
import { nanoid } from 'nanoid';

const apiClient = axios.create({
    baseURL: 'https://script.google.com/macros/s',
    withCredentials: false,
    timeout: 30000,
    validateStatus: function () {
        return true; 
    },
    transformRequest: [(data) => {
        return data;
    }]
});
const ENDPOINT = {
    'csoBersama': '/AKfycbzDiNXFej4tFpppXYDFPg0wwlOWvCBZ1jbFpQmDVojdb1f1TvVjfPw9jkkb5_oqVYDAwA/exec',
}

// Fungsi transform umum untuk backward compatibility
function transformRawData(rawData, headers, markAsDone = false) {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((row, index) => {
        const dataObject = {};
        headers.forEach((header, colIndex) => {
            if (header.key) {
                dataObject[header.key] = row[colIndex] || '';
            }
        });
        
        if (dataObject.id === '' || !dataObject.id) {
            dataObject.id = nanoid(5);
            dataObject.no = index+1;
        }

        if (markAsDone) {
            dataObject.done = true;
        } else {
            dataObject.done = false;
        }

        return dataObject;
    });
}

// Fungsi transform khusus untuk prospektif data
function transformProspektifData(rawData, headers, markAsDone = false) {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((row, index) => {
        const dataObject = {
            id: nanoid(5),
            no: index + 1,
            done: markAsDone,
            originalIndex: index
        };

        headers.forEach((header, colIndex) => {
            if (header.key && row[colIndex] !== undefined) {
                if (header.key === 'done') {
                    dataObject[header.key] = row[colIndex].toUpperCase() === 'TRUE';
                } else {
                    dataObject[header.key] = row[colIndex] || '';
                }
            }
        });

        return dataObject;
    });
}

export const getTrialStudents = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-siswa-trial' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'no', label: 'No' },
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'jam', label: 'Jam' },
                { key: 'nama', label: 'Nama' },
                { key: 'modul', label: 'Modul' },
                { key: 'ageGroup', label: 'Age Group' },
                { key: 'mentor', label: 'Mentor' },
                { key: 'proactive', label: 'Proactive' },
                { key: 'briefAcception', label: 'Brief Acception' },
                { key: 'visualization', label: 'Visualization' },
                { key: 'artworkQuality', label: 'Artwork Quality' },
                { key: 'creativity', label: 'Creativity' },
                { key: 'basicSkill', label: 'Basic Skill' },
                { key: 'focus', label: 'Focus' },
                { key: 'review', label: 'Review' }
            ];

            const formattedData = result.data.map((item, index) => {
                const studentObject = {}

                headerItems.forEach((headerName, col) => {
                    const key = headerName.key;
                    studentObject[key] = item[col] || '';
                });
                studentObject.no = index + 1;
                studentObject.id = index;

                return studentObject;
            });
            
            return formattedData;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching trial students:", error);
        throw error;
    }
};

export const getMerchandiseData = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'get-kirim-merchandise' }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching merchandise data:", error);
        throw error;
    }
};

export const postDataKirimMerch = async (rowData) => {
    const params = new URLSearchParams({
        action: 'update-kirim-merchandise',
        nis: rowData.nis,
        jenisPaket: rowData.jenisPaket
    });

    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch(error) {
        console.error("Error posting daftar merch:", error);
        throw error;
    }
}

export const getDailyStoryData = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-daily-story' }
        });

        const result = await response.data;

        if (result.status === 'success') {
            const formattedData = (dataArray) => {
                if (!Array.isArray(dataArray)) return [];

                return dataArray.map((item, index) => ({
                    no: index + 1,
                    tanggal: item.tanggal || '-',
                    link_dropbox: item.link_dropbox || '-',
                    status_marcom_ceklis: item.status_marcom_ceklis || '-',
                    done: item.status_cso === 'Done',
                    id: nanoid(5),
                    timestamp: item.timestamp || '-'
                }))
            }
            return {
                undone: formattedData(result.data.undone),
                done: formattedData(result.data.done)
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching daily story:", error);
        throw error;
    }
};

export const markStoryAsDone = async (date) => {
    const params = new URLSearchParams();
    params.append('action', 'done-story');
    params.append('date', date);

    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);
        
        if (response.data.status === 'success') {
            console.log(response.data.message);
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to mark as done');
        }
    } catch (error) {
        console.error("Error marking story as done:", error);
        throw error;
    }
};

export const getDaftarOffboarding = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-daftar-offboarding' }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching data offboarding:", error);
        throw error;
    }
};

export const postOffboardingData = async (rowData) => {
    const params = new URLSearchParams({
        action: 'ceklis-daftar-offboarding',
        id_ticket: rowData.id,
        program: rowData.program,
        modul: rowData.modul,
        level: rowData.level,
        tanggal_mulai_cuti: rowData.tanggalMulaiCuti,
        tanggal_akhir_cuti: rowData.tanggalAkhirCuti,
        last_day: rowData.done_lastDay,
        schedule_dirapihkan: rowData.done_scheduleSudahDirapihkan,
        reminder_whatsapp: rowData.done_reminderWhatsapp,
        sertifikat_dikirim: rowData.done_sertifSudahDikirim,
        progress_report: rowData.done_progressReportSudahDikirim
    });
    
    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.error("Error posting offboarding data:", error);
        throw error;
    }
}

export const getPendaftaranFD = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-pendaftaran-fd' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'angkatan', label: 'Angkatan' },
                { key: 'tahun', label: 'Tahun' },
                { key: 'noFd', label: 'No' },
                { key: 'nis', label: 'NIS'},
                { key: 'nama', label: 'Nama'},
                { key: 'linkPendaftaran', label: 'Link Pendaftaran Lanjutan'},
                { key: 'done_reminderH9', label: 'Reminder H-9'},
                { key: 'done_reminderH6', label: 'Keterangan Detail'},
                { key: 'done_reminderH4', label: 'Tanggal Mulai Cuti'},
                { key: 'done_reminderH2', label: 'Tanggal Akhir Cuti'},
                { key: 'done_reminderH1', label: 'Last Day'},
                { key: 'done_reminderH11', label: 'Schedule Sudah Dirapihkan?'},
                { key: 'done_reminderH12', label: 'Reminder Whatsapp'},
            ];

            const formattedData = result.data.map((item, index) => {
                const pendaftaranFdObject = {}

                headerItems.forEach((headerName, col) => {
                    const key = headerName.key;
                    pendaftaranFdObject[key] = item[col] || '';
                });
                pendaftaranFdObject.no = index + 1;

                return pendaftaranFdObject;
            });
            
            return formattedData;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching data pendaftaran FD:", error);
        throw error;
    }
};

export const getLostnFound = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-lostnfound' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'idTicket', label: 'ID Ticket' },
                { key: 'nama', label: 'Nama' },
                { key: 'nomor', label: 'Nomor' },
                { key: 'kategori', label: 'Kategori' },
                { key: 'requestDetail', label: 'Request Detail' },
                { key: 'pic', label: 'PIC' },
                { key: 'lampiran', label: 'Lampiran' },
                { key: 'hasil', label: 'Hasil' },
                { key: 'done', label: 'Done?' }
            ];

            const formattedOpen = transformRawData(result.dataOpen, headerItems, false);
            const formattedClose = transformRawData(result.dataClose, headerItems, true);

            return {
                dataOpen: formattedOpen,
                dataClose: formattedClose
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching data LostNFound:", error);
        throw error;
    }
};

export const postLostNFound = async (rowData) => {
    const params = new URLSearchParams({
        action: 'done-lostnfound',
        id_ticket: rowData.idTicket
    });

    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.log("Error posting data lost n found");
        throw error;
    }
}

export const getProspektifDariMarcom = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-prospektif-marcom' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'nama', label: 'Nama' },
                { key: 'nomor_hp', label: 'Nomor HP' },
                { key: 'firstContact', label: 'First Contact' },
                { key: 'media', label: 'Media' },
                { key: 'programYangMenarik', label: 'Program Yang Menarik' },
                { key: 'referral', label: 'Referral (Optional)' },
                { key: 'keterangan', label: 'Keterangan' },
                { key: 'done', label: 'Done?' }
            ];
            const dataOpen = Array.isArray(result.dataOpen) ? result.dataOpen : [];
            const dataClose = Array.isArray(result.dataClose) ? result.dataClose : [];

            const formattedOpen = transformProspektifData(dataOpen, headerItems, false);
            const formattedClose = transformProspektifData(dataClose, headerItems, true);

            return {
                dataOpen: formattedOpen,
                dataClose: formattedClose
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching data LostNFound:", error);
        throw error;
    }
}

export const postProspektifDariMarcom = async ({ rowData }) => {
    try {
        const formData = new FormData();
        formData.append('action', 'done-prospektif-marcom');
        formData.append('nomor_hp', rowData.nomor_hp);

        const response = await apiClient.post(ENDPOINT.csoBersama, formData);

        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.error('Error in postProspektifDariMarcom:', error);
        throw error;
    }
};

export const getDaftarKelasTersedia = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'daftar-kelas-tersedia' }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching daftar kelas tersedia:", error);
        throw error;
    }
};

export const getStatistikProspektif = async (tahun) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { 
                action: 'data-statistik-prospektif',
                tahun: tahun
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching statistik prospektif:", error);
        throw error;
    }
};

export const getRekapJadwalMentor = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'rekap-jadwal-mentor' }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching rekap jadwal mentor:", error);
        throw error;
    }
};

export const getJanjiTemu = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-janji-temu' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'idTicket', label: 'ID Ticket' },
                { key: 'nama', label: 'Nama' },
                { key: 'tanggal', label: 'Tanggal' },
                { key: 'nomor_hp', label: 'Nomor HP' },
                { key: 'kategori', label: 'Kategori' },
                { key: 'detail', label: 'Detail' },
                { key: 'pic', label: 'PIC' },
                { key: 'lampiran', label: 'Lampiran' },
                { key: 'hasil', label: 'Hasil' }
            ];

            const formattedOpen = transformRawData(result.dataOpen || [], headerItems);
            const formattedClose = transformRawData(result.dataClose || [], headerItems);

            return {
                dataOpen: formattedOpen,
                dataClose: formattedClose
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching janji temu:", error);
        throw error;
    }
};

export const postJanjiTemu = async ({ rowData }) => {
    const params = new URLSearchParams({
        action: 'done-janjitemu',
        id_ticket: rowData.idTicket
    });

    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.error("Error posting janji temu:", error);
        throw error;
    }
};

export const getTicketExternal = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-ticket-external' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const headerItems = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'idTicket', label: 'ID Ticket' },
                { key: 'nama', label: 'Nama' },
                { key: 'status', label: 'Status' },
                { key: 'jam', label: 'Jam' },
                { key: 'tanggal', label: 'Tanggal' },
                { key: 'nomor_hp', label: 'Nomor HP' },
                { key: 'media', label: 'Media' },
                { key: 'kategori', label: 'Kategori' },
                { key: 'subKategori', label: 'Sub Kategori' },
                { key: 'detail', label: 'Detail' },
                { key: 'pic', label: 'PIC' },
                { key: 'hasil', label: 'Hasil' },
                { key: 'done', label: 'Done?' }
            ];

            const formattedOpen = transformRawData(result.dataOpen || [], headerItems);
            const formattedClose = transformRawData(result.dataClose || [], headerItems);

            return {
                dataOpen: formattedOpen,
                dataClose: formattedClose
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching ticket external:", error);
        throw error;
    }
};

export const postTicketExternal = async ({ rowData }) => {
    const params = new URLSearchParams({
        action: 'done-ticketexternal',
        id_ticket: rowData.idTicket
    });

    try {
        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.error("Error posting ticket external:", error);
        throw error;
    }
};

export const getPendaftaranLanjutan = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-pendaftaran-lanjutan' }
        });

        if (response.data.status === 'success') {
            // Transform array data to object format
            const transformData = (dataArray) => dataArray.map((row) => ({
                psid: row[0],
                nama: row[1],
                linkPendaftaran: row[2],
                tanggalKirim: row[3]
            }));

            return {
                status: 'success',
                dataOpen: transformData(response.data.dataOpen || []),
                dataClose: transformData(response.data.dataClose || [])
            };
        }

        throw new Error(response.data.message || 'Failed to fetch data');
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch data');
    }
};

export const postTanggalKirimPendaftaran = async ({ rowData, tanggalKirim }) => {
    try {
        const response = await apiClient.post(ENDPOINT.csoBersama, null, {
            params: {
                action: 'input-tanggal-kirim',
                psid: rowData.psid,
                tanggalKirim
            }
        });

        if (response.data.status === 'success') {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to update data');
    } catch (error) {
        throw new Error(error.message || 'Failed to update data');
    }
};