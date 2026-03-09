import styled from '@emotion/styled';

export const StyledKelengkapanDataPage = styled.div`
  .page-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--chakra-colors-gray-800);
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--chakra-colors-gray-200);
    background: white;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
      height: 12px;
    }

    &::-webkit-scrollbar-track {
      background: var(--chakra-colors-gray-100);
      border-radius: 0 0 8px 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--chakra-colors-gray-400);
      border-radius: 6px;
      
      &:hover {
        background: var(--chakra-colors-gray-500);
      }
    }
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 2000px; /* Wide table for many columns */

    thead {
      background-color: var(--chakra-colors-gray-50);
      position: sticky;
      top: 0;
      z-index: 2;

      th {
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--chakra-colors-gray-700);
        border-bottom: 2px solid var(--chakra-colors-gray-200);
        white-space: nowrap;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--chakra-colors-gray-100);
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--chakra-colors-gray-50);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 12px 16px;
        font-size: 0.875rem;
        color: var(--chakra-colors-gray-600);
        white-space: nowrap;
      }
    }
  }

  /* Dark mode */
  &[data-theme='dark'] {
    .page-title {
      color: var(--chakra-colors-gray-100);
    }

    .table-container {
      border-color: var(--chakra-colors-gray-600);
      background: var(--chakra-colors-dark-bg-card);

      &::-webkit-scrollbar-track {
        background: var(--chakra-colors-gray-700);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--chakra-colors-gray-500);
        
        &:hover {
          background: var(--chakra-colors-gray-400);
        }
      }
    }

    .data-table {
      thead {
        background-color: var(--chakra-colors-gray-700);

        th {
          color: var(--chakra-colors-gray-200);
          border-bottom-color: var(--chakra-colors-gray-600);
        }
      }

      tbody {
        tr {
          border-bottom-color: var(--chakra-colors-gray-700);

          &:hover {
            background-color: var(--chakra-colors-gray-700);
          }
        }

        td {
          color: var(--chakra-colors-gray-300);
        }
      }
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .page-title {
      font-size: 1.5rem;
    }
  }
`;
