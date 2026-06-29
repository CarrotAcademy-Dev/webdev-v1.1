import styled from 'styled-components';

export const StyledDaftarHarga = styled.div`
  .page-header {
    margin-bottom: 2rem;

    h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--chakra-colors-chakra-body-text);
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 0.95rem;
      color: var(--chakra-colors-gray-500);
    }
  }

  .table-container {
    overflow-x: auto;
    border: 1px solid var(--chakra-colors-gray-200);

    [data-theme='dark'] & {
      border-color: var(--chakra-colors-gray-600);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      
      thead {
        background-color: var(--chakra-colors-gray-50);
        
        [data-theme='dark'] & {
          background-color: var(--chakra-colors-gray-700);
        }

        tr {
          th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--chakra-colors-gray-700);
            border-bottom: 2px solid var(--chakra-colors-gray-200);
            white-space: nowrap;
            user-select: none;
            transition: background-color 0.2s;

            [data-theme='dark'] & {
              color: var(--chakra-colors-gray-200);
              border-bottom-color: var(--chakra-colors-gray-600);
            }

            &:hover {
              background-color: var(--chakra-colors-gray-100);

              [data-theme='dark'] & {
                background-color: var(--chakra-colors-gray-600);
              }
            }
          }
        }
      }

      tbody {
        tr {
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--chakra-colors-gray-50);

            [data-theme='dark'] & {
              background-color: var(--chakra-colors-gray-700);
            }
          }

          td {
            padding: 1rem;
            font-size: 0.875rem;
            color: var(--chakra-colors-gray-600);
            border-bottom: 1px solid var(--chakra-colors-gray-200);

            [data-theme='dark'] & {
              color: var(--chakra-colors-gray-300);
              border-bottom-color: var(--chakra-colors-gray-600);
            }

            &:first-child {
              font-weight: 600;
              color: var(--chakra-colors-gray-800);

              [data-theme='dark'] & {
                color: var(--chakra-colors-gray-100);
              }
            }
          }

          &:last-child td {
            border-bottom: none;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .page-header {
      h1 {
        font-size: 1.5rem;
      }

      p {
        font-size: 0.875rem;
      }
    }

    .table-container {
      table {
        font-size: 0.8rem;

        thead tr th,
        tbody tr td {
          padding: 0.75rem 0.5rem;
        }
      }
    }
  }
`;
