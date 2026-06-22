/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { getTagihanSiswa } from "@/features/finance/financeApiService";
import { logger } from "@/utils/logger";
import { Box, Button, Flex, FormControl, FormLabel, Input, InputGroup, InputLeftElement, Skeleton, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiChevronUp, FiSearch } from "react-icons/fi";
import { StyledTagihan } from "./Tagihan.styled";
import useDebounce from "@/hooks/useDebounce";

function TagihanPage() {
    const toast = useToast();

    // Theme colors
    const cardBg = useColorModeValue('white', 'dark.bg.card');
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    // Search input state
    const [namaInput, setNamaInput] = useState('');
    const [tagihanData, setTagihanData] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Table search (after data fetched)
    const [TableSearch, setTableSearch] = useState('');
    const debouncedTableSearch = useDebounce(TableSearch, 300);

    // Fetch tagihan mutation
    const { mutate: fetchTagihan, isPending } = useMutation({
        mutationFn: getTagihanSiswa,
        onSuccess: (data) => {
            setTagihanData(data || []);
            setCurrentPage(1); // Reset to first page on new search

            toast({
                title: 'Data berhasil dimuat',
                description:`Ditemukan ${data?.length || 0} tagihan untuk "${namaInput}"`,
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });

            logger.info('[TagihanPage] Tagihan data fetched successfully', {
                namaLengkap: namaInput,
                resultCount: data?.length || 0
             });
        },
        onError: (error) => {
            toast({
                tittle: 'Error',
                description: error?.message || 'Gagal memuat data tagihan',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });

            logger.error('[TagihanPage] Failed to fetch tagihan data', {
                namaLengkap: namaInput,
                error: error.message
            });
            setTagihanData([]); // Clear data on error
        }
    });

    // Helper untuk sorting
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Convert to lowercase for string comparison
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Handle sort
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    // Handle search data
    const handleSearch = () => {
        if (!namaInput.trim()) {
            return;
        }
        fetchTagihan(namaInput.trim());
    };

    // Handle Enter Key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Process data (filter + sort)
    const processedData = useMemo(() => {
        if (!tagihanData) return [];

        let filtered = [...tagihanData];

        // Apply table search
        if (debouncedTableSearch) {
            const searchLower = debouncedTableSearch.toLowerCase();
            filtered = filtered.filter(item => 
                item.nama_siswa?.toLowerCase().includes(searchLower) ||
                item.umur?.toString().includes(searchLower) ||
                item.produk?.toLowerCase().includes(searchLower) ||
                item.tagihan?.toString().includes(searchLower) ||
                item.harga?.toString().includes(searchLower) ||
                item.tanggal_tagih?.toLowerCase().includes(searchLower) ||
                item.jatuh_tempo?.toLowerCase().includes(searchLower) ||
                item.sisa_tagihan?.toString().includes(searchLower)
            );
        }

        // Apply sorting
        filtered = sortData(filtered, sortConfig);

        return filtered;
    }, [tagihanData, debouncedTableSearch, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search changes
    useMemo(() => {
        setCurrentPage(1);
    }, [debouncedTableSearch]);

    // Render sort icon
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return 'null';
        return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
    };

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return '-';
        const numericValue = value.toString().replace(/[^0-9]/g, '');
        return `Rp ${parseInt(numericValue).toLocaleString('id-ID')}`;
    }

    return (
        <ContainerCarrot>
            <StyledTagihan>
                {/* Header */}
                <div className="page-header">
                    <h1>Tagihan Siswa</h1>
                    <p>Cari data Tagihan berdasarkan nama siswa</p>
                </div>

                {/* Search by Name */}
                <Box mb={6}>
                    <FormControl maxW="600px">
                        <FormLabel>Nama Lengkap Siwa</FormLabel>
                        <Flex gap={3}>
                            <Input 
                                placeholder="Masukkan nama lengkap siswa"
                                value={namaInput}
                                onChange={(e) => setNamaInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                bg={cardBg}
                                borderColor={borderColor}
                                flex={1}
                            />
                            <Button
                                colorScheme="orange"
                                onClick={handleSearch}
                                isLoading={isPending}
                                isDisabled={!namaInput.trim()}
                                minW="100px"
                            >
                                Cari
                            </Button>
                        </Flex>
                    </FormControl>
                </Box>

                {/* Show results only if data fetched */}
                {tagihanData.length > 0 && (
                    <>
                        {/* Table Search */}
                        <Box mb={6}>
                            <InputGroup maxW="400px">
                                <InputLeftElement pointerEvents="none" color={textColor}>
                                    <FiSearch color="gray" />
                                </InputLeftElement>
                                <Input 
                                    placeholder="Cari tagihan..."
                                    value={TableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    bg={cardBg}
                                    borderColor={borderColor}
                                />
                            </InputGroup>
                        </Box>

                        {/* Table */}
                        <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
                            <table>
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('kode_faktur')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Kode Faktur {renderSortIcon('kode_faktur')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('pic')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                PIC {renderSortIcon('pic')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('nama_siswa')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Nama Siswa {renderSortIcon('nama_siswa')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('umur')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Umur {renderSortIcon('umur')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('produk')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Produk {renderSortIcon('produk')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('hari')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Hari {renderSortIcon('hari')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('qty')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                QTY {renderSortIcon('qty')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('tagihan')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Tagihan {renderSortIcon('tagihan')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('harga')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Harga {renderSortIcon('harga')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('tanggal_tagih')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Tanggal Tagih {renderSortIcon('tanggal_tagih')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('jatuh_tempo')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Jatuh Tempo {renderSortIcon('jatuh_tempo')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('sisa_tagihan')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Sisa Tagihan {renderSortIcon('sisa_tagihan')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('link_pdf')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Link PDF {renderSortIcon('link_pdf')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('sudah_tagih')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Sudah Tagih {renderSortIcon('sudah_tagih')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('sudah_bayar')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Sudah Bayar {renderSortIcon('sudah_bayar')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('kelas_pengganti')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Kelas Pengganti {renderSortIcon('kelas_pengganti')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('tanggal_tagih_cso')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Tanggal Tagih CSO {renderSortIcon('tanggal_tagih_cso')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('notes')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Notes {renderSortIcon('notes')}
                                            </Flex>
                                        </th>
                                        <th onClick={() => handleSort('link_invoice')} style={{cursor: 'pointer'}}>
                                            <Flex align="center" gap={2}>
                                                Link Invoice {renderSortIcon('link_invoice')}
                                            </Flex>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} style={{textAlign: 'center', padding: '2rem'}}>
                                                <Text color={textColor}>
                                                    {debouncedTableSearch ? `Tidak ada tagihan yang cocok dengan "${debouncedTableSearch}"` : 'Tidak ada data tagihan'}
                                                </Text>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr key={`${item.kode_faktur}-${index}`}>
                                                <td>{item.kode_faktur}</td>
                                                <td>{item.pic}</td>
                                                <td>{item.nama_siswa}</td>
                                                <td>{item.umur}</td>
                                                <td>{item.produk}</td>
                                                <td>{item.hari}</td>
                                                <td>{item.qty}</td>
                                                <td>{formatCurrency(item.tagihan)}</td>
                                                <td>{formatCurrency(item.harga)}</td>
                                                <td>{item.tanggal_tagih}</td>
                                                <td>{item.jatuh_tempo}</td>
                                                <td>{formatCurrency(item.sisa_tagihan)}</td>
                                                <td>{item.link_pdf ? (
                                                    <a href={item.link_pdf} target="_blank" rel="noopener noreferrer">
                                                        Lihat PDF
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}</td>
                                                <td>{item.sudah_tagih}</td>
                                                <td>{item.sudah_bayar}</td>
                                                <td>{item.kelas_pengganti}</td>
                                                <td>{item.tanggal_tagih_cso}</td>
                                                <td>{item.notes}</td>
                                                <td>{item.link_invoice ? (
                                                    <a href={item.link_invoice} target="_blank" rel="noopener noreferrer">
                                                        Lihat Invoice
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </Box>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <Box mt={6}>
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    startIndex={(currentPage - 1) * itemsPerPage}
                                    endIndex={currentPage * itemsPerPage}
                                    totalItems={processedData.length}
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* Empty state */}
                {tagihanData.length === 0 && !isPending && (
                    <Box textAlign="center" py={10}>
                        <Text fontSize="lg" color={textColor}>
                            Tidak ada data tagihan yang tersedia.
                        </Text>
                    </Box>
                )}

                {/* Loading state */}
                {isPending && (
                    <Flex direction="column" gap={10}>
                       <Skeleton height="60px" />
                       <Skeleton height="400px" />
                    </Flex>
                )}
            </StyledTagihan>
        </ContainerCarrot>
    );
}

export default TagihanPage;