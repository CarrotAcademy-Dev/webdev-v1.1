import React, { useState } from 'react';
import { 
    Button, 
    Input, 
    FormControl, 
    FormLabel,
    Link
} from '@chakra-ui/react';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import StyledForgotPasswordPage from './ForgotPassword.Styled';
import { forgotPassword } from '@/features/auth/authApiService';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const result = await forgotPassword(email);
            setMessage(result.message || 'Password sementara telah dikirim ke email Anda. Silakan cek inbox atau spam folder.');
            setEmail(''); // Clear email field
        } catch (err) {
            setError(err.message || 'Gagal memproses permintaan. Pastikan email Anda terdaftar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StyledForgotPasswordPage>
            <div className="forgot-card">
                <div className="icon-wrapper">
                    <FiMail />
                </div>
                
                <h1 className="title">Lupa Password?</h1>
                <p className="subtitle">
                    Masukkan email Anda dan kami akan mengirimkan password sementara untuk reset akun Anda.
                </p>

                <form onSubmit={handleSubmit}>
                    <FormControl id="email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input 
                            type="email"
                            placeholder="email@carrotacademy.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="lg"
                        />
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
                        bg="#FE7743"
                        color="white"
                        rightIcon={<FiArrowRight />}
                        _hover={{ bg: '#E46A3A' }}
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!email}
                    >
                        KIRIM PASSWORD BARU
                    </Button>
                </form>

                <Link className="back-link" as={RouterLink} to="/login">
                    <FiArrowLeft />
                    Kembali ke Login
                </Link>
            </div>
        </StyledForgotPasswordPage>
    );
}

export default ForgotPassword;
