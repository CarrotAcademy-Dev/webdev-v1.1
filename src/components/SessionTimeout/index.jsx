import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { 
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';

export default function SessionTimeout() {
    const { currentUser, extendSession, logout, getSessionTimeRemaining } = useContext(AuthContext);
    const [showWarning, setShowWarning] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const textColor = useColorModeValue('gray.600', 'dark.text.secondary');

    useEffect(() => {
        if (!currentUser) return;

        const checkSession = () => {
            const remaining = getSessionTimeRemaining();
            setRemainingMinutes(remaining);

            // Show warning jika kurang dari 10 menit
            if (remaining > 0 && remaining <= 10) {
                setShowWarning(true);
            } else if (remaining === 0) {
                // Auto logout jika sudah habis
                logout();
                setShowWarning(false);
            }
        };

        // Check immediately
        checkSession();

        // Check setiap 1 menit
        const interval = setInterval(checkSession, 60 * 1000);

        return () => clearInterval(interval);
    }, [currentUser, getSessionTimeRemaining, logout]);

    const handleExtend = () => {
        extendSession();
        setShowWarning(false);
    };

    const handleLogout = () => {
        logout();
        setShowWarning(false);
    };

    if (!currentUser) return null;

    return (
        <Modal 
            isOpen={showWarning} 
            onClose={() => {}} // Prevent closing
            closeOnOverlayClick={false}
            closeOnEsc={false}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>⏰ Sesi Akan Berakhir</ModalHeader>
                <ModalBody>
                    <Box>
                        <Text mb={3}>
                            Sesi login Anda akan berakhir dalam <strong>{remainingMinutes} menit</strong>.
                        </Text>
                        <Text mb={3}>
                            Untuk melanjutkan pekerjaan, silakan perpanjang sesi. 
                            Atau logout jika sudah selesai.
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                            💡 Tips: Simpan pekerjaan Anda terlebih dahulu untuk menghindari kehilangan data.
                        </Text>
                    </Box>
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                    >
                        Logout Sekarang
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleExtend}
                    >
                        Perpanjang Sesi (24 Jam)
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
