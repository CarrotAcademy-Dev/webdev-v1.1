import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getMaintenanceData, editMaintenanceData, addMaintenanceData } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, IconButton, Input, Select, Stack, Text, Textarea,
    Tooltip, useColorMode, useDisclosure, Badge,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox,
    FiList, FiSearch, FiPlus, FiTool, FiCheckCircle, FiClock,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_OPTIONS = ["Selesai", "Belum Selesai", "Sedang Dikerjakan"];

const STATUS_COLORS = {
    "Selesai": "green",
    "Belum Selesai": "red",
    "Sedang Dikerjakan": "orange",
};

const EMPTY_FORM = {
    kode_barang: "", nama_barang: "", tanggal_mulai: "", tanggal_selesai: "",
    durasi: "", status_pemeliharaan: "", catatan: "",
};

const MaintenancePage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: maintenanceData = [], isLoading, isError } = useQuery({
        queryKey: ["maintenanceData"],
        queryFn: getMaintenanceData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addMaintenanceData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["maintenanceData"] });
            toaster.create({ title: "Berhasil tambah data maintenance", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editMaintenanceData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["maintenanceData"] });
            toaster.create({ title: "Berhasil update data maintenance", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = maintenanceData.length;
        const selesai = maintenanceData.filter(i => i.status_pemeliharaan === "Selesai").length;
        const belumSelesai = maintenanceData.filter(i => i.status_pemeliharaan === "Belum Selesai").length;
        const sedangDikerjakan = maintenanceData.filter(i => i.status_pemeliharaan === "Sedang Dikerjakan").length;
        return { total, selesai, belumSelesai, sedangDikerjakan };
    }, [maintenanceData]);

    const filteredData = useMemo(() => {
        let data = maintenanceData;
        if (filterStatus !== "all") data = data.filter(i => i.status_pemeliharaan === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.kode_barang && String(i.kode_barang).toLowerCase().includes(lower)) ||
            (i.catatan && String(i.catatan).toLowerCase().includes(lower))
        );
    }, [maintenanceData, searchQuery, filterStatus]);

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
        setFormData({
            kode_barang: item.kode_barang || "",
            nama_barang: item.nama_barang || "",
            tanggal_mulai: item.tanggal_mulai || "",
            tanggal_selesai: item.tanggal_selesai || "",
            durasi: item.durasi || "",
            status_pemeliharaan: item.status_pemeliharaan || "",
            catatan: item.catatan || "",
        });
        onEditOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!formData.kode_barang || !formData.nama_barang) {
            toaster.create({ title: "Kode Barang dan Nama Barang wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        addMutation.mutate(formData);
    };

    const handleEditSubmit = () => {
        if (!formData.kode_barang) {
            toaster.create({ title: "Kode Barang wajib diisi", type: "warning", duration: 2000 });
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

    const FormFields = ({ isEdit }) => (
        <Stack gap={4}>
            <Flex gap={4}>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Kode Barang <Text as="span" color="red.500">*</Text></Text>
                    <Input
                        name="kode_barang"
                        value={formData.kode_barang}
                        onChange={handleInputChange}
                        placeholder="Contoh: AST-001"
                        isReadOnly={isEdit}
                        bg={isEdit ? (colorMode === "dark" ? "gray.700" : "gray.100") : undefined}
                    />
                </Box>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Nama Barang <Text as="span" color="red.500">*</Text></Text>
                    <Input
                        name="nama_barang"
                        value={formData.nama_barang}
                        onChange={handleInputChange}
                        placeholder="Nama barang"
                        isReadOnly={isEdit}
                        bg={isEdit ? (colorMode === "dark" ? "gray.700" : "gray.100") : undefined}
                    />
                </Box>
            </Flex>
            <Flex gap={4}>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Tanggal Mulai</Text>
                    <Input name="tanggal_mulai" type="date" value={formData.tanggal_mulai} onChange={handleInputChange} />
                </Box>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Tanggal Selesai</Text>
                    <Input name="tanggal_selesai" type="date" value={formData.tanggal_selesai} onChange={handleInputChange} />
                </Box>
            </Flex>
            <Flex gap={4}>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Durasi</Text>
                    <Input name="durasi" value={formData.durasi} onChange={handleInputChange} placeholder="Contoh: 3 hari" />
                </Box>
                <Box flex={1}>
                    <Text fontWeight="medium" mb={2}>Status Pemeliharaan</Text>
                    <Select name="status_pemeliharaan" value={formData.status_pemeliharaan} onChange={handleInputChange}>
                        <option value="">- Pilih Status -</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Box>
            </Flex>
            <Box>
                <Text fontWeight="medium" mb={2}>Catatan</Text>
                <Textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    placeholder="Catatan tambahan..."
                    rows={3}
                />
            </Box>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Maintenance</h1>
                    <Text className="subtitle">Kelola data pemeliharaan asset</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Maintenance</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Selesai</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.selesai}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Sedang Dikerjakan</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sedangDikerjakan}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTool size={28} />
                        <p>Belum Selesai</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.belumSelesai}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filter + Add */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" justify="space-between" align="center">
                    <Flex gap={3} wrap="wrap" flex={1}>
                        <Box position="relative" width="100%" maxWidth="320px">
                            <Input
                                placeholder="Cari kode, nama barang, catatan..."
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
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Maintenance
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data maintenance</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data maintenance"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="kode_barang" label="Kode Barang" minWidth="120px" />
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="180px" />
                                        <SortableHeader column="tanggal_mulai" label="Tanggal Mulai" minWidth="130px" />
                                        <SortableHeader column="tanggal_selesai" label="Tanggal Selesai" minWidth="130px" />
                                        <th style={{ minWidth: "100px" }}>Durasi</th>
                                        <th style={{ minWidth: "150px" }}>Status</th>
                                        <th style={{ minWidth: "200px" }}>Catatan</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.kode_barang || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.kode_barang || "-"}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td>{String(item.tanggal_mulai || "-")}</td>
                                            <td>{String(item.tanggal_selesai || "-")}</td>
                                            <td>{item.durasi || "-"}</td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status_pemeliharaan] || "gray"}>
                                                    {item.status_pemeliharaan || "-"}
                                                </Badge>
                                            </td>
                                            <td>
                                                {item.catatan?.length > 30 ? (
                                                    <Tooltip label={item.catatan}>
                                                        <span>{item.catatan.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : item.catatan || "-"}
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

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Maintenance</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields isEdit={false} /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Maintenance — {formData.nama_barang}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody><FormFields isEdit={true} /></ModalBody>
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

export default MaintenancePage;