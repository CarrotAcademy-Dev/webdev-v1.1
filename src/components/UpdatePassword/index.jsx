import React, { useState, useContext } from 'react';
import { 
    Button, 
    Input, 
    InputGroup,
    InputRightElement,
    FormControl, 
    FormLabel,
} from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StyledUpdatePasswordPage from './UpdatePassword.Styled';
import { updatePassword, validatePassword } from '@/features/auth/authApiService';
import { AuthContext } from '@/context/AuthContext';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

function UpdatePassword() {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Semua field harus diisi');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok');
            return;
        }

        if (oldPassword === newPassword) {
            setError('Password baru harus berbeda dengan password lama');
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('Password baru tidak memenuhi persyaratan keamanan');
            return;
        }

        setIsLoading(true);

        try {
            console.log('[Update Password] Submitting with email:', currentUser.email);
            const result = await updatePassword(currentUser.email, oldPassword, newPassword);
            console.log('[Update Password] Success:', result);
            
            setMessage(result.message || 'Password berhasil diubah! Anda akan logout otomatis dalam 3 detik...');
            
            // Clear form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Auto logout after 3 seconds
            setTimeout(async () => {
                await logout();
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('[Update Password] Error caught:', err);
            // Display the backend error message directly
            const errorMessage = err.message || 'Gagal mengubah password. Pastikan password lama Anda benar.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <StyledUpdatePasswordPage>
            <div className="update-card">
                <div className="icon-wrapper">
                    <FiLock />
                </div>
                
                <h1 className="title">Ubah Password</h1>
                <p className="subtitle">
                    Ubah password Anda untuk keamanan akun yang lebih baik.
                </p>

                <form onSubmit={handleSubmit}>
                    <FormControl id="oldPassword" isRequired className="form-control">
                        <FormLabel>Password Lama</FormLabel>
                        <InputGroup>
                            <Input 
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder="Masukkan password lama"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                size="lg"
                            />
                            <InputRightElement height="100%">
                                <Button 
                                    h="1.75rem" 
                                    size="sm" 
                                    onClick={() => setShowOldPassword(!showOldPassword)} 
                                    variant="ghost"
                                >
                                    {showOldPassword ? <FiEyeOff /> : <FiEye />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    <FormControl id="newPassword" isRequired className="form-control">
                        <FormLabel>Password Baru</FormLabel>
                        <InputGroup>
                            <Input 
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Masukkan password baru"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                size="lg"
                            />
                            <InputRightElement height="100%">
                                <Button 
                                    h="1.75rem" 
                                    size="sm" 
                                    onClick={() => setShowNewPassword(!showNewPassword)} 
                                    variant="ghost"
                                >
                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <PasswordStrengthIndicator password={newPassword} />
                    </FormControl>

                    <FormControl id="confirmPassword" isRequired className="form-control">
                        <FormLabel>Konfirmasi Password Baru</FormLabel>
                        <InputGroup>
                            <Input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi password baru"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                size="lg"
                            />
                            <InputRightElement height="100%">
                                <Button 
                                    h="1.75rem" 
                                    size="sm" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    variant="ghost"
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    {message && (
                        <div className="success-message">
                            <p>{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    <Button
                        className="submit-button"
                        bg="#f5576c"
                        color="white"
                        rightIcon={<FiCheck />}
                        _hover={{ bg: '#f093fb' }}
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!oldPassword || !newPassword || !confirmPassword}
                    >
                        UBAH PASSWORD
                    </Button>
                </form>

                <div className="back-link" onClick={handleBack}>
                    <FiArrowLeft />
                    Kembali
                </div>
            </div>
        </StyledUpdatePasswordPage>
    );
}

export default UpdatePassword;
