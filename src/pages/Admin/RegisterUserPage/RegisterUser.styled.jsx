import styled from 'styled-components';

export const StyledRegisterUserPage = styled.div`
    .page-header {
        margin-bottom: 2rem;
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 0.5rem;
    }

    .page-subtitle {
        font-size: 1rem;
        color: #666;
    }

    .register-container {
        max-width: 700px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        padding: 2.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .access-denied {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .access-denied-icon {
        font-size: 4rem;
        color: #dc3545;
        margin-bottom: 1rem;
    }

    .access-denied-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
    }

    .access-denied-text {
        color: #666;
        margin-bottom: 1.5rem;
    }

    .form-section {
        margin-bottom: 2rem;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #FE7743;
    }

    .form-grid {
        display: grid;
        gap: 1.5rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .field-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: #555;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .required-mark {
        color: #FE7743;
        font-weight: 700;
    }

    .field-hint {
        font-size: 0.85rem;
        color: #777;
        margin-top: 0.25rem;
    }

    .field-error {
        font-size: 0.85rem;
        color: #dc3545;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .field-success {
        font-size: 0.85rem;
        color: #28a745;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .password-strength {
        margin-top: 0.5rem;
    }

    .strength-bar {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .strength-fill {
        height: 100%;
        transition: width 0.3s ease, background 0.3s ease;
    }

    .strength-fill.weak {
        width: 33%;
        background: #dc3545;
    }

    .strength-fill.medium {
        width: 66%;
        background: #ffc107;
    }

    .strength-fill.strong {
        width: 100%;
        background: #28a745;
    }

    .strength-text {
        font-size: 0.85rem;
        font-weight: 500;
    }

    .strength-text.weak {
        color: #dc3545;
    }

    .strength-text.medium {
        color: #ffc107;
    }

    .strength-text.strong {
        color: #28a745;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e0e0e0;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .role-info {
        padding: 1rem;
        background: #f8f9fa;
        border-left: 4px solid #FE7743;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .role-info-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
    }

    .role-info-list {
        font-size: 0.9rem;
        color: #666;
        margin-left: 1rem;
    }

    @media (max-width: 768px) {
        .register-container {
            padding: 1.5rem;
        }

        .button-group {
            flex-direction: column;
        }

        .form-actions {
            flex-direction: column-reverse;
        }
    }
`;
