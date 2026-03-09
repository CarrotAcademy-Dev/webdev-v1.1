import styled from '@emotion/styled';

const StyledForgotPasswordPage = styled.div`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;

    .forgot-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        max-width: 500px;
        width: 100%;
        padding: 3rem;
    }

    .icon-wrapper {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        
        svg {
            font-size: 4rem;
            color: #FE7743;
        }
    }

    .title {
        font-size: 2rem;
        font-weight: 700;
        color: #2D3748;
        margin-bottom: 0.5rem;
        text-align: center;
    }

    .subtitle {
        color: #718096;
        margin-bottom: 2rem;
        text-align: center;
        font-size: 0.95rem;
    }

    .submit-button {
        width: 100%;
        margin-top: 1.5rem;
        height: 3rem;
        font-weight: 600;
        font-size: 1rem;
    }

    .back-link {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1.5rem;
        color: #667eea;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
            color: #764ba2;
        }

        svg {
            margin-right: 0.5rem;
        }
    }

    .success-message {
        background: #C6F6D5;
        border: 1px solid #9AE6B4;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
        
        p {
            color: #22543D;
            margin: 0;
            font-size: 0.9rem;
        }
    }

    .error-message {
        background: #FED7D7;
        border: 1px solid #FC8181;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
        
        p {
            color: #742A2A;
            margin: 0;
            font-size: 0.9rem;
        }
    }
`;

export default StyledForgotPasswordPage;
