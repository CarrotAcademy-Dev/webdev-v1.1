import { useState, useMemo, memo } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Checkbox,
    Flex, IconButton, Text, Input, InputGroup, InputLeftElement, Box, Select, useColorModeValue
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from '@/components/Pagination';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function DataTableComponent( {tableData, headerItems, onAction, isLoading} ) {
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const scrollbarBg = useColorModeValue('#f7fafc', '#2D3748');
    const scrollbarThumb = useColorModeValue('#cbd5e0', '#4A5568');
    const scrollbarThumbHover = useColorModeValue('#a0aec0', '#718096');
    const theadBg = useColorModeValue('orange.50', 'orange.900');
    const theadHoverBg = useColorModeValue('orange.100', 'orange.800');
    const textMuted = useColorModeValue('gray.600', 'gray.400');
    const noDataColor = useColorModeValue('gray.500', 'gray.400');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const itemsPerPage = 10;

    // Filter data berdasarkan search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return tableData;
        
        return tableData.filter(item => {
            return headerItems.some(header => {
                const value = item[header.key];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            });
        });
    }, [tableData, searchQuery, headerItems]);

    // Sort data berdasarkan sortConfig
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle null/undefined values
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;

            // Try to parse as date (format: DD/MM/YYYY or YYYY-MM-DD)
            const dateA = new Date(aValue);
            const dateB = new Date(bValue);
            
            if (!isNaN(dateA) && !isNaN(dateB)) {
                return sortConfig.direction === 'asc' 
                    ? dateA - dateB 
                    : dateB - dateA;
            }

            // Try to parse as number
            const numA = parseFloat(aValue);
            const numB = parseFloat(bValue);
            
            if (!isNaN(numA) && !isNaN(numB)) {
                return sortConfig.direction === 'asc' 
                    ? numA - numB 
                    : numB - numA;
            }

            // String comparison
            const strA = String(aValue).toLowerCase();
            const strB = String(bValue).toLowerCase();
            
            if (sortConfig.direction === 'asc') {
                return strA.localeCompare(strB);
            } else {
                return strB.localeCompare(strA);
            }
        });

        return sorted;
    }, [filteredData, sortConfig]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Reset to page 1 when search or sort changes
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                // Toggle direction
                return {
                    key,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc'
                };
            } else {
                // New column, default to asc
                return { key, direction: 'asc' };
            }
        });
        setCurrentPage(1);
    };

    return (
        <Box>
            {/* Search Bar */}
            <Flex mb={4} gap={3} alignItems="center">
                <InputGroup maxW="400px">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search across all columns..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        borderRadius="md"
                    />
                </InputGroup>
                <Text fontSize="sm" color={textMuted}>
                    {sortedData.length} results
                </Text>
            </Flex>

            {/* Table Container - Only table scrolls horizontally */}
            <TableContainer 
                overflowX="auto" 
                maxW="100%"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                sx={{
                    '&::-webkit-scrollbar': {
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: scrollbarBg,
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: scrollbarThumb,
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: scrollbarThumbHover,
                    },
                }}
            >
                <Table variant="simple">
                    <Thead bg={theadBg}>
                        <Tr>
                            {headerItems.map((headerName) => (
                                <Th 
                                    key={headerName.key}
                                    cursor="pointer"
                                    onClick={() => handleSort(headerName.key)}
                                    userSelect="none"
                                    _hover={{ bg: theadHoverBg }}
                                    position="relative"
                                >
                                    <Flex alignItems="center" gap={1}>
                                        {headerName.label}
                                        {sortConfig.key === headerName.key && (
                                            sortConfig.direction === 'asc' 
                                                ? <FiChevronUp size={14} /> 
                                                : <FiChevronDown size={14} />
                                        )}
                                    </Flex>
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            // Skeleton loading rows
                            Array.from({ length: 5 }).map((_, idx) => (
                                <Tr key={idx}>
                                    {headerItems.map((header) => (
                                        <Td key={header.key}>
                                            <Skeleton height="20px" />
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        ) : currentItems.length === 0 ? (
                            <Tr>
                                <Td colSpan={headerItems.length} textAlign="center">
                                    <Text color={noDataColor} py={4}>No data available</Text>
                                </Td>
                            </Tr>
                        ) : (
                            currentItems.map((item, rowIndex) => (
                            <Tr key={item.idTicket || item.id || item.nis || item.nomor_hp || rowIndex}>
                                {headerItems.map(headerName => (
                                    <Td key={`${item.idTicket || item.id || item.nis || item.nomor_hp || rowIndex}-${headerName.key}`} >
                                        {headerName.render ? (
                                            headerName.render(item, rowIndex)
                                        ): (
                                            headerName.key.toLowerCase() === 'done' || headerName.key.toLowerCase().includes('done') ? (
                                            <Checkbox
                                                    isChecked={item[headerName.key]}
                                                    onChange={() => onAction(item)}
                                                    colorScheme="orange" 
                                                />
                                            ): headerName.key.toLowerCase().includes('link') ? (
                                                item[headerName.key] != '-' ? (
                                                    <a href={item[headerName.key]} target="_blank" style={{textDecoration: 'underline'}}>
                                                        {headerName.label}
                                                    </a>
                                                ): <p>-</p>
                                            ) : (
                                                item[headerName.key]
                                            )
                                        )}
                                    </Td>
                                ))}
                            </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    startIndex={indexOfFirstItem}
                    endIndex={Math.min(indexOfLastItem, sortedData.length)}
                    totalItems={sortedData.length}
                />
            )}
        </Box>
    );
}

export default memo(DataTableComponent);