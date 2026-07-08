/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getJenisMap, editJenisMap, deleteJenisMap } from "@/features/hr/gaMainDataApiService";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Textarea, useColorMode, useDisclosure, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiInbox, FiList, FiPlus, FiSearch, FiTrash2, FiMap, FiPackage,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const KOLOM_OPTIONS = [
    { value: "map_drawing", label: "Map Drawing" },
    { value: "map_foundation", label: "Map Foundation" },
    { value: "map_painting", label: "Map Painting" },
    { value: "foundation_merch", label: "Foundation Merch" },
    { value: "drawing_merch", label: "Drawing Merch" },
    { value: "painting_merch", label: "Painting Merch" },
    { value: "digital_merch", label: "Digital Merch" },
    { value: "portfolio_merch", label: "Portfolio Merch" },
    { value: "opening_fulltime_course_merch", label: "Opening Fulltime Course Merch" },
    { value: "closing_fulltime_course_merch", label: "Closing Fulltime Course Merch" },
    { value: "friendsip_merch", label: "Friendship Merch" },
    { value: "paket_a", label: "Paket A" },
    { value: "paket_b", label: "Paket B" },
    { value: "paket_c", label: "Paket C (Naik Level Drawing)" },
    { value: "paket_d", label: "Paket D (Naik Level Painting)" },
    { value: "paket_e", label: "Paket E (Onboarding Drawing)" },
    { value: "paket_f", label: "Paket F (Onboarding Painting)" },
    { value: "paket_g", label: "Paket G (Onboarding Foundation)" },
    { value: "paket_h", label: "Paket H (Sertifikat)" },
    { value: "paket_i", label: "Paket I (Naik Level Foundation)" },
];

const JenisMapPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isManageOpen, onOpen: onManageOpen, onClose: onManageClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKolom, setSelectedKolom] = useState(KOLOM_OPTIONS[0].value);
    const [newItemInput, setNewItemInput] = useState("");
    const [bulkInput, setBulkInput] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["jenisMap"],
        queryFn: getJenisMap,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const jenisPaket = useMemo(() => data?.jenis_paket || [], [data]);
    const detailPaket = useMemo(() => data?.detail_paket || {}, [data]);

    const editMutation = useMutation({
        mutationFn: editJenisMap,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jenisMap"] });
            toaster.create({ title: "Berhasil update kolom jenis map", type: "success", duration: 3000 });
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJenisMap,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jenisMap"] });
            toaster.create({ title: "Berhasil hapus item", type: "success", duration: 2000 });
        },
        onError: (error) => {
            toaster.create({ title: "Gagal hapus item", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => {
        const totalKolom = KOLOM_OPTIONS.length;
        const totalItems = Object.values(detailPaket).reduce((sum, arr) => sum + (arr?.length || 0), 0);
        return { totalKolom, totalItems, totalPaket: jenisPaket.length };
    }, [detailPaket, jenisPaket]);

    const currentItems = detailPaket[selectedKolom] || [];

    const filteredKolomItems = useMemo(() => {
        if (!searchQuery) return currentItems;
        const lower = searchQuery.toLowerCase();
        return currentItems.filter(item => String(item).toLowerCase().includes(lower));
    }, [currentItems, searchQuery]);

    const handleAddItem = () => {
        if (!newItemInput.trim()) {
            toaster.create({ title: "Masukkan nama item", type: "warning", duration: 2000 });
            return;
        }
        const newList = [...currentItems, newItemInput.trim()];
        editMutation.mutate({ kolom: selectedKolom, items: newList });
        setNewItemInput("");
    };

    const handleDeleteItem = (value) => {
        deleteMutation.mutate({ kolom: selectedKolom, value });
    };

    const handleOpenManage = () => {
        setBulkInput(currentItems.join("\n"));
        onManageOpen();
    };

    const handleBulkSave = () => {
        const newList = bulkInput.split("\n").map(l => l.trim()).filter(Boolean);
        editMutation.mutate({ kolom: selectedKolom, items: newList });
        onManageClose();
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Jenis Map</h1>
                    <Text className="subtitle">Kelola daftar item map dan paket per kategori</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiMap size={28} />
                        <p>Jumlah Kategori</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalKolom}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Total Item</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalItems}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Jenis Paket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalPaket}</p>}
                    </InfoCard>
                </Box>

                {isLoading ? (
                    <Skeleton height="400px" />
                ) : isError ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data jenis map</Text></Flex>
                ) : (
                    <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={4}>
                        {/* Kolom Selector */}
                        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={3} h="fit-content" maxH="600px" overflowY="auto">
                            <Text fontWeight="bold" fontSize="sm" mb={3} px={2}>Kategori Map/Paket</Text>
                            <Stack gap={1}>
                                {KOLOM_OPTIONS.map(opt => (
                                    <Flex
                                        key={opt.value}
                                        as="button"
                                        onClick={() => { setSelectedKolom(opt.value); setSearchQuery(""); }}
                                        p={2}
                                        borderRadius="md"
                                        align="center"
                                        justify="space-between"
                                        bg={selectedKolom === opt.value ? "teal.500" : "transparent"}
                                        color={selectedKolom === opt.value ? "white" : "inherit"}
                                        _hover={{ bg: selectedKolom === opt.value ? "teal.500" : colorMode === "dark" ? "gray.700" : "gray.100" }}
                                        textAlign="left"
                                        fontSize="sm"
                                    >
                                        <Text noOfLines={1}>{opt.label}</Text>
                                        <Badge colorScheme={selectedKolom === opt.value ? "whiteAlpha" : "gray"} fontSize="xs">
                                            {detailPaket[opt.value]?.length || 0}
                                        </Badge>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>

                        {/* Items Panel */}
                        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                            <Flex p={4} borderBottom="1px solid" borderColor={borderCol} justify="space-between" align="center" wrap="wrap" gap={3}>
                                <Box>
                                    <Text fontWeight="bold">{KOLOM_OPTIONS.find(o => o.value === selectedKolom)?.label}</Text>
                                    <Text fontSize="xs" color="gray.500">{currentItems.length} item</Text>
                                </Box>
                                <Button size="sm" variant="outline" colorScheme="teal" onClick={handleOpenManage}>
                                    Kelola Massal
                                </Button>
                            </Flex>

                            <Flex p={4} gap={2} borderBottom="1px solid" borderColor={borderCol}>
                                <Input
                                    placeholder="Tambah item baru..."
                                    value={newItemInput}
                                    onChange={(e) => setNewItemInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                                    size="sm"
                                />
                                <Button size="sm" colorScheme="teal" onClick={handleAddItem} isLoading={editMutation.isPending}>
                                    <FiPlus />
                                </Button>
                            </Flex>

                            <Box p={4} pb={0}>
                                <Box position="relative">
                                    <Input
                                        placeholder="Cari item..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        size="sm"
                                        pl="36px"
                                    />
                                    <Box position="absolute" left="10px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                        <FiSearch size={14} />
                                    </Box>
                                </Box>
                            </Box>

                            <Box p={4} maxH="400px" overflowY="auto">
                                {filteredKolomItems.length === 0 ? (
                                    <Flex direction="column" align="center" py={8} gap={2} color="gray.500">
                                        <FiInbox size={32} />
                                        <Text fontSize="sm">{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada item"}</Text>
                                    </Flex>
                                ) : (
                                    <Stack gap={1}>
                                        {filteredKolomItems.map((item, i) => (
                                            <Flex
                                                key={i}
                                                align="center"
                                                justify="space-between"
                                                p={2}
                                                borderRadius="md"
                                                _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.50" }}
                                            >
                                                <Text fontSize="sm">{item}</Text>
                                                <IconButton
                                                    size="xs"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => handleDeleteItem(item)}
                                                    isLoading={deleteMutation.isPending}
                                                >
                                                    <FiTrash2 size={14} />
                                                </IconButton>
                                            </Flex>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                )}

                {/* Bulk Manage Modal */}
                <Modal isOpen={isManageOpen} onClose={onManageClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Kelola Massal — {KOLOM_OPTIONS.find(o => o.value === selectedKolom)?.label}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                                Satu item per baris. Ini akan mengganti seluruh isi kategori.
                            </Text>
                            <Textarea
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                rows={12}
                                fontFamily="mono"
                                fontSize="sm"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                {bulkInput.split("\n").filter(l => l.trim()).length} item
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onManageClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleBulkSave} isLoading={editMutation.isPending}>
                                Simpan Semua
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default JenisMapPage;