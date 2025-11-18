import styled from "@emotion/styled";

export const StyledPendaftaranLanjutanPage = styled.div`
    width: 100%;
    padding: 2rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: #2D3748;
    }

    .hero-section {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
        margin-bottom: 2rem;

        .hero-section__left {
            flex: 2;
        }

        .hero-section__right {
            flex: 1;
            
            & > div {
                height: 100%;
            }
        }

        .stats-grid-prospective {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .progress-info {
            width: 100%;
            
            h3 {
                font-size: 1.1rem;
                font-weight: 600;
                color: #2D3748;
                margin-bottom: 1rem;
            }

            .progress-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;

                .percentage {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #F97316;
                }

                .count {
                    font-size: 0.9rem;
                    color: #718096;
                }
            }

            .progress-bar {
                width: 100%;
                height: 12px;
                background-color: #E2E8F0;
                border-radius: 6px;
                overflow: hidden;

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #F97316 0%, #FBBF24 100%);
                    transition: width 0.3s ease;
                    border-radius: 6px;
                }
            }
        }
    }

    @media (min-width: 769px) {
        .stats-grid-prospective {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 992px) {
        .hero-section {
            flex-direction: column;
        }
    }

    .table-container {
        overflow-x: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dde5f1ff;
        }

        th {
            background-color: #fbf9e8ff;
            font-weight: 600;
            color: #4A5568;
            white-space: nowrap;
        }

        tbody tr:hover {
            background-color: #F7FAFC;
        }

        td {
            vertical-align: middle;
        }
    }
`;
