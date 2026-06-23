import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { ceklisDaftarOffboardingFinance, getDataOffboardingFinance } from "@/features/finance/financeApiService";
import usePagination from "@/hooks/usePagination";
import { Box, Button, Checkbox, Flex, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiInbox, FiList, FiSearch } from "react-icons/fi";
import { DaftarOffboardingFinanceStyled } from "./DaftarOffboarding.styled";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";

const DaftarOffboardingFinancePage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
    const [formData, setFormData] = useState({
        id_offboarding: "",
        timestamp: "",
        pic: "",
        nama: "",
        program: "",
        modul: "",
        level: "",
        keterangan: "",
        keterangan_detail: "",
        sudah_ubah_tagihan: false,
        sudah_memberi_tagihan: false,
        sudah_lunas: false,
    });

    // Fetch data
    const { data: offboardingData, isLoading, isError } = useQuery({
        queryKey: ["daftarOffboarding", "bypass_cache_v1"],
        queryFn: getDataOffboardingFinance,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchWhenWindowFocus: false,
    });

    // Update mutation
    const UpdateMutation = useMutation({
        mutationFn: ceklisDaftarOffboardingFinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daftarOffboarding"] });
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
                description: error?.message || "Terjadi kesalahan saat update data",
                type: "error",
                duration: 3000,
            });
        },
    });

    // Summary stats from full dataset
    const isTruthy = (val) => val === true || val === "true";
    const stats = useMemo(() => {
        const data = offboardingData || [];
        return {
            total: data.length,
            ubahTagihan: data.filter((item) => isTruthy(item.sudah_ubah_tagihan)).length,
            beriTagihan: data.filter((item) => isTruthy(item.sudah_memberi_tagihan)).length,
            lunas: data.filter((item) => isTruthy(item.sudah_lunas)).length,
            selesai: data.filter((item) => isTruthy(item.sudah_ubah_tagihan) && isTruthy(item.sudah_memberi_tagihan) && isTruthy(item.sudah_lunas)).length,
        }
    }, [offboardingData]);   

    // Search logic - filter by nama, program, modul
    const filteredData = useMemo(() => {
        const data = offboardingData || [];
        if (!searchQuery) return data;

        return data.filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                item.nama && item.nama.toLowerCase().includes(searchLower) ||
                item.program && item.program.toLowerCase().includes(searchLower) ||
                item.modul && item.modul.toLowerCase().includes(searchLower)
            )
        })
    }, [offboardingData, searchQuery]);

    // Sort logic - sortable: id_offboarding, timestamp, nama, program, modul, level
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination - 20 items per page
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage} = 
        usePagination(sortedData, 20);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    // Open modal for edit
    const handleEdit = (item) => {
        setFormData({
            id_offboarding: item.id_offboarding || "",
            timestamp: item.timestamp || "",
            pic: item.pic || "",
            nama: item.nama || "",
            program: item.program || "",
            modul: item.modul || "",
            level: item.level || "",
            keterangan: item.keterangan || "",
            keterangan_detail: item.keterangan_detail || "",
            sudah_ubah_tagihan: isTruthy(item.sudah_ubah_tagihan),
            sudah_memberi_tagihan: isTruthy(item.sudah_memberi_tagihan),
            sudah_lunas: isTruthy(item.sudah_lunas),
        });
        onOpen();
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle form submit
    const handleSubmit = () => {
        UpdateMutation.mutate(formData);
    };

    // Handle modal close
    const handleModalClose = () => {
        setFormData({
            id_offboarding: "",
            timestamp: "",
            pic: "",
            nama: "",
            program: "",
            modul: "",
            level: "",
            keterangan: "",
            keterangan_detail: "",
            sudah_ubah_tagihan: false,
            sudah_memberi_tagihan: false,
            sudah_lunas: false,
        });
        onClose();
    };

    // Render boolean as icon
    const renderBool = (val) => (val === true || val === "true" ? "✅" : "❌");

    // Sortable column header helper
    const SortableHeader = ({ column, label, minWidth}) => (
        <th
            onClick={() => handleSort(column)}
            style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}
        >
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (
                    sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                )}
            </Flex>
        </th>
    );

    return (
        <ContainerCarrot>
            <DaftarOffboardingFinanceStyled>
                <Box className="header">
                    <h1>Daftar Offboarding</h1>
                    <Text className="subtitle">
                        Kelola data offboarding siswa
                    </Text>
                </Box>

                {/* Summary stats */}
                <Box className="stats-grid-offboarding" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Selesai semua</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Ubah Tagihan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.ubahTagihan}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Beri Tagihan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.beriTagihan}</p>}
                    </InfoCard>
                    <InfoCard>                         
                        <FiList size={28} />
                        <p>Lunas</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.lunas}</p>}
                    </InfoCard>
                </Box>

                {/* Search Bar */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama, program, atau modul..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton count={20} height={40} style={{ marginBottom: "8px" }} />
                        </Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data offboarding</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>
                                {searchQuery
                                    ? "Tidak ada hasil untuk pencarian Anda"
                                    : "Belum ada data offboarding"}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>No</th>
                                        <SortableHeader column="id_offboarding" label="ID Offboarding" minWidth="100px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <th style={{ minWidth: "120px" }}>PIC</th>
                                        <SortableHeader column="nama" label="Nama" minWidth="180px" />
                                        <SortableHeader column="program" label="Program" minWidth="120px" />
                                        <SortableHeader column="modul" label="Modul" minWidth="100px" />
                                        <SortableHeader column="level" label="Level" minWidth="80px" />
                                        <th style={{ minWidth: "140px" }}>Keterangan</th>
                                        <th style={{ minWidth: "180px" }}>Keterangan Detail</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Ubah Tagihan</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Beri Tagihan</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Lunas</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_offboarding || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_offboarding}</td>
                                            <td>{item.timestamp}</td>
                                            <td>{item.pic}</td>
                                            <td>{item.nama}</td>
                                            <td>{item.program}</td>
                                            <td>{item.modul}</td>
                                            <td>{item.level}</td>
                                            <td>
                                                {item.keterangan && item.keterangan.length > 25 ? (
                                                    <Tooltip label={item.keterangan}>
                                                        <span>{item.keterangan.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.keterangan
                                                )}
                                            </td>
                                            <td>
                                                {item.keterangan_detail && item.keterangan_detail.length > 30 ? (
                                                    <Tooltip label={item.keterangan_detail}>
                                                        <span>{item.keterangan_detail.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.keterangan_detail
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.sudah_ubah_tagihan)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.sudah_memberi_tagihan)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.sudah_lunas)}</td>
                                            <td style={{ position: "sticky", right: 0 }}>
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

                            {/* Pagination Controls */}
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
                        <ModalHeader>Edit Daftar Offboarding</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* ID Offboarding (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>ID Offboarding</Text>
                                    <Input 
                                        value={formData.id_offboarding}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Timestamp (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Timestamp</Text>
                                    <Input 
                                        value={formData.timestamp}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* PIC (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>PIC</Text>
                                    <Input 
                                        value={formData.pic}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Nama (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama</Text>
                                    <Input 
                                        value={formData.nama}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Program */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Program</Text>
                                    <Input 
                                        name="program"
                                        value={formData.program}
                                        onChange={handleInputChange}
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Modul */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Modul</Text>
                                    <Input 
                                        name="modul"
                                        value={formData.modul}
                                        onChange={handleInputChange}
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Level */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Level</Text>
                                    <Input 
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Keterangan (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan</Text>
                                    <Input 
                                        value={formData.keterangan}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Keterangan Detail (read-only, textarea) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan Detail</Text>
                                    <Textarea
                                        value={formData.keterangan_detail}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Checkboxes */}
                                <Box>
                                    <Text fontWeight="medium" mb={3}>Status</Text>
                                    <Stack gap={3}>
                                        <Checkbox
                                            name="sudah_ubah_tagihan"
                                            isChecked={formData.sudah_ubah_tagihan}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Ubah Tagihan
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_memberi_tagihan"
                                            isChecked={formData.sudah_memberi_tagihan}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Memberi Tagihan
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_lunas"
                                            isChecked={formData.sudah_lunas}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Lunas
                                        </Checkbox>
                                    </Stack>
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
                                isLoading={UpdateMutation.isLoading}
                            >
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </DaftarOffboardingFinanceStyled>
        </ContainerCarrot>
    );
};

export default DaftarOffboardingFinancePage;