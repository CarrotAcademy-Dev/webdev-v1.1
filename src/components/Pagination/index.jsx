import { Flex, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback function when page changes
 * @param {number} startIndex - Start index of current items
 * @param {number} endIndex - End index of current items  
 * @param {number} totalItems - Total number of items
 * @param {number} maxPageButtons - Max number of page buttons to show (default: 7)
 */
function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    startIndex, 
    endIndex, 
    totalItems,
    maxPageButtons = 7
}) {
    // Theme colors
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const bgDefault = useColorModeValue('white', 'gray.700');
    const bgDisabled = useColorModeValue('gray.100', 'gray.800');
    const textDefault = useColorModeValue('gray.700', 'gray.200');
    const textDisabled = useColorModeValue('gray.400', 'gray.600');
    const activeBg = '#FE7743';
    const activeColor = 'white';

    // Don't render if no pages
    if (totalPages <= 0) return null;

    /**
     * Generate page numbers with ellipsis logic
     * Example: [1, 2, 3, ..., 50] or [1, ..., 45, 46, 47, ..., 50]
     */
    const getPageNumbers = () => {
        const pages = [];
        
        // If total pages less than max buttons, show all
        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const leftSiblingIndex = Math.max(currentPage - 1, 2);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages - 1);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            // Near start: [1, 2, 3, 4, 5, ..., 50]
            const leftRange = Math.min(maxPageButtons - 2, totalPages - 1);
            for (let i = 2; i <= leftRange; i++) {
                pages.push(i);
            }
            pages.push('...');
        } else if (shouldShowLeftDots && !shouldShowRightDots) {
            // Near end: [1, ..., 46, 47, 48, 49, 50]
            pages.push('...');
            const rightRange = Math.max(totalPages - maxPageButtons + 3, 2);
            for (let i = rightRange; i < totalPages; i++) {
                pages.push(i);
            }
        } else if (shouldShowLeftDots && shouldShowRightDots) {
            // Middle: [1, ..., 45, 46, 47, ..., 50]
            pages.push('...');
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                pages.push(i);
            }
            pages.push('...');
        } else {
            // Fallback: show range around current
            for (let i = 2; i < totalPages; i++) {
                pages.push(i);
            }
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <Flex 
            justify="space-between" 
            align="center" 
            mt={4} 
            pt={4} 
            borderTop={`1px solid`}
            borderColor={borderColor}
            flexWrap="wrap"
            gap={3}
        >
            {/* Info text */}
            <Text fontSize="sm" color={textDefault}>
                Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} entries
            </Text>

            {/* Pagination controls */}
            <Flex gap={1} flexWrap="wrap" align="center">
                {/* First page */}
                <Button
                    size="sm"
                    onClick={() => onPageChange(1)}
                    isDisabled={currentPage === 1}
                    bg={currentPage === 1 ? bgDisabled : bgDefault}
                    color={currentPage === 1 ? textDisabled : textDefault}
                    borderColor={borderColor}
                    variant="outline"
                    _hover={{ 
                        bg: currentPage === 1 ? bgDisabled : 'gray.50',
                        _dark: { bg: currentPage === 1 ? bgDisabled : 'gray.600' }
                    }}
                    leftIcon={<FiChevronsLeft />}
                    title="First page"
                >
                    First
                </Button>

                {/* Previous page */}
                <Button
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    bg={currentPage === 1 ? bgDisabled : bgDefault}
                    color={currentPage === 1 ? textDisabled : textDefault}
                    borderColor={borderColor}
                    variant="outline"
                    _hover={{ 
                        bg: currentPage === 1 ? bgDisabled : 'gray.50',
                        _dark: { bg: currentPage === 1 ? bgDisabled : 'gray.600' }
                    }}
                    leftIcon={<FiChevronLeft />}
                >
                    Prev
                </Button>

                {/* Page numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <Text
                                key={`ellipsis-${index}`}
                                px={3}
                                py={2}
                                color={textDefault}
                                fontSize="sm"
                                fontWeight="600"
                            >
                                ...
                            </Text>
                        );
                    }

                    const isActive = currentPage === page;

                    return (
                        <Button
                            key={page}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            bg={isActive ? activeBg : bgDefault}
                            color={isActive ? activeColor : textDefault}
                            borderColor={isActive ? activeBg : borderColor}
                            variant="outline"
                            fontWeight="600"
                            _hover={{ 
                                bg: isActive ? activeBg : 'gray.50',
                                _dark: { bg: isActive ? activeBg : 'gray.600' }
                            }}
                            minW="40px"
                        >
                            {page}
                        </Button>
                    );
                })}

                {/* Next page */}
                <Button
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    bg={currentPage === totalPages ? bgDisabled : bgDefault}
                    color={currentPage === totalPages ? textDisabled : textDefault}
                    borderColor={borderColor}
                    variant="outline"
                    _hover={{ 
                        bg: currentPage === totalPages ? bgDisabled : 'gray.50',
                        _dark: { bg: currentPage === totalPages ? bgDisabled : 'gray.600' }
                    }}
                    rightIcon={<FiChevronRight />}
                >
                    Next
                </Button>

                {/* Last page */}
                <Button
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    isDisabled={currentPage === totalPages}
                    bg={currentPage === totalPages ? bgDisabled : bgDefault}
                    color={currentPage === totalPages ? textDisabled : textDefault}
                    borderColor={borderColor}
                    variant="outline"
                    _hover={{ 
                        bg: currentPage === totalPages ? bgDisabled : 'gray.50',
                        _dark: { bg: currentPage === totalPages ? bgDisabled : 'gray.600' }
                    }}
                    rightIcon={<FiChevronsRight />}
                    title="Last page"
                >
                    Last
                </Button>
            </Flex>
        </Flex>
    );
}

export default Pagination;
