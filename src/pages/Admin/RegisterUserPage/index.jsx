import { useState, useContext, useEffect } from 'react';
import { Box, Button, Input, Select, useToast, FormControl, InputGroup, InputRightElement, IconButton, useColorMode } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { registerUser, validatePassword, getPasswordValidationMessage } from '@/features/auth/authApiService';
import ContainerCarrot from '@/components/Container';
import { StyledRegisterUserPage } from './RegisterUser.styled';
import { AuthContext } from '@/context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function RegisterUserPage() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Role-based access control
    const hasAccess = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        jabatan: '',
        role: 'staff',
        aktif: 'ya'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [errors, setErrors] = useState({});

    // Calculate password strength
    useEffect(() => {
        if (!formData.password) {
            setPasswordStrength('');
            return;
        }

        if (validatePassword(formData.password)) {
            setPasswordStrength('strong');
        } else if (formData.password.length >= 8) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('weak');
        }
    }, [formData.password]);

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            toast({
                title: 'Registrasi Berhasil!',
                description: data.message,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            // Reset form
            setFormData({
                nama: '',
                email: '',
                password: '',
                confirmPassword: '',
                jabatan: '',
                role: 'staff',
                aktif: 'ya'
            });
            setErrors({});
        },
        onError: (error) => {
            toast({
                title: 'Registrasi Gagal',
                description: error.message,
                status: 'error',
                duration: 4000,
                isClosable: true
            });
        }
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate all required fields
        if (!formData.nama.trim()) {
            newErrors.nama = 'Nama lengkap wajib diisi';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = getPasswordValidationMessage();
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        if (!formData.jabatan.trim()) {
            newErrors.jabatan = 'Jabatan wajib diisi';
        }

        if (!formData.role) {
            newErrors.role = 'Role wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast({
                title: 'Data Tidak Lengkap',
                description: 'Mohon lengkapi semua field yang wajib diisi',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        // Prepare data (exclude confirmPassword)
        const { confirmPassword: _confirmPassword, ...submitData } = formData;
        registerMutation.mutate(submitData);
    };

    const handleReset = () => {
        setFormData({
            nama: '',
            email: '',
            password: '',
            confirmPassword: '',
            jabatan: '',
            role: 'staff',
            aktif: 'ya'
        });
        setErrors({});
    };

    // Access denied UI
    if (!hasAccess) {
        return (
            <ContainerCarrot>
                <StyledRegisterUserPage>
                    <div className="access-denied">
                        <div className="access-denied-icon">
                            <FiShield />
                        </div>
                        <h2 className="access-denied-title">Akses Ditolak</h2>
                        <p className="access-denied-text">
                            Halaman ini hanya dapat diakses oleh Admin atau Super Admin.
                        </p>
                        <Button colorScheme="orange" onClick={() => navigate('/dashboard')}>
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </StyledRegisterUserPage>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <StyledRegisterUserPage data-theme={colorMode}>
                <div className="page-header">
                    <h1 className="page-title">Registrasi User Baru</h1>
                    <p className="page-subtitle">
                        Buat akun untuk karyawan baru atau user sistem
                    </p>
                </div>

                <div className="register-container">
                    <div className="role-info">
                        <div className="role-info-title">📌 Informasi Role:</div>
                        <ul className="role-info-list">
                            <li><strong>super_admin:</strong> Akses penuh ke semua fitur sistem</li>
                            <li><strong>admin:</strong> Dapat mengelola user dan akses fitur admin</li>
                            <li><strong>staff:</strong> Akses terbatas sesuai jabatan (CSO, ESO, dll)</li>
                        </ul>
                    </div>

                    {/* Informasi Akun */}
                    <div className="form-section">
                        <h3 className="section-title">Informasi Akun</h3>
                        <div className="form-grid">
                            <FormControl isInvalid={!!errors.nama}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Nama Lengkap <span className="required-mark">*</span>
                                    </label>
                                    <Input
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.nama}
                                        onChange={(e) => handleInputChange('nama', e.target.value)}
                                        size="lg"
                                    />
                                    {errors.nama && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.nama}
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            <FormControl isInvalid={!!errors.email}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Email <span className="required-mark">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="nama@role.carrotacademy.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        size="lg"
                                    />
                                    {errors.email && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.email}
                                        </div>
                                    )}
                                    {!errors.email && formData.email && (
                                        <div className="field-success">
                                            <FiCheckCircle /> Email valid
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            <FormControl isInvalid={!!errors.password}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Password <span className="required-mark">*</span>
                                    </label>
                                    <InputGroup size="lg">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Masukkan password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    <div className="field-hint">
                                        {getPasswordValidationMessage()}
                                    </div>
                                    {formData.password && (
                                        <div className="password-strength">
                                            <div className="strength-bar">
                                                <div className={`strength-fill ${passwordStrength}`} />
                                            </div>
                                            <div className={`strength-text ${passwordStrength}`}>
                                                {passwordStrength === 'weak' && 'Password lemah'}
                                                {passwordStrength === 'medium' && 'Password sedang'}
                                                {passwordStrength === 'strong' && 'Password kuat'}
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.password}
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            <FormControl isInvalid={!!errors.confirmPassword}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Konfirmasi Password <span className="required-mark">*</span>
                                    </label>
                                    <InputGroup size="lg">
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Ulangi password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    {errors.confirmPassword && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.confirmPassword}
                                        </div>
                                    )}
                                    {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <div className="field-success">
                                            <FiCheckCircle /> Password cocok
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                        </div>
                    </div>

                    {/* Informasi Pekerjaan */}
                    <div className="form-section">
                        <h3 className="section-title">Informasi Pekerjaan</h3>
                        <div className="form-grid">
                            <FormControl isInvalid={!!errors.jabatan}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Jabatan <span className="required-mark">*</span>
                                    </label>
                                    <Input
                                        placeholder="Contoh: Customer Support Officer, HR&GA Officer, dll."
                                        value={formData.jabatan}
                                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                                        size="lg"
                                    />
                                    {errors.jabatan && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.jabatan}
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            <FormControl isInvalid={!!errors.role}>
                                <div className="form-field">
                                    <label className="field-label">
                                        Role <span className="required-mark">*</span>
                                    </label>
                                    <Select
                                        value={formData.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        size="lg"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </Select>
                                    {errors.role && (
                                        <div className="field-error">
                                            <FiAlertCircle /> {errors.role}
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            <FormControl>
                                <div className="form-field">
                                    <label className="field-label">
                                        Status Aktif <span className="required-mark">*</span>
                                    </label>
                                    <Select
                                        value={formData.aktif}
                                        onChange={(e) => handleInputChange('aktif', e.target.value)}
                                        size="lg"
                                    >
                                        <option value="ya">Aktif</option>
                                        <option value="tidak">Tidak Aktif</option>
                                    </Select>
                                    <div className="field-hint">
                                        User dengan status "Tidak Aktif" tidak dapat login
                                    </div>
                                </div>
                            </FormControl>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="button-group">
                        <div className="form-actions">
                            <Button
                                colorScheme="red"
                                variant="outline"
                                size="lg"
                                onClick={handleReset}
                                isDisabled={registerMutation.isPending}
                            >
                                Reset Form
                            </Button>
                            <Button
                                colorScheme="green"
                                size="lg"
                                onClick={handleSubmit}
                                isLoading={registerMutation.isPending}
                                loadingText="Mendaftar..."
                            >
                                Daftar User Baru
                            </Button>
                        </div>
                    </div>
                </div>
            </StyledRegisterUserPage>
        </ContainerCarrot>
    );
}

export default RegisterUserPage;
