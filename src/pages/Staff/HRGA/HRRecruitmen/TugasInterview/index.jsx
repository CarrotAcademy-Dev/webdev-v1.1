import ContainerCarrot from "@/components/Container";
import { getTugasInterview, addTugasInterview, editTugasInterview } from "@/features/hr/hrApiService";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Skeleton, Stack, Text, Textarea, Tooltip,
    useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiPlus, FiSearch, FiUsers, FiFileText,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { toaster } from "@/components/ui/toaster";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

const EMPTY_FORM = {
    posisi: "", nama_tugas: "", deskripsi_tugas: "", submit_soal: "", uniqueId: "",
};

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(url).protocol); }
    catch { return false; }
};

const TugasInterviewPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: tugasData = [], isLoading, isError } = useQuery({
        queryKey: ["tugasInterview"],
        queryFn: getTugasInterview,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addTugasInterview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tugasInterview"] });
            toaster.create({ title: "Berhasil tambah tugas", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah tugas", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editTugasInterview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tugasInterview"] });
            toaster.create({ title: "Berhasil edit tugas", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal edit tugas", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const data = tugasData;
        const uniquePosisi = new Set(data.map(i => i.posisi).filter(Boolean)).size;
        const adaSoal = data.filter(i => i.submit_soal && i.submit_soal !== "").length;
        return { total: data.length, uniquePosisi, adaSoal };
    }, [tugasData]);

    const filteredData = useMemo(() => {
        const data = tugasData;
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.posisi && i.posisi.toLowerCase().includes(lower)) ||
            (i.nama_tugas && i.nama_tugas.toLowerCase().includes(lower))
        );
    }, [tugasData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleOpenEdit = (item) => {
        setFormData({
            posisi: item.posisi || "",
            nama_tugas: item.nama_tugas || "",
            deskripsi_tugas: item.deksripsi_tugas || "", // typo di backend: deksripsi
            submit_soal: item.submit_soal || "",
            uniqueId: item.uniqueId || "",
        });
        onEditOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const { posisi, nama_tugas, deskripsi_tugas, submit_soal } = formData;
        if (!posisi || !nama_tugas || !deskripsi_tugas || !submit_soal) {
            toaster.create({ title: "Semua field wajib diisi", type: "warning", duration: 2000 });
            return false;
        }
        return true;
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (
                    sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                )}
            </Flex>
        </th>
    );

    const FormFields = () => (
        <Stack gap={4}>
            <Box>
                <Text fontWeight="medium" mb={2}>Posisi <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="posisi"
                    value={formData.posisi}
                    onChange={handleInputChange}
                    placeholder="Contoh: CSO Intern, ESO, Finance..."
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={2}>Nama Tugas <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="nama_tugas"
                    value={formData.nama_tugas}
                    onChange={handleInputChange}
                    placeholder="Nama tugas interview"
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={2}>Deskripsi Tugas <Text as="span" color="red.500">*</Text></Text>
                <Textarea
                    name="deskripsi_tugas"
                    value={formData.deskripsi_tugas}
                    onChange={handleInputChange}
                    placeholder="Jelaskan detail tugas yang harus dikerjakan..."
                    rows={4}
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={2}>Link Submit Soal <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="submit_soal"
                    value={formData.submit_soal}
                    onChange={handleInputChange}
                    placeholder="https://..."
                />
            </Box>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Tugas Interview</h1>
                    <Text className="subtitle">Kelola data tugas interview per posisi</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Tugas</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUsers size={28} />
                        <p>Jumlah Posisi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniquePosisi}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFileText size={28} />
                        <p>Ada Link Soal</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaSoal}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={4} justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari posisi atau nama tugas..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Tugas
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data tugas interview</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data tugas interview"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="posisi" label="Posisi" minWidth="150px" />
                                        <SortableHeader column="nama_tugas" label="Nama Tugas" minWidth="180px" />
                                        <th style={{ minWidth: "250px" }}>Deskripsi Tugas</th>
                                        <th style={{ minWidth: "120px" }}>Link Soal</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.uniqueId || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.posisi}</td>
                                            <td>{item.nama_tugas}</td>
                                            <td>
                                                {item.deksripsi_tugas?.length > 60 ? (
                                                    <Tooltip label={item.deksripsi_tugas}>
                                                        <span>{item.deksripsi_tugas.substring(0, 60)}...</span>
                                                    </Tooltip>
                                                ) : item.deksripsi_tugas || "-"}
                                            </td>
                                            <td>
                                                {isValidUrl(item.submit_soal) ? (
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => window.open(item.submit_soal, "_blank", "noopener,noreferrer")}
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : item.submit_soal || "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton
                                                    size="sm"
                                                    backgroundColor="teal.400"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(item)}
                                                >
                                                    <FiEdit2 />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <Flex justify="center" mt={4} mb={4}>
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

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Tugas Interview</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={() => validate() && addMutation.mutate(formData)} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Tugas Interview</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={() => validate() && editMutation.mutate(formData)} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default TugasInterviewPage;