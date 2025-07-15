import { FiBox, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { Box, Flex, Icon, Progress,  Text, VStack } from '@chakra-ui/react';
import TasksChart from '@/components/TasksChart';
import HeroLayout from '@/components/HeroLayout';
import InfoCard from '@/components/InfoCard';
import { FaMedal } from 'react-icons/fa';
import KpiDetails from '@/components/KpiDetails';
import ContainerCarrot from '@/components/Container';

function KpiDetailsPage() {
    const kpiRightContent = (
        <VStack spacing={6} mt={10}> 
            <InfoCard>
                <FiBox size="30px" color="#FE7743" />
                <p>Total Task</p>
                <p className="card__points">150</p>
            </InfoCard>
            <InfoCard>
                <FiClock size="30px" color="#FE7743" />
                <p>Due Today</p>
                <p className="card__points">50</p>
            </InfoCard>
            <InfoCard>
                <FiAlertTriangle size="30px" color="#FE7743" />
                <p>Overdue</p>
                <p className="card__points">4</p>
            </InfoCard>
        </VStack>
    );

    const kpiLeftContent = (
        <VStack
            spacing={8}
            align="stretch"
        >
            <Box>
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold" fontSize="1.2rem">Point</Text>
                    <Text color="#FE7743" fontWeight="bold">50 pts</Text>
                </Flex>
                <Progress
                    value={50}
                    size="lg"
                    colorScheme="orange"
                    bg="orange.100"
                    borderRadius="full"
                    mt={4}
                    hasStripe
                    isAnimated  
                />
            </Box>
            <Flex 
                align="center" 
                bg="orange.50" 
                p={3} 
                borderRadius="lg" 
                mt={3}
            >
                <Icon as={FaMedal} color="#FE7743" boxSize={6} />
                <Text ml={4} fontWeight="medium" color="gray.700">
                    You are the 1st place in CSO
                </Text>
            </Flex>
            <Box mt={3}>
                <TasksChart />
            </Box>
        </VStack>
    );
    
    return (
        <>
            <ContainerCarrot>
                <HeroLayout 
                    title="KPI - Overview"
                    leftContent={kpiLeftContent}
                    rightContent={kpiRightContent}
                />
            </ContainerCarrot>
            <KpiDetails />
        </>
    );
}

export default KpiDetailsPage;