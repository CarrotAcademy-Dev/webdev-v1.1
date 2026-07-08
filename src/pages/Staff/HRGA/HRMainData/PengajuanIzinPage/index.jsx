import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import {
    getPengajuanIzin, editPengajuanIzin,
    getDbPengajuanIzin, editDbPengajuanIzin, tambahDbPengajuanIzin, deleteDbPengajuanIzin,
} from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Checkbox, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, Tooltip, useColorMode, useDisclosure,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiInbox, FiList,
    FiPlus, FiSearch, FiTrash2, FiCheckCircle, FiClock,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE";

const EMPTY_DB_FORM = {
    timestamp: "", nama_lengkap_staff: "", tipe_izin: "", detail_alasan_izin: "",
    tanggal_mulai_izin: "", jam_mulai_izin: "", tanggal_selesai_izin: "", jam_selesai_izin: "",
    bukti_izin_cuti: "", status_bukti_pendukung: "", approval_leny_c: false,
};

const PengajuanIzinPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();

    // Tab 1 — Pengajuan Izin
    const { isOpen: isIzinEditOpen, onOpen: onIzinEditOpen, onClose: onIzinEditClose } = useDisclosure();
    const [izinEditForm, setIzinEditForm] = useState({
        timestamp: "", nama_lengkap_staff: "", approval_hrga: false, sp_dan_surat_peringatan: false,
    });
    const [izinSearch, setIzinSearch] = useState("");
    const [izinSort, setIzinSort] = useState({ key: null, direction: "asc" });

    // Tab 2 — DB Pengajuan Izin
    const { isOpen: isDbAddOpen, onOpen: onDbAddOpen, onClose: onDbAddClose } = useDisclosure();
    const { isOpen: isDbEditOpen, onOpen: onDbEditOpen, onClose: onDbEditClose } = useDisclosure();
    const { isOpen: isDbDeleteOpen, onOpen: onDbDeleteOpen, onClose: onDbDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const [dbForm, setDbForm] = useState(EMPTY_DB_FORM);
    const [selectedDb, setSelectedDb] = useState(null);
    const [dbSearch, setDbSearch] = useState("");
    const [dbSort, setDbSort] = useState({ key: null, direction: "asc" });

    // Queries
    const { data: izinData = [], isLoading: isIzinLoading, isError: isIzinError } = useQuery({
        queryKey: ["pengajuanIzin"],
        queryFn: getPengajuanIzin,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: dbIzinData = [], isLoading: isDbLoading, isError: isDbError } = useQuery({
        queryKey: ["dbPengajuanIzin"],
        queryFn: getDbPengajuanIzin,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Mutations Tab 1
    const izinEditMutation = useMutation({
        mutationFn: editPengajuanIzin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pengajuanIzin"] });
            toaster.create({ title: "Berhasil update approval", type: "success", duration: 3000 });
            onIzinEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Mutations Tab 2
    const dbAddMutation = useMutation({
        mutationFn: tambahDbPengajuanIzin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dbPengajuanIzin"] });
            toaster.create({ title: "Berhasil tambah data", type: "success", duration: 3000 });
            setDbForm(EMPTY_DB_FORM);
            onDbAddClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal tambah data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const dbEditMutation = useMutation({
        mutationFn: editDbPengajuanIzin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dbPengajuanIzin"] });
            toaster.create({ title: "Berhasil update data", type: "success", duration: 3000 });
            onDbEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const dbDeleteMutation = useMutation({
        mutationFn: deleteDbPengajuanIzin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dbPengajuanIzin"] });
            toaster.create({ title: "Berhasil hapus data", type: "success", duration: 3000 });
            onDbDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        totalIzin: izinData.length,
        totalDb: dbIzinData.length,
        approved: izinData.filter(i => isTruthy(i.approval_hrga)).length,
    }), [izinData, dbIzinData]);

    // Filter + Sort Tab 1
    const filteredIzin = useMemo(() => {
        let data = izinData;
        if (izinSearch) {
            const lower = izinSearch.toLowerCase();
            data = data.filter(i =>
                (i.nama_lengkap_staff && String(i.nama_lengkap_staff).toLowerCase().includes(lower)) ||
                (i.tipe_izin && String(i.tipe_izin).toLowerCase().includes(lower))
            );
        }
        if (izinSort.key) {
            data = [...data].sort((a, b) => {
                const aVal = String(a[izinSort.key] || "").toLowerCase();
                const bVal = String(b[izinSort.key] || "").toLowerCase();
                if (aVal < bVal) return izinSort.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return izinSort.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [izinData, izinSearch, izinSort]);

    // Filter + Sort Tab 2
    const filteredDb = useMemo(() => {
        let data = dbIzinData;
        if (dbSearch) {
            const lower = dbSearch.toLowerCase();
            data = data.filter(i =>
                (i.nama_lengkap_staff && String(i.nama_lengkap_staff).toLowerCase().includes(lower)) ||
                (i.tipe_izin && String(i.tipe_izin).toLowerCase().includes(lower))
            );
        }
        if (dbSort.key) {
            data = [...data].sort((a, b) => {
                const aVal = String(a[dbSort.key] || "").toLowerCase();
                const bVal = String(b[dbSort.key] || "").toLowerCase();
                if (aVal < bVal) return dbSort.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return dbSort.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [dbIzinData, dbSearch, dbSort]);

    const izinPagination = usePagination(filteredIzin, 20);
    const dbPagination = usePagination(filteredDb, 20);

    const handleOpenIzinEdit = (item) => {
        setIzinEditForm({
            timestamp: item.timestamp || "",
            nama_lengkap_staff: item.nama_lengkap_staff || "",
            approval_hrga: isTruthy(item.approval_hrga),
            sp_dan_surat_peringatan: isTruthy(item.sp_dan_surat_peringatan),
        });
        onIzinEditOpen();
    };

    const handleIzinEditSubmit = () => {
        izinEditMutation.mutate({
            timestamp: izinEditForm.timestamp,
            nama_lengkap_staff: izinEditForm.nama_lengkap_staff,
            approval_hrga: izinEditForm.approval_hrga ? "TRUE" : "FALSE",
            sp_dan_surat_peringatan: izinEditForm.sp_dan_surat_peringatan ? "TRUE" : "FALSE",
        });
    };

    const handleOpenDbEdit = (item) => {
        setDbForm({
            timestamp: item.timestamp || "",
            nama_lengkap_staff: item.nama_lengkap_staff || "",
            tipe_izin: item.tipe_izin || "",
            detail_alasan_izin: item.detail_alasan_izin || "",
            tanggal_mulai_izin: item.tanggal_mulai_izin || "",
            jam_mulai_izin: item.jam_mulai_izin || "",
            tanggal_selesai_izin: item.tanggal_selesai_izin || "",
            jam_selesai_izin: item.jam_selesai_izin || "",
            bukti_izin_cuti: item.bukti_izin_cuti || "",
            status_bukti_pendukung: item.status_bukti_pendukung || "",
            approval_leny_c: isTruthy(item.approval_leny_c),
        });
        onDbEditOpen();
    };

    const handleOpenDbDelete = (item) => { setSelectedDb(item); onDbDeleteOpen(); };

    const handleDbAddSubmit = () => {
        if (!dbForm.timestamp?.trim() || !dbForm.nama_lengkap_staff?.trim()) {
            toaster.create({ title: "Timestamp dan Nama wajib diisi", type: "warning", duration: 2000 });
            return;
        }
        dbAddMutation.mutate({ ...dbForm, approval_leny_c: dbForm.approval_leny_c ? "TRUE" : "FALSE" });
    };

    const handleDbEditSubmit = () => {
        dbEditMutation.mutate({ ...dbForm, approval_leny_c: dbForm.approval_leny_c ? "TRUE" : "FALSE" });
    };

    const SortHeader = (sort, setSort) => ({ column, label, minWidth }) => (
        <th onClick={() => setSort(prev => ({ key: column, direction: prev.key === column && prev.direction === "asc" ? "desc" : "asc" }))}
            style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sort.key === column && (sort.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const IzinSortHeader = SortHeader(izinSort, setIzinSort);
    const DbSortHeader = SortHeader(dbSort, setDbSort);

    const DbFormFields = () => (
        <Stack gap={4}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                {[
                    { label: "Timestamp *", name: "timestamp", type: "date" },
                    { label: "Nama Lengkap Staff *", name: "nama_lengkap_staff" },
                    { label: "Tipe Izin", name: "tipe_izin" },
                    { label: "Detail Alasan Izin", name: "detail_alasan_izin" },
                    { label: "Tanggal Mulai Izin", name: "tanggal_mulai_izin", type: "date" },
                    { label: "Jam Mulai", name: "jam_mulai_izin", type: "time" },
                    { label: "Tanggal Selesai", name: "tanggal_selesai_izin", type: "date" },
                    { label: "Jam Selesai", name: "jam_selesai_izin", type: "time" },
                    { label: "Bukti Izin/Cuti", name: "bukti_izin_cuti" },
                    { label: "Status Bukti Pendukung", name: "status_bukti_pendukung" },
                ].map(({ label, name, type = "text" }) => (
                    <Box key={name}>
                        <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
                        <Input name={name} value={dbForm[name] || ""} type={type} size="sm"
                            onChange={(e) => setDbForm(prev => ({ ...prev, [name]: e.target.value }))} />
                    </Box>
                ))}
            </Grid>
            <Flex align="center" gap={2} p={3} borderRadius="md" border="1px solid"
                borderColor={dbForm.approval_leny_c ? "teal.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                bg={dbForm.approval_leny_c ? (colorMode === "dark" ? "teal.900" : "teal.50") : "transparent"}
                cursor="pointer" onClick={() => setDbForm(prev => ({ ...prev, approval_leny_c: !prev.approval_leny_c }))}>
                <Checkbox isChecked={dbForm.approval_leny_c} colorScheme="teal"
                    onChange={() => setDbForm(prev => ({ ...prev, approval_leny_c: !prev.approval_leny_c }))}
                    onClick={(e) => e.stopPropagation()} />
                <Text fontSize="sm">Approval Leny C</Text>
            </Flex>
        </Stack>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Pengajuan Izin</h1>
                    <Text className="subtitle">Kelola pengajuan izin karyawan dan database izin</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard><FiList size={28} /><p>Pengajuan Izin</p>
                        {isIzinLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalIzin}</p>}
                    </InfoCard>
                    <InfoCard><FiCheckCircle size={28} /><p>HRGA Approved</p>
                        {isIzinLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.approved}</p>}
                    </InfoCard>
                    <InfoCard><FiClock size={28} /><p>DB Izin</p>
                        {isDbLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalDb}</p>}
                    </InfoCard>
                </Box>

                <Tabs colorScheme="teal">
                    <TabList mb={4}>
                        <Tab fontWeight="600">Pengajuan Izin ({stats.totalIzin})</Tab>
                        <Tab fontWeight="600">DB Pengajuan Izin ({stats.totalDb})</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Tab 1 — Pengajuan Izin */}
                        <TabPanel px={0}>
                            <Flex className="search-container" mb={4}>
                                <Box position="relative" width="100%" maxWidth="360px">
                                    <Input placeholder="Cari nama, tipe izin..."
                                        value={izinSearch} onChange={(e) => setIzinSearch(e.target.value)} pl="40px" />
                                    <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                                </Box>
                            </Flex>

                            <Box className="table-wrapper">
                                {isIzinLoading ? (
                                    <Box p={4}><Skeleton count={8} height={40} style={{ marginBottom: "8px" }} /></Box>
                                ) : isIzinError ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                                ) : filteredIzin.length === 0 ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>Belum ada data pengajuan izin</Text></Flex>
                                ) : (
                                    <>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "50px" }}>No</th>
                                                    <th style={{ minWidth: "120px" }}>Timestamp</th>
                                                    <IzinSortHeader column="nama_lengkap_staff" label="Nama Staff" minWidth="160px" />
                                                    <IzinSortHeader column="tipe_izin" label="Tipe Izin" minWidth="140px" />
                                                    <th style={{ minWidth: "200px" }}>Detail Alasan</th>
                                                    <th style={{ minWidth: "120px" }}>Mulai</th>
                                                    <th style={{ minWidth: "100px" }}>Jam Mulai</th>
                                                    <th style={{ minWidth: "120px" }}>Selesai</th>
                                                    <th style={{ minWidth: "100px" }}>Jam Selesai</th>
                                                    <th style={{ minWidth: "100px", textAlign: "center" }}>Bukti</th>
                                                    <th style={{ minWidth: "110px", textAlign: "center" }}>Approval HRGA</th>
                                                    <th style={{ minWidth: "80px", textAlign: "center" }}>SP</th>
                                                    <th style={{ width: "80px", position: "sticky", right: 0 }}>Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {izinPagination.currentItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{izinPagination.startIndex + index + 1}</td>
                                                        <td>{item.timestamp || "-"}</td>
                                                        <td>{item.nama_lengkap_staff || "-"}</td>
                                                        <td>{item.tipe_izin || "-"}</td>
                                                        <td>
                                                            {item.detail_alasan_izin?.length > 30 ? (
                                                                <Tooltip label={item.detail_alasan_izin}>
                                                                    <span>{item.detail_alasan_izin.substring(0, 30)}...</span>
                                                                </Tooltip>
                                                            ) : item.detail_alasan_izin || "-"}
                                                        </td>
                                                        <td>{item.tanggal_mulai_izin || "-"}</td>
                                                        <td>{item.jam_mulai_izin || "-"}</td>
                                                        <td>{item.tanggal_selesai_izin || "-"}</td>
                                                        <td>{item.jam_selesai_izin || "-"}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {item.bukti_izin_surat_sakit ? "✅" : "❌"}
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {isTruthy(item.approval_hrga) ? "✅" : "❌"}
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {isTruthy(item.sp_dan_surat_peringatan) ? "⚠️" : "-"}
                                                        </td>
                                                        <td style={{ position: "sticky", right: 0 }}>
                                                            <IconButton size="sm" backgroundColor="teal.400" variant="ghost" onClick={() => handleOpenIzinEdit(item)}>
                                                                <FiEdit2 />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {izinPagination.totalPages > 1 && (
                                            <Flex justify="center" mt={4}>
                                                <Pagination currentPage={izinPagination.currentPage} totalPages={izinPagination.totalPages}
                                                    onPageChange={izinPagination.goToPage} startIndex={izinPagination.startIndex}
                                                    endIndex={izinPagination.endIndex} totalItems={izinPagination.totalItems} />
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Box>
                        </TabPanel>

                        {/* Tab 2 — DB Pengajuan Izin */}
                        <TabPanel px={0}>
                            <Flex className="search-container" mb={4} justify="space-between" align="center" gap={3}>
                                <Box position="relative" width="100%" maxWidth="360px">
                                    <Input placeholder="Cari nama, tipe izin..."
                                        value={dbSearch} onChange={(e) => setDbSearch(e.target.value)} pl="40px" />
                                    <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none"><FiSearch size={18} /></Box>
                                </Box>
                                <Button colorScheme="teal" onClick={() => { setDbForm(EMPTY_DB_FORM); onDbAddOpen(); }}>
                                    <FiPlus style={{ marginRight: "6px" }} /> Tambah
                                </Button>
                            </Flex>

                            <Box className="table-wrapper">
                                {isDbLoading ? (
                                    <Box p={4}><Skeleton count={8} height={40} style={{ marginBottom: "8px" }} /></Box>
                                ) : isDbError ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                                ) : filteredDb.length === 0 ? (
                                    <Flex className="empty-state"><FiInbox size={48} /><Text>{dbSearch ? "Tidak ada hasil" : "Belum ada data"}</Text></Flex>
                                ) : (
                                    <>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "50px" }}>No</th>
                                                    <th style={{ minWidth: "120px" }}>Timestamp</th>
                                                    <DbSortHeader column="nama_lengkap_staff" label="Nama Staff" minWidth="160px" />
                                                    <DbSortHeader column="tipe_izin" label="Tipe Izin" minWidth="140px" />
                                                    <th style={{ minWidth: "180px" }}>Detail Alasan</th>
                                                    <th style={{ minWidth: "120px" }}>Mulai</th>
                                                    <th style={{ minWidth: "100px" }}>Jam Mulai</th>
                                                    <th style={{ minWidth: "120px" }}>Selesai</th>
                                                    <th style={{ minWidth: "100px" }}>Jam Selesai</th>
                                                    <th style={{ minWidth: "120px" }}>Bukti</th>
                                                    <th style={{ minWidth: "130px" }}>Status Bukti</th>
                                                    <th style={{ minWidth: "100px", textAlign: "center" }}>Approval Leny</th>
                                                    <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dbPagination.currentItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{dbPagination.startIndex + index + 1}</td>
                                                        <td>{item.timestamp || "-"}</td>
                                                        <td>{item.nama_lengkap_staff || "-"}</td>
                                                        <td>{item.tipe_izin || "-"}</td>
                                                        <td>
                                                            {item.detail_alasan_izin?.length > 25 ? (
                                                                <Tooltip label={item.detail_alasan_izin}>
                                                                    <span>{item.detail_alasan_izin.substring(0, 25)}...</span>
                                                                </Tooltip>
                                                            ) : item.detail_alasan_izin || "-"}
                                                        </td>
                                                        <td>{item.tanggal_mulai_izin || "-"}</td>
                                                        <td>{item.jam_mulai_izin || "-"}</td>
                                                        <td>{item.tanggal_selesai_izin || "-"}</td>
                                                        <td>{item.jam_selesai_izin || "-"}</td>
                                                        <td>{item.bukti_izin_cuti || "-"}</td>
                                                        <td>{item.status_bukti_pendukung || "-"}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {isTruthy(item.approval_leny_c) ? "✅" : "❌"}
                                                        </td>
                                                        <td style={{ position: "sticky", right: 0 }}>
                                                            <Flex gap={1}>
                                                                <IconButton size="sm" backgroundColor="teal.400" variant="ghost" onClick={() => handleOpenDbEdit(item)}>
                                                                    <FiEdit2 />
                                                                </IconButton>
                                                                <IconButton size="sm" colorScheme="red" variant="ghost" onClick={() => handleOpenDbDelete(item)}>
                                                                    <FiTrash2 />
                                                                </IconButton>
                                                            </Flex>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {dbPagination.totalPages > 1 && (
                                            <Flex justify="center" mt={4}>
                                                <Pagination currentPage={dbPagination.currentPage} totalPages={dbPagination.totalPages}
                                                    onPageChange={dbPagination.goToPage} startIndex={dbPagination.startIndex}
                                                    endIndex={dbPagination.endIndex} totalItems={dbPagination.totalItems} />
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {/* Edit Modal — Pengajuan Izin (hanya approval_hrga & sp) */}
                <Modal isOpen={isIzinEditOpen} onClose={onIzinEditClose} size="md">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit Approval — {izinEditForm.nama_lengkap_staff}</ModalHeader><ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                        ℹ️ Hanya Approval HRGA dan SP/Surat Peringatan yang bisa diedit.
                                    </Text>
                                </Box>
                                {[
                                    { key: "approval_hrga", label: "Approval HRGA" },
                                    { key: "sp_dan_surat_peringatan", label: "SP / Surat Peringatan" },
                                ].map(({ key, label }) => (
                                    <Flex key={key} align="center" gap={2} p={3} borderRadius="md" border="1px solid"
                                        borderColor={izinEditForm[key] ? "teal.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                                        bg={izinEditForm[key] ? (colorMode === "dark" ? "teal.900" : "teal.50") : "transparent"}
                                        cursor="pointer" onClick={() => setIzinEditForm(prev => ({ ...prev, [key]: !prev[key] }))}>
                                        <Checkbox isChecked={izinEditForm[key]} colorScheme="teal"
                                            onChange={() => setIzinEditForm(prev => ({ ...prev, [key]: !prev[key] }))}
                                            onClick={(e) => e.stopPropagation()} />
                                        <Text fontSize="sm" fontWeight="medium">{label}</Text>
                                    </Flex>
                                ))}
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onIzinEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleIzinEditSubmit} isLoading={izinEditMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Add Modal — DB Pengajuan Izin */}
                <Modal isOpen={isDbAddOpen} onClose={onDbAddClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Tambah DB Pengajuan Izin</ModalHeader><ModalCloseButton />
                        <ModalBody><DbFormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onDbAddClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleDbAddSubmit} isLoading={dbAddMutation.isPending}>Tambah</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Modal — DB Pengajuan Izin */}
                <Modal isOpen={isDbEditOpen} onClose={onDbEditClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay /><ModalContent>
                        <ModalHeader>Edit DB Pengajuan Izin — {dbForm.nama_lengkap_staff}</ModalHeader><ModalCloseButton />
                        <ModalBody><DbFormFields /></ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onDbEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleDbEditSubmit} isLoading={dbEditMutation.isPending}>Simpan</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete AlertDialog — DB Pengajuan Izin */}
                <AlertDialog isOpen={isDbDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDbDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus DB Pengajuan Izin</AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin hapus data izin <strong>{selectedDb?.nama_lengkap_staff}</strong> ({selectedDb?.timestamp})?
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDbDeleteClose}>Batal</Button>
                                <Button colorScheme="red" ml={3} isLoading={dbDeleteMutation.isPending}
                                    onClick={() => dbDeleteMutation.mutate({ timestamp: selectedDb?.timestamp, nama_lengkap_staff: selectedDb?.nama_lengkap_staff })}>
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

export default PengajuanIzinPage;