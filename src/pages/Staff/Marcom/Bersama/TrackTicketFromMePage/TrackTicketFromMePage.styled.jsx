import styled from 'styled-components';

export const StyledTrackTicketFromMePage = styled.div`
  .page-header {
    margin-bottom: 1.5rem;

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--chakra-colors-chakra-body-text);
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.9rem;
      color: var(--chakra-colors-gray-500);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
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

        tr th {
          padding: 0.875rem 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--chakra-colors-gray-700);
          border-bottom: 2px solid var(--chakra-colors-gray-200);
          white-space: nowrap;

          [data-theme='dark'] & {
            color: var(--chakra-colors-gray-200);
            border-bottom-color: var(--chakra-colors-gray-600);
          }
        }
      }

      tbody tr {
        transition: background-color 0.15s ease;
        border-bottom: 1px solid var(--chakra-colors-gray-100);

        [data-theme='dark'] & {
          border-bottom-color: var(--chakra-colors-gray-700);
        }

        &:hover {
          background-color: var(--chakra-colors-orange-50);

          [data-theme='dark'] & {
            background-color: var(--chakra-colors-whiteAlpha-100);
          }
        }

        td {
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          vertical-align: middle;
        }
      }
    }
  }
`;
