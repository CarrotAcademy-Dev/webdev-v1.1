import { useState, useEffect } from 'react';
import { Box, Button, Input, Select, Textarea, useToast, Checkbox, useColorMode, IconButton, Tooltip } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProspektif, submitProspektifForm, editDataProspektif } from '@/features/cso/csoApiService';
import ContainerCarrot from '@/components/Container';
import { StyledProspektifFormPage } from './ProspektifForm.styled';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCopy, FiExternalLink } from 'react-icons/fi';

function ProspektifFormPage() {
    const { colorMode } = useColorMode();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchPsid, setSearchPsid] = useState('');
    const [currentPsid, setCurrentPsid] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewMode, setIsNewMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const toast = useToast();
    const queryClient = useQueryClient();

    // Auto-load data dari URL parameter
    useEffect(() => {
        const psidFromUrl = searchParams.get('psid');
        if (psidFromUrl && psidFromUrl !== currentPsid) {
            setSearchPsid(psidFromUrl);
            setCurrentPsid(psidFromUrl);
            setIsNewMode(false);
            setIsEditMode(false);
        }
    }, [searchParams, currentPsid]);

    // Query untuk fetch data berdasarkan PSID
    const { data: prospektifData, isLoading, isError } = useQuery({
        queryKey: ['prospektifData', currentPsid],
        queryFn: () => getDataProspektif(currentPsid),
        enabled: !!currentPsid && !isNewMode,
        retry: false
    });

    // Mutation untuk submit form baru
    const submitMutation = useMutation({
        mutationFn: submitProspektifForm,
        onSuccess: (data) => {
            toast({
                title: 'Data berhasil ditambahkan!',
                description: data.message,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setIsNewMode(false);
            setIsEditMode(false);
            setEditedData({});
            queryClient.invalidateQueries(['prospektifData']);
            queryClient.invalidateQueries({ queryKey: ['dashboardProspektifPersonal'] });
        },
        onError: (error) => {
            toast({
                title: 'Gagal menambahkan data',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    });

    
    // Mutation untuk edit data
    const editMutation = useMutation({
        mutationFn: editDataProspektif,
        onSuccess: (data) => {
            if (data.status === 'no_change') {
                toast({
                    title: 'Tidak ada perubahan',
                    description: data.message,
                    status: 'info',
                    duration: 3000,
                    isClosable: true
                });
            } else {
                toast({
                    title: 'Data berhasil diupdate!',
                    description: data.message,
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            }
            setIsEditMode(false);
            queryClient.invalidateQueries(['prospektifData', currentPsid]);
            // Invalidate dashboard query agar checklist terupdate (semua query yang match prefix)
            queryClient.invalidateQueries({ queryKey: ['dashboardProspektifPersonal'] });
            
            // Navigate back ke dashboard prospektif kalau datang dari sana
            const cameFromDashboard = searchParams.get('from') === 'dashboard' || searchParams.get('psid');
            if (cameFromDashboard) {
                // Tentukan field mana yang diubah untuk selective refetch
                const editedFields = Object.keys(editedData || {});
                const needsRefetch = {
                    followUp: editedFields.some(f => f.includes('fu1') || f.includes('fu2') || f.includes('fu3')),
                    trial: editedFields.some(f => f.includes('trial')),
                    firstClass: editedFields.some(f => f.includes('first_class'))
                };
                
                navigate('/my-tasks/dashboard-prospektif', { 
                    state: { 
                        refetchNeeded: true,
                        editedPsid: currentPsid,
                        needsRefetch
                    },
                    replace: true // Replace history agar back button langsung ke dashboard
                });
            }
        },
        onError: (error) => {
            toast({
                title: 'Gagal mengupdate data',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    });

    const handleSearch = () => {
        if (searchPsid.trim()) {
            setCurrentPsid(searchPsid.trim());
            setIsNewMode(false);
            setIsEditMode(false);
            setEditedData({});
        } else {
            toast({
                title: 'PSID harus diisi',
                status: 'warning',
                duration: 2000,
                isClosable: true
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleNewForm = () => {
        setIsNewMode(true);
        setIsEditMode(true);
        setCurrentPsid('');
        setEditedData({
            full_name: '',
            phone_number: '',
            age: '',
            gender: '',
            parent_name: '',
            parent_phone: '',
            first_contact_date: '',
            media_contact: '',
            tahu_carrot_darimana: '',
            referral: '',
            schedule_request: '',
            program: '',
            trial_date: '',
            first_class_date: '',
            goals: '',
            notes: '',
            fu1_ceklis: '',
            notes_fu1: '',
            fu2_ceklis: '',
            notes_fu2: '',
            fu3_ceklis: '',
            notes_fu3: '',
            retention: '',
            program_explained: '',
            pricelist_explained: '',
            trial_ceklis: '',
            target: '',
            registration: '',
            predrawing: '',
            invoice: '',
            onboarding: '',
            class_email: '',
            photo: '',
            qrcode_presence: '',
            reminder: '',
            merchandise: '',
            cancel_check: '',
            prefilled_link_form: ''
        });
    };

    // Helper function untuk convert ISO date ke YYYY-MM-DD format
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        try {
            const date = new Date(isoDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Helper function untuk transform data dari backend ke format yang sesuai untuk form
    const transformDataForEdit = (data) => {
        if (!data) return {};
        
        const transformed = { 
            ...data,
            // Pastikan timestamp dan psid tetap ada untuk edit
            timestamp: data.timestamp,
            psid: data.psid
        };
        
        // Convert date fields dari ISO format ke YYYY-MM-DD
        const dateFields = [
            'first_contact_date',
            'trial_date',
            'first_class_date',
            'fu1_date',
            'fu2_date',
            'fu3_date'
        ];
        
        dateFields.forEach(field => {
            if (transformed[field]) {
                transformed[field] = formatDateForInput(transformed[field]);
            }
        });
        
        // Convert boolean ke string untuk checkbox
        // Pastikan semua boolean field jadi 'true' atau 'false' string, BUKAN empty string
        const booleanFields = [
            'fu1_ceklis', 'fu2_ceklis', 'fu3_ceklis',
            'retention', 'program_explained', 'pricelist_explained',
            'trial_ceklis', 'target', 'registration', 'predrawing',
            'invoice', 'onboarding', 'class_email', 'photo',
            'qrcode_presence', 'reminder', 'merchandise', 'cancel_check'
        ];
        
        booleanFields.forEach(field => {
            const value = transformed[field];
            // Normalize ke 'true' atau 'false' string
            if (value === true || value === 'true') {
                transformed[field] = 'true';
            } else {
                // Apapun selain true/'true' jadi 'false' (termasuk false, 'false', '', null, undefined)
                transformed[field] = 'false';
            }
        });
        
        return transformed;
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setEditedData(transformDataForEdit(prospektifData));
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setIsNewMode(false);
        setEditedData({});
    };

    // Helper function untuk convert YYYY-MM-DD ke ISO timestamp untuk backend
    const formatDateForBackend = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString + 'T00:00:00.000Z');
            return date.toISOString();
        } catch (error) {
            console.error('Error formatting date for backend:', error);
            return '';
        }
    };

    const handleSubmit = () => {
        // Validasi field wajib
        if (!editedData.full_name || !editedData.first_contact_date) {
            toast({
                title: 'Data tidak lengkap',
                description: 'Nama Lengkap dan Tanggal Kontak Pertama wajib diisi',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        // Validasi phone number - minimal salah satu harus diisi
        if (!editedData.phone_number && !editedData.parent_phone) {
            toast({
                title: 'Data tidak lengkap',
                description: 'Minimal salah satu nomor telepon harus diisi (Phone Number atau Parents/Guardian Phone Number)',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        // Convert date fields dari YYYY-MM-DD ke ISO timestamp untuk backend
        const dataToSubmit = { ...editedData };
        const dateFields = [
            'first_contact_date',
            'trial_date',
            'first_class_date',
            'fu1_date',
            'fu2_date',
            'fu3_date'
        ];
        
        dateFields.forEach(field => {
            if (dataToSubmit[field]) {
                dataToSubmit[field] = formatDateForBackend(dataToSubmit[field]);
            }
        });

        if (isNewMode) {
            submitMutation.mutate(dataToSubmit);
        } else {
            editMutation.mutate(dataToSubmit);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper function untuk format ISO date ke readable format (mode view)
    const formatDateForDisplay = (isoDate) => {
        if (!isoDate) return '-';
        try {
            const date = new Date(isoDate);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        } catch (error) {
            console.error('Error formatting date for display:', error);
            return isoDate;
        }
    };

    const renderField = (label, field, type = 'text', required = false) => {
        const value = isEditMode ? (editedData[field] || '') : (prospektifData?.[field] || '');
        
        // Format date untuk display di mode view
        const isDateField = type === 'date';
        const displayValue = (!isEditMode && isDateField && value) 
            ? formatDateForDisplay(value) 
            : (value || '-');
        
        // Special handling untuk link fields
        const isLinkField = field === 'prefilled_link_form';

        return (
            <div className="form-field">
                <label className="field-label">
                    {label} {required && <span style={{ color: '#FE7743' }}>*</span>}
                </label>
                {isEditMode ? (
                    type === 'textarea' ? (
                        <Textarea
                            value={value}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={`Masukkan ${label}`}
                            size="md"
                            resize="vertical"
                            minHeight="100px"
                        />
                    ) : type === 'select' ? (
                        <Select
                            value={value}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={`Pilih ${label}`}
                            size="md"
                        >
                            {field === 'gender' && (
                                <>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </>
                            )}
                            {field === 'program' && (
                                <>
                                    <option value="Trial">Trial</option>
                                    <option value="Full Time Course">Full Time Course</option>
                                    <option value="Portfolio">Portfolio</option>
                                    <option value="Foundation">Foundation</option>
                                    <option value="Drawing Studio">Drawing Studio</option>
                                    <option value="Painting Studio">Painting Studio</option>
                                    <option value="Digital Studio">Digital Studio</option>
                                    <option value="Drawing Accelerated">Drawing Accelerated</option>
                                    <option value="Digital Accelerated">Digital Accelerated</option>
                                </>
                            )}
                            {field === 'media_contact' && (
                                <>
                                    <option value="Visit">Visit</option>
                                    <option value="Call">Call</option>
                                    <option value="Whatsapp">Whatsapp</option>
                                    <option value="Whatsapp Call">Whatsapp Call</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Referral">Referral</option>
                                    
                                </>
                            )}
                        </Select>
                    ) : (
                        <Input
                            type={type}
                            value={value}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={`Masukkan ${label}`}
                            size="md"
                        />
                    )
                ) : (
                    <div className={`field-value ${!value ? 'empty' : ''}`}>
                        {isLinkField && value ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a 
                                    href={value} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#4346feff',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FiExternalLink size={16} />
                                    Buka Prefilled Form
                                </a>
                                <Tooltip label="Copy link" placement="top">
                                    <IconButton
                                        icon={<FiCopy />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="blue"
                                        onClick={() => {
                                            navigator.clipboard.writeText(value);
                                            toast({
                                                title: 'Link berhasil dicopy!',
                                                status: 'success',
                                                duration: 2000,
                                                isClosable: true
                                            });
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        ) : (
                            displayValue
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderCheckbox = (label, field) => {
        const value = isEditMode ? editedData[field] : prospektifData?.[field];
        const isChecked = value === 'true' || value === true;
        
        // Special styling untuk cancel_check field - warna merah di edit mode
        const isCancelCheck = field === 'cancel_check';
        const checkboxColor = (isEditMode && isCancelCheck) ? 'red' : 'orange';

        return (
            <div className="checkbox-field">
                {isEditMode ? (
                    <Checkbox
                        isChecked={isChecked}
                        onChange={(e) => handleInputChange(field, e.target.checked ? 'true' : 'false')}
                        colorScheme={checkboxColor}
                    >
                        <span style={isCancelCheck ? { color: '#E53E3E', fontWeight: '600' } : {}}>
                            {label}
                        </span>
                    </Checkbox>
                ) : (
                    <>
                        <div className={`readonly-checkbox ${isChecked ? 'checked' : ''}`} />
                        <span>{label}</span>
                    </>
                )}
            </div>
        );
    };

    return (
        <ContainerCarrot>
            <StyledProspektifFormPage data-theme={colorMode}>
                <h1 className="page-title">Prospektif Form</h1>

                <div className="form-container">
                    <div className="search-section">
                        <div className="search-input-wrapper">
                            <Box>
                                <label className="field-label">Search By PSID</label>
                                <Input
                                    placeholder="Masukkan PSID..."
                                    value={searchPsid}
                                    onChange={(e) => setSearchPsid(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    size="lg"
                                    disabled={isNewMode}
                                />
                            </Box>
                        </div>
                        <Button
                            colorScheme="blue"
                            onClick={handleSearch}
                            size="lg"
                            isDisabled={isNewMode}
                            bg="blue.500"
                            _hover={{ bg: 'blue.600' }}
                            color="white"
                        >
                            Cari
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleNewForm}
                            size="lg"
                            isDisabled={isNewMode}
                            bg="green.500"
                            _hover={{ bg: 'green.600' }}
                            color="white"
                        >
                            Form Baru
                        </Button>
                    </div>

                    {(currentPsid || isNewMode) && (
                        <>
                            <div className="button-group">
                                {!isNewMode && !isEditMode && (
                                    <Button colorScheme="orange" onClick={handleEdit}>
                                        Edit Data
                                    </Button>
                                )}
                                {isEditMode && (
                                    <>
                                        <Button
                                            colorScheme="green"
                                            onClick={handleSubmit}
                                            isLoading={submitMutation.isPending || editMutation.isPending}
                                        >
                                            {isNewMode ? 'Submit Form Baru' : 'Simpan Perubahan'}
                                        </Button>
                                        <Button colorScheme="red" variant="outline" onClick={handleCancel}>
                                            Batal
                                        </Button>
                                    </>
                                )}
                            </div>

                            {isLoading && !isNewMode ? (
                                <div className="empty-state">Memuat data...</div>
                            ) : isError && !isNewMode ? (
                                <div className="error-state">Data dengan PSID tersebut tidak ditemukan</div>
                            ) : (
                                <>
                                    {/* Informasi Dasar */}
                                    <div className="form-section">
                                        <h3 className="section-title">Personal Information</h3>
                                        <div className="form-grid">
                                            {!isNewMode && renderField('PSID', 'psid')}
                                            {renderField('Full Name', 'full_name', 'text', true)}
                                            {renderField('Phone Number', 'phone_number', 'tel')}
                                            {renderField('Age', 'age', 'text')}
                                            {renderField('Gender', 'gender', 'select')}
                                        </div>
                                    </div>

                                    {/* Informasi Orang Tua */}
                                    <div className="form-section">
                                        <h3 className="section-title">Parents/Guardian Information</h3>
                                        <div className="form-grid">
                                            {renderField('Parents/Guardian Name', 'parent_name')}
                                            {renderField('Parents/Guardian Phone Number', 'parent_phone', 'tel')}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="form-section">
                                        <h3 className="section-title">Contact Information</h3>
                                        <div className="form-grid">
                                            {renderField('First Contact Date', 'first_contact_date', 'date', true)}
                                            {renderField('Contact Media', 'media_contact', 'select')}
                                            {renderField('How Did They Know Carrot?', 'tahu_carrot_darimana')}
                                            {renderField('Referral', 'referral')}
                                        </div>
                                    </div>

                                    {/* Program Information */}
                                    <div className="form-section">
                                        <h3 className="section-title">Program Information</h3>
                                        <div className="form-grid">
                                            {renderField('Schedule Request', 'schedule_request')}
                                            {renderField('Program', 'program', 'select')}
                                            {renderField('Trial Date', 'trial_date', 'date')}
                                            {renderField('First Class Date', 'first_class_date', 'date')}
                                            {renderField('Prefilled Link Form', 'prefilled_link_form')}
                                        </div>
                                    </div>

                                    {/* Follow Up Progress */}
                                    <div className="form-section">
                                        <h3 className="section-title">Progress Follow Up</h3>
                                        <div className="form-grid">
                                            {renderField('FU1 Date', 'fu1_date', 'date')}
                                            {renderField('FU2 Date', 'fu2_date', 'date')}
                                            {renderField('FU3 Date', 'fu3_date', 'date')}
                                        </div>
                                        <div className="checkbox-grid">
                                            {renderCheckbox('FU1 Ceklis', 'fu1_ceklis')}
                                            {renderCheckbox('FU2 Ceklis', 'fu2_ceklis')}
                                            {renderCheckbox('FU3 Ceklis', 'fu3_ceklis')}
                                        </div>
                                    </div>

                                    {/* Progress Checklist */}
                                    <div className="form-section">
                                        <h3 className="section-title">Progress Checklist</h3>
                                        <div className="checkbox-grid">
                                            {renderCheckbox('Retention', 'retention')}
                                            {renderCheckbox('Program Explained', 'program_explained')}
                                            {renderCheckbox('Pricelist Explained', 'pricelist_explained')}
                                            {renderCheckbox('Trial Ceklis', 'trial_ceklis')}
                                            {renderCheckbox('Target', 'target')}
                                            {renderCheckbox('Registration', 'registration')}
                                            {renderCheckbox('Predrawing', 'predrawing')}
                                            {renderCheckbox('Invoice', 'invoice')}
                                            {renderCheckbox('Onboarding', 'onboarding')}
                                            {renderCheckbox('Class Email', 'class_email')}
                                            {renderCheckbox('Photo', 'photo')}
                                            {renderCheckbox('QR Code Presence', 'qrcode_presence')}
                                            {renderCheckbox('Reminder', 'reminder')}
                                            {renderCheckbox('Merchandise', 'merchandise')}
                                        </div>

                                        {/* Cancel Check Section */}
                                        <div className="checkbox-grid" style={{ marginTop: '1rem'}}>
                                            {renderCheckbox('Cancel?', 'cancel_check')}
                                        </div>
                                    </div>

                                    {/* Notes Section */}
                                    <div className="notes-section">
                                        <h3 className="section-title">Notes</h3>
                                        <div className="notes-grid">
                                            {renderField('Goals', 'goals', 'textarea')}
                                            {renderField('Notes', 'notes', 'textarea')}
                                            {renderField('Notes FU1', 'notes_fu1', 'textarea')}
                                            {renderField('Notes FU2', 'notes_fu2', 'textarea')}
                                            {renderField('Notes FU3', 'notes_fu3', 'textarea')}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!currentPsid && !isNewMode && (
                        <div className="empty-state">
                            Silakan cari data dengan PSID atau buat form baru
                        </div>
                    )}
                </div>
            </StyledProspektifFormPage>
        </ContainerCarrot>
    );
}

export default ProspektifFormPage;
