import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getSearchBarang } from "@/features/hr/gaMainDataApiService";
import {
    Box, Button, Flex, Input, Skeleton, Text, useColorMode,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
    FiSearch, FiPackage, FiInbox, FiExternalLink, FiPhone, FiCreditCard,
} from "react-icons/fi";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const SearchBarangPage = () => {
    const { colorMode } = useColorMode();
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState(null);
    const [searchedKeyword, setSearchedKeyword] = useState("");

    const searchMutation = useMutation({
        mutationFn: getSearchBarang,
        onSuccess: (data) => {
            setResults(data);
            setSearchedKeyword(keyword);
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal mencari barang",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
            setResults(null);
        },
    });

    const handleSearch = () => {
        if (!keyword.trim()) {
            toaster.create({ title: "Masukkan kata kunci pencarian", type: "warning", duration: 2000 });
            return;
        }
        searchMutation.mutate(keyword.trim());
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";
    const hoverBg = colorMode === "dark" ? "gray.700" : "gray.50";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Search Barang</h1>
                    <Text className="subtitle">Cari ketersediaan barang berdasarkan nama, beserta info vendor</Text>
                </Box>

                {/* Search Bar */}
                <Flex gap={3} mb={6} maxW="500px">
                    <Box position="relative" flex={1}>
                        <Input
                            placeholder="Cari nama barang..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button colorScheme="teal" onClick={handleSearch} isLoading={searchMutation.isPending} minW="90px">
                        Cari
                    </Button>
                </Flex>

                {/* Loading */}
                {searchMutation.isPending && (
                    <Box>
                        <Skeleton count={4} height={100} style={{ marginBottom: "12px" }} />
                    </Box>
                )}

                {/* Empty state — belum pernah search */}
                {!results && !searchMutation.isPending && (
                    <Flex className="empty-state">
                        <FiPackage size={48} />
                        <Text>Masukkan kata kunci untuk mencari barang</Text>
                    </Flex>
                )}

                {/* Results */}
                {results && !searchMutation.isPending && (
                    <>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="sm" color="gray.500">
                                Menampilkan {results.length} hasil untuk "<strong>{searchedKeyword}</strong>"
                            </Text>
                        </Flex>

                        {results.length === 0 ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>Tidak ada barang yang cocok dengan kata kunci tersebut</Text>
                            </Flex>
                        ) : (
                            <Flex direction="column" gap={3}>
                                {results.map((item, i) => (
                                    <Box
                                        key={i}
                                        bg={cardBg}
                                        border="1px solid"
                                        borderColor={borderCol}
                                        borderRadius="12px"
                                        p={4}
                                        transition="all 0.2s"
                                        _hover={{ borderColor: "teal.300", shadow: "sm" }}
                                    >
                                        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3}>
                                            <Box flex={1} minW="200px">
                                                <Text fontWeight="bold" fontSize="md">{item.nama_barang}</Text>
                                                <Flex gap={3} mt={1} wrap="wrap" fontSize="sm" color="gray.500">
                                                    {item.merek && <Text>Merek: {item.merek}</Text>}
                                                    {item.ukuran && <Text>· Ukuran: {item.ukuran}</Text>}
                                                    {item.tipe && <Text>· Tipe: {item.tipe}</Text>}
                                                    {item.warna && <Text>· Warna: {item.warna}</Text>}
                                                </Flex>
                                                {item.jenis && (
                                                    <Text fontSize="xs" color="gray.400" mt={1}>Jenis: {item.jenis}</Text>
                                                )}
                                            </Box>

                                            <Box
                                                minW="220px"
                                                p={3}
                                                borderRadius="md"
                                                bg={hoverBg}
                                            >
                                                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="bold" textTransform="uppercase">
                                                    Info Vendor
                                                </Text>
                                                <Text fontSize="sm" fontWeight="medium">{item.nama_vendor || "-"}</Text>
                                                <Text fontSize="xs" color="gray.500">{item.alamat || "-"}</Text>
                                                <Flex align="center" gap={1} mt={1} fontSize="xs" color="gray.500">
                                                    <FiPhone size={12} /> {item.no_telp || "-"}
                                                </Flex>
                                                <Flex align="center" gap={1} fontSize="xs" color="gray.500">
                                                    <FiCreditCard size={12} /> {item.no_rekening || "-"}
                                                </Flex>
                                                {isValidUrl(item.link_toko) && (
                                                    <Flex align="center" gap={1} mt={2}>
                                                        <Text
                                                            as="a"
                                                            href={item.link_toko}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            fontSize="xs"
                                                            color="blue.400"
                                                        >
                                                            Lihat Toko
                                                        </Text>
                                                        <FiExternalLink size={12} />
                                                    </Flex>
                                                )}
                                            </Box>
                                        </Flex>
                                    </Box>
                                ))}
                            </Flex>
                        )}
                    </>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default SearchBarangPage;