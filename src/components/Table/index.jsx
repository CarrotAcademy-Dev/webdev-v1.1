import { useState } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Checkbox,
    Flex, IconButton, Text
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function DataTableComponent( {tableData, headerItems, onAction} ) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    return (
        <TableContainer>
            <Table variant="simple">
                <Thead bg="orange.50">
                    <Tr>
                        {headerItems.map((headerName) => (
                            <Th key={headerName.key}>{headerName.label}</Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {currentItems.map((item, rowIndex) => (
                        <Tr key={item.idTicket}>
                            {headerItems.map(headerName => (
                                <Td key={headerName.key} >
                                    {headerName.render ? (
                                        headerName.render(item, rowIndex)
                                    ): (
                                        headerName.key.toLowerCase() === 'done' ? (
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
                    ))}
                </Tbody>
            </Table>
            
            <Flex justifyContent="flex-end" alignItems="center" mt={4}>
                <Text fontSize="sm" mr={4}>
                    Page {currentPage} of {totalPages}
                </Text>
                <IconButton
                    aria-label="Previous Page"
                    icon={<FiChevronLeft />}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    isDisabled={currentPage === 1}
                    mr={2}
                />
                <IconButton
                    aria-label="Next Page"
                    icon={<FiChevronRight />}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    isDisabled={currentPage === totalPages}
                />
            </Flex>
        </TableContainer>
    );
}

export default DataTableComponent;