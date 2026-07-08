import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getUtilsTicketingExternal, createTicketExternal } from "@/features/hr/hrgaPersonalApiService";
import {
    Box, Button, Flex, Grid, Input, Select, Stack, Switch,
    Text, Textarea, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiPlus, FiSend } from "react-icons/fi";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

// Mapping kategori → request options
const KATEGORI_REQUEST_MAP = {
    "Schedule": "schedule",
    "Complaint": "complaint",
    "Request": "request",
    "Billing": "billing",
    "Offboarding": "offboarding",
    "Info": "info",
    "Query": "query",
};

const EMPTY_FORM = {
    pic: "", nama: "", nomor_hp: "", jam: "", media: "",
    kategori: "", request: "", detail: "",
    accountable: "", consulted1: "", consulted2: "",
    lampiran: "", hasil: "", status: "false",
};

const TicketingExternalPage = () => {
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState(EMPTY_FORM);
    const [lastTicketId, setLastTicketId] = useState(null);

    const { data: utils, isLoading: isUtilsLoading } = useQuery({
        queryKey: ["utilsTicketingExternal"],
        queryFn: getUtilsTicketingExternal,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: createTicketExternal,
        onSuccess: (result) => {
            setLastTicketId(result?.ticketID || null);
            toaster.create({
                title: `Ticket berhasil dibuat${result?.ticketID ? ` — ${result.ticketID}` : ""}`,
                type: "success",
                duration: 4000,
            });
            setForm(EMPTY_FORM);
            onClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal membuat ticket", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Get request options based on selected kategori
    const currentRequestOptions = useMemo(() => {
        if (!form.kategori || !utils) return [];
        const mapKey = KATEGORI_REQUEST_MAP[form.kategori];
        if (!mapKey) return [];
        return utils[`kategori_${mapKey}`] || [];
    }, [form.kategori, utils]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            // Reset request jika kategori berubah
            ...(name === "kategori" ? { request: "" } : {}),
        }));
    };

    const handleSubmit = () => {
        const required = ["pic", "nama", "nomor_hp", "jam", "media", "kategori", "request", "detail"];
        const missing = required.filter(k => !form[k]?.trim());
        if (missing.length > 0) {
            toaster.create({ title: `Field wajib diisi: ${missing.join(", ")}`, type: "warning", duration: 3000 });
            return;
        }
        createMutation.mutate(form);
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    const SelectField = ({ label, name, value, options, required }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">
                {label} {required && <Text as="span" color="red.500">*</Text>}
            </Text>
            <Select name={name} value={value} onChange={handleChange} placeholder="- Pilih -">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
        </Box>
    );

    const InputField = ({ label, name, value, type = "text", required, placeholder }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">
                {label} {required && <Text as="span" color="red.500">*</Text>}
            </Text>
            <Input name={name} value={value} onChange={handleChange} type={type} placeholder={placeholder} />
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Ticketing External</h1>
                    <Text className="subtitle">Buat tiket eksternal untuk pelanggan atau siswa</Text>
                </Box>

                {/* Last ticket ID */}
                {lastTicketId && (
                    <Box mb={6} p={4} borderRadius="12px" bg={colorMode === "dark" ? "teal.900" : "teal.50"}
                        border="1px solid" borderColor="teal.400">
                        <Text fontWeight="bold" color={colorMode === "dark" ? "teal.200" : "teal.700"}>
                            ✅ Ticket terakhir dibuat: <Text as="span" fontFamily="mono">{lastTicketId}</Text>
                        </Text>
                    </Box>
                )}

                {/* Main card */}
                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                    <Flex p={5} borderBottom="1px solid" borderColor={borderCol} justify="space-between" align="center">
                        <Box>
                            <Text fontWeight="bold" fontSize="lg">Buat Ticket Eksternal Baru</Text>
                            <Text fontSize="sm" color="gray.500">Isi formulir di bawah untuk membuat tiket</Text>
                        </Box>
                        <Button colorScheme="teal" onClick={onOpen} isDisabled={isUtilsLoading}>
                            <FiPlus style={{ marginRight: "6px" }} /> Buat Ticket
                        </Button>
                    </Flex>

                    <Box p={5}>
                        {isUtilsLoading ? (
                            <Skeleton count={3} height={40} style={{ marginBottom: "12px" }} />
                        ) : (
                            <Stack gap={4}>
                                {/* Info Panel */}
                                <Box p={4} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                                    border="1px solid" borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}>
                                    <Text fontSize="sm" color={colorMode === "dark" ? "gray.300" : "blue.700"} fontWeight="medium" mb={2}>
                                        ℹ️ Panduan Ticketing External
                                    </Text>
                                    <Stack gap={1} fontSize="xs" color={colorMode === "dark" ? "gray.400" : "blue.600"}>
                                        <Text>• Kategori <strong>Offboarding</strong>: data otomatis dikirim ke CSO, ESO, dan Finance</Text>
                                        <Text>• Request <strong>Lost & Found, Janji Temu, Bukti Pembayaran, Sertifikat</strong>: data dikirim ke sheet khusus</Text>
                                        <Text>• Kategori lain: data dikirim ke Ticketing External dan semua Consulted</Text>
                                        <Text>• Centang "Status Done" jika tiket langsung selesai saat dibuat</Text>
                                    </Stack>
                                </Box>

                                {/* Stats dari utils */}
                                <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3}>
                                    {[
                                        { label: "Kategori", count: utils?.kategori_data?.length || 0 },
                                        { label: "Accountable", count: utils?.accountable_data?.length || 0 },
                                        { label: "Consulted", count: utils?.consulted_data?.length || 0 },
                                        { label: "From Options", count: utils?.from_data?.length || 0 },
                                    ].map(({ label, count }) => (
                                        <Box key={label} p={3} borderRadius="md" border="1px solid" borderColor={borderCol} textAlign="center">
                                            <Text fontWeight="bold" fontSize="lg">{count}</Text>
                                            <Text fontSize="xs" color="gray.500">{label} Tersedia</Text>
                                        </Box>
                                    ))}
                                </Grid>
                            </Stack>
                        )}
                    </Box>
                </Box>

                {/* Create Ticket Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Buat Ticket External Baru</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={5}>
                                {/* PIC & Identitas */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        PIC & Identitas
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="PIC" name="pic" value={form.pic} required placeholder="Kode nama PIC" />
                                        <InputField label="Nama (Customer/Siswa)" name="nama" value={form.nama} required placeholder="Nama pelanggan" />
                                        <InputField label="Nomor HP" name="nomor_hp" value={form.nomor_hp} required placeholder="08xx..." />
                                        <InputField label="Jam" name="jam" value={form.jam} required type="time" />
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Media <Text as="span" color="red.500">*</Text></Text>
                                            <Select name="media" value={form.media} onChange={handleChange} placeholder="- Pilih Media -">
                                                {(utils?.from_data || []).map(m => <option key={m} value={m}>{m}</option>)}
                                            </Select>
                                        </Box>
                                    </Grid>
                                </Box>

                                {/* Kategori & Request */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        Kategori & Request
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Kategori <Text as="span" color="red.500">*</Text></Text>
                                            <Select name="kategori" value={form.kategori} onChange={handleChange} placeholder="- Pilih Kategori -">
                                                {(utils?.kategori_data || []).map(k => <option key={k} value={k}>{k}</option>)}
                                            </Select>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Request <Text as="span" color="red.500">*</Text></Text>
                                            <Select name="request" value={form.request} onChange={handleChange}
                                                placeholder={form.kategori ? "- Pilih Request -" : "Pilih kategori dulu"}
                                                isDisabled={!form.kategori || currentRequestOptions.length === 0}>
                                                {currentRequestOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                            </Select>
                                        </Box>
                                    </Grid>
                                    <Box mt={3}>
                                        <Text fontWeight="medium" mb={2} fontSize="sm">Detail <Text as="span" color="red.500">*</Text></Text>
                                        <Textarea name="detail" value={form.detail} onChange={handleChange}
                                            placeholder="Detail pertanyaan, keluhan, atau request..." rows={4} />
                                    </Box>
                                </Box>

                                {/* RACI */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        RACI
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Accountable</Text>
                                            <Select name="accountable" value={form.accountable} onChange={handleChange} placeholder="- Pilih -">
                                                {(utils?.accountable_data || []).map(a => <option key={a} value={a}>{a}</option>)}
                                            </Select>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Consulted 1</Text>
                                            <Select name="consulted1" value={form.consulted1} onChange={handleChange} placeholder="- Pilih -">
                                                {(utils?.consulted_data || []).map(c => <option key={c} value={c}>{c}</option>)}
                                            </Select>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" mb={2} fontSize="sm">Consulted 2</Text>
                                            <Select name="consulted2" value={form.consulted2} onChange={handleChange} placeholder="- Pilih (opsional) -">
                                                <option value="">- Kosong -</option>
                                                {(utils?.consulted_data || []).map(c => <option key={c} value={c}>{c}</option>)}
                                            </Select>
                                        </Box>
                                    </Grid>
                                </Box>

                                {/* Lampiran & Hasil */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        Lampiran & Hasil
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Lampiran (URL)" name="lampiran" value={form.lampiran} placeholder="https://..." />
                                        <InputField label="Hasil" name="hasil" value={form.hasil} placeholder="Hasil penanganan (opsional)" />
                                    </Grid>
                                </Box>

                                {/* Status Done */}
                                <Box p={4} borderRadius="md" border="2px solid"
                                    borderColor={form.status === "true" ? "green.400" : borderCol}
                                    bg={form.status === "true" ? (colorMode === "dark" ? "green.900" : "green.50") : "transparent"}
                                    transition="all 0.2s">
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text fontWeight="medium">Status Done Langsung</Text>
                                            <Text fontSize="xs" color="gray.500">
                                                Centang jika tiket sudah selesai saat dibuat (langsung Close)
                                            </Text>
                                        </Box>
                                        <Switch
                                            isChecked={form.status === "true"}
                                            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.checked ? "true" : "false" }))}
                                            colorScheme="green"
                                            size="lg"
                                        />
                                    </Flex>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleSubmit} isLoading={createMutation.isPending}>
                                <FiSend style={{ marginRight: "6px" }} /> Kirim Ticket
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default TicketingExternalPage;