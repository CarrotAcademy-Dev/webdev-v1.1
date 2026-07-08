/* eslint-disable no-unused-vars */
import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getListBarangJual, editListBarangJual, addListBarangJual } from "@/features/hr/stockApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
    Stack, Text, Tooltip, useColorMode, useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiPlus, FiSearch, FiShoppingBag, FiTag,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const EMPTY_FORM = {
    row: "",
    nama_barang: "",
    shortlink: "",
    qrcode: "",
    harga_jual: "",
};

const ListBarangJualPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: barangJualData = [], isLoading, isError } = useQuery({
        queryKey: ["listBarangJual"],
        queryFn: getListBarangJual,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: addListBarangJual,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["listBarangJual"] });
            toaster.create({ title: "Berhasil tambah barang jual", type: "success", duration: 3000 });
            setFormData(EMPTY_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const editMutation = useMutation({
        mutationFn: editListBarangJual,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["listBarangJual"] });
            toaster.create({ title: "Berhasil update barang jual", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = barangJualData.length;
        const adaShortlink = barangJualData.filter(i => i.shortlink && i.shortlink !== "").length;
        const adaQrcode = barangJualData.filter(i => isValidUrl(i.qrcode)).length;
        return { total, adaShortlink, adaQrcode };
    }, [barangJualData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return barangJualData;
        const lower = searchQuery.toLowerCase();
        return barangJualData.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.shortlink && String(i.shortlink).toLowerCase().includes(lower)) ||
            (i.harga_jual && String(i.harga_jual).toLowerCase().includes(lower))
        );
    }, [barangJualData, searchQuery]);

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
            row: String(item.row || ""),
            nama_barang: item.nama_barang || "",
            shortlink: item.shortlink || "",
            qrcode: item.qrcode || "",
            harga_jual: item.harga_jual || "",
        });
        onEditOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!formData.nama_barang.trim()) {
            toaster.create({ title: "Nama barang wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        const { row, ...payload } = formData;
        addMutation.mutate(payload);
    };

    const handleEditSubmit = () => {
        if (!formData.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        const { nama_barang, ...rest } = formData; // nama_barang tidak bisa diedit? cek dok — boleh diedit
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
            {isEdit && (
                <Box>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Row (Read-only)</Text>
                    <Input value={formData.row} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} size="sm" />
                </Box>
            )}
            <Box>
                <Text fontWeight="medium" mb={2}>Nama Barang <Text as="span" color="red.500">*</Text></Text>
                <Input
                    name="nama_barang"
                    value={formData.nama_barang}
                    onChange={handleInputChange}
                    placeholder="Nama barang yang dijual"
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={2}>Harga Jual</Text>
                <Input
                    name="harga_jual"
                    value={formData.harga_jual}
                    onChange={handleInputChange}
                    placeholder="Contoh: 25000"
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={1}>Shortlink</Text>
                <Text fontSize="xs" color="gray.500" mb={2}>Link pendek untuk halaman pembelian</Text>
                <Input
                    name="shortlink"
                    value={formData.shortlink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                />
            </Box>
            <Box>
                <Text fontWeight="medium" mb={1}>QR Code URL</Text>
                <Text fontSize="xs" color="gray.500" mb={2}>
                    URL gambar QR Code. Kosongkan jika QR berupa image over-cell (tidak bisa diambil Apps Script).
                </Text>
                <Input
                    name="qrcode"
                    value={formData.qrcode}
                    onChange={handleInputChange}
                    placeholder="https://..."
                />
            </Box>
            {isEdit && (
                <Box
                    p={3}
                    borderRadius="md"
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                    <Text fontSize="xs" color="gray.500">
                        ⚠️ Kolom <strong>URL</strong> tidak bisa diedit — di-generate otomatis oleh backend.
                    </Text>
                </Box>
            )}
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>List Barang Jual</h1>
                    <Text className="subtitle">Kelola daftar barang yang dijual beserta shortlink dan QR Code</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiShoppingBag size={28} />
                        <p>Total Barang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiExternalLink size={28} />
                        <p>Ada Shortlink</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaShortlink}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTag size={28} />
                        <p>Ada QR Code</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaQrcode}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Add */}
                <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama barang, shortlink, harga..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={() => { setFormData(EMPTY_FORM); onAddOpen(); }}>
                        <FiPlus style={{ marginRight: "6px" }} /> Tambah Barang
                    </Button>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data barang jual</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data barang jual"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="180px" />
                                        <SortableHeader column="harga_jual" label="Harga Jual" minWidth="120px" />
                                        <th style={{ minWidth: "160px" }}>URL</th>
                                        <th style={{ minWidth: "160px" }}>Shortlink</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>QR Code</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td>{item.harga_jual || "-"}</td>
                                            <td>
                                                {isValidUrl(item.url) ? (
                                                    <Flex align="center" gap={2}>
                                                        <Text fontSize="sm" color="blue.400" noOfLines={1} maxW="120px">
                                                            {String(item.url)}
                                                        </Text>
                                                        <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                            onClick={() => window.open(String(item.url), "_blank", "noopener,noreferrer")}>
                                                            <FiExternalLink />
                                                        </IconButton>
                                                    </Flex>
                                                ) : item.url || "-"}
                                            </td>
                                            <td>
                                                {item.shortlink ? (
                                                    <Flex align="center" gap={2}>
                                                        <Text fontSize="sm" noOfLines={1} maxW="120px">
                                                            {String(item.shortlink)}
                                                        </Text>
                                                        {isValidUrl(item.shortlink) && (
                                                            <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                onClick={() => window.open(String(item.shortlink), "_blank", "noopener,noreferrer")}>
                                                                <FiExternalLink />
                                                            </IconButton>
                                                        )}
                                                    </Flex>
                                                ) : "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {isValidUrl(item.qrcode) ? (
                                                    <Box
                                                        as="img"
                                                        src={String(item.qrcode)}
                                                        alt="QR Code"
                                                        boxSize="48px"
                                                        objectFit="contain"
                                                        cursor="pointer"
                                                        onClick={() => window.open(String(item.qrcode), "_blank", "noopener,noreferrer")}
                                                        title="Klik untuk buka QR Code"
                                                    />
                                                ) : (
                                                    <Text fontSize="xs" color="gray.400">-</Text>
                                                )}
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
                        <ModalHeader>Tambah Barang Jual</ModalHeader>
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
                        <ModalHeader>Edit Barang Jual — {formData.nama_barang}</ModalHeader>
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

export default ListBarangJualPage;