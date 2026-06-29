import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getDataPenyusutan, editPenyusutanBarang } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, IconButton, Input, Select, Text, Textarea,
    Tooltip, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiCalendar, FiTrendingDown,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const BULAN_OPTIONS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const CURRENT_MONTH_EN = BULAN_OPTIONS[new Date().getMonth()];

const PenyusutanPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [selectedBulan, setSelectedBulan] = useState(CURRENT_MONTH_EN);
    const [selectedTahun, setSelectedTahun] = useState(String(CURRENT_YEAR));
    const [appliedFilter, setAppliedFilter] = useState(null); // { bulan, tahun }
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState({ kode_barang: "", nama_barang: "", keterangan: "" });

    const { data: penyusutanData = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["dataPenyusutan", appliedFilter?.bulan, appliedFilter?.tahun],
        queryFn: () => getDataPenyusutan(appliedFilter.bulan, appliedFilter.tahun),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedFilter,
    });

    const editMutation = useMutation({
        mutationFn: editPenyusutanBarang,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dataPenyusutan"] });
            toaster.create({ title: "Berhasil update keterangan", type: "success", duration: 3000 });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update keterangan", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Ambil kolom dinamis dari data pertama (A3:L = 12 kolom, nama field tidak diketahui pasti)
    const columns = useMemo(() => {
        if (!penyusutanData.length) return [];
        return Object.keys(penyusutanData[0]);
    }, [penyusutanData]);

    const stats = useMemo(() => {
        const total = penyusutanData.length;
        const adaKeterangan = penyusutanData.filter(i => i.keterangan && i.keterangan !== "").length;
        return { total, adaKeterangan };
    }, [penyusutanData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return penyusutanData;
        const lower = searchQuery.toLowerCase();
        return penyusutanData.filter(item =>
            Object.values(item).some(val => val && String(val).toLowerCase().includes(lower))
        );
    }, [penyusutanData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = String(a[sortConfig.key] || "").toLowerCase();
            const bVal = String(b[sortConfig.key] || "").toLowerCase();
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

    const handleTampilkan = () => {
        setAppliedFilter({ bulan: selectedBulan, tahun: selectedTahun });
        setCurrentPage(1);
        setSearchQuery("");
    };

    const handleOpenEdit = (item) => {
        setEditForm({
            kode_barang: item.kode_barang || "",
            nama_barang: item.nama_barang || "",
            keterangan: item.keterangan || "",
        });
        onOpen();
    };

    const handleEditSubmit = () => {
        if (!editForm.kode_barang) {
            toaster.create({ title: "Kode Barang tidak ditemukan pada data ini", type: "warning", duration: 3000 });
            return;
        }
        editMutation.mutate({ kode_barang: editForm.kode_barang, keterangan: editForm.keterangan });
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

    const isValidUrl = (url) => {
        if (!url) return false;
        try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
        catch { return false; }
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Data Penyusutan Barang</h1>
                    <Text className="subtitle">Lihat dan kelola data penyusutan asset per bulan</Text>
                </Box>

                {/* Filter Bulan & Tahun */}
                <Box bg={colorMode === "dark" ? "gray.800" : "white"} border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    borderRadius="12px" p={4} mb={6}
                >
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Bulan</Text>
                            <Select value={selectedBulan} onChange={(e) => setSelectedBulan(e.target.value)} maxW="180px">
                                {BULAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                            </Select>
                        </Box>
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Tahun</Text>
                            <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} maxW="140px">
                                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </Select>
                        </Box>
                        <Button colorScheme="teal" onClick={handleTampilkan} isLoading={isFetching} leftIcon={<FiCalendar />}>
                            Tampilkan
                        </Button>
                    </Flex>
                </Box>

                {/* Empty state sebelum filter dipilih */}
                {!appliedFilter && (
                    <Flex className="empty-state">
                        <FiTrendingDown size={48} />
                        <Text>Pilih bulan dan tahun, lalu klik "Tampilkan" untuk melihat data</Text>
                    </Flex>
                )}

                {/* Stats */}
                {appliedFilter && (
                    <Box className="stats-grid" mb={6}>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Total Barang</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiEdit2 size={28} />
                            <p>Ada Keterangan</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaKeterangan}</p>}
                        </InfoCard>
                    </Box>
                )}

                {/* Search */}
                {appliedFilter && (
                    <Flex className="search-container" mb={4}>
                        <Box position="relative" width="100%" maxWidth="400px">
                            <Input
                                placeholder="Cari di semua kolom..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                pl="40px"
                            />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <FiSearch size={18} />
                            </Box>
                        </Box>
                    </Flex>
                )}

                {/* Table */}
                {appliedFilter && (
                    <Box className="table-wrapper">
                        {isLoading ? (
                            <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                        ) : isError ? (
                            <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data penyusutan</Text></Flex>
                        ) : sortedData.length === 0 ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>
                                    {searchQuery
                                        ? "Tidak ada hasil pencarian"
                                        : `Tidak ada data untuk ${appliedFilter.bulan} ${appliedFilter.tahun}`}
                                </Text>
                            </Flex>
                        ) : (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50px" }}>No</th>
                                            {columns.map(col => (
                                                <SortableHeader
                                                    key={col}
                                                    column={col}
                                                    label={col.replace(/_/g, " ").toUpperCase()}
                                                    minWidth="140px"
                                                />
                                            ))}
                                            <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => (
                                            <tr key={item.kode_barang || index}>
                                                <td>{startIndex + index + 1}</td>
                                                {columns.map(col => {
                                                    const val = item[col];
                                                    if (isValidUrl(val)) {
                                                        return (
                                                            <td key={col}>
                                                                <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                onClick={() => window.open(String(val), "_blank", "noopener,noreferrer")}>
                                                                    <FiExternalLink />
                                                                </IconButton>
                                                            </td>
                                                        );
                                                    }
                                                    const str = val ? String(val) : "-";
                                                    return (
                                                        <td key={col}>
                                                            {str.length > 30 ? (
                                                                <Tooltip label={str}><span>{str.substring(0, 30)}...</span></Tooltip>
                                                            ) : str}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                        onClick={() => handleOpenEdit(item)}>
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
                )}

                {/* Edit Keterangan Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Keterangan — {editForm.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box mb={4}>
                                <Text fontWeight="medium" mb={2} fontSize="sm">Kode Barang</Text>
                                <Input value={editForm.kode_barang} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
                            </Box>
                            <Box>
                                <Text fontWeight="medium" mb={2} fontSize="sm">Keterangan</Text>
                                <Textarea
                                    value={editForm.keterangan}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, keterangan: e.target.value }))}
                                    placeholder="Masukkan keterangan penyusutan..."
                                    rows={4}
                                />
                            </Box>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
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

export default PenyusutanPage;