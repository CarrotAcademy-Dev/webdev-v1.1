import ContainerCarrot from "@/components/Container";
import { getJamKerja, addJamKerja, editJamKerja } from "@/features/hr/hrApiService";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay, Skeleton, Stack, Text, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiPlus, FiSearch, FiClock,
    FiUsers,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { toaster } from "@/components/ui/toaster";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

const EMPTY_FORM = { divisi: "", jam_masuk: "", jam_keluar: "", shift: "", uniqueId: "" };

const JamKerjaPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: jamKerjaData = [], isLoading, isError } = useQuery({
        queryKey: ["jamKerja"],
        queryFn: getJamKerja,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addJamKerja,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jamKerja"] });
            toaster.create({ title: "Berhasil tambah data", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal tambah data",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const editMutation = useMutation({
        mutationFn: editJamKerja,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jamKerja"] });
            toaster.create({ title: "Berhasil edit data", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onEditClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal edit data",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const stats = useMemo(() => {
        const data = jamKerjaData;
        const uniqueDivisi = new Set(data.map(i => i.divisi).filter(Boolean)).size;
        const uniqueShift = new Set(data.map(i => i.shift).filter(Boolean)).size;
        return { total: data.length, uniqueDivisi, uniqueShift };
    }, [jamKerjaData]);

    const filteredData = useMemo(() => {
        const data = jamKerjaData;
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.divisi && i.divisi.toLowerCase().includes(lower)) ||
            (i.shift && i.shift.toLowerCase().includes(lower))
        );
    }, [jamKerjaData, searchQuery]);

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
            divisi: item.divisi || "",
            jam_masuk: item.jam_masuk || "",
            jam_keluar: item.jam_keluar || "",
            shift: item.shift || "",
            uniqueId: item.uniqueId || "",
        });
        onEditOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        const { divisi, jam_masuk, jam_keluar, shift } = formData;
        if (!divisi || !jam_masuk || !jam_keluar || !shift) {
            toaster.create({ title: "Semua field wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(formData);
    };

    const handleEditSubmit = () => {
        const { divisi, jam_masuk, jam_keluar, shift, uniqueId } = formData;
        if (!divisi || !jam_masuk || !jam_keluar || !shift || !uniqueId) {
            toaster.create({ title: "Semua field wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(formData);
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
                <Text fontWeight="medium" mb={2}>Divisi <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="divisi"
                    value={formData.divisi}
                    onChange={handleInputChange}
                    placeholder="Contoh: Finance, ESO, CSO..."
                />
            </Box>
            <Flex gap={4}>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Jam Masuk <Text as="span" color="red.500">*</Text></Text>
                    <Input
                        name="jam_masuk"
                        type="time"
                        value={formData.jam_masuk}
                        onChange={handleInputChange}
                    />
                </Box>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Jam Keluar <Text as="span" color="red.500">*</Text></Text>
                    <Input
                        name="jam_keluar"
                        type="time"
                        value={formData.jam_keluar}
                        onChange={handleInputChange}
                    />
                </Box>
            </Flex>
            <Box>
                <Text fontWeight="medium" mb={2}>Shift <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    placeholder="Contoh: Pagi, Siang, Malam..."
                />
            </Box>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Jam Kerja</h1>
                    <Text className="subtitle">Kelola data jam kerja per divisi dan shift</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Data</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUsers size={28} />
                        <p>Jumlah Divisi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueDivisi}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Jumlah Shift</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueShift}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={4} justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari divisi atau shift..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Data
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data jam kerja</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data jam kerja"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="divisi" label="Divisi" minWidth="150px" />
                                        <SortableHeader column="jam_masuk" label="Jam Masuk" minWidth="120px" />
                                        <SortableHeader column="jam_keluar" label="Jam Keluar" minWidth="120px" />
                                        <SortableHeader column="shift" label="Shift" minWidth="120px" />
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.uniqueId || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.divisi}</td>
                                            <td>{item.jam_masuk}</td>
                                            <td>{item.jam_keluar}</td>
                                            <td>{item.shift}</td>
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

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Jam Kerja</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Jam Kerja</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default JamKerjaPage;