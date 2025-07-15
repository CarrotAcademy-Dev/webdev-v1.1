import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Grid, GridItem, VStack, Heading, Text, Button, Image } from '@chakra-ui/react';
import underConstructionIllustration from '../../assets/images/notfound.svg';
import StyledNotFound from './NotFound.styled';

function NotFoundPage() {
    return (
        <StyledNotFound>
            <Box
                bg="white"
                borderRadius="24px"
                boxShadow="0 10px 30px rgba(0, 0, 0, 0.08)"
                p={{ base: 6, md: 10 }}
                width="100%"
                maxWidth="1100px"
            >
                <Grid
                    templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                    gap={10}
                    alignItems="center"
                >
                    <GridItem>
                        <VStack spacing={6} align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }}>
                            <Heading as="h1" size="2xl">
                                Maaf halaman ini sedang dalam pengembangan :(
                            </Heading>
                            <Text fontSize="lg" color="gray.600">
                                Tim Developer sedang bekerja keras untuk menyelesaikan halaman ini. Silakan kembali lagi nanti.
                            </Text>
                            <Button
                                as={RouterLink}
                                to="/home"
                                bg="#FE7743"
                                color="white"
                                size="lg"
                                _hover={{ bg: '#E46A3A' }}
                            >
                                Kembali ke Home
                            </Button>
                        </VStack>
                    </GridItem>
                    <GridItem>
                        <VStack spacing={8}>
                            <Image src={underConstructionIllustration} alt="Page under construction" maxW="100%" />
                        </VStack>
                    </GridItem>
                </Grid>
            </Box>
        </StyledNotFound>
    );
}

export default NotFoundPage;