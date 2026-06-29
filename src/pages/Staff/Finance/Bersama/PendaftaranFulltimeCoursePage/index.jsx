import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getPendaftaranFullTime, updatePendaftaranFullTime } from "@/features/finance/financeApiService";
import usePagination from "@/hooks/usePagination";
import { Box, Button, Flex, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Stack, Text, useColorMode, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiInbox, FiList, FiSearch } from "react-icons/fi";
import { PendaftaranFulltimeCourseStyled } from "./PendaftaranFulltimeCourse.styled";
import InfoCard from "@/components/InfoCard";
import { Tooltip } from "recharts";
import Pagination from "@/components/Pagination";

const PendaftaranFulltimeCoursePage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [ searchQuery, setSearchQuery ] = useState("");
    const [ sortConfig, setSortConfig ] = useState({ key: null, direction: "asc" });
    const [ formData, setFormData ] = useState({
        nama_siswa: "",
        angkatan: "",
        tahun: "",
        nomor: "",
        nomor_faktur: "",
        // readonly fields
        timestamp: "",
        id: "",
        biaya_pendafataran: "",
        biaya_program: "",
        discount: "",
        cicilan_one: "",
        cicilan_two: "",
        cicilan_three: "",
        cicilan_four: "",
        cicilan_five: "",
        cicilan_six: "",
        cicilan_seven: "",
        cicilan_eight: "",
        cicilan_nine: "",
        cicilan_ten: "",
        sisa_biaya: "",
        other_benefits: "",
        keterangan: "", // editable
        info: "",
    });

    // Fetch data
    const { data: pendaftaranData, isLoading, isError } = useQuery({
        queryKey: ['pendaftaranFullTime'],
        queryFn: getPendaftaranFullTime,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: updatePendaftaranFullTime,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendaftaranFullTime']});
            toaster.create({
                title: "Data berhasil diperbarui",
                type: "success",
                duration: 3000,
            });
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal memperbarui data",
                description: error.message || "Terjadi kesalahan saat memperbarui data.",
                type: "error",
                duration: 5000,
            });
        },
    });

    // Summary stats
    const stats = useMemo(() => {
        const data = pendaftaranData || [];
        const total = data.length;
        const uniqueAngkatan = new Set(data.map(item => item.angkatan).filter(Boolean)).size || 0;
        const sudahFaktur = data.filter(item => item.nomor_faktur && item.nomor_faktur.trim() !== "").length || 0;
        const adaSisaBiaya = data.filter(item => item.sisa_biaya && item.sisa_biaya !== "0" && item.sisa_biaya !== "").length || 0;
        return {total, uniqueAngkatan, sudahFaktur, adaSisaBiaya};
    }, [pendaftaranData]);

    // Search by nama_siswa, angkatan, nomor_faktur
    const filteredData = useMemo(() => {
        const data = pendaftaranData || [];
        if (!searchQuery) return data;

        const lowerSearch  = searchQuery.toLowerCase();
        return data.filter(item =>
            (item.nama_siswa && item.nama_siswa.toLowerCase().includes(lowerSearch)) ||
            (item.angkatan && item.angkatan.toLowerCase().includes(lowerSearch)) ||
            (item.nomor_faktur && item.nomor_faktur.toLowerCase().includes(lowerSearch))
        )
    }, [pendaftaranData, searchQuery]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
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
            nama_siswa: item.nama_siswa || "",
            angkatan: item.angkatan || "",
            tahun: item.tahun || "",
            nomor: item.nomor || "",
            nomor_faktur: item.nomor_faktur || "",
            // readonly fields
            timestamp: item.timestamp || "",
            id: item.id || "",
            biaya_pendafataran: item.biaya_pendafataran || "",
            biaya_program: item.biaya_program || "",
            discount: item.discount || "",
            cicilan_one: item.cicilan_one || "",
            cicilan_two: item.cicilan_two || "",
            cicilan_three: item.cicilan_three || "",
            cicilan_four: item.cicilan_four || "",
            cicilan_five: item.cicilan_five || "",
            cicilan_six: item.cicilan_six || "",
            cicilan_seven: item.cicilan_seven || "",
            cicilan_eight: item.cicilan_eight || "",
            cicilan_nine: item.cicilan_nine || "",
            cicilan_ten: item.cicilan_ten || "",
            sisa_biaya: item.sisa_biaya || "",
            other_benefits: item.other_benefits || "",
            keterangan: item.keterangan || "",
            info: item.info || "",
        });
        onOpen();
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submit
    const handleSubmit = () => {
        updateMutation.mutate(formData);
    };

    // Handle modal close
    const handleClose = () => {
        setFormData({
            nama_siswa: "",
            angkatan: "",
            tahun: "",
            nomor: "",
            nomor_faktur: "",
            // readonly fields
            timestamp: "",
            id: "",
            biaya_pendafataran: "",
            biaya_program: "",
            discount: "",
            cicilan_one: "",
            cicilan_two: "",
            cicilan_three: "",
            cicilan_four: "",
            cicilan_five: "",
            cicilan_six: "",
            cicilan_seven: "",
            cicilan_eight: "",
            cicilan_nine: "",
            cicilan_ten: "",
            sisa_biaya: "",
            other_benefits: "",
            keterangan: "",
            info: "",
        });
        onClose();
    };
    
    // Component for read-only fields in the edit form
    const ReadOnlyField = ({ label, value, isTextArea }) => {
        return (
            <Box>
                <Text fontWeight="medium" mb={2}>
                    {label}
                </Text>
                {isTextArea ? (
                    <Box
                        p={2} borderRadius="md" fontSize="sm" minH="60px"
                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    >
                        {value || "-"}
                    </Box>
                ) : (
                    <Input
                        value={value}
                        isReadOnly
                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    />
                )}
            </Box>
        );
    };

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

    // Format currency for display
    const formatRupiah = (val) => {
        if (!val || val === "") return "-";
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <ContainerCarrot>
            <PendaftaranFulltimeCourseStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Pendaftaran Fulltime Course</h1>
                    <Text className="subtitle">
                        Kelola data pendaftaran fulltime course, termasuk informasi siswa, angkatan, biaya, dan status pembayaran. Gunakan fitur pencarian, penyortiran, dan pagination untuk memudahkan navigasi data. Klik pada baris untuk melihat detail dan mengedit informasi pendaftaran.
                    </Text>
                </Box>

                {/* Summary stats cards */}
                <Flex className="stats-grid-pendaftaranFulltime" gap={4} mb={6} flexWrap="wrap">
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Siswa</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Jumlah Angkatan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueAngkatan}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Sudah Faktur</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahFaktur}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Ada Sisa Biaya</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaSisaBiaya}</p>}
                    </InfoCard>
                </Flex>

                {/* Search and Filter */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari berdasarkan nama siswa, angkatan, atau nomor faktur..."
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper" overflowX="auto">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton height="40px" count={20} style={{ marginBottom: "8px" }} />
                        </Box>
                    ) : isError ? (
                        <Flex direction="column" align="center" justify="center" py={12} gap={3}>
                            <FiInbox size={48} />
                            <Text color="red.500">Gagal Memuat Data</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex direction="column" align="center"py={12} gap={3}>
                            <FiInbox size={48} />
                            <Text color="gray.500">{searchQuery ? `Tidak ada data yang sesuai dengan pencarian "${searchQuery}"` : "Tidak ada data yang tersedia"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ width: "100px", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="angkatan" label="Angkatan" minWidth="100px" />
                                        <SortableHeader column="tahun" label="Tahun" minWidth="80px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <th style={{ minWidth: "100px" }}>ID</th>
                                        <SortableHeader column="nama_siswa" label="Nama Siswa" minWidth="180px" />
                                        <th style={{ minWidth: "130px" }}>Nomor Faktur</th>
                                        <th style={{ minWidth: "130px" }}>Biaya Pendaftaran</th>
                                        <th style={{ minWidth: "130px" }}>Biaya Program</th>
                                        <th style={{ minWidth: "100px" }}>Discount</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 1</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 2</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 3</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 4</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 5</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 6</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 7</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 8</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 9</th>
                                        <th style={{ minWidth: "120px" }}>Cicilan 10</th>
                                        <th style={{ minWidth: "120px" }}>Sisa Biaya</th>
                                        <th style={{ minWidth: "140px" }}>Other Benefits</th>
                                        <th style={{ minWidth: "160px" }}>Keterangan</th>
                                        <th style={{ minWidth: "120px" }}>Info</th>
                                        <th style={{ minWidth: "80px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.angkatan}</td>
                                            <td>{item.tahun}</td>
                                            <td>{item.timestamp}</td>
                                            <td>{item.id}</td>
                                            <td>{item.nama_siswa}</td>
                                            <td>{item.nomor_faktur}</td>
                                            <td>{formatRupiah(item.biaya_pendafataran)}</td>
                                            <td>{formatRupiah(item.biaya_program)}</td>
                                            <td>{formatRupiah(item.discount)}</td>
                                            <td>{formatRupiah(item.cicilan_one)}</td>
                                            <td>{formatRupiah(item.cicilan_two)}</td>
                                            <td>{formatRupiah(item.cicilan_three)}</td>
                                            <td>{formatRupiah(item.cicilan_four)}</td>
                                            <td>{formatRupiah(item.cicilan_five)}</td>
                                            <td>{formatRupiah(item.cicilan_six)}</td>
                                            <td>{formatRupiah(item.cicilan_seven)}</td>
                                            <td>{formatRupiah(item.cicilan_eight)}</td>
                                            <td>{formatRupiah(item.cicilan_nine)}</td>
                                            <td>{formatRupiah(item.cicilan_ten)}</td>
                                            <td>{formatRupiah(item.sisa_biaya)}</td>
                                            <td>
                                                {item.other_benefits && item.other_benefits.length > 20 ? (
                                                    <Tooltip label={item.other_benefits}>
                                                        <span>{item.other_benefits.substring(0, 20)}...</span>
                                                    </Tooltip>
                                                ) : item.other_benefits || "-"}
                                            </td>
                                            <td>
                                                {item.keterangan && item.keterangan.length > 25 ? (
                                                    <Tooltip label={item.keterangan}>
                                                        <span>{item.keterangan.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : item.keterangan || "-"}
                                            </td>
                                            <td>{item.info || "-"}</td>
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
                <Modal isOpen={isOpen} onClose={handleClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Pendaftaran Fulltime Course</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Read only fields */}
                                <ReadOnlyField label="Nama Siswa" value={formData.nama_siswa} />
                                <ReadOnlyField label="ID" value={formData.id} />
                                <ReadOnlyField label="Timestamp" value={formData.timestamp} />
                                <ReadOnlyField label="Biaya Pendaftaran" value={formatRupiah(formData.biaya_pendafataran)} />
                                <ReadOnlyField label="Biaya Program" value={formatRupiah(formData.biaya_program)} />
                                <ReadOnlyField label="Discount" value={formatRupiah(formData.discount)} />
                                <ReadOnlyField label="Cicilan 1" value={formatRupiah(formData.cicilan_one)} />
                                <ReadOnlyField label="Cicilan 2" value={formatRupiah(formData.cicilan_two)} />
                                <ReadOnlyField label="Cicilan 3" value={formatRupiah(formData.cicilan_three)} />
                                <ReadOnlyField label="Cicilan 4" value={formatRupiah(formData.cicilan_four)} />
                                <ReadOnlyField label="Cicilan 5" value={formatRupiah(formData.cicilan_five)} />
                                <ReadOnlyField label="Cicilan 6" value={formatRupiah(formData.cicilan_six)} />
                                <ReadOnlyField label="Cicilan 7" value={formatRupiah(formData.cicilan_seven)} />
                                <ReadOnlyField label="Cicilan 8" value={formatRupiah(formData.cicilan_eight)} />
                                <ReadOnlyField label="Cicilan 9" value={formatRupiah(formData.cicilan_nine)} />
                                <ReadOnlyField label="Cicilan 10" value={formatRupiah(formData.cicilan_ten)} />
                                <ReadOnlyField label="Sisa Biaya" value={formatRupiah(formData.sisa_biaya)} />
                                <ReadOnlyField label="Other Benefits" value={formData.other_benefits} isTextArea />
                                <ReadOnlyField label="Info" value={formData.info} isTextArea />

                                {/* Editable field */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Angkatan</Text>
                                    <Input name="angkatan" value={formData.angkatan} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Tahun</Text>
                                    <Input name="tahun" value={formData.tahun} onChange={handleInputChange} placeholder="Contoh: 2026" />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nomor</Text>
                                    <Input name="nomor" value={formData.nomor} onChange={handleInputChange} placeholder="Contoh: 001" />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nomor Faktur</Text>
                                    <Input name="nomor_faktur" value={formData.nomor_faktur} onChange={handleInputChange} placeholder="Contoh: INV-2026-001" />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleClose}>
                                Batal
                            </Button>
                            <Button colorScheme="teal" onClick={handleSubmit} isLoading={updateMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </PendaftaranFulltimeCourseStyled>
        </ContainerCarrot>
    );
}

export default PendaftaranFulltimeCoursePage;