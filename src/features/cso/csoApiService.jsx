import axios from 'axios';
import { nanoid } from 'nanoid';
import { API_CONFIG } from '@/config/api.config';
import { logError, ApiError } from '@/utils/errorHandler';
import { auth } from '@/utils/storage';

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
            pic: pic // codeName dari user yang login
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
    // Ambil codeName dari user yang login
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

