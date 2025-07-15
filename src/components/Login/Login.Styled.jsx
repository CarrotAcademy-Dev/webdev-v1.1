import styled from 'styled-components';

const StyledLoginPage = styled.main`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    .login-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        max-width: 900px;
        background-color: white;
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .form-section {
        padding: 3rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .subtitle {
        color: #718096;
    }
    .title {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
    }
    .forgot-password {
        display: block;
        text-align: right;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        color: #718096;
    }
    .login-button {
        width: 100%;
        margin-top: 2rem;
        padding: 1.5rem 0;
        font-weight: bold;
    }
    .signup-link {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.875rem;
        color: #718096;
        a {
            color: #FE7743;
            font-weight: bold;
        }
    }
    .image-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        position: relative;
    }
    .logo {
        position: absolute;
        top: 2rem;
        right: 2rem;
        width: 150px;
    }
    .illustration {
        max-width: 100%;
        height: auto;
    }
    @media (max-width: 768px) {
        .login-card {
            grid-template-columns: 1fr;
        }
        .image-section {
            display: none;
        }
    }
`;

export default StyledLoginPage;