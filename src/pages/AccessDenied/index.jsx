import { Button } from '@chakra-ui/react';
import { FiShield, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledAccessDenied = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .access-denied-container {
        background: white;
        border-radius: 16px;
        padding: 3rem;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .icon-wrapper {
        font-size: 5rem;
        color: #dc3545;
        margin-bottom: 1.5rem;
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
    }

    .title {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 1rem;
    }

    .subtitle {
        font-size: 1.1rem;
        color: #666;
        margin-bottom: 0.5rem;
    }

    .message {
        font-size: 0.95rem;
        color: #888;
        margin-bottom: 2rem;
        line-height: 1.6;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    @media (max-width: 768px) {
        .access-denied-container {
            padding: 2rem 1.5rem;
        }

        .title {
            font-size: 1.5rem;
        }

        .button-group {
            flex-direction: column;
        }
    }
`;

function AccessDenied() {
    const navigate = useNavigate();

    return (
        <StyledAccessDenied>
            <div className="access-denied-container">
                <div className="icon-wrapper">
                    <FiShield />
                </div>
                <h1 className="title">Akses Ditolak</h1>
                <p className="subtitle">Anda tidak memiliki izin untuk mengakses halaman ini</p>
                <p className="message">
                    Halaman ini hanya dapat diakses oleh user dengan jabatan atau role tertentu.
                    Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
                </p>
                <div className="button-group">
                    <Button
                        leftIcon={<FiHome />}
                        colorScheme="orange"
                        size="lg"
                        onClick={() => navigate('/home')}
                    >
                        Kembali ke Dashboard
                    </Button>
                    <Button
                        colorScheme="gray"
                        size="lg"
                        onClick={() => navigate(-1)}
                    >
                        Halaman Sebelumnya
                    </Button>
                </div>
            </div>
        </StyledAccessDenied>
    );
}

export default AccessDenied;
