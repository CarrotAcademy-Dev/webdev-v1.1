import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getServicesData, editServicesData } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, IconButton, Input, Select, Text, Badge,
    Switch, Tooltip, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiDollarSign, FiCheckCircle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_OPTIONS = ["Sudah Dibayar", "Belum Dibayar", "Tanpa Biaya"];

const STATUS_COLORS = {
    "Sudah Dibayar": "green",
    "Belum Dibayar": "red",
    "Tanpa Biaya": "gray",
};

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE";

const ServicesPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState({ nama_barang: "", status: "", send_to_bkk: "FALSE" });

    const { data: servicesData = [], isLoading, isError } = useQuery({
        queryKey: ["servicesData"],
        queryFn: getServicesData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editServicesData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["servicesData"] });
            toaster.create({ title: "Berhasil update data service", type: "success", duration: 3000 });
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Kolom dinamis (A3:M = 13 kolom, nama field tidak disebut pasti kecuali status & send_to_bkk)
    const columns = useMemo(() => {
        if (!servicesData.length) return [];
        return Object.keys(servicesData[0]).filter(k => k !== "status" && k !== "send_to_bkk");
    }, [servicesData]);

    const stats = useMemo(() => {
        const total = servicesData.length;
        const sudahDibayar = servicesData.filter(i => i.status === "Sudah Dibayar").length;
        const belumDibayar = servicesData.filter(i => i.status === "Belum Dibayar").length;
        const sentToBkk = servicesData.filter(i => isTruthy(i.send_to_bkk)).length;
        return { total, sudahDibayar, belumDibayar, sentToBkk };
    }, [servicesData]);

    const filteredData = useMemo(() => {
        let data = servicesData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(item =>
            Object.values(item).some(val => val && String(val).toLowerCase().includes(lower))
        );
    }, [servicesData, searchQuery, filterStatus]);

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

    const handleOpenEdit = (item) => {
        setEditForm({
            nama_barang: item.nama_barang || "",
            status: item.status || "",
            send_to_bkk: isTruthy(item.send_to_bkk) ? "TRUE" : "FALSE",
        });
        onOpen();
    };

    const handleEditSubmit = () => {
        if (!editForm.nama_barang) {
            toaster.create({ title: "Nama Barang tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(editForm);
    };

    // Quick toggle langsung dari tabel tanpa buka modal (untuk send_to_bkk)
    const quickToggleMutation = useMutation({
        mutationFn: editServicesData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["servicesData"] });
            toaster.create({ title: "Berhasil update", type: "success", duration: 2000 });
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const handleQuickToggle = (item) => {
        quickToggleMutation.mutate({
            nama_barang: item.nama_barang,
            send_to_bkk: isTruthy(item.send_to_bkk) ? "FALSE" : "TRUE",
        });
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
                    <h1>Services</h1>
                    <Text className="subtitle">Kelola status pembayaran service asset</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Service</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Sudah Dibayar</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahDibayar}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Belum Dibayar</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.belumDibayar}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Sent to BKK</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sentToBkk}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filter */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
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
                    <Select maxW="200px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data services</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data services"}</Text>
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
                                        <th style={{ minWidth: "130px" }}>Status</th>
                                        <th style={{ width: "100px", textAlign: "center" }}>Send to BKK</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.nama_barang || index}>
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
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>
                                                    {item.status || "-"}
                                                </Badge>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <Switch
                                                    isChecked={isTruthy(item.send_to_bkk)}
                                                    onChange={() => handleQuickToggle(item)}
                                                    colorScheme="teal"
                                                    isDisabled={quickToggleMutation.isPending}
                                                />
                                            </td>
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

                {/* Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Status — {editForm.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box mb={4}>
                                <Text fontWeight="medium" mb={2} fontSize="sm">Nama Barang</Text>
                                <Input value={editForm.nama_barang} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
                            </Box>
                            <Box mb={4}>
                                <Text fontWeight="medium" mb={2} fontSize="sm">Status</Text>
                                <Select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="">- Pilih Status -</option>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                            </Box>
                            <Box>
                                <Flex align="center" justify="space-between">
                                    <Text fontWeight="medium" fontSize="sm">Send to BKK</Text>
                                    <Switch
                                        isChecked={editForm.send_to_bkk === "TRUE"}
                                        onChange={(e) => setEditForm(prev => ({
                                            ...prev,
                                            send_to_bkk: e.target.checked ? "TRUE" : "FALSE",
                                        }))}
                                        colorScheme="teal"
                                    />
                                </Flex>
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

export default ServicesPage;