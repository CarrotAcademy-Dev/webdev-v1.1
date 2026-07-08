import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { searchProbationTraining, saveProbationTraining, clearProbationTraining } from "@/features/hr/hrMainDataApiService";
import {
    Box, Button, Checkbox, Flex, Input, Stack, Text, useColorMode, Badge,
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    useDisclosure,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
    FiSearch, FiSave, FiTrash2, FiInbox, FiCheckCircle, FiUser,
} from "react-icons/fi";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const ProbationTrainingPage = () => {
    const { colorMode } = useColorMode();
    const { isOpen: isClearOpen, onOpen: onClearOpen, onClose: onClearClose } = useDisclosure();
    const cancelRef = useRef();

    const [namaInput, setNamaInput] = useState("");
    const [trainingData, setTrainingData] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});

    const searchMutation = useMutation({
        mutationFn: searchProbationTraining,
        onSuccess: (result) => {
            setTrainingData(result);
            // Init checkbox dari done status
            const initChecked = {};
            (result.training || []).forEach(t => {
                initChecked[t.no] = t.done === true;
            });
            setCheckedItems(initChecked);
        },
        onError: (error) => {
            toaster.create({ title: "Karyawan tidak ditemukan", description: error?.message, type: "error", duration: 3000 });
            setTrainingData(null);
        },
    });

    const saveMutation = useMutation({
        mutationFn: saveProbationTraining,
        onSuccess: (result) => {
            toaster.create({
                title: `Berhasil simpan training (${result?.total_saved || 0} ditambah, ${result?.total_deleted || 0} dihapus)`,
                type: "success",
                duration: 4000,
            });
            // Re-fetch untuk refresh status
            searchMutation.mutate(trainingData.nama);
        },
        onError: (error) => {
            toaster.create({ title: "Gagal simpan training", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const clearMutation = useMutation({
        mutationFn: clearProbationTraining,
        onSuccess: (result) => {
            toaster.create({ title: `Berhasil bersihkan data (${result?.total_data || 0} baris)`, type: "success", duration: 3000 });
            onClearClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal bersihkan data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const handleSearch = () => {
        if (!namaInput.trim()) {
            toaster.create({ title: "Masukkan nama karyawan", type: "warning", duration: 2000 });
            return;
        }
        searchMutation.mutate(namaInput.trim());
    };

    const handleToggle = (no) => {
        setCheckedItems(prev => ({ ...prev, [no]: !prev[no] }));
    };

    const handleSave = () => {
        if (!trainingData) return;
        // Kirim hanya item yang diceklis
        const doneTugas = (trainingData.training || []).filter(t => checkedItems[t.no]);
        saveMutation.mutate({ nama: trainingData.nama, data: doneTugas });
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    const doneCount = Object.values(checkedItems).filter(Boolean).length;
    const totalCount = trainingData?.training?.length || 0;

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Probation Training</h1>
                    <Text className="subtitle">Kelola checklist training karyawan dalam masa probation</Text>
                </Box>

                {/* Search */}
                <Flex gap={3} mb={6} maxW="500px">
                    <Box position="relative" flex={1}>
                        <Input
                            placeholder="Cari nama karyawan..."
                            value={namaInput}
                            onChange={(e) => setNamaInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={handleSearch} isLoading={searchMutation.isPending} minW="90px">Cari</Button>
                    <Button colorScheme="red" variant="outline" onClick={onClearOpen} title="Bersihkan baris kosong">
                        <FiTrash2 />
                    </Button>
                </Flex>

                {/* Loading */}
                {searchMutation.isPending && (
                    <Box><Skeleton height="200px" borderRadius="12px" /></Box>
                )}

                {/* Empty state */}
                {!trainingData && !searchMutation.isPending && (
                    <Flex className="empty-state">
                        <FiUser size={48} />
                        <Text>Cari nama karyawan untuk melihat daftar training probation</Text>
                    </Flex>
                )}

                {/* Error state */}
                {searchMutation.isError && !searchMutation.isPending && (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>Karyawan tidak ditemukan atau posisi kosong</Text>
                    </Flex>
                )}

                {/* Training Content */}
                {trainingData && !searchMutation.isPending && (
                    <>
                        {/* Info Karyawan + Progress */}
                        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={5} mb={5}>
                            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
                                <Box>
                                    <Text fontWeight="bold" fontSize="lg">{trainingData.nama}</Text>
                                    <Text fontSize="sm" color="gray.500">Posisi: {trainingData.position}</Text>
                                    <Text fontSize="xs" color="gray.400" mt={1}>Sheet: {trainingData.sheet_training}</Text>
                                </Box>
                                <Box textAlign="right">
                                    <Text fontSize="2xl" fontWeight="bold" color={doneCount === totalCount ? "green.400" : "teal.400"}>
                                        {doneCount}/{totalCount}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">Training Selesai</Text>
                                    {/* Progress bar */}
                                    <Box mt={2} w="120px" h="6px" bg={colorMode === "dark" ? "gray.600" : "gray.200"} borderRadius="full" overflow="hidden">
                                        <Box
                                            h="100%" bg={doneCount === totalCount ? "green.400" : "teal.400"} borderRadius="full"
                                            width={`${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`}
                                            transition="width 0.3s"
                                        />
                                    </Box>
                                </Box>
                            </Flex>
                        </Box>

                        {/* Checklist per kategori */}
                        {trainingData.training && trainingData.training.length > 0 ? (() => {
                            const grouped = trainingData.training.reduce((acc, t) => {
                                const kat = t.kategori || "Umum";
                                if (!acc[kat]) acc[kat] = [];
                                acc[kat].push(t);
                                return acc;
                            }, {});

                            return (
                                <Stack gap={4}>
                                    {Object.entries(grouped).map(([kategori, items]) => (
                                        <Box key={kategori} bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                                            <Flex p={4} borderBottom="1px solid" borderColor={borderCol} align="center" justify="space-between">
                                                <Text fontWeight="bold">{kategori}</Text>
                                                <Badge colorScheme="teal">
                                                    {items.filter(i => checkedItems[i.no]).length}/{items.length}
                                                </Badge>
                                            </Flex>
                                            <Stack gap={0}>
                                                {items.map((t, idx) => {
                                                    const isDone = checkedItems[t.no] || false;
                                                    return (
                                                        <Flex
                                                            key={t.no}
                                                            p={4}
                                                            align="flex-start"
                                                            gap={3}
                                                            borderBottom={idx < items.length - 1 ? "1px solid" : "none"}
                                                            borderColor={borderCol}
                                                            bg={isDone ? (colorMode === "dark" ? "green.900" : "green.50") : "transparent"}
                                                            transition="background 0.15s"
                                                            cursor="pointer"
                                                            onClick={() => handleToggle(t.no)}
                                                        >
                                                            <Checkbox
                                                                isChecked={isDone}
                                                                onChange={() => handleToggle(t.no)}
                                                                colorScheme="green"
                                                                mt="2px"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <Box flex={1}>
                                                                <Flex align="center" gap={2}>
                                                                    <Text
                                                                        fontSize="sm"
                                                                        fontWeight="medium"
                                                                        textDecoration={isDone ? "line-through" : "none"}
                                                                        color={isDone ? "gray.400" : "inherit"}
                                                                    >
                                                                        {t.judul}
                                                                    </Text>
                                                                    {isDone && <FiCheckCircle size={14} color="#48bb78" />}
                                                                </Flex>
                                                                {t.deskripsi && (
                                                                    <Text fontSize="xs" color="gray.500" mt={0.5}>{t.deskripsi}</Text>
                                                                )}
                                                                {t.detail && (
                                                                    <Text fontSize="xs" color="gray.400" mt={0.5}>{t.detail}</Text>
                                                                )}
                                                            </Box>
                                                            <Badge colorScheme="gray" fontSize="xs">{t.no}</Badge>
                                                        </Flex>
                                                    );
                                                })}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            );
                        })() : (
                            <Flex className="empty-state">
                                <FiInbox size={40} />
                                <Text>Tidak ada daftar training untuk posisi ini</Text>
                            </Flex>
                        )}

                        {/* Save Button */}
                        {trainingData.training && trainingData.training.length > 0 && (
                            <Flex justify="flex-end" mt={6}>
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    onClick={handleSave}
                                    isLoading={saveMutation.isPending}
                                >
                                    <FiSave style={{ marginRight: "8px" }} />
                                    Simpan Progress ({doneCount} done)
                                </Button>
                            </Flex>
                        )}
                    </>
                )}

                {/* Clear Confirmation */}
                <AlertDialog isOpen={isClearOpen} leastDestructiveRef={cancelRef} onClose={onClearClose}>
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">Bersihkan Data Training</AlertDialogHeader>
                            <AlertDialogBody>
                                Ini akan membersihkan baris kosong di data training done (compact). Data tidak dihapus, hanya dirapikan.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onClearClose}>Batal</Button>
                                <Button colorScheme="orange" onClick={() => clearMutation.mutate()} ml={3} isLoading={clearMutation.isPending}>
                                    Bersihkan
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default ProbationTrainingPage;