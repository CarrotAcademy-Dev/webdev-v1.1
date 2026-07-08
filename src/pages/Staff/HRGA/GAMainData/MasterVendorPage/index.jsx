/* eslint-disable no-unused-vars */
import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    getMasterVendor, editMasterVendor,
    getInputMasterVendor, tambahInputMasterVendor, editInputMasterVendor, deleteInputMasterVendor,
} from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Tooltip, useColorMode, useDisclosure,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiPlus, FiSearch, FiTrash2, FiTruck,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const MasterVendorPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();

    // ============ Tab Master Vendor (otomatis) ============
    const { isOpen: isAutoEditOpen, onOpen: onAutoEditOpen, onClose: onAutoEditClose } = useDisclosure();
    const [autoSearch, setAutoSearch] = useState("");
    const [autoSort, setAutoSort] = useState({ key: null, direction: "asc" });
    const [autoEditForm, setAutoEditForm] = useState({ id: "", nomor_telp: "", nomor_rekening: "", keterangan: "" });
    const [autoCurrentPage, setAutoCurrentPage] = useState(1);

    const { data: autoVendorData = [], isLoading: isAutoLoading, isError: isAutoError } = useQuery({
        queryKey: ["masterVendor"],
        queryFn: getMasterVendor,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const autoEditMutation = useMutation({
        mutationFn: editMasterVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["masterVendor"] });
            toaster.create({ title: "Berhasil update vendor", type: "success", duration: 3000 });
            onAutoEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const autoFiltered = useMemo(() => {
        if (!autoSearch) return autoVendorData;
        const lower = autoSearch.toLowerCase();
        return autoVendorData.filter(i =>
            (i.nama_vendor && String(i.nama_vendor).toLowerCase().includes(lower)) ||
            (i.alamat_toko && String(i.alamat_toko).toLowerCase().includes(lower))
        );
    }, [autoVendorData, autoSearch]);

    const autoSorted = useMemo(() => {
        if (!autoSort.key) return autoFiltered;
        return [...autoFiltered].sort((a, b) => {
            const aVal = String(a[autoSort.key] || "").toLowerCase();
            const bVal = String(b[autoSort.key] || "").toLowerCase();
            if (aVal < bVal) return autoSort.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return autoSort.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [autoFiltered, autoSort]);

    const {
        currentItems: autoCurrentItems, currentPage: autoPage, totalPages: autoTotalPages,
        goToPage: autoGoToPage, startIndex: autoStartIndex, endIndex: autoEndIndex, totalItems: autoTotalItems,
    } = usePagination(autoSorted, 20);

    const handleAutoSort = (key) => {
        setAutoSort(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    const handleAutoOpenEdit = (item) => {
        setAutoEditForm({
            id: String(item.id || ""),
            nomor_telp: item.nomor_telp || "",
            nomor_rekening: item.nomor_rekening || "",
            keterangan: item.keterangan || "",
        });
        onAutoEditOpen();
    };

    const handleAutoEditSubmit = () => {
        if (!autoEditForm.id) {
            toaster.create({ title: "ID tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        autoEditMutation.mutate(autoEditForm);
    };

    // ============ Tab Input Master Vendor (manual) ============
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isInputEditOpen, onOpen: onInputEditOpen, onClose: onInputEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [inputSearch, setInputSearch] = useState("");
    const [inputSort, setInputSort] = useState({ key: null, direction: "asc" });
    const [selectedInputItem, setSelectedInputItem] = useState(null);
    const EMPTY_INPUT_FORM = { id: "", nama_vendor: "", alamat_toko: "", nomor_telp: "", nomor_rekening: "", link_toko: "", keterangan: "" };
    const [inputForm, setInputForm] = useState(EMPTY_INPUT_FORM);

    const { data: inputVendorData = [], isLoading: isInputLoading, isError: isInputError } = useQuery({
        queryKey: ["inputMasterVendor"],
        queryFn: getInputMasterVendor,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const addMutation = useMutation({
        mutationFn: tambahInputMasterVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inputMasterVendor"] });
            toaster.create({ title: "Berhasil tambah vendor", type: "success", duration: 3000 });
            setInputForm(EMPTY_INPUT_FORM);
            onAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const inputEditMutation = useMutation({
        mutationFn: editInputMasterVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inputMasterVendor"] });
            toaster.create({ title: "Berhasil update vendor", type: "success", duration: 3000 });
            onInputEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInputMasterVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inputMasterVendor"] });
            toaster.create({ title: "Berhasil hapus vendor", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const inputFiltered = useMemo(() => {
        if (!inputSearch) return inputVendorData;
        const lower = inputSearch.toLowerCase();
        return inputVendorData.filter(i =>
            (i.nama_vendor && String(i.nama_vendor).toLowerCase().includes(lower)) ||
            (i.alamat_toko && String(i.alamat_toko).toLowerCase().includes(lower))
        );
    }, [inputVendorData, inputSearch]);

    const inputSorted = useMemo(() => {
        if (!inputSort.key) return inputFiltered;
        return [...inputFiltered].sort((a, b) => {
            const aVal = String(a[inputSort.key] || "").toLowerCase();
            const bVal = String(b[inputSort.key] || "").toLowerCase();
            if (aVal < bVal) return inputSort.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return inputSort.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [inputFiltered, inputSort]);

    const {
        currentItems: inputCurrentItems, currentPage: inputPage, totalPages: inputTotalPages,
        goToPage: inputGoToPage, startIndex: inputStartIndex, endIndex: inputEndIndex, totalItems: inputTotalItems,
    } = usePagination(inputSorted, 20);

    const handleInputSort = (key) => {
        setInputSort(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = () => {
        if (!inputForm.nama_vendor.trim()) {
            toaster.create({ title: "Nama vendor wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        const { id, ...payload } = inputForm;
        if (id.trim()) payload.id = id;
        addMutation.mutate(payload);
    };

    const handleOpenInputEdit = (item) => {
        setInputForm({
            id: String(item.id || ""),
            nama_vendor: item.nama_vendor || "",
            alamat_toko: item.alamat_toko || "",
            nomor_telp: item.nomor_telp || "",
            nomor_rekening: item.nomor_rekening || "",
            link_toko: item.link_toko || "",
            keterangan: item.keterangan || "",
        });
        onInputEditOpen();
    };

    const handleInputEditSubmit = () => {
        if (!inputForm.id) {
            toaster.create({ title: "ID tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        inputEditMutation.mutate(inputForm);
    };

    const handleOpenDelete = (item) => {
        setSelectedInputItem(item);
        onDeleteOpen();
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedInputItem.id);
    };

    const stats = useMemo(() => ({
        totalOtomatis: autoVendorData.length,
        totalManual: inputVendorData.length,
    }), [autoVendorData, inputVendorData]);

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Master Vendor</h1>
                    <Text className="subtitle">Data vendor otomatis (dari transaksi) dan input manual</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiTruck size={28} />
                        <p>Vendor Otomatis</p>
                        {isAutoLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalOtomatis}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Vendor Manual</p>
                        {isInputLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalManual}</p>}
                    </InfoCard>
                </Box>

                <Tabs colorScheme="teal">
                    <TabList mb={4}>
                        <Tab fontWeight="600">Vendor Otomatis ({stats.totalOtomatis})</Tab>
                        <Tab fontWeight="600">Vendor Manual ({stats.totalManual})</Tab>
                    </TabList>

                    <TabPanels>
                        {/* ====== TAB 1: Vendor Otomatis ====== */}
                        <TabPanel px={0}>
                            <Flex className="search-container" mb={4}>
                                <Box position="relative" width="100%" maxWidth="400px">
                                    <Input
                                        placeholder="Cari nama vendor, alamat..."
                                        value={autoSearch}
                                        onChange={(e) => { setAutoSearch(e.target.value); setAutoCurrentPage(1); }}
                                        pl="40px"
                                    />
                                    <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                        <FiSearch size={18} />
                                    </Box>
                                </Box>
                            </Flex>

                            <Box className="table-wrapper">
                                {isAutoLoading ? (
                                    <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                                ) : isAutoError ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data vendor</Text></Flex>
                                ) : autoSorted.length === 0 ? (
                                    <Flex className="empty-state">
                                        <FiInbox size={48} />
                                        <Text>{autoSearch ? "Tidak ada hasil pencarian" : "Belum ada data vendor otomatis"}</Text>
                                    </Flex>
                                ) : (
                                    <>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "80px" }}>ID</th>
                                                    <th onClick={() => handleAutoSort("nama_vendor")} style={{ cursor: "pointer", minWidth: "180px" }}>
                                                        <Flex align="center" gap={1}>Nama Vendor
                                                            {autoSort.key === "nama_vendor" && (autoSort.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
                                                        </Flex>
                                                    </th>
                                                    <th style={{ minWidth: "200px" }}>Alamat Toko</th>
                                                    <th style={{ minWidth: "140px" }}>No Telp</th>
                                                    <th style={{ minWidth: "150px" }}>No Rekening</th>
                                                    <th style={{ minWidth: "100px" }}>Link Toko</th>
                                                    <th style={{ minWidth: "160px" }}>Keterangan</th>
                                                    <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {autoCurrentItems.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td>{item.id}</td>
                                                        <td>{item.nama_vendor || "-"}</td>
                                                        <td>
                                                            {item.alamat_toko?.length > 30 ? (
                                                                <Tooltip label={item.alamat_toko}><span>{item.alamat_toko.substring(0, 30)}...</span></Tooltip>
                                                            ) : item.alamat_toko || "-"}
                                                        </td>
                                                        <td>{item.nomor_telp || "-"}</td>
                                                        <td>{item.nomor_rekening || "-"}</td>
                                                        <td>
                                                            {isValidUrl(item.link_toko) ? (
                                                                <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                    onClick={() => window.open(String(item.link_toko), "_blank", "noopener,noreferrer")}>
                                                                    <FiExternalLink />
                                                                </IconButton>
                                                            ) : "-"}
                                                        </td>
                                                        <td>
                                                            {item.keterangan?.length > 25 ? (
                                                                <Tooltip label={item.keterangan}><span>{item.keterangan.substring(0, 25)}...</span></Tooltip>
                                                            ) : item.keterangan || "-"}
                                                        </td>
                                                        <td style={{ position: "sticky", right: 0 }}>
                                                            <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                                onClick={() => handleAutoOpenEdit(item)}>
                                                                <FiEdit2 />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {autoTotalPages > 1 && (
                                            <Flex justify="center" mt={4}>
                                                <Pagination currentPage={autoPage} totalPages={autoTotalPages} onPageChange={autoGoToPage}
                                                    startIndex={autoStartIndex} endIndex={autoEndIndex} totalItems={autoTotalItems} />
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Box>
                        </TabPanel>

                        {/* ====== TAB 2: Vendor Manual ====== */}
                        <TabPanel px={0}>
                            <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                                <Box position="relative" width="100%" maxWidth="400px">
                                    <Input
                                        placeholder="Cari nama vendor, alamat..."
                                        value={inputSearch}
                                        onChange={(e) => setInputSearch(e.target.value)}
                                        pl="40px"
                                    />
                                    <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                        <FiSearch size={18} />
                                    </Box>
                                </Box>
                                <Button colorScheme="teal" onClick={() => { setInputForm(EMPTY_INPUT_FORM); onAddOpen(); }}>
                                    <FiPlus style={{ marginRight: "6px" }} /> Tambah Vendor
                                </Button>
                            </Flex>

                            <Box className="table-wrapper">
                                {isInputLoading ? (
                                    <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                                ) : isInputError ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data vendor manual</Text></Flex>
                                ) : inputSorted.length === 0 ? (
                                    <Flex className="empty-state">
                                        <FiInbox size={48} />
                                        <Text>{inputSearch ? "Tidak ada hasil pencarian" : "Belum ada data vendor manual"}</Text>
                                    </Flex>
                                ) : (
                                    <>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "50px" }}>No</th>
                                                    <th style={{ minWidth: "80px" }}>ID</th>
                                                    <th onClick={() => handleInputSort("nama_vendor")} style={{ cursor: "pointer", minWidth: "180px" }}>
                                                        <Flex align="center" gap={1}>Nama Vendor
                                                            {inputSort.key === "nama_vendor" && (inputSort.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
                                                        </Flex>
                                                    </th>
                                                    <th style={{ minWidth: "200px" }}>Alamat Toko</th>
                                                    <th style={{ minWidth: "140px" }}>No Telp</th>
                                                    <th style={{ minWidth: "150px" }}>No Rekening</th>
                                                    <th style={{ minWidth: "100px" }}>Link Toko</th>
                                                    <th style={{ minWidth: "160px" }}>Keterangan</th>
                                                    <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inputCurrentItems.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td>{inputStartIndex + index + 1}</td>
                                                        <td>{item.id || "-"}</td>
                                                        <td>{item.nama_vendor || "-"}</td>
                                                        <td>
                                                            {item.alamat_toko?.length > 30 ? (
                                                                <Tooltip label={item.alamat_toko}><span>{item.alamat_toko.substring(0, 30)}...</span></Tooltip>
                                                            ) : item.alamat_toko || "-"}
                                                        </td>
                                                        <td>{item.nomor_telp || "-"}</td>
                                                        <td>{item.nomor_rekening || "-"}</td>
                                                        <td>
                                                            {isValidUrl(item.link_toko) ? (
                                                                <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                    onClick={() => window.open(String(item.link_toko), "_blank", "noopener,noreferrer")}>
                                                                    <FiExternalLink />
                                                                </IconButton>
                                                            ) : "-"}
                                                        </td>
                                                        <td>
                                                            {item.keterangan?.length > 25 ? (
                                                                <Tooltip label={item.keterangan}><span>{item.keterangan.substring(0, 25)}...</span></Tooltip>
                                                            ) : item.keterangan || "-"}
                                                        </td>
                                                        <td style={{ position: "sticky", right: 0 }}>
                                                            <Flex gap={1}>
                                                                <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                                    onClick={() => handleOpenInputEdit(item)}>
                                                                    <FiEdit2 />
                                                                </IconButton>
                                                                <IconButton size="sm" colorScheme="red" variant="ghost"
                                                                    onClick={() => handleOpenDelete(item)}>
                                                                    <FiTrash2 />
                                                                </IconButton>
                                                            </Flex>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {inputTotalPages > 1 && (
                                            <Flex justify="center" mt={4}>
                                                <Pagination currentPage={inputPage} totalPages={inputTotalPages} onPageChange={inputGoToPage}
                                                    startIndex={inputStartIndex} endIndex={inputEndIndex} totalItems={inputTotalItems} />
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {/* Edit Modal — Vendor Otomatis (hanya 3 field) */}
                <Modal isOpen={isAutoEditOpen} onClose={onAutoEditClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Vendor Otomatis</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">No Telp</Text>
                                    <Input value={autoEditForm.nomor_telp}
                                        onChange={(e) => setAutoEditForm(prev => ({ ...prev, nomor_telp: e.target.value }))} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">No Rekening</Text>
                                    <Input value={autoEditForm.nomor_rekening}
                                        onChange={(e) => setAutoEditForm(prev => ({ ...prev, nomor_rekening: e.target.value }))} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">Keterangan</Text>
                                    <Input value={autoEditForm.keterangan}
                                        onChange={(e) => setAutoEditForm(prev => ({ ...prev, keterangan: e.target.value }))} />
                                </Box>
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Hanya No Telp, No Rekening, dan Keterangan yang bisa diedit untuk vendor otomatis.
                                    </Text>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAutoEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAutoEditSubmit} isLoading={autoEditMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Add Modal — Vendor Manual */}
                <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tambah Vendor Manual</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama Vendor <Text as="span" color="red.500">*</Text></Text>
                                    <Input name="nama_vendor" value={inputForm.nama_vendor} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Alamat Toko</Text>
                                    <Input name="alamat_toko" value={inputForm.alamat_toko} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>No Telp</Text>
                                    <Input name="nomor_telp" value={inputForm.nomor_telp} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>No Rekening</Text>
                                    <Input name="nomor_rekening" value={inputForm.nomor_rekening} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Link Toko</Text>
                                    <Input name="link_toko" value={inputForm.link_toko} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan</Text>
                                    <Input name="keterangan" value={inputForm.keterangan} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={1}>ID (opsional)</Text>
                                    <Text fontSize="xs" color="gray.500" mb={2}>Kosongkan untuk auto-generate</Text>
                                    <Input name="id" value={inputForm.id} onChange={handleInputChange} placeholder="Auto-generate jika kosong" />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleAddSubmit} isLoading={addMutation.isPending}>
                                Tambah
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal — Vendor Manual */}
                <Modal isOpen={isInputEditOpen} onClose={onInputEditClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Vendor Manual</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box>
                                    <Text fontWeight="medium" mb={2} fontSize="sm">ID (Read-only)</Text>
                                    <Input value={inputForm.id} isReadOnly bg={colorMode === "dark" ? "gray.700" : "gray.100"} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama Vendor</Text>
                                    <Input name="nama_vendor" value={inputForm.nama_vendor} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Alamat Toko</Text>
                                    <Input name="alamat_toko" value={inputForm.alamat_toko} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>No Telp</Text>
                                    <Input name="nomor_telp" value={inputForm.nomor_telp} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>No Rekening</Text>
                                    <Input name="nomor_rekening" value={inputForm.nomor_rekening} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Link Toko</Text>
                                    <Input name="link_toko" value={inputForm.link_toko} onChange={handleInputChange} />
                                </Box>
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan</Text>
                                    <Input name="keterangan" value={inputForm.keterangan} onChange={handleInputChange} />
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onInputEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleInputEditSubmit} isLoading={inputEditMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation */}
                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Vendor</AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus vendor{" "}
                                <strong>{selectedInputItem?.nama_vendor}</strong>?
                                Tindakan ini tidak bisa dibatalkan.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>Batal</Button>
                                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}
                                    isLoading={deleteMutation.isPending}>
                                    Hapus
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default MasterVendorPage;