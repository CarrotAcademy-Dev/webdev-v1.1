import styled from '@emotion/styled';

const StyledProfilePage = styled.div`
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;

    .profile-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 3rem;
        padding: 2rem;
        background: var(--card-bg);
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        @media (max-width: 768px) {
            flex-direction: column;
            text-align: center;
        }
    }

    .profile-avatar-large {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
        font-weight: 700;
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        flex-shrink: 0;
    }

    .profile-info {
        flex: 1;

        h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.5rem 0;
        }

        .profile-subtitle {
            font-size: 1.1rem;
            color: #FE7743;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .profile-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1rem;

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                color: var(--text-secondary);

                svg {
                    color: #FE7743;
                }
            }
        }
    }

    .profile-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .info-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
        transition: all 0.2s;

        &:hover {
            border-color: rgba(254, 119, 67, 0.3);
            box-shadow: 0 4px 12px rgba(254, 119, 67, 0.2);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);

            svg {
                font-size: 1.5rem;
                color: #FE7743;
            }

            h3 {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
            }

            .badge-new {
                background: #FE7743;
                color: white;
                font-size: 0.7rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-weight: 600;
                margin-left: auto;
            }
        }

        .card-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;

        .label {
            font-size: 0.9rem;
            color: var(--text-secondary);
            font-weight: 500;
            min-width: 120px;
        }

        .value {
            font-size: 0.9rem;
            color: var(--text-primary);
            font-weight: 600;
            text-align: right;
            flex: 1;
            word-break: break-word;

            &.highlight {
                color: #FE7743;
            }

            &.success {
                color: #48BB78;
            }

            &.warning {
                color: #ED8936;
            }
        }
    }

    .work-duration-card {
        .duration-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;

            @media (max-width: 480px) {
                grid-template-columns: 1fr;
            }
        }

        .duration-item {
            text-align: center;
            padding: 1rem;
            background: var(--input-bg);
            border-radius: 8px;

            .duration-label {
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-bottom: 0.5rem;
            }

            .duration-value {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--text-primary);

                &.large {
                    font-size: 1.5rem;
                    color: #FE7743;
                }
            }
        }

        .progress-bar {
            margin-top: 1rem;
            
            .progress-label {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                color: var(--text-secondary);
                margin-bottom: 0.5rem;
            }

            .progress-track {
                height: 8px;
                background: var(--input-bg);
                border-radius: 4px;
                overflow: hidden;

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #FE7743 0%, #f5576c 100%);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
            }
        }
    }

    .detail-section {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-top: 2rem;

        h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 2rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;

            @media (max-width: 768px) {
                grid-template-columns: 1fr;
            }
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .detail-label {
                font-size: 0.85rem;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .detail-value {
                font-size: 0.95rem;
                color: var(--text-primary);
                font-weight: 600;
                padding: 0.75rem;
                background: var(--input-bg);
                border-radius: 6px;

                &.empty {
                    color: var(--text-muted);
                    font-style: italic;
                }
            }
        }
    }

    .document-links {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;

        a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--input-bg);
            border-radius: 6px;
            color: #FE7743;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;

            &:hover {
                background: #FE7743;
                color: white;
                transform: translateY(-2px);
            }

            svg {
                font-size: 1rem;
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .profile-header {
            padding: 1.5rem;

            h1 {
                font-size: 1.5rem;
            }
        }

        .info-row {
            flex-direction: column;
            align-items: flex-start;

            .value {
                text-align: left;
            }
        }
    }
`;

export default StyledProfilePage;
