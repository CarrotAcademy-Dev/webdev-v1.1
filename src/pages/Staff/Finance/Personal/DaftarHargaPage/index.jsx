/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { getDaftarHargaPersonal } from "@/features/finance/financeApiService";
import {
    Box, Flex, Input, InputGroup, InputLeftElement, Text,
    useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";
import { StyledDaftarHarga } from "../../Bersama/DaftarHargaPage/DaftarHarga.styled";

const DaftarHargaPersonalPage = () => {
    const cardBg = useColorModeValue("white", "dark.bg.card");
    const textColor = useColorModeValue("gray.600", "dark.text.secondary");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const itemsPerPage = 10;

    // Product state
    const [productSearch, setProductSearch] = useState("");
    const [productSort, setProductSort] = useState({ key: null, direction: "asc" });
    const [productPage, setProductPage] = useState(1);
    const debouncedProductSearch = useDebounce(productSearch, 300);

    // Discount state
    const [discountSearch, setDiscountSearch] = useState("");
    const [discountSort, setDiscountSort] = useState({ key: null, direction: "asc" });
    const [discountPage, setDiscountPage] = useState(1);
    const debouncedDiscountSearch = useDebounce(discountSearch, 300);

    const { data: hargaData, isLoading, isError } = useQuery({
        queryKey: ["daftarHargaPersonal"],
        queryFn: getDaftarHargaPersonal,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const productData = hargaData?.data_product || [];
    const discountData = hargaData?.data_discount || [];

    // Sort helper
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
            const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    };

    // Processed product data
    const processedProduct = useMemo(() => {
        let data = productData;
        if (debouncedProductSearch) {
            const lower = debouncedProductSearch.toLowerCase();
            data = data.filter(item =>
                item.nama_product?.toLowerCase().includes(lower) ||
                item.nama_ditampilkan?.toLowerCase().includes(lower) ||
                item.harga_satuan?.toString().toLowerCase().includes(lower)
            );
        }
        return sortData(data, productSort);
    }, [productData, debouncedProductSearch, productSort]);

    // Processed discount data
    const processedDiscount = useMemo(() => {
        let data = discountData;
        if (debouncedDiscountSearch) {
            const lower = debouncedDiscountSearch.toLowerCase();
            data = data.filter(item =>
                item.daftar_diskon?.toLowerCase().includes(lower) ||
                item.jumlah_sesi?.toString().toLowerCase().includes(lower) ||
                item.harga_discount?.toString().toLowerCase().includes(lower)
            );
        }
        return sortData(data, discountSort);
    }, [discountData, debouncedDiscountSearch, discountSort]);

    // Reset page on search change
    useMemo(() => setProductPage(1), [debouncedProductSearch]);
    useMemo(() => setDiscountPage(1), [debouncedDiscountSearch]);

    // Pagination product
    const productTotalPages = Math.ceil(processedProduct.length / itemsPerPage);
    const paginatedProduct = processedProduct.slice(
        (productPage - 1) * itemsPerPage,
        productPage * itemsPerPage
    );

    // Pagination discount
    const discountTotalPages = Math.ceil(processedDiscount.length / itemsPerPage);
    const paginatedDiscount = processedDiscount.slice(
        (discountPage - 1) * itemsPerPage,
        discountPage * itemsPerPage
    );

    const handleProductSort = (key) => {
        setProductSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleDiscountSort = (key) => {
        setDiscountSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const renderSortIcon = (key, sortConfig) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />;
    };

    const formatCurrency = (value) => {
        if (!value) return "-";
        const numeric = value.toString().replace(/[^0-9]/g, "");
        if (!numeric) return value;
        return `Rp ${parseInt(numeric).toLocaleString("id-ID")}`;
    };

    if (isLoading) return (
        <ContainerCarrot>
            <Flex direction="column" gap={4}>
                <Skeleton height="60px" />
                <Skeleton height="400px" />
            </Flex>
        </ContainerCarrot>
    );

    if (isError) return (
        <ContainerCarrot>
            <Box p={8} textAlign="center">
                <Text color="red.500">Gagal memuat data daftar harga</Text>
            </Box>
        </ContainerCarrot>
    );

    return (
        <ContainerCarrot>
            <StyledDaftarHarga>
                <div className="page-header">
                    <h1>Daftar Harga</h1>
                    <p>Referensi harga produk dan diskon program Finance</p>
                </div>

                <Tabs colorScheme="orange">
                    <TabList>
                        <Tab fontWeight="600">Harga Produk ({productData.length})</Tab>
                        <Tab fontWeight="600">Diskon ({discountData.length})</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Tab Harga Produk */}
                        <TabPanel px={0}>
                            <Box mb={6}>
                                <InputGroup maxW="400px">
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Cari nama produk, display, harga..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        bg={cardBg}
                                        borderColor={borderColor}
                                    />
                                </InputGroup>
                            </Box>

                            <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
                                <table>
                                    <thead>
                                        <tr>
                                            {[
                                                { key: "nama_product", label: "Nama Produk" },
                                                { key: "nama_ditampilkan", label: "Nama Ditampilkan" },
                                                { key: "harga_satuan", label: "Harga Satuan" },
                                            ].map(({ key, label }) => (
                                                <th key={key} onClick={() => handleProductSort(key)} style={{ cursor: "pointer" }}>
                                                    <Flex align="center" gap={2}>
                                                        {label} {renderSortIcon(key, productSort)}
                                                    </Flex>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProduct.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                                                    <Text color={textColor}>
                                                        {debouncedProductSearch ? "Tidak ada hasil pencarian" : "Tidak ada data"}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedProduct.map((item, index) => (
                                                <tr key={`${item.nama_product}-${index}`}>
                                                    <td>{item.nama_product}</td>
                                                    <td>{item.nama_ditampilkan}</td>
                                                    <td>{formatCurrency(item.harga_satuan)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </Box>

                            {productTotalPages > 1 && (
                                <Box mt={6}>
                                    <Pagination
                                        currentPage={productPage}
                                        totalPages={productTotalPages}
                                        onPageChange={setProductPage}
                                        startIndex={(productPage - 1) * itemsPerPage}
                                        endIndex={productPage * itemsPerPage}
                                        totalItems={processedProduct.length}
                                    />
                                </Box>
                            )}
                        </TabPanel>

                        {/* Tab Diskon */}
                        <TabPanel px={0}>
                            <Box mb={6}>
                                <InputGroup maxW="400px">
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Cari nama diskon, jumlah sesi, harga..."
                                        value={discountSearch}
                                        onChange={(e) => setDiscountSearch(e.target.value)}
                                        bg={cardBg}
                                        borderColor={borderColor}
                                    />
                                </InputGroup>
                            </Box>

                            <Box className="table-container" bg={cardBg} borderRadius="md" overflow="hidden">
                                <table>
                                    <thead>
                                        <tr>
                                            {[
                                                { key: "daftar_diskon", label: "Nama Diskon" },
                                                { key: "jumlah_sesi", label: "Jumlah Sesi" },
                                                { key: "harga_discount", label: "Harga Diskon" },
                                            ].map(({ key, label }) => (
                                                <th key={key} onClick={() => handleDiscountSort(key)} style={{ cursor: "pointer" }}>
                                                    <Flex align="center" gap={2}>
                                                        {label} {renderSortIcon(key, discountSort)}
                                                    </Flex>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDiscount.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                                                    <Text color={textColor}>
                                                        {debouncedDiscountSearch ? "Tidak ada hasil pencarian" : "Tidak ada data"}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedDiscount.map((item, index) => (
                                                <tr key={`${item.daftar_diskon}-${index}`}>
                                                    <td>{item.daftar_diskon}</td>
                                                    <td>{item.jumlah_sesi}</td>
                                                    <td>{formatCurrency(item.harga_discount)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </Box>

                            {discountTotalPages > 1 && (
                                <Box mt={6}>
                                    <Pagination
                                        currentPage={discountPage}
                                        totalPages={discountTotalPages}
                                        onPageChange={setDiscountPage}
                                        startIndex={(discountPage - 1) * itemsPerPage}
                                        endIndex={discountPage * itemsPerPage}
                                        totalItems={processedDiscount.length}
                                    />
                                </Box>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </StyledDaftarHarga>
        </ContainerCarrot>
    );
};

export default DaftarHargaPersonalPage;