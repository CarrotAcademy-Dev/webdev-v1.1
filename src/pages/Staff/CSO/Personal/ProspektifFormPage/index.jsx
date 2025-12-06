import { useState } from 'react';
import { Box, Button, Input, Select, Textarea, useToast, Checkbox } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProspektif, submitProspektifForm, editDataProspektif } from '@/features/cso/csoApiService';
import ContainerCarrot from '@/components/Container';
import { StyledProspektifFormPage } from './ProspektifForm.styled';

function ProspektifFormPage() {
    const [searchPsid, setSearchPsid] = useState('');
    const [currentPsid, setCurrentPsid] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewMode, setIsNewMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const toast = useToast();
    const queryClient = useQueryClient();

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
            merchandise: ''
        });
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setEditedData({ ...prospektifData });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setIsNewMode(false);
        setEditedData({});
    };

    const handleSubmit = () => {
        // Validasi field wajib
        if (!editedData.full_name || !editedData.phone_number || !editedData.first_contact_date) {
            toast({
                title: 'Data tidak lengkap',
                description: 'Nama Lengkap, Nomor HP, dan Tanggal Kontak Pertama wajib diisi',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        if (isNewMode) {
            submitMutation.mutate(editedData);
        } else {
            editMutation.mutate(editedData);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const renderField = (label, field, type = 'text', required = false) => {
        const value = isEditMode ? (editedData[field] || '') : (prospektifData?.[field] || '');
        const displayValue = value || '-';

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
                                    <option value="Studio">Studio</option>
                                    <option value="Full Time">Full Time</option>
                                </>
                            )}
                            {field === 'media_contact' && (
                                <>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Telepon">Telepon</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Email">Email</option>
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
                        {displayValue}
                    </div>
                )}
            </div>
        );
    };

    const renderCheckbox = (label, field) => {
        const isChecked = isEditMode 
            ? editedData[field] === 'true' || editedData[field] === true
            : prospektifData?.[field] === 'true' || prospektifData?.[field] === true;

        return (
            <div className="checkbox-field">
                {isEditMode ? (
                    <Checkbox
                        isChecked={isChecked}
                        onChange={(e) => handleInputChange(field, e.target.checked.toString())}
                        colorScheme="orange"
                    >
                        {label}
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
            <StyledProspektifFormPage>
                <h1 className="page-title">Prospektif Form</h1>

                <div className="form-container">
                    <div className="search-section">
                        <div className="search-input-wrapper">
                            <Box>
                                <label className="field-label">Cari berdasarkan PSID</label>
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
                            colorScheme="orange"
                            onClick={handleSearch}
                            size="lg"
                            isDisabled={isNewMode}
                        >
                            Cari
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleNewForm}
                            size="lg"
                            isDisabled={isNewMode}
                        >
                            Form Baru
                        </Button>
                    </div>

                    {(currentPsid || isNewMode) && (
                        <>
                            <div className="button-group">
                                {!isNewMode && !isEditMode && (
                                    <Button colorScheme="blue" onClick={handleEdit}>
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
                                        <Button colorScheme="gray" onClick={handleCancel}>
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
                                        <h3 className="section-title">Informasi Dasar</h3>
                                        <div className="form-grid">
                                            {!isNewMode && renderField('PSID', 'psid')}
                                            {renderField('Nama Lengkap', 'full_name', 'text', true)}
                                            {renderField('Nomor HP', 'phone_number', 'tel', true)}
                                            {renderField('Umur', 'age', 'number')}
                                            {renderField('Jenis Kelamin', 'gender', 'select')}
                                        </div>
                                    </div>

                                    {/* Informasi Orang Tua */}
                                    <div className="form-section">
                                        <h3 className="section-title">Informasi Orang Tua</h3>
                                        <div className="form-grid">
                                            {renderField('Nama Orang Tua', 'parent_name')}
                                            {renderField('Nomor HP Orang Tua', 'parent_phone', 'tel')}
                                        </div>
                                    </div>

                                    {/* Informasi Kontak */}
                                    <div className="form-section">
                                        <h3 className="section-title">Informasi Kontak</h3>
                                        <div className="form-grid">
                                            {renderField('Tanggal Kontak Pertama', 'first_contact_date', 'date', true)}
                                            {renderField('Media Kontak', 'media_contact', 'select')}
                                            {renderField('Tahu Carrot Dari', 'tahu_carrot_darimana')}
                                            {renderField('Referral', 'referral')}
                                        </div>
                                    </div>

                                    {/* Informasi Program */}
                                    <div className="form-section">
                                        <h3 className="section-title">Informasi Program</h3>
                                        <div className="form-grid">
                                            {renderField('Jadwal yang Diminta', 'schedule_request')}
                                            {renderField('Program', 'program', 'select')}
                                            {renderField('Tanggal Trial', 'trial_date', 'date')}
                                            {renderField('Tanggal Kelas Pertama', 'first_class_date', 'date')}
                                        </div>
                                    </div>

                                    {/* Follow Up Progress */}
                                    <div className="form-section">
                                        <h3 className="section-title">Progress Follow Up</h3>
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
                                    </div>

                                    {/* Notes Section */}
                                    <div className="notes-section">
                                        <h3 className="section-title">Catatan</h3>
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
