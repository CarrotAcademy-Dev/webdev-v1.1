import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Textarea,
    Tooltip,
    useColorMode,
    useDisclosure
} from "@chakra-ui/react";
import { FiEdit2, FiExternalLink, FiSearch, FiInbox, FiChevronUp, FiChevronDown } from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import { getProgressReportMonthly, updateProgressReportMonthly } from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ProgressReportMonthlyStyled } from "./ProgressReportMonthly.styled";
import { toaster } from "../../../../../components/ui/toaster";

const ProgressReportMonthlyPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [formData, setFormData] = useState({
        id: "",
        nama_siswa: "",
        program: "",
        modul: "",
        bulan_aktif: "",
        email: "",
        last_update: "",
        notes: "",
        last_day_class: "",
        check: false,
        link_progress_report: "",
        ready_kirim: "",
        tanggal_kirim: "",
    });

    // Fetch data
    const { data: reportData = [], isLoading, isError } = useQuery({
        queryKey: ['progressReportMonthly'],
        queryFn: getProgressReportMonthly,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: updateProgressReportMonthly,
        onSuccess: () => {
            queryClient.invalidateQueries(['progressReportMonthly']);
            toaster.create({
                title: "Berhasil update data",
                type: "success",
                duration: 3000,
            });
            onClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal update data",
                description: error.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    // Search logic - filter by nama_siswa, program, modul
    const filteredData = useMemo(() => {
        if (!searchQuery) return reportData;

        return reportData.filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (item.nama_siswa && item.nama_siswa.toLowerCase().includes(searchLower)) ||
                (item.program && item.program.toLowerCase().includes(searchLower)) ||
                (item.modul && item.modul.toLowerCase().includes(searchLower))
            );
        });
    }, [reportData, searchQuery]);

    // Sort logic - sortable: nama_siswa, program, modul, bulan_aktif, last_update, tanggal_kirim
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            // String comparison
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination - 20 items per page
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Validate URL
    const isValidUrl = (urlString) => {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Validate email
    const isValidEmail = (email) => {
        if (!email) return true; // Empty is ok
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Convert MM/DD/YYYY (backend format) to YYYY-MM-DD (input date format)
    const convertToInputDate = (dateStr) => {
        if (!dateStr) return "";
        // Expected format: MM/DD/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [month, day, year] = parts;
            // Return YYYY-MM-DD format
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr;
    };

    // Convert YYYY-MM-DD (input date format) to MM/DD/YYYY (backend format)
    const convertFromInputDate = (dateStr) => {
        if (!dateStr) return "";
        // Expected format: YYYY-MM-DD
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            // Return MM/DD/YYYY format
            return `${month}/${day}/${year}`;
        }
        return dateStr;
    };

    // Open modal for edit
    const handleEdit = (item) => {
        setFormData({
            id: item.id || "",
            nama_siswa: item.nama_siswa || "",
            program: item.program || "",
            modul: item.modul || "",
            bulan_aktif: item.bulan_aktif || "",
            email: item.email || "",
            last_update: item.last_update || "",
            notes: item.notes || "",
            last_day_class: convertToInputDate(item.last_day_class) || "",
            check: item.check === "TRUE" || item.check === true,
            link_progress_report: item.link_progress_report || "",
            ready_kirim: item.ready_kirim || "",
            tanggal_kirim: convertToInputDate(item.tanggal_kirim) || "",
        });
        onOpen();
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle submit
    const handleSubmit = () => {
        // Validate email format
        if (!isValidEmail(formData.email)) {
            toaster.create({
                title: "Email tidak valid",
                description: "Mohon masukkan alamat email yang valid",
                type: "error",
                duration: 3000,
            });
            return;
        }

        const submitData = {
            ...formData,
            check: formData.check ? "TRUE" : "FALSE",
            last_day_class: convertFromInputDate(formData.last_day_class),
            tanggal_kirim: convertFromInputDate(formData.tanggal_kirim)
        };

        updateMutation.mutate(submitData);
    };

    // Handle modal close
    const handleModalClose = () => {
        setFormData({
            id: "",
            nama_siswa: "",
            program: "",
            modul: "",
            bulan_aktif: "",
            email: "",
            last_update: "",
            notes: "",
            last_day_class: "",
            check: false,
            link_progress_report: "",
            ready_kirim: "",
            tanggal_kirim: "",
        });
        onClose();
    };

    return (
        <ContainerCarrot>
            <ProgressReportMonthlyStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Progress Report Monthly</h1>
                    <Text className="subtitle">
                        Kelola data progress report bulanan siswa
                    </Text>
                </Box>

                {/* Search Bar */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama siswa, program, atau modul..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            pl="40px"
                        />
                        <Box
                            position="absolute"
                            left="12px"
                            top="50%"
                            transform="translateY(-50%)"
                            pointerEvents="none"
                        >
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton count={20} height={40} style={{ marginBottom: '8px' }} />
                        </Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data. Silakan refresh halaman.</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>
                                {searchQuery
                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                    : "Belum ada data progress report"}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>No</th>
                                        <th 
                                            onClick={() => handleSort('nama_siswa')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '180px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Nama Siswa
                                                {sortConfig.key === 'nama_siswa' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('program')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '120px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Program
                                                {sortConfig.key === 'program' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('modul')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '100px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Modul
                                                {sortConfig.key === 'modul' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th 
                                            onClick={() => handleSort('bulan_aktif')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '120px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Bulan Aktif
                                                {sortConfig.key === 'bulan_aktif' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th style={{ minWidth: '200px' }}>Email</th>
                                        <th 
                                            onClick={() => handleSort('last_update')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '120px' }}
                                        >
                                            <Flex align="center" gap={1}>
                                                Last Update
                                                {sortConfig.key === 'last_update' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th style={{ minWidth: '150px' }}>Notes</th>
                                        <th style={{ minWidth: '150px' }}>Last Day Class</th>
                                        <th style={{ width: '80px' }}>Check</th>
                                        <th style={{ minWidth: '150px' }}>Link Progress Report</th>
                                        <th style={{ minWidth: '120px' }}>Ready Kirim</th>
                                        <th 
                                            onClick={() => handleSort('tanggal_kirim')}
                                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '140px' }}
                                        >
                                            <Flex align="center" gap={1}>   
                                                Tanggal Kirim
                                                {sortConfig.key === 'tanggal_kirim' && (
                                                    sortConfig.direction === 'asc' ? 
                                                        <FiChevronUp size={14} /> : 
                                                        <FiChevronDown size={14} />
                                                )}
                                            </Flex>
                                        </th>
                                        <th style={{ width: '100px', position: 'sticky', right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{(currentPage - 1) * 20 + index + 1}</td>
                                            <td>{item.nama_siswa}</td>
                                            <td>{item.program}</td>
                                            <td>{item.modul}</td>
                                            <td>{item.bulan_aktif}</td>
                                            <td>{item.email}</td>
                                            <td>{item.last_update}</td>
                                            <td>
                                                {item.notes && item.notes.length > 30 ? (
                                                    <Tooltip label={item.notes}>
                                                        <span>{item.notes.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.notes
                                                )}
                                            </td>
                                            <td>{item.last_day_class}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {item.check === "TRUE" || item.check === true ? "✓" : ""}
                                            </td>
                                            <td>
                                                {isValidUrl(item.link_progress_report) && (
                                                    <IconButton
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="ghost"
                                                        onClick={() => window.open(item.link_progress_report, '_blank')}
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                )}
                                            </td>
                                            <td>{item.ready_kirim}</td>
                                            <td>{item.tanggal_kirim}</td>
                                            <td style={{ position: 'sticky', right: 0 }}>
                                                <IconButton
                                                    size="sm"
                                                    backgroundColor="teal.400"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FiEdit2 />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Flex justify="center" mt={4}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={goToPage}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalItems={totalItems}
                                    />
                                </Flex>
                            )}
                        </>
                    )}
                </Box>

                {/* Edit Modal */}
                <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Progress Report Monthly</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* ID (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>ID</Text>
                                    <Input
                                        name="id"
                                        value={formData.id}
                                        isReadOnly
                                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                                    />
                                </Box>

                                {/* Nama Siswa (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama Siswa</Text>
                                    <Input
                                        name="nama_siswa"
                                        value={formData.nama_siswa}
                                        isReadOnly
                                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                                    />
                                </Box>

                                {/* Program */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Program</Text>
                                    <Input
                                        name="program"
                                        value={formData.program}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan program"
                                    />
                                </Box>

                                {/* Modul */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Modul</Text>
                                    <Input
                                        name="modul"
                                        value={formData.modul}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan modul"
                                    />
                                </Box>

                                {/* Bulan Aktif */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Bulan Aktif</Text>
                                    <Input
                                        name="bulan_aktif"
                                        value={formData.bulan_aktif}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan bulan aktif"
                                    />
                                </Box>

                                {/* Email */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Email</Text>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan email"
                                    />
                                </Box>

                                {/* Last Update (text field) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Last Update</Text>
                                    <Input
                                        name="last_update"
                                        value={formData.last_update}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 19/1 atau Done"
                                    />
                                </Box>

                                {/* Notes */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Notes</Text>
                                    <Textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan catatan"
                                        rows={3}
                                    />
                                </Box>

                                {/* Last Day Class (date input MM/DD/YYYY) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Last Day Class</Text>
                                    <Input
                                        type="date"
                                        name="last_day_class"
                                        value={formData.last_day_class}
                                        onChange={handleInputChange}
                                    />
                                </Box>

                                {/* Check (checkbox) */}
                                <Box>
                                    <Checkbox
                                        name="check"
                                        isChecked={formData.check}
                                        onChange={handleInputChange}
                                    >
                                        Check
                                    </Checkbox>
                                </Box>

                                {/* Link Progress Report */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Link Progress Report</Text>
                                    <Input
                                        name="link_progress_report"
                                        value={formData.link_progress_report}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan link progress report"
                                    />
                                </Box>

                                {/* Ready Kirim (text field) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Ready Kirim</Text>
                                    <Input
                                        name="ready_kirim"
                                        value={formData.ready_kirim}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan status ready kirim"
                                    />
                                </Box>

                                {/* Tanggal Kirim (date input MM/DD/YYYY) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Tanggal Kirim</Text>
                                    <Input
                                        type="date"
                                        name="tanggal_kirim"
                                        value={formData.tanggal_kirim}
                                        onChange={handleInputChange}
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleModalClose}>
                                Batal
                            </Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSubmit}
                                isLoading={updateMutation.isPending}
                            >
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </ProgressReportMonthlyStyled>
        </ContainerCarrot>
    );
};

export default ProgressReportMonthlyPage;
