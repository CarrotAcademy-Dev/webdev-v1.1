import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import StyledRemindersWidget from './RemindersWidget.Styled';
import { 
    Button, 
    Spinner, 
    Badge, 
    Box, 
    Flex, 
    Text, 
    IconButton,
    Collapse,
    useColorMode
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '@/context/AuthContext';
import { format } from 'date-fns';
import { 
    FiCalendar, 
    FiBook, 
    FiUsers, 
    FiAlertCircle, 
    FiChevronDown, 
    FiChevronUp,
    FiPhone
} from 'react-icons/fi';
import { HiOutlineTicket } from 'react-icons/hi';
import { BsWhatsapp } from 'react-icons/bs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JABATAN } from '@/utils/constants/accessControl';

// Import API services
import { 
    getJanjiTemu, 
    getReminderFoundationNaikModul,
    getDashboardProspektifPersonal
} from '@/features/cso/csoApiService';
import { getTicketingInternal } from '@/features/eso/esoApiService';

function RemindersWidget() {
    const { currentUser } = useContext(AuthContext);
    const { colorMode } = useColorMode();
    const jabatan = currentUser?.jabatan;

    // Collapsible state with localStorage
    const [collapsedSections, setCollapsedSections] = useLocalStorage('reminders-collapsed', {});

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Helper: Format phone number for WhatsApp
    const formatWhatsAppNumber = (phone) => {
        if (!phone) return '';
        // Remove non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        // Add 62 prefix if starts with 0
        return cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned;
    };

    // Helper: Open WhatsApp
    const openWhatsApp = (phone, name = '') => {
        const number = formatWhatsAppNumber(phone);
        const message = encodeURIComponent(`Halo ${name}, `);
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    };

    // Helper function to get today's date in format for API
    const getTodayFilter = () => {
        const today = new Date();
        return format(today, 'MMM yyyy'); // "Jan 2026"
    };

    // ========== CSO Reminders ==========
    const { data: janjiTemuData, isLoading: loadingJanjiTemu } = useQuery({
        queryKey: ['janjiTemu'],
        queryFn: getJanjiTemu,
        enabled: jabatan === JABATAN.CSO,
        staleTime: 1000 * 60 * 5,
        select: (data) => {
            // Filter janji temu hari ini yang masih open
            const today = new Date();
            const todayStr = format(today, 'd MMMM yyyy'); // "7 January 2026"
            
            return (data?.dataOpen || []).filter(item => {
                // Check if tanggal is today
                return item.tanggal && item.tanggal.includes(todayStr.split(' ')[0]);
            }).slice(0, 3); // Max 3 items
        }
    });

    const { data: foundationData, isLoading: loadingFoundation } = useQuery({
        queryKey: ['reminderFoundation', getTodayFilter()],
        queryFn: () => getReminderFoundationNaikModul(getTodayFilter()),
        enabled: jabatan === JABATAN.CSO,
        staleTime: 1000 * 60 * 5,
        select: (data) => (data || []).slice(0, 3) // Max 3 items
    });

    const { data: prospektifData, isLoading: loadingProspektif } = useQuery({
        queryKey: ['dashboardProspektif', getTodayFilter()],
        queryFn: () => getDashboardProspektifPersonal(getTodayFilter()),
        enabled: jabatan === JABATAN.CSO,
        staleTime: 1000 * 60 * 5,
        select: (data) => {
            // Count prospektif yang perlu follow up
            const total = (data?.dataDashboard || []).length;
            return { count: total };
        }
    });

    // ========== ESO Reminders ==========
    const { data: ticketData, isLoading: loadingTicket } = useQuery({
        queryKey: ['ticketingInternal'],
        queryFn: getTicketingInternal,
        enabled: jabatan === JABATAN.ESO,
        staleTime: 1000 * 60 * 5,
        select: (data) => {
            // Filter ticket yang status = open
            return (data || []).filter(item => item.status === 'Open').slice(0, 3);
        }
    });

    // ========== Loading State ==========
    const isLoading = loadingJanjiTemu || loadingFoundation || loadingProspektif || loadingTicket;

    // ========== Render Reminders per Jabatan ==========
    const renderCSOReminders = () => {
        const hasJanjiTemu = janjiTemuData && janjiTemuData.length > 0;
        const hasFoundation = foundationData && foundationData.length > 0;
        const hasProspektif = prospektifData && prospektifData.count > 0;

        if (!hasJanjiTemu && !hasFoundation && !hasProspektif) {
            return (
                <Box textAlign="center" py={4}>
                    <Text fontSize="2xl" mb={2}>🎉</Text>
                    <Text color="gray.500" fontStyle="italic">
                        All caught up! No pending reminders.
                    </Text>
                </Box>
            );
        }

        return (
            <>
                {/* Janji Temu */}
                {hasJanjiTemu && (
                    <Box className="reminder-section" mb={4}>
                        <Flex align="center" justify="space-between" mb={2}>
                            <Flex align="center" gap={2}>
                                <FiCalendar size={18} />
                                <Text fontWeight="600" fontSize="md">Janji Temu Hari Ini</Text>
                                <Badge colorScheme="orange" borderRadius="full">
                                    {janjiTemuData.length}
                                </Badge>
                            </Flex>
                            <IconButton
                                icon={collapsedSections['janji-temu'] ? <FiChevronDown /> : <FiChevronUp />}
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSection('janji-temu')}
                                aria-label="Toggle Janji Temu"
                            />
                        </Flex>
                        
                        <Collapse in={!collapsedSections['janji-temu']} animateOpacity>
                            {janjiTemuData.map((item, idx) => (
                                <Box 
                                    key={idx} 
                                    pl={6} 
                                    mb={3} 
                                    pb={3} 
                                    borderBottom={idx < janjiTemuData.length - 1 ? '1px solid' : 'none'} 
                                    borderColor="gray.200"
                                >
                                    <Flex justify="space-between" align="flex-start" mb={1}>
                                        <Box flex="1">
                                            <Text fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.100' : 'gray.700'}>
                                                • {item.nama}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">{item.kategori}</Text>
                                            {item.detail && (
                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                    {item.detail}
                                                </Text>
                                            )}
                                        </Box>
                                        {item.nomor_hp && (
                                            <Flex gap={1} ml={2}>
                                                <IconButton
                                                    icon={<FiPhone />}
                                                    size="xs"
                                                    colorScheme="green"
                                                    variant="ghost"
                                                    as="a"
                                                    href={`tel:${item.nomor_hp}`}
                                                    aria-label="Call"
                                                    title={`Call ${item.nama}`}
                                                />
                                                <IconButton
                                                    icon={<BsWhatsapp />}
                                                    size="xs"
                                                    colorScheme="green"
                                                    variant="ghost"
                                                    onClick={() => openWhatsApp(item.nomor_hp, item.nama)}
                                                    aria-label="WhatsApp"
                                                    title={`WhatsApp ${item.nama}`}
                                                />
                                            </Flex>
                                        )}
                                    </Flex>
                                </Box>
                            ))}
                            <Box mt={2}>
                                <Button 
                                    as={Link} 
                                    to="/my-tasks/janji-temu" 
                                    size="sm" 
                                    colorScheme="orange"
                                    variant="outline"
                                    width="full"
                                >
                                    View All Appointments →
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                )}

                {/* Foundation Naik Modul */}
                {hasFoundation && (
                    <Box className="reminder-section" mb={4}>
                        <Flex align="center" justify="space-between" mb={2}>
                            <Flex align="center" gap={2}>
                                <FiBook size={18} />
                                <Text fontWeight="600" fontSize="md">Foundation Naik Modul</Text>
                                <Badge colorScheme="blue" borderRadius="full">
                                    {foundationData.length}
                                </Badge>
                            </Flex>
                            <IconButton
                                icon={collapsedSections['foundation'] ? <FiChevronDown /> : <FiChevronUp />}
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSection('foundation')}
                                aria-label="Toggle Foundation"
                            />
                        </Flex>
                        
                        <Collapse in={!collapsedSections['foundation']} animateOpacity>
                            <Box pl={6} mb={2}>
                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                                    {foundationData.length} siswa siap naik level
                                </Text>
                                {foundationData.slice(0, 3).map((item, idx) => (
                                    <Flex 
                                        key={idx} 
                                        justify="space-between" 
                                        align="center" 
                                        mt={2} 
                                        p={2} 
                                        bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'} 
                                        borderRadius="md"
                                    >
                                        <Box>
                                            <Text fontSize="xs" fontWeight="500">
                                                {item.nama || 'Student'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {item.modul_sekarang} → {item.modul_tujuan}
                                            </Text>
                                        </Box>
                                        {item.nomor_hp && (
                                            <IconButton
                                                icon={<BsWhatsapp />}
                                                size="xs"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => openWhatsApp(item.nomor_hp, item.nama)}
                                                aria-label="WhatsApp"
                                            />
                                        )}
                                    </Flex>
                                ))}
                            </Box>
                            <Box mt={2}>
                                <Button 
                                    as={Link} 
                                    to="/my-tasks/dashboard-reminder" 
                                    size="sm" 
                                    colorScheme="blue"
                                    variant="outline"
                                    width="full"
                                >
                                    View Dashboard Reminder →
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                )}

                {/* Prospektif Follow Up */}
                {hasProspektif && (
                    <Box className="reminder-section">
                        <Flex align="center" justify="space-between" mb={2}>
                            <Flex align="center" gap={2}>
                                <FiUsers size={18} />
                                <Text fontWeight="600" fontSize="md">Prospektif Follow Up</Text>
                                <Badge colorScheme="purple" borderRadius="full">
                                    {prospektifData.count}
                                </Badge>
                            </Flex>
                            <IconButton
                                icon={collapsedSections['prospektif'] ? <FiChevronDown /> : <FiChevronUp />}
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSection('prospektif')}
                                aria-label="Toggle Prospektif"
                            />
                        </Flex>
                        
                        <Collapse in={!collapsedSections['prospektif']} animateOpacity>
                            <Box pl={6} mb={2}>
                                <Flex align="center" gap={2} mb={2}>
                                    <FiAlertCircle color="purple" />
                                    <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                                        {prospektifData.count} prospektif perlu dihubungi
                                    </Text>
                                </Flex>
                                <Text fontSize="xs" color="gray.500">
                                    Prioritaskan prospektif yang sudah lama tidak dihubungi
                                </Text>
                            </Box>
                            <Box mt={2}>
                                <Button 
                                    as={Link} 
                                    to="/my-tasks/dashboard-prospektif" 
                                    size="sm" 
                                    colorScheme="purple"
                                    variant="outline"
                                    width="full"
                                >
                                    View Dashboard Prospektif →
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                )}
            </>
        );
    };

    const renderESOReminders = () => {
        const hasTickets = ticketData && ticketData.length > 0;

        if (!hasTickets) {
            return (
                <Box textAlign="center" py={4}>
                    <Text fontSize="2xl" mb={2}>🎉</Text>
                    <Text color="gray.500" fontStyle="italic">
                        All caught up! No open tickets.
                    </Text>
                </Box>
            );
        }

        return (
            <Box className="reminder-section">
                <Flex align="center" justify="space-between" mb={2}>
                    <Flex align="center" gap={2}>
                        <HiOutlineTicket size={18} />
                        <Text fontWeight="600" fontSize="md">Ticket Internal Open</Text>
                        <Badge colorScheme="red" borderRadius="full">
                            {ticketData.length}
                        </Badge>
                    </Flex>
                    <IconButton
                        icon={collapsedSections['tickets'] ? <FiChevronDown /> : <FiChevronUp />}
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSection('tickets')}
                        aria-label="Toggle Tickets"
                    />
                </Flex>
                
                <Collapse in={!collapsedSections['tickets']} animateOpacity>
                    {ticketData.map((item, idx) => (
                        <Box 
                            key={idx} 
                            pl={6} 
                            mb={3} 
                            pb={3} 
                            borderBottom={idx < ticketData.length - 1 ? '1px solid' : 'none'} 
                            borderColor="gray.200"
                        >
                            <Flex justify="space-between" align="flex-start">
                                <Box flex="1">
                                    <Flex align="center" gap={2} mb={1}>
                                        <Text fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.100' : 'gray.700'}>
                                            {item.id_ticket}
                                        </Text>
                                        <Badge 
                                            colorScheme={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'blue'} 
                                            size="sm"
                                        >
                                            {item.priority || 'Normal'}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="xs" color="gray.500">{item.kategori}</Text>
                                    {item.subject && (
                                        <Text fontSize="xs" color="gray.500" noOfLines={1} mt={1}>
                                            {item.subject}
                                        </Text>
                                    )}
                                </Box>
                            </Flex>
                        </Box>
                    ))}
                    <Box mt={2}>
                        <Button 
                            as={Link} 
                            to="/eso/ticketing-internal" 
                            size="sm" 
                            colorScheme="red"
                            variant="outline"
                            width="full"
                        >
                            View All Tickets →
                        </Button>
                    </Box>
                </Collapse>
            </Box>
        );
    };

    const renderDefaultReminders = () => {
        return (
            <Box textAlign="center" py={4}>
                <Text fontSize="2xl" mb={2}>📋</Text>
                <Text color="gray.500" fontStyle="italic">
                    No reminders configured for your role.
                </Text>
            </Box>
        );
    };

    return (
        <StyledRemindersWidget>
            <h3 className="widget-title">Reminders</h3>
            
            {isLoading ? (
                <Box textAlign="center" py={6}>
                    <Spinner size="md" color="orange.500" />
                    <Text mt={2} fontSize="sm" color="gray.500">Loading reminders...</Text>
                </Box>
            ) : (
                <Box className="reminders-list" mt={4}>
                    {jabatan === JABATAN.CSO && renderCSOReminders()}
                    {jabatan === JABATAN.ESO && renderESOReminders()}
                    {jabatan !== JABATAN.CSO && jabatan !== JABATAN.ESO && renderDefaultReminders()}
                </Box>
            )}
        </StyledRemindersWidget>
    );
}

export default RemindersWidget;
