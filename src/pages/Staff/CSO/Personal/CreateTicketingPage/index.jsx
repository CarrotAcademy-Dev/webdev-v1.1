import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Text, Flex, useToast, Tabs, TabList, Tab, TabPanels, TabPanel, useColorMode } from '@chakra-ui/react';
import ContainerCarrot from '@/components/Container';
import { StyledCreateTicketing } from './CreateTicketing.styled';
import { createTicketingExternal, createTicketingInternal } from '@/features/cso/csoApiService';

// Mapping kategori ke request options berdasarkan screenshot
const REQUEST_OPTIONS = {
    'Schedule': [
        'Reschedule',
        'Rekap Jadwal Mentor',
        'Izin'
    ],
    'Complaint': [
        'Invoice',
        'Progress Report',
        'Modul',
        'Progress Siswa'
    ],
    'Request': [
        'Kelas Pengganti',
        'Sertifikat',
        'Mentor',
        'Lost & Found',
        'Personal Mentoring',
        'Konsultasi',
        'Janji Temu',
        'Photo atau Design',
        'Administratif',
        'Retention',
        'Modul',
        'Invoice',
        'Perizinan Buat Baru',
        'Perizinan Orang Datang',
        'Perizinan Perpanjang',
        'Partnership',
        'Sponsorship'
    ],
    'Billing': [
        'Invoice',
        'Bukti Pembayaran'
    ],
    'Offboarding': [
        'Cuti',
        'Ubah hari permanen',
        'Off',
        'Pindah program',
        'Tambah sesi program',
        'Kurang sesi program',
        'Tambah modul',
        'Kurang modul'
    ],
    'Info': [
        'Class - Link',
        'Reminder Kelas',
        'Broadcast'
    ],
    'Query': [
        'Query'
    ]
};

function CreateTicketingPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    // ============ EXTERNAL FORM STATE ============
    const [externalForm, setExternalForm] = useState({
        nama: '',
        nomor_hp: '',
        jam: '',
        media: '',
        kategori: '',
        request: '',
        detail: '',
        accountable: '',
        consulted1: '',
        consulted2: '',
        lampiran: '',
        hasil: '',
        status: false
    });

    // ============ INTERNAL FORM STATE ============
    const [internalForm, setInternalForm] = useState({
        title: '',
        description: '',
        deadline: '',
        label: '',
        responsible: '',
        accountable: '',
        consulted: '',
        informed: ''
    });

    // ============ MUTATIONS ============
    const createExternalMutation = useMutation({
        mutationFn: createTicketingExternal,
        onSuccess: () => {
            toast({
                title: 'Berhasil!',
                description: 'Ticketing external berhasil dibuat',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Reset form
            setExternalForm({
                nama: '',
                nomor_hp: '',
                jam: '',
                media: '',
                kategori: '',
                request: '',
                detail: '',
                accountable: '',
                consulted1: '',
                consulted2: '',
                lampiran: '',
                hasil: '',
                status: false
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal membuat ticket',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const createInternalMutation = useMutation({
        mutationFn: createTicketingInternal,
        onSuccess: () => {
            toast({
                title: 'Berhasil!',
                description: 'Ticketing internal berhasil dibuat',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Reset form
            setInternalForm({
                title: '',
                description: '',
                deadline: '',
                label: '',
                responsible: '',
                accountable: '',
                consulted: '',
                informed: ''
            });
        },
        onError: (error) => {
            toast({
                title: 'Gagal membuat ticket',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    // ============ HANDLERS ============
    const handleExternalChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Reset request field when category changes
        if (name === 'kategori') {
            setExternalForm(prev => ({
                ...prev,
                kategori: value,
                request: '' // Reset request saat kategori berubah
            }));
        } else {
            setExternalForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleInternalChange = (e) => {
        const { name, value } = e.target;
        setInternalForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExternalSubmit = (e) => {
        e.preventDefault();
        createExternalMutation.mutate(externalForm);
    };

    const handleInternalSubmit = (e) => {
        e.preventDefault();
        createInternalMutation.mutate(internalForm);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <ContainerCarrot>
            <StyledCreateTicketing data-theme={colorMode}>
                <Box className="hero-section">
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Create Ticketing
                        </Text>
                    </Flex>
                </Box>

                <Box className="main-content-section">
                    <Tabs variant="soft-rounded" colorScheme="orange">
                        <TabList mb={6} justifyContent="center" gap={4}>
                            <Tab 
                                _selected={{ 
                                    bg: '#212020ff', 
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                px={8}
                                py={2}
                            >
                                Ticketing External
                            </Tab>
                            <Tab 
                                _selected={{ 
                                    bg: '#212020ff', 
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                px={8}
                                py={2}
                            >
                                Ticketing Internal
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {/* EXTERNAL FORM */}
                            <TabPanel p={0}>
                                <form onSubmit={handleExternalSubmit}>
                                    <div className="form-section">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Nama Contact <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nama"
                                                    value={externalForm.nama}
                                                    onChange={handleExternalChange}
                                                    required
                                                    placeholder="Masukkan nama contact"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Nomor HP <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nomor_hp"
                                                    value={externalForm.nomor_hp}
                                                    onChange={handleExternalChange}
                                                    required
                                                    placeholder="Contoh: 081234567890"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Jam <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="time"
                                                    name="jam"
                                                    value={externalForm.jam}
                                                    onChange={handleExternalChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    From <span className="required">*</span>
                                                </label>
                                                <select
                                                    name="media"
                                                    value={externalForm.media}
                                                    onChange={handleExternalChange}
                                                    required
                                                >
                                                    <option value="">Pilih media</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                    <option value="WhatsApp Carrot Call">WhatsApp Carrot Call</option>
                                                    <option value="Call">Call</option>
                                                    <option value="Social Media">Social Media</option>
                                                    <option value="Visit">Visit</option>
                                                    <option value="Email">Email</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Kategori <span className="required">*</span>
                                                </label>
                                                <select
                                                    name="kategori"
                                                    value={externalForm.kategori}
                                                    onChange={handleExternalChange}
                                                    required
                                                >
                                                    <option value="">Pilih kategori</option>
                                                    <option value="Schedule">Schedule</option>
                                                    <option value="Request">Request</option>
                                                    <option value="Complaint">Complaint</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="Offboarding">Offboarding</option>
                                                    <option value="Info">Info</option>
                                                    <option value="Query">Query</option>
                                                    <option value="_hari paling banyak complaint wa">Hari Banyak Complaint WA</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Request <span className="required">*</span>
                                                </label>
                                                <select
                                                    name="request"
                                                    value={externalForm.request}
                                                    onChange={handleExternalChange}
                                                    required
                                                    disabled={!externalForm.kategori}
                                                >
                                                    <option value="">
                                                        {!externalForm.kategori 
                                                            ? 'Pilih kategori terlebih dahulu' 
                                                            : 'Pilih request'}
                                                    </option>
                                                    {externalForm.kategori && REQUEST_OPTIONS[externalForm.kategori]?.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>
                                                Request Detail <span className="required">*</span>
                                            </label>
                                            <textarea
                                                name="detail"
                                                value={externalForm.detail}
                                                onChange={handleExternalChange}
                                                required
                                                placeholder="Jelaskan detail request..."
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Accountable (optional)</label>
                                                <select
                                                    name="accountable"
                                                    value={externalForm.accountable}
                                                    onChange={handleExternalChange}
                                                >
                                                    <option value="">Pilih accountable</option>
                                                    <option value="LC">LC</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Consulted 1 (optional)</label>
                                                <select
                                                    name="consulted1"
                                                    value={externalForm.consulted1}
                                                    onChange={handleExternalChange}
                                                >
                                                    <option value="">Pilih consulted</option>
                                                    <option value="HRGA">HRGA</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="NV">NV</option>
                                                    <option value="DN">DN</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Consulted 2 (optional)</label>
                                                <select
                                                    name="consulted2"
                                                    value={externalForm.consulted2}
                                                    onChange={handleExternalChange}
                                                >
                                                    <option value="">Pilih consulted</option>
                                                    <option value="HRGA">HRGA</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="NV">NV</option>
                                                    <option value="DN">DN</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Lampiran</label>
                                                <input
                                                    type="text"
                                                    name="lampiran"
                                                    value={externalForm.lampiran}
                                                    onChange={handleExternalChange}
                                                    placeholder="URL lampiran (jika ada)"
                                                />
                                                <span className="helper-text">
                                                    Upload file lampiran ke <a href="http://tinyurl.com/LampiranTicketExternal" target="_blank" rel="noopener noreferrer">folder</a> dan paste link nya di sini
                                                </span>
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Hasil</label>
                                            <textarea
                                                name="hasil"
                                                value={externalForm.hasil}
                                                onChange={handleExternalChange}
                                                placeholder="Hasil penanganan (jika sudah selesai)"
                                            />
                                        </div>

                                        <div className="checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="status-external"
                                                name="status"
                                                checked={externalForm.status}
                                                onChange={handleExternalChange}
                                            />
                                            <label htmlFor="status-external">
                                                Sudah selesai?
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary"
                                                disabled={createExternalMutation.isPending}
                                            >
                                                {createExternalMutation.isPending ? 'Creating...' : 'Create Ticket'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </TabPanel>

                            {/* INTERNAL FORM */}
                            <TabPanel p={0}>
                                <form onSubmit={handleInternalSubmit}>
                                    <div className="form-section">
                                        <div className="form-group full-width">
                                            <label>
                                                Title <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={internalForm.title}
                                                onChange={handleInternalChange}
                                                required
                                                placeholder="Contoh: Request Foto Tes"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>
                                                Description <span className="required">*</span>
                                            </label>
                                            <textarea
                                                name="description"
                                                value={internalForm.description}
                                                onChange={handleInternalChange}
                                                required
                                                placeholder="Jelaskan detail task..."
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Deadline <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="deadline"
                                                    value={internalForm.deadline}
                                                    onChange={handleInternalChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Label <span className="required">*</span>
                                                </label>
                                                <select
                                                    name="label"
                                                    value={internalForm.label}
                                                    onChange={handleInternalChange}
                                                    required
                                                >
                                                    <option value="">Pilih label</option>
                                                    <option value="Administration">Administration</option>
                                                    <option value="Review">Review</option>
                                                    <option value="Research">Research</option>
                                                    <option value="Procedure">Procedure</option>
                                                    <option value="Recruitment">Recruitment</option>
                                                    <option value="Schedule">Schedule</option>
                                                    <option value="Query">Query</option>
                                                    <option value="Complaint">Complaint</option>
                                                    <option value="Request">Request</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="Feedback">Feedback</option>
                                                    <option value="Offboarding">Offboarding</option>
                                                    <option value="Payment">Payment</option>
                                                    <option value="Artist Journal">Artist Journal</option>
                                                    <option value="Siswa Tidak Proaktif">Siswa Tidak Proaktif</option>
                                                    <option value="Presensi Online">Presensi Online</option>
                                                    <option value="Lost and Found">Lost and Found</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Responsible <span className="required">*</span>
                                                </label>
                                                <select
                                                    name="responsible"
                                                    value={internalForm.responsible}
                                                    onChange={handleInternalChange}
                                                    required
                                                >
                                                    <option value="">Pilih responsible</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="Finance - EDS">Finance - EDS</option>
                                                    <option value="Finance - AR">Finance - AR</option>
                                                    <option value="CSO - CM">CSO - CM</option>
                                                    <option value="CSO - YS">CSO - YS</option>
                                                    <option value="JSD">JSD</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="NV">NV</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="DN">DN</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Accountable (optional)</label>
                                                <select
                                                    name="accountable"
                                                    value={internalForm.accountable}
                                                    onChange={handleInternalChange}
                                                >
                                                    <option value="">Pilih accountable</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="Finance - EDS">Finance - EDS</option>
                                                    <option value="Finance - AR">Finance - AR</option>
                                                    <option value="CSO - CM">CSO - CM</option>
                                                    <option value="CSO - YS">CSO - YS</option>
                                                    <option value="JSD">JSD</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="NV">NV</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="DN">DN</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Consulted (optional)</label>
                                                <select
                                                    name="consulted"
                                                    value={internalForm.consulted}
                                                    onChange={handleInternalChange}
                                                >
                                                    <option value="">Pilih consulted</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="Finance - EDS">Finance - EDS</option>
                                                    <option value="Finance - AR">Finance - AR</option>
                                                    <option value="CSO - CM">CSO - CM</option>
                                                    <option value="CSO - YS">CSO - YS</option>
                                                    <option value="JSD">JSD</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="NV">NV</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="DN">DN</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Informed (optional)</label>
                                                <select
                                                    name="informed"
                                                    value={internalForm.informed}
                                                    onChange={handleInternalChange}
                                                >
                                                    <option value="">Pilih informed</option>
                                                    <option value="Marcom">Marcom</option>
                                                    <option value="ESO">ESO</option>
                                                    <option value="Finance - EDS">Finance - EDS</option>
                                                    <option value="Finance - AR">Finance - AR</option>
                                                    <option value="CSO - CM">CSO - CM</option>
                                                    <option value="CSO - YS">CSO - YS</option>
                                                    <option value="JSD">JSD</option>
                                                    <option value="PAS">PAS</option>
                                                    <option value="LC">LC</option>
                                                    <option value="NV">NV</option>
                                                    <option value="MAF">MAF</option>
                                                    <option value="DN">DN</option>
                                                    <option value="AS">AS</option>
                                                    <option value="APH">APH</option>
                                                    <option value="BA">BA</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary"
                                                disabled={createInternalMutation.isPending}
                                            >
                                                {createInternalMutation.isPending ? 'Creating...' : 'Create Ticket'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </StyledCreateTicketing>
        </ContainerCarrot>
    );
}

export default CreateTicketingPage;
