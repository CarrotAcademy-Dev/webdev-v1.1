import styled from 'styled-components';

export const StyledRekapAbsensi = styled.div`
    width: 100%;
    padding: 5rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: #2D3748;
    }

    .today-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #2D3748;
            margin-bottom: 1rem;
        }

        .time-display {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;

            .time-item {
                flex: 1;
                min-width: 200px;
                padding: 1rem;
                background: #F7FAFC;
                border-radius: 8px;
                border-left: 4px solid #FE7743;

                .time-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #718096;
                    margin-bottom: 0.5rem;
                }

                .time-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #080808ff;
                }
            }
        }
        
        .statsCard {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin: 2rem 0;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;

        @media (min-width: 769px) {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .filter-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
    }

    .table-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #2D3748;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #F7FAFC;
        }
    }

    .payslip-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #2D3748;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #F7FAFC;
        }

        .payslip-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;

            @media (min-width: 768px) {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .payslip-group {
            .group-title {
                font-size: 1rem;
                font-weight: 600;
                color: #2D3748;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #E2E8F0;
            }

            .payslip-item {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem 0;
                border-bottom: 1px solid #F7FAFC;

                .item-label {
                    font-size: 0.875rem;
                    color: #4A5568;
                }

                .item-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #2D3748;
                }

                &.total {
                    font-weight: 700;
                    color: #FE7743;
                    border-top: 2px solid #FE7743;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                }
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-title {
            font-size: 1.5rem;
        }

        .today-section,
        .filter-section,
        .table-section,
        .payslip-section {
            padding: 1rem;
        }
    }
`;
