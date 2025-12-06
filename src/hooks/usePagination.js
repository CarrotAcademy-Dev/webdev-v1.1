// src/hooks/usePagination.js
import { useState, useMemo } from 'react';

/**
 * Hook untuk pagination logic
 */
export const usePagination = (data = [], itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const paginationData = useMemo(() => {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

        return {
            currentItems,
            currentPage,
            totalPages,
            totalItems,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            startIndex: indexOfFirstItem,
            endIndex: Math.min(indexOfLastItem, totalItems),
        };
    }, [data, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
        setCurrentPage(pageNumber);
    };

    const nextPage = () => {
        if (paginationData.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (paginationData.hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const goToLastPage = () => {
        setCurrentPage(paginationData.totalPages);
    };

    const resetPage = () => {
        setCurrentPage(1);
    };

    return {
        ...paginationData,
        goToPage,
        nextPage,
        prevPage,
        goToFirstPage,
        goToLastPage,
        resetPage,
        setCurrentPage,
    };
};

/**
 * Contoh penggunaan:
 * 
 * const {
 *     currentItems,
 *     currentPage,
 *     totalPages,
 *     nextPage,
 *     prevPage,
 *     goToPage,
 * } = usePagination(data, 10);
 * 
 * // Render currentItems
 * {currentItems.map(item => <div key={item.id}>{item.name}</div>)}
 * 
 * // Pagination controls
 * <Button onClick={prevPage} disabled={!hasPrevPage}>Previous</Button>
 * <span>Page {currentPage} of {totalPages}</span>
 * <Button onClick={nextPage} disabled={!hasNextPage}>Next</Button>
 */

export default usePagination;
