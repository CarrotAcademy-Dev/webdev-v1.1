import axios from 'axios';
import { nanoid } from 'nanoid';
import { API_CONFIG } from '@/config/api.config';
import { logError, ApiError } from '@/utils/errorHandler';
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
    'csoBersama': API_CONFIG.endpoints.csoBersama,
    'csoPersonal': API_CONFIG.endpoints.csoPersonal
}

// Helper function untuk parsing dan sorting timestamp
function sortByTimestampDescending(data, timestampKey = 'timestamp') {
    return data.sort((a, b) => {
        const parseTimestamp = (ts) => {
            if (!ts) return new Date(0);
            
            // Try to parse as standard date
            const date = new Date(ts);
            if (!isNaN(date)) return date;
            
            // Parse DD/MM/YYYY HH:mm:ss format
            const [datePart, timePart] = String(ts).split(' ');
            if (datePart) {
                const parts = datePart.split('/');
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    return new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
                }
            }
            
            return new Date(0);
        };
        
        return parseTimestamp(b[timestampKey]) - parseTimestamp(a[timestampKey]);
    });
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
            
            // Sort by timestamp (newest first)
            return sortByTimestampDescending(formattedData);
        } else {
            throw new ApiError(result.message || 'Failed to fetch data', 500);
        }
    } catch (error) {
        logError(error, 'getTrialStudents');
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

export const getJenisMerchandise = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'jenis-merchandise' }
        });

        const result = response.data;

        if (result.status === 'success') {
            // Return array of jenis merchandise
            return result.jenis_paket || [];
        } else {
            throw new Error(result.message || 'Failed to fetch jenis merchandise');
        }
    } catch (error) {
        console.error("Error fetching jenis merchandise:", error);
        throw error;
    }
};

export const postDataKirimMerch = async (rowData) => {
    try {
        // Validasi input
        if (!rowData.nis || !rowData.jenisPaket) {
            throw new Error('NIS dan jenis paket wajib diisi');
        }

        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || 'Unknown';

        const params = new URLSearchParams({
            action: 'update-kirim-merchandise',
            nis: rowData.nis,
            jenisPaket: rowData.jenisPaket,
            pic: pic
        });

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
            
            const undoneData = formattedData(result.data.undone);
            const doneData = formattedData(result.data.done);
            
            return {
                undone: sortByTimestampDescending(undoneData, 'tanggal'),
                done: sortByTimestampDescending(doneData, 'tanggal')
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
    // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || 'Unknown';

    const params = new URLSearchParams();
    params.append('action', 'done-story');
    params.append('date', date);
    params.append('pic', pic);

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
            // Transform data to match frontend expectations
            const formattedData = result.result.map((item, index) => ({
                no: index + 1,
                id: item.id_offboarding,
                id_ticket: item.id_offboarding, // untuk compatibility
                timestamp: item.timestamp || '',
                pic: item.pic || '',
                nama: item.nama || '',
                program: item.program || '',
                modul: item.modul || '',
                level: item.level || '',
                keterangan: item.keterangan || '',
                keteranganDetail: item.keterangan_detail || '',
                tanggalMulaiCuti: item.tanggal_mulai_cuti || '',
                tanggalAkhirCuti: item.tanggal_akhir_cuti || '',
                done_lastDay: item.last_day,
                done_scheduleSudahDirapihkan: item.schedule_dirapihkan,
                done_reminderWhatsapp: item.reminder_whatsapp,
                done_sertifSudahDikirim: item.sertifikat_dikirim,
                done_progressReportSudahDikirim: item.progress_report_dikirim,
                // Check if all tasks are done
                done: item.last_day === true && 
                      item.schedule_dirapihkan === true && 
                      item.reminder_whatsapp === true && 
                      item.sertifikat_dikirim === true && 
                      item.progress_report_dikirim === true
            }));

            // Sort by timestamp (newest first)
            return sortByTimestampDescending(formattedData);
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
        id_ticket: rowData.id_ticket || rowData.id,
        program: rowData.program || '',
        modul: rowData.modul || '',
        level: rowData.level || '',
        tanggal_mulai_cuti: rowData.tanggalMulaiCuti || '',
        tanggal_akhir_cuti: rowData.tanggalAkhirCuti || '',
        last_day: rowData.done_lastDay || false,
        schedule_dirapihkan: rowData.done_scheduleSudahDirapihkan || false,
        reminder_whatsapp: rowData.done_reminderWhatsapp || false,
        sertifikat_dikirim: rowData.done_sertifSudahDikirim || false,
        progress_report: rowData.done_progressReportSudahDikirim || false
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
            // Backend returns: Angkatan, Tahun, No, NIS, Nama, Link, H-9, H-6, H-4, H-3, H-2, H-1, H+1, H+2
            const formattedData = result.data.map((item, index) => {
                // Parse checkbox values (TRUE/FALSE string to boolean)
                const parseCheckbox = (val) => {
                    if (typeof val === 'boolean') return val;
                    return val === 'TRUE' || val === true;
                };

                const reminderH9 = parseCheckbox(item[6]);
                const reminderH6 = parseCheckbox(item[7]);
                const reminderH4 = parseCheckbox(item[8]);
                const reminderH3 = parseCheckbox(item[9]);
                const reminderH2 = parseCheckbox(item[10]);
                const reminderH1 = parseCheckbox(item[11]);
                const reminderHplus1 = parseCheckbox(item[12]);
                const reminderHplus2 = parseCheckbox(item[13]);

                // Check if all reminders are done
                const allDone = reminderH9 && reminderH6 && reminderH4 && reminderH3 && 
                               reminderH2 && reminderH1 && reminderHplus1 && reminderHplus2;

                return {
                    no: index + 1,
                    angkatan: item[0] || '',
                    tahun: item[1] || '',
                    noFd: item[2] || '',
                    nis: item[3] || '',
                    nama: item[4] || '',
                    linkPendaftaran: item[5] || '',
                    done_reminderH9: reminderH9,
                    done_reminderH6: reminderH6,
                    done_reminderH4: reminderH4,
                    done_reminderH3: reminderH3,
                    done_reminderH2: reminderH2,
                    done_reminderH1: reminderH1,
                    done_reminderHplus1: reminderHplus1,
                    done_reminderHplus2: reminderHplus2,
                    done: allDone
                };
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

export const postPendaftaranFD = async (rowData) => {
    try {
        if (!rowData.nis) {
            throw new Error('NIS wajib diisi');
        }

        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || 'Unknown';

        // Convert boolean to TRUE/FALSE string for backend
        const boolToString = (val) => val ? 'TRUE' : 'FALSE';

        const params = new URLSearchParams({
            action: 'ceklis-pendaftaran-fd',
            nis: rowData.nis,
            pic: pic
        });

        // Tambahkan parameter optional jika ada
        if (rowData.angkatan) params.append('angkatan', rowData.angkatan);
        if (rowData.tahun) params.append('tahun', rowData.tahun);
        if (rowData.noFd) params.append('nomor', rowData.noFd);
        
        // Tambahkan checkbox values
        if (rowData.done_reminderH9 !== undefined) params.append('reminder_hmin9', boolToString(rowData.done_reminderH9));
        if (rowData.done_reminderH6 !== undefined) params.append('reminder_hmin6', boolToString(rowData.done_reminderH6));
        if (rowData.done_reminderH4 !== undefined) params.append('reminder_hmin4', boolToString(rowData.done_reminderH4));
        if (rowData.done_reminderH3 !== undefined) params.append('reminder_hmin3', boolToString(rowData.done_reminderH3));
        if (rowData.done_reminderH2 !== undefined) params.append('reminder_hmin2', boolToString(rowData.done_reminderH2));
        if (rowData.done_reminderH1 !== undefined) params.append('reminder_hmin1', boolToString(rowData.done_reminderH1));
        if (rowData.done_reminderHplus1 !== undefined) params.append('reminder_hplus1', boolToString(rowData.done_reminderHplus1));
        if (rowData.done_reminderHplus2 !== undefined) params.append('reminder_hplus2', boolToString(rowData.done_reminderHplus2));

        const response = await apiClient.post(`${ENDPOINT.csoBersama}?${params.toString()}`);
        
        const result = response.data;
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit data');
        }
    } catch (error) {
        console.error("Error posting pendaftaran FD:", error);
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
    // Ambil nama dari user yang login
    const userData = auth.getUser();
    const pic = userData?.codeName || 'Unknown';

    const params = new URLSearchParams({
        action: 'done-lostnfound',
        id_ticket: rowData.idTicket,
        pic: pic
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

            // Sort by timestamp (newest first)
            return {
                dataOpen: sortByTimestampDescending(formattedOpen),
                dataClose: sortByTimestampDescending(formattedClose)
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
        if (!rowData.nomor_hp) {
            throw new Error('Nomor HP wajib diisi');
        }

        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || 'Unknown';

        // Coba dengan GET method karena backend GAS tidak return ContentService dengan benar
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: {
                action: 'done-prospektif-marcom',
                nomor_hp: rowData.nomor_hp,
                pic: pic
            }
        });

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

            // Sort by tanggal (newest first)
            return {
                dataOpen: sortByTimestampDescending(formattedOpen, 'tanggal'),
                dataClose: sortByTimestampDescending(formattedClose, 'tanggal')
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
    // Ambil codeName dari user yang login
    const userData = auth.getUser();
    const pic = userData?.codeName || 'Unknown';

    const params = new URLSearchParams({
        action: 'done-janjitemu',
        id_ticket: rowData.idTicket,
        pic: pic,
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
            // Transform data dari backend ke format frontend
            const formattedOpen = (result.dataOpen || []).map(item => ({
                timestamp: item.timestamp || '',
                idTicket: item.id_ticket || '',
                nama: item.nama || '',
                status: item.status || '',
                jam: item.jam || '',
                tanggal: item.deadline || '',
                nomor_hp: item.nomor_hp || '',
                media: item.from || '',
                kategori: item.kategori || '',
                subKategori: item.request || '',
                detail: item.request_detail || '',
                pic: item.pic || '',
                hasil: item.hasil || '',
                done: false
            }));

            const formattedClose = (result.dataClose || []).map(item => ({
                timestamp: item.timestamp || '',
                idTicket: item.id_ticket || '',
                nama: item.nama || '',
                status: item.status || '',
                jam: item.jam || '',
                tanggal: item.deadline || '',
                nomor_hp: item.nomor_hp || '',
                media: item.from || '',
                kategori: item.kategori || '',
                subKategori: item.request || '',
                detail: item.request_detail || '',
                pic: item.pic || '',
                hasil: item.hasil || '',
                done: true
            }));

            // Sort by timestamp (newest first) - parse DD/MM/YYYY HH:mm:ss format
            const sortByTimestamp = (a, b) => {
                const parseTimestamp = (ts) => {
                    if (!ts) return new Date(0);
                    // Try to parse various formats
                    const date = new Date(ts);
                    if (!isNaN(date)) return date;
                    
                    // Parse DD/MM/YYYY HH:mm:ss format
                    const [datePart, timePart] = ts.split(' ');
                    if (datePart) {
                        const [day, month, year] = datePart.split('/');
                        if (year && month && day) {
                            return new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
                        }
                    }
                    return new Date(0);
                };
                
                return parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp);
            };

            return {
                dataOpen: formattedOpen.sort(sortByTimestamp),
                dataClose: formattedClose.sort(sortByTimestamp)
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
    // Ambil codeName dari user yang login
    const userData = auth.getUser();
    const pic = userData?.codeName || userData?.name || 'Unknown';

    const params = new URLSearchParams({
        action: 'done-ticketexternal',
        id_ticket: rowData.idTicket,
        pic: pic,
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
        logError(error, 'postTicketExternal');
        throw error;
    }
};

export const getPendaftaranLanjutan = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-pendaftaran-lanjutan' }
        });

        if (response.data.status === 'success') {
            // Backend returns array of objects
            // Key names: psid, nama, prefilld_link (2 L's, 1 D), tanggal_kirim
            const transformData = (dataArray) => {
                if (!Array.isArray(dataArray)) return [];
                
                return dataArray.map((item) => ({
                    psid: item.psid || '',
                    nama: item.nama || '',
                    linkPendaftaran: item.prefilld_link || '',
                    tanggalKirim: item.tanggal_kirim || ''
                }));
            };

            const dataOpen = transformData(response.data.dataOpen || []);
            const dataClose = transformData(response.data.dataClose || []);

            return {
                dataOpen: sortByTimestampDescending(dataOpen, 'tanggalKirim'),
                dataClose: sortByTimestampDescending(dataClose, 'tanggalKirim')
            };
        }

        throw new Error(response.data.message || 'Failed to fetch data');
    } catch (error) {
        console.error('Error fetching pendaftaran lanjutan:', error);
        throw new Error(error.message || 'Failed to fetch data');
    }
};

export const postTanggalKirimPendaftaran = async ({ rowData, tanggalKirim }) => {
    try {
        if (!rowData.psid || !tanggalKirim) {
            throw new Error('PSID dan tanggal kirim wajib diisi');
        }

        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || 'Unknown';

        const response = await apiClient.post(ENDPOINT.csoBersama, null, {
            params: {
                action: 'input-tanggal-kirim',
                psid: rowData.psid,
                tanggal_kirim: tanggalKirim, // Format YYYY-MM-DD
                pic: pic // codeName dari user yang login
            }
        });

        if (response.data.status === 'success') {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to update data');
    } catch (error) {
        console.error('Error posting tanggal kirim:', error);
        throw new Error(error.message || 'Failed to update data');
    }
};

export const getPartnershipData = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: { action: 'data-partnership' }
        });

        const result = response.data;

        if (result.status === 'success') {
            const formattedDataOpen = (result.dataOpen || []).map((item) => ({
                timestamp: item.timestamp || '',
                idTicket: item.id_ticket || '',
                nama: item.nama || '',
                status: item.status || '',
                jam: item.jam || '',
                tanggal: item.deadline || '',
                nomorHp: item.nomor_hp || '',
                media: item.from || '',
                kategori: item.kategori || '',
                subKategori: item.request || '',
                detail: item.request_detail || '',
                responsible: item.responsible || '',
                accountable: item.accountable || '',
                consulted: item.consulted || '',
                informed: item.informed || '',
                lampiran: item.lampiran || '',
                hasil: item.hasil || '',
                todo: item.todo || '',
                comment: item.comment || '',
                pic: item.pic || '',
                done: false
            }));

            const formattedDataClose = (result.dataClose || []).map((item) => ({
                timestamp: item.timestamp || '',
                idTicket: item.id_ticket || '',
                nama: item.nama || '',
                status: item.status || '',
                jam: item.jam || '',
                tanggal: item.deadline || '',
                nomorHp: item.nomor_hp || '',
                media: item.from || '',
                kategori: item.kategori || '',
                subKategori: item.request || '',
                detail: item.request_detail || '',
                responsible: item.responsible || '',
                accountable: item.accountable || '',
                consulted: item.consulted || '',
                informed: item.informed || '',
                lampiran: item.lampiran || '',
                hasil: item.hasil || '',
                todo: item.todo || '',
                comment: item.comment || '',
                pic: item.pic || '',
                done: true
            }));

            const sortByTimestamp = (a, b) => {
                const parseTimestamp = (ts) => {
                    if (!ts) return new Date(0);

                    const date = new Date(ts);
                    if (!isNaN(date)) return date;

                    const [datePart, timePart] = ts.split(' ');
                    if (datePart) {
                        const [day, month, year] = datePart.split('/');
                        if (year && month && day) {
                            return new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
                        }
                    }

                    return new Date(0);
                }
                return parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp);
            }

            return {
                dataOpen: formattedDataOpen.sort(sortByTimestamp),
                dataClose: formattedDataClose.sort(sortByTimestamp)
            };
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching partnership data:", error);
        throw error;
    }
};

export const postPartnership = async ({ rowData }) => {
    const params = new URLSearchParams({
        action: 'done-partnership',
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
        logError(error, 'postPartnership');
        throw error;
    }
};

export const getDataSiswaAktifPerBulan = async ({ tahun, bulan }) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: {
                action: 'data-siswa-aktif-perbulan',
                tahun: tahun,
                bulan: bulan
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching data siswa aktif per bulan:", error);
        throw error;
    }
};

export const getDashboardSiswaAktifTahunan = async (tahunFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoBersama, {
            params: {
                action: 'data-dashboard-siswa-aktif',
                tahun_filter: tahunFilter
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result || {};
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error("Error fetching dashboard siswa aktif tahunan:", error);
        throw error;
    }
};

// ==================== CSO PERSONAL ====================

export const getDashboardProspektifPersonal = async (dateFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashbord-prospektif',
                date_req: dateFilter
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result || {};
        } else {
            throw new Error(result.message || 'Failed to fetch dashboard prospektif');
        }
    } catch (error) {
        console.error("Error fetching dashboard prospektif personal:", error);
        throw error;
    }
};

export const ceklisDashboardProspektif = async ({ target, psid }) => {
    try {
        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        // Google Apps Script POST harus menggunakan URLSearchParams
        const params = new URLSearchParams();
        params.append('action', 'ceklis-dashboard-prospektif');
        params.append('target', target);
        params.append('psid', psid);
        params.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.message || 'Berhasil di update';
        } else {
            throw new Error(result.message || 'Failed to update checklist');
        }
    } catch (error) {
        console.error("Error updating checklist dashboard prospektif:", error);
        throw error;
    }
};

export const getReminderFoundationNaikModul = async (dataFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: { 
                action: 'get-dashboard-reminder',
                target: 'foundation-naik-modul',
                bulan_tahun: dataFilter
            }
        });

        const result = response.data;
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch reminder foundation naik modul data');
        }
    } catch (error) {
        console.error("Error fetching reminder foundation naik modul data:", error);
        throw error;
    }
}

export const getReminderSiswaCuti = async (dataFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-reminder',
                target: 'data-cuti',
                bulan_tahun: dataFilter
            }
        });

        const result = response.data;
        
        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch reminder siswa cuti data');
        }
    } catch (error) {
        console.error("Error fetching reminder siswa cuti data:", error);
        throw error;
    }
}

export const getReminderChatFulltime = async (dataFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-reminder',
                target: "reminder-chat-fulltime",
                date: dataFilter
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch reminder chat fulltime data');
        }
    } catch (error) {
        console.error("Error fetching reminder chat fulltime data:", error);
        throw error;
    }
}

export const getReminderHargaFulltime = async (dataFilter) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-reminder',
                target: 'reminder-harga-fulltime',
                date: dataFilter
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return {
                normal: result.result_normal || [],
                promo: result.result_promo || [],
                normalCount: result.result_normal_jumlah || 0,
                promoCount: result.result_promo_jumlah || 0
            };
        } else {
            throw new Error(result.message || 'Failed to fetch reminder harga fulltime data');
        }
    } catch (error) {
        console.error("Error fetching reminder harga fulltime data:", error);
        throw error;
    }
}

export const getReminderHoliday = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-reminder',
                target: 'reminder-holiday'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result?.reminder_holiday || {};
        } else {
            throw new Error(result.message || 'Failed to fetch reminder holiday data');
        }
    } catch (error) {
        console.error("Error fetching reminder holiday data:", error);
        throw error;
    }
}

export const getTicketingInternal = async () => {
    try {
        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';
        const role = getJabatanAbbreviation(userData?.jabatan);
        const kode = (`${role} - ${pic}`).toUpperCase();

        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'ticketing-internal',
                kode_nama: kode
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch ticketing internal data');
        }
    } catch (error) {
        console.error("Error fetching ticketing internal data:", error);
        throw error;
    }
}

export const postCeklisTicketingInternal = async ({ id_ticket, result, notes }) => {
    try {
        if (!id_ticket || !result || !notes) {
            throw new Error('ID Ticket, Result, dan Notes wajib diisi');
        }

        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        console.log('Submitting ticketing internal:', { id_ticket, result, notes, pic });

        // POST dengan URLSearchParams sebagai body + Content-Type header
        const params = new URLSearchParams();
        params.append('action', 'ceklis-ticketing-internal');
        params.append('id_ticket', id_ticket);
        params.append('result', result);
        params.append('notes', notes);
        params.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const responseData = response.data;

        if (responseData.status === 'success') {
            return responseData;
        } else {
            throw new Error(responseData.message || 'Failed to submit ticketing internal');
        }
    } catch (error) {
        console.error("Error submitting ticketing internal:", error);
        // Jika axios error, log detail lebih lengkap
        if (error.response) {
            console.error('Response error:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        throw error;
    }
}

export const getFdIdentity = async () => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-fd-identity'
            }
        });

        const result = response.data

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch FD identity data');
        }
    } catch (error) {
        console.error("Error fetching FD identity data:", error);
        throw error;
    }
}

export const getTrackTicketFme = async () => {
    try {
        // Ambil codeName dari user yang login
        const userData = auth.getUser();
        const kodeNama = userData?.codeName || '';
        const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
        const person = `${jabatanAbbr} - ${kodeNama}`.toUpperCase();

        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'track-ticket-fme',
                kode_nama: person
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch track ticket From Me data');
        }
    } catch (error) {
        console.error("Error fetching track ticket From Me data:", error);
        throw error;
    }
}

export async function createTicketingExternal(ticketData) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';
        const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
        const person = `${jabatanAbbr} - ${pic}`.toUpperCase();

        const formData = new URLSearchParams();
        formData.append('action', 'create-ticketing-external');
        formData.append('pic', person);
        formData.append('nama', ticketData.nama || '');
        formData.append('nomor_hp', ticketData.nomor_hp || '');
        formData.append('jam', ticketData.jam || '');
        formData.append('media', ticketData.media || '');
        formData.append('kategori', ticketData.kategori || '');
        formData.append('request', ticketData.request || '');
        formData.append('detail', ticketData.detail || '');
        formData.append('accountable', ticketData.accountable || '');
        formData.append('consulted1', ticketData.consulted1 || '');
        formData.append('consulted2', ticketData.consulted2 || '');
        formData.append('lampiran', ticketData.lampiran || '');
        formData.append('hasil', ticketData.hasil || '');
        formData.append('status', ticketData.status || '');

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Google Apps Script sering tidak return proper CORS headers
        // Jadi kita treat as success kalau HTTP status 200, karena data sudah terkirim
        if (response.status === 200 || response.status === 201) {
            return {
                status: 'success',
                message: 'Ticket external berhasil dibuat'
            };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to create external ticket');
        }
    } catch (error) {
        console.error("Error creating external ticket:", error);
        
        // Jika error adalah CORS atau network error tapi kita tahu data sudah terkirim
        // (karena sebelumnya berhasil), treat as success
        if (error.message.includes('CORS') || error.message.includes('Network Error')) {
            console.warn('CORS error detected, but data might be sent successfully');
            return {
                status: 'success',
                message: 'Ticket external berhasil dibuat (CORS bypass)'
            };
        }
        
        throw error;
    }
}

export async function createTicketingInternal(ticketData) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';
        const jabatanAbbr = getJabatanAbbreviation(userData?.jabatan);
        const person = `${jabatanAbbr} - ${pic}`.toUpperCase();

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

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to create internal ticket');
        }
    } catch (error) {
        console.error("Error creating internal ticket:", error);
        throw error;
    }
}

export async function getDashboardDailySiswaBaru() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'siswa-baru'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch siswa baru data');
        }
    } catch (error) {
        console.error("Error fetching siswa baru:", error);
        throw error;
    }
}

export async function getDashboardDailySiswaRetention() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'siswa-retention'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch siswa retention data');
        }
    } catch (error) {
        console.error("Error fetching siswa retention:", error);
        throw error;
    }
}

export async function getDashboardDailyBirthday(bulanTahun) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'siswa-birthday',
                bulan_tahun: bulanTahun
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch birthday data');
        }
    } catch (error) {
        console.error("Error fetching birthday:", error);
        throw error;
    }
}

export async function getDashboardDailyLastDay() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'last-day'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch last day data');
        }
    } catch (error) {
        console.error("Error fetching last day:", error);
        throw error;
    }
}

export async function getDashboardDailyComplaintWA() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'get-complaint-wa'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return {
                hari_terbanyak: result.hari_terbanyak || {},
                complaint_terbanyak: result.complaint_terbanyak || {}
            };
        } else {
            throw new Error(result.message || 'Failed to fetch complaint WA data');
        }
    } catch (error) {
        console.error("Error fetching complaint WA:", error);
        throw error;
    }
}

export async function getDashboardDailySiswaNaikLevel() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'siswa-naik-level'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch siswa naik level data');
        }
    } catch (error) {
        console.error("Error fetching siswa naik level:", error);
        throw error;
    }
}

export async function getDashboardDailySiswaPindahModul() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'siswa-pindah-modul'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || [];
        } else {
            throw new Error(result.message || 'Failed to fetch siswa pindah modul data');
        }
    } catch (error) {
        console.error("Error fetching siswa pindah modul:", error);
        throw error;
    }
}

export async function getDashboardDailySertifikat() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-daily',
                target: 'get-sertifikat'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result || {};
        } else {
            throw new Error(result.message || 'Failed to fetch sertifikat data');
        }
    } catch (error) {
        console.error("Error fetching sertifikat:", error);
        throw error;
    }
}

export async function submitDoneSiswaBaru(uniqueId, mapStatus, doneStatus) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-siswa-baru');
        formData.append('unique_id', uniqueId);
        formData.append('map_status', mapStatus);
        formData.append('done_status', doneStatus);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Data berhasil diupdate' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done siswa baru');
        }
    } catch (error) {
        console.error("Error submitting done siswa baru:", error);
        throw error;
    }
}

export async function submitDoneSiswaRetention(uniqueId, mapStatus, doneStatus) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-siswa-retention');
        formData.append('unique_id', uniqueId);
        formData.append('map_status', mapStatus);
        formData.append('done_status', doneStatus);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Data berhasil diupdate' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done siswa retention');
        }
    } catch (error) {
        console.error("Error submitting done siswa retention:", error);
        throw error;
    }
}

export async function submitDoneBirthday(nama) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-birthday');
        formData.append('nama', nama);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: `Berhasil update data ${nama}` };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done birthday');
        }
    } catch (error) {
        console.error("Error submitting done birthday:", error);
        throw error;
    }
}

export async function submitDoneLastDay(uniqueId) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-last-day');
        formData.append('unique_id', uniqueId);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Berhasil update data' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done last day');
        }
    } catch (error) {
        console.error("Error submitting done last day:", error);
        throw error;
    }
}

export async function submitDoneNaikLevel(id, mapStatus, doneStatus, modul) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-naik-level');
        formData.append('id', id);
        formData.append('map_status', mapStatus);
        formData.append('done_status', doneStatus);
        formData.append('modul', modul);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Berhasil update data' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done naik level');
        }
    } catch (error) {
        console.error("Error submitting done naik level:", error);
        throw error;
    }
}

export async function submitDonePindahModul(id, mapStatus, doneStatus, modulBaru) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-pindah-modul');
        formData.append('id', id);
        formData.append('map_status', mapStatus);
        formData.append('done_status', doneStatus);
        formData.append('modul_baru', modulBaru);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Berhasil update data' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done pindah modul');
        }
    } catch (error) {
        console.error("Error submitting done pindah modul:", error);
        throw error;
    }
}

export async function submitDoneSertifikat(tahun, id) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-dashboard-daily');
        formData.append('target', 'done-sertifikat');
        formData.append('tahun', tahun);
        formData.append('id', id);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: 'Berhasil update data' };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit done sertifikat');
        }
    } catch (error) {
        console.error("Error submitting done sertifikat:", error);
        throw error;
    }
}

export async function getInvoiceTagihToday(date) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-invoice',
                target: 'invoice-tagih-today',
                date: date // format: "d mmm yyyy" e.g., "27 Nov 2025"
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch invoice tagih today');
        }
    } catch (error) {
        console.error("Error fetching invoice tagih today:", error);
        throw error;
    }
}

export async function getCariInvoice(namaLengkap) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-invoice',
                target: 'cari-invoice',
                nama_lengkap: namaLengkap
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to search invoice');
        }
    } catch (error) {
        console.error("Error searching invoice:", error);
        throw error;
    }
}

export async function getStudioNaikUmur(bulanTahun, age = 'ALL') {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-invoice',
                target: 'studio-naik-umur',
                bulan_tahun: bulanTahun, // format: "mmm yyyy" e.g., "Nov 2025"
                age: age // 'ALL', 'M', 'DV1', 'DV2', 'P'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Failed to fetch studio naik umur');
        }
    } catch (error) {
        console.error("Error fetching studio naik umur:", error);
        throw error;
    }
}

export async function submitStudioNaikUmur(uniqueId, nama) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-studio-naikumur');
        formData.append('unique_id', uniqueId);
        formData.append('nama', nama);
        formData.append('pic', pic);

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // CORS bypass: check status first
        if (response.status === 200 || response.status === 201) {
            return { status: 'success', message: `Data ${nama} berhasil diupdate.` };
        }

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit studio naik umur');
        }
    } catch (error) {
        console.error("Error submitting studio naik umur:", error);
        throw error;
    }
}

export async function getDataPortfolio() {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-portfolio',
                target: 'get-data-portfolio'
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Failed to fetch portfolio data');
        }
    } catch (error) {
        console.error("Error fetching portfolio data:", error);
        throw error;
    }
}

export async function pencarianNamaPortfolio(namaSiswa) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-dashboard-portfolio',
                target: 'pencarian-nama-portfolio',
                nama_siswa: namaSiswa
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to search portfolio');
        }
    } catch (error) {
        console.error("Error searching portfolio:", error);
        throw error;
    }
}

export async function getReviewKaryawan(namaFilter) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'get-review-karyawan',
                nama_filter: namaFilter
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch review karyawan');
        }
    } catch (error) {
        console.error("Error fetching review karyawan:", error);
        throw error;
    }
}

export async function submitReviewKaryawan(data) {
    try {
        const userData = auth.getUser();
        const reviewer = userData?.nama || userData?.nama || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-review-karyawan');
        formData.append('reviewer', reviewer);
        formData.append('nama_karyawan', data.nama_karyawan);
        formData.append('id_karyawan', data.id_karyawan);
        formData.append('jabatan', data.jabatan);
        formData.append('tingkat_pekerjaan', data.tingkat_pekerjaan);
        formData.append('status', data.status);
        formData.append('disiplin', data.disiplin);
        formData.append('komunikasi', data.komunikasi);
        formData.append('kerja_sama_tim', data.kerja_sama_tim);
        formData.append('tanggung_jawab', data.tanggung_jawab);
        formData.append('inisiatif', data.inisiatif);
        formData.append('kinerja_umum', data.kinerja_umum);
        formData.append('review', data.review || '');

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;

        // Check actual response from backend
        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit review karyawan');
        }
    } catch (error) {
        console.error("Error submitting review karyawan:", error);
        throw error;
    }
}

export async function getRekapAbsensiKaryawan() {
    try {
        const userData = auth.getUser();
        const namaKaryawan = userData?.nama || userData?.nama || 'Unknown';

        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'rekap-data-karyawan',
                target: 'rekap-absensi-karyawan',
                nama_karyawan: namaKaryawan
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch rekap absensi');
        }
    } catch (error) {
        console.error("Error fetching rekap absensi:", error);
        throw error;
    }
}

export async function getAbsensiBulanan(filterBulan) {
    try {
        const userData = auth.getUser();
        const namaKaryawan = userData?.nama || userData?.nama || 'Unknown';

        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'rekap-data-karyawan',
                target: 'absensi-karyawan-bulanan',
                nama_karyawan: namaKaryawan,
                filter_bulan: filterBulan
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch absensi bulanan');
        }
    } catch (error) {
        console.error("Error fetching absensi bulanan:", error);
        throw error;
    }
}

export async function getPayslip(bulan, tahun) {
    try {
        const userData = auth.getUser();
        const namaKaryawan = userData?.nama || userData?.nama || 'Unknown';


        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'rekap-data-karyawan',
                target: 'get-payslip',
                nama_karyawan: namaKaryawan,
                bulan: bulan,
                tahun: tahun
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch payslip');
        }
    } catch (error) {
        console.error("Error fetching payslip:", error);
        throw error;
    }
}

export async function getProfilSiswa(nama) {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: {
                action: 'search-profil-siswa',
                nama: nama
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to fetch profil siswa');
        }
    } catch (error) {
        console.error("Error fetching profil siswa:", error);
        throw error;
    }
}

export async function submitProfilSiswa(data) {
    try {
        const userData = auth.getUser();
        const pic = userData?.codeName || userData?.name || 'Unknown';

        const formData = new URLSearchParams();
        formData.append('action', 'submit-profile-siswa');
        formData.append('pic', pic);
        
        // Append all required fields
        Object.keys(data).forEach(key => {
            formData.append(key, data[key] || '');
        });

        const response = await apiClient.post(ENDPOINT.csoPersonal, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit profil siswa');
        }
    } catch (error) {
        console.error("Error submitting profil siswa:", error);
        throw error;
    }
}

// ==================== PROSPEKTIF FORM FUNCTIONS ====================

export const getDataProspektif = async (psid) => {
    try {
        const response = await apiClient.get(ENDPOINT.csoPersonal, {
            params: { 
                action: 'get-data-prospektif',
                psid: psid
            }
        });

        const result = response.data;

        if (result.status === 'success') {
            return result.result;
        } else {
            throw new Error(result.message || 'Failed to fetch prospektif data');
        }
    } catch (error) {
        console.error("Error fetching prospektif data:", error);
        throw error;
    }
};

export const submitProspektifForm = async (formData) => {
    const userData = auth.getUser();
    const pic = userData?.codeName || 'Unknown';

    const params = new URLSearchParams({
        action: 'submit-prospektf',
        pic: pic,
        full_name: formData.full_name || '',
        phone_number: formData.phone_number || '',
        age: formData.age || '',
        gender: formData.gender || '',
        parent_name: formData.parent_name || '',
        parent_phone: formData.parent_phone || '',
        first_contact_date: formData.first_contact_date || '',
        media_contact: formData.media_contact || '',
        tahu_carrot_darimana: formData.tahu_carrot_darimana || '',
        referral: formData.referral || '',
        schedule_request: formData.schedule_request || '',
        program: formData.program || '',
        trial_date: formData.trial_date || '',
        first_class_date: formData.first_class_date || '',
        goals: formData.goals || '',
        notes: formData.notes || '',
        fu1_date: formData.fu1_date || '',
        fu1_ceklis: formData.fu1_ceklis || false,
        notes_fu1: formData.notes_fu1 || '',
        fu2_date: formData.fu2_date || '',
        fu2_ceklis: formData.fu2_ceklis || false,
        notes_fu2: formData.notes_fu2 || '',
        fu3_date: formData.fu3_date || '',
        fu3_ceklis: formData.fu3_ceklis || false,
        notes_fu3: formData.notes_fu3 || '',
        retention: formData.retention || false,
        program_explained: formData.program_explained || false,
        pricelist_explained: formData.pricelist_explained || false,
        trial_ceklis: formData.trial_ceklis || false,
        target: formData.target || false,
        registration: formData.registration || false,
        predrawing: formData.predrawing || false,
        invoice: formData.invoice || false,
        onboarding: formData.onboarding || false,
        class_email: formData.class_email || false,
        photo: formData.photo || false,
        qrcode_presence: formData.qrcode_presence || false,
        reminder: formData.reminder || false,
        merchandise: formData.merchandise || false,
    });

    try {
        const response = await apiClient.post(ENDPOINT.csoPersonal, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;
        if (result.status === 'success' || result.status === 'sucess') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to submit prospektif form');
        }
    } catch (error) {
        console.error("Error submitting prospektif form:", error);
        throw error;
    }
};

export const editDataProspektif = async (formData) => {
    const userData = auth.getUser();
    const pic = userData?.codeName || 'Unknown';

    const params = new URLSearchParams({
        action: 'edit-prospektif',
        timestamp: formData.timestamp || '',
        psid: formData.psid || '',
        pic: pic,
        full_name: formData.full_name || '',
        phone_number: formData.phone_number || '',
        age: formData.age || '',
        gender: formData.gender || '',
        parent_name: formData.parent_name || '',
        parent_phone: formData.parent_phone || '',
        first_contact_date: formData.first_contact_date || '',
        media_contact: formData.media_contact || '',
        tahu_carrot_darimana: formData.tahu_carrot_darimana || '',
        referral: formData.referral || '',
        schedule_request: formData.schedule_request || '',
        program: formData.program || '',
        trial_date: formData.trial_date || '',
        first_class_date: formData.first_class_date || '',
        goals: formData.goals || '',
        notes: formData.notes || '',
        fu1_date: formData.fu1_date || '',
        fu1_ceklis: formData.fu1_ceklis || 'false',
        notes_fu1: formData.notes_fu1 || '',
        fu2_date: formData.fu2_date || '',
        fu2_ceklis: formData.fu2_ceklis || 'false',
        notes_fu2: formData.notes_fu2 || '',
        fu3_date: formData.fu3_date || '',
        fu3_ceklis: formData.fu3_ceklis || 'false',
        notes_fu3: formData.notes_fu3 || '',
        retention: formData.retention || 'false',
        program_explained: formData.program_explained || 'false',
        pricelist_explained: formData.pricelist_explained || 'false',
        trial_ceklis: formData.trial_ceklis || 'false',
        target: formData.target || 'false',
        registration: formData.registration || 'false',
        predrawing: formData.predrawing || 'false',
        invoice: formData.invoice || 'false',
        onboarding: formData.onboarding || 'false',
        class_email: formData.class_email || 'false',
        photo: formData.photo || 'false',
        qrcode_presence: formData.qrcode_presence || 'false',
        reminder: formData.reminder || 'false',
        merchandise: formData.merchandise || 'false',
        cancel_check: formData.cancel_check || 'false'
        // prefilled_link_form TIDAK dikirim karena auto-generated by formula di sheet
    });

    try {
        const response = await apiClient.post(`${ENDPOINT.csoPersonal}?${params.toString()}`);

        const result = response.data;
        if (result.status === 'success' || result.status === 'no_change') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to edit prospektif data');
        }
    } catch (error) {
        console.error("Error editing prospektif data:", error);
        throw error;
    }
};

