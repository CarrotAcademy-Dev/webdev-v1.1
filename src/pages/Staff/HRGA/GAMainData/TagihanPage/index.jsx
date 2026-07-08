import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getTagihan, editTagihan, deleteTagihan } from "@/features/hr/gaMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2,
    FiInbox, FiList, FiSearch, FiTrash2, FiDollarSign,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const BULAN_KEYS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const BULAN_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const EMPTY_FORM = {
    row: "", no: "", tgl_periode: "", description: "", master: "",
    january: "", february: "", march: "", april: "", may: "", june: "",
    july: "", august: "", september: "", october: "", november: "", december: "",
    data_source: "", payment_app: "", payment_method: "", expense_date: "", notes: "",
};

const parseNum = (val) => {
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? 0 : num;
};

const formatRupiah = (val) => {
    const num = parseNum(val);
    if (num === 0) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
};

const TagihanPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const { data: tagihanData = [], isLoading, isError } = useQuery({
        queryKey: ["tagihan"],
        queryFn: getTagihan,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editTagihan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tagihan"] });
            toaster.create({ title: "Berhasil update tagihan", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTagihan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tagihan"] });
            toaster.create({ title: "Berhasil hapus tagihan", type: "success", duration: 3000 });
            onDeleteClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const total = tagihanData.length;
        const totalJumlah = tagihanData.reduce((sum, i) => sum + parseNum(i.jumlah), 0);
        const uniqueMaster = new Set(tagihanData.map(i => i.master).filter(Boolean)).size;
        return { total, totalJumlah, uniqueMaster };
    }, [tagihanData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return tagihanData;
        const lower = searchQuery.toLowerCase();
        return tagihanData.filter(i =>
            (i.description && String(i.description).toLowerCase().includes(lower)) ||
            (i.master && String(i.master).toLowerCase().includes(lower)) ||
            (i.notes && String(i.notes).toLowerCase().includes(lower))
        );
    }, [tagihanData, searchQuery]);

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
        setSelectedItem(item);
        setFormData({
            row: String(item.row || ""),
            no: item.no || "",
            tgl_periode: item.tgl_periode || "",
            description: item.description || "",
            master: item.master || "",
            ...BULAN_KEYS.reduce((acc, k) => ({ ...acc, [k]: item[k] || "" }), {}),
            data_source: item.data_source || "",
            payment_app: item.payment_app || "",
            payment_method: item.payment_method || "",
            expense_date: item.expense_date || "",
            notes: item.notes || "",
        });
        onEditOpen();
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        onDeleteOpen();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = () => {
        if (!formData.row) {
            toaster.create({ title: "Row tidak ditemukan", type: "warning", duration: 2000 });
            return;
        }
        const { row, ...rest } = formData;
        editMutation.mutate({ row, ...rest });
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedItem.row);
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

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Tagihan (Budgeting)</h1>
                    <Text className="subtitle">Kelola data tagihan dan budgeting kantor per bulan</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Item</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Total Jumlah</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ fontSize: "14px" }}>{formatRupiah(stats.totalJumlah)}</p>
                        )}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Jumlah Master</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueMaster}</p>}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari description, master, notes..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data tagihan</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data tagihan"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ minWidth: "2400px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="tgl_periode" label="Tgl Periode" minWidth="120px" />
                                        <SortableHeader column="description" label="Description" minWidth="180px" />
                                        <SortableHeader column="master" label="Master" minWidth="140px" />
                                        {BULAN_LABELS.map(b => (
                                            <th key={b} style={{ minWidth: "100px", textAlign: "right" }}>{b}</th>
                                        ))}
                                        <th style={{ minWidth: "130px", textAlign: "right" }}>Jumlah</th>
                                        <th style={{ minWidth: "120px" }}>Data Source</th>
                                        <th style={{ minWidth: "130px" }}>Payment App</th>
                                        <th style={{ minWidth: "130px" }}>Payment Method</th>
                                        <th style={{ minWidth: "130px" }}>Expense Date</th>
                                        <th style={{ minWidth: "160px" }}>Notes</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.tgl_periode || "-")}</td>
                                            <td>{item.description || "-"}</td>
                                            <td>{item.master || "-"}</td>
                                            {BULAN_KEYS.map(k => (
                                                <td key={k} style={{ textAlign: "right" }}>{formatRupiah(item[k])}</td>
                                            ))}
                                            <td style={{ textAlign: "right", fontWeight: 700 }}>{formatRupiah(item.jumlah)}</td>
                                            <td>{item.data_source || "-"}</td>
                                            <td>{item.payment_app || "-"}</td>
                                            <td>{item.payment_method || "-"}</td>
                                            <td>{String(item.expense_date || "-")}</td>
                                            <td>
                                                {item.notes?.length > 25 ? (
                                                    <Tooltip label={item.notes}><span>{item.notes.substring(0, 25)}...</span></Tooltip>
                                                ) : item.notes || "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                        onClick={() => handleOpenEdit(item)}>
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
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Tagihan — {formData.description}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={5}>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Info Umum</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">No</Text>
                                            <Input name="no" value={formData.no} onChange={handleInputChange} size="sm" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Tanggal Periode</Text>
                                            <Input name="tgl_periode" value={formData.tgl_periode} onChange={handleInputChange} size="sm" type="date" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Description</Text>
                                            <Input name="description" value={formData.description} onChange={handleInputChange} size="sm" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Master</Text>
                                            <Input name="master" value={formData.master} onChange={handleInputChange} size="sm" />
                                        </Box>
                                    </Grid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        Biaya Per Bulan
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3}>
                                        {BULAN_KEYS.map((key, i) => (
                                            <Box key={key}>
                                                <Text fontWeight="medium" mb={2} fontSize="sm">{BULAN_LABELS[i]}</Text>
                                                <Input name={key} value={formData[key]} onChange={handleInputChange} size="sm" placeholder="0" />
                                            </Box>
                                        ))}
                                    </Grid>
                                    <Box mt={3} p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                        border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                        <Text fontSize="xs" color={colorMode === "dark" ? "gray.300" : "blue.700"}>
                                            ℹ️ Kolom "Jumlah" otomatis dihitung dari formula, tidak bisa diedit manual.
                                        </Text>
                                    </Box>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Detail Pembayaran</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Data Source</Text>
                                            <Input name="data_source" value={formData.data_source} onChange={handleInputChange} size="sm" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Payment App</Text>
                                            <Input name="payment_app" value={formData.payment_app} onChange={handleInputChange} size="sm" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Payment Method</Text>
                                            <Input name="payment_method" value={formData.payment_method} onChange={handleInputChange} size="sm" />
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Expense Date</Text>
                                            <Input name="expense_date" value={formData.expense_date} onChange={handleInputChange} size="sm" type="date" />
                                        </Box>
                                    </Grid>
                                    <Box mt={3}>
                                        <Text fontWeight="medium" mb={2} fontSize="sm">Notes</Text>
                                        <Textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} size="sm" />
                                    </Box>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation */}
                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Hapus Tagihan</AlertDialogHeader>
                            <AlertDialogBody>
                                Yakin ingin menghapus tagihan{" "}
                                <strong>{selectedItem?.description}</strong>?
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

export default TagihanPage;