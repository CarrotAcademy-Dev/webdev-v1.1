import styled from 'styled-components';

export const StyledProfilSiswa = styled.div`
    width: 100%;
    padding: 2rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: #2D3748;
    }

    .search-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
    }

    .profile-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;

        @media (min-width: 1024px) {
            grid-template-columns: 300px 1fr;
        }
    }

    .profile-sidebar {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        height: fit-content;

        .profile-photo {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 12px;
            background: #F7FAFC;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .placeholder {
                font-size: 4rem;
                color: #CBD5E0;
            }
        }

        .student-info {
            .info-item {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #F7FAFC;

                &:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .info-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #718096;
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                }

                .info-value {
                    font-size: 0.875rem;
                    color: #2D3748;
                    font-weight: 500;
                }
            }
        }
    }

    .profile-content {
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

        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;

            @media (min-width: 768px) {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .info-field {
            .field-label {
                font-size: 0.875rem;
                font-weight: 600;
                color: #4A5568;
                margin-bottom: 0.5rem;
            }

            .field-value {
                font-size: 0.875rem;
                color: #2D3748;
                padding: 0.75rem;
                background: #F7FAFC;
                border-radius: 6px;
                border: 1px solid #E2E8F0;
            }

            &.full-width {
                grid-column: 1 / -1;
            }
        }

        .course-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #F7FAFC;
        }

        .course-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;

            thead {
                background: #F7FAFC;

                th {
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: #2D3748;
                    border-bottom: 2px solid #E2E8F0;
                }
            }

            tbody {
                tr {
                    border-bottom: 1px solid #E2E8F0;

                    &:hover {
                        background: #F7FAFC;
                    }

                    td {
                        padding: 12px;
                        font-size: 0.875rem;
                        color: #4A5568;
                    }
                }
            }
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #A0AEC0;
            font-size: 0.875rem;
        }
    }

    .edit-button {
        width: 100%;
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background: #FE7743;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            background: #E56533;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(254, 119, 67, 0.3);
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-title {
            font-size: 1.5rem;
        }

        .profile-sidebar,
        .profile-content,
        .search-section {
            padding: 1rem;
        }

        .course-table {
            font-size: 0.75rem;

            thead th,
            tbody td {
                padding: 8px;
            }
        }
    }
`;
