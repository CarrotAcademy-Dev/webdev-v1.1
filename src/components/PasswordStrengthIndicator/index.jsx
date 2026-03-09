import React from 'react';
import { Box, Text, Progress } from '@chakra-ui/react';

/**
 * Password Strength Indicator Component
 * Shows visual feedback for password strength:
 * - Weak (0-33%): Red - Missing requirements
 * - Medium (34-66%): Orange - Some requirements met
 * - Strong (67-100%): Green - All requirements met
 */
function PasswordStrengthIndicator({ password }) {
    const calculateStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'gray' };

        let score = 0;
        const checks = {
            length: pass.length >= 8 && pass.length <= 20,
            lowercase: /[a-z]/.test(pass),
            uppercase: /[A-Z]/.test(pass),
            number: /\d/.test(pass),
            symbol: /[\W_]/.test(pass)
        };

        // Each requirement = 20 points
        Object.values(checks).forEach(check => {
            if (check) score += 20;
        });

        // Determine label and color
        if (score === 100) {
            return { score, label: 'Kuat', color: 'green', checks };
        } else if (score >= 60) {
            return { score, label: 'Sedang', color: 'orange', checks };
        } else if (score > 0) {
            return { score, label: 'Lemah', color: 'red', checks };
        }
        
        return { score: 0, label: '', color: 'gray', checks };
    };

    const strength = calculateStrength(password);

    if (!password) return null;

    return (
        <Box mt={2}>
            <Progress 
                value={strength.score} 
                size="sm" 
                colorScheme={strength.color}
                borderRadius="md"
                mb={2}
            />
            <Text fontSize="sm" fontWeight="medium" color={`${strength.color}.500`}>
                {strength.label && `Kekuatan Password: ${strength.label}`}
            </Text>
            
            {strength.score < 100 && (
                <Box mt={2} fontSize="xs" color="gray.600">
                    <Text fontWeight="semibold" mb={1}>Persyaratan Password:</Text>
                    <Box as="ul" pl={4}>
                        <li style={{ color: strength.checks?.length ? 'green' : 'inherit' }}>
                            ✓ 8-20 karakter {strength.checks?.length && '✅'}
                        </li>
                        <li style={{ color: strength.checks?.lowercase ? 'green' : 'inherit' }}>
                            ✓ Minimal 1 huruf kecil {strength.checks?.lowercase && '✅'}
                        </li>
                        <li style={{ color: strength.checks?.uppercase ? 'green' : 'inherit' }}>
                            ✓ Minimal 1 huruf besar {strength.checks?.uppercase && '✅'}
                        </li>
                        <li style={{ color: strength.checks?.number ? 'green' : 'inherit' }}>
                            ✓ Minimal 1 angka {strength.checks?.number && '✅'}
                        </li>
                        <li style={{ color: strength.checks?.symbol ? 'green' : 'inherit' }}>
                            ✓ Minimal 1 simbol (!@#$%^&*) {strength.checks?.symbol && '✅'}
                        </li>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default PasswordStrengthIndicator;
