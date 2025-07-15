import HeroLayout from '@/components/HeroLayout';
import InfoCard from '@/components/InfoCard';
import TasksChart from '@/components/TasksChart';
import GaugeChart from '@/components/GaugeChart';
import { FiCheckSquare, FiClock, FiAlertTriangle } from 'react-icons/fi';
import StyledKpiDetails from './KpiDetails.Styled';
import ContainerCarrot from '../Container';
import { LuSparkles } from 'react-icons/lu';
import { VStack } from '@chakra-ui/react';


function KpiDetails() {
    const kpiLeftContent = (
        <StyledKpiDetails>
            <div className="top-grid">
                <InfoCard className="points-card">
                    <LuSparkles color='#FE7743' size="40px" />
                    <p className="points-value">98 pts</p>
                </InfoCard>
            </div>
            <div className="stats-grid">
                <InfoCard><FiCheckSquare size="30px" color='#FE7743' /> <p>Done</p> <p className="card__points">2</p></InfoCard>
                <InfoCard><FiClock size="30px" color='#FE7743' /> <p>Due Today</p> <p className="card__points">5</p></InfoCard>
                <InfoCard><FiAlertTriangle size="30px" color='#FE7743' /> <p>Overdue</p> <p className="card__points">2</p></InfoCard>
            </div>
        </StyledKpiDetails>
    );

    const kpiRightContent = (
        <InfoCard>
            <GaugeChart />
        </InfoCard>
    )

    return (
        <ContainerCarrot>
            <VStack spacing={6} align='stretch'>
                <HeroLayout 
                    title="KPI - Details"
                    subtitle="CSO-001 Follow Up 1 Completion Rate"
                    leftContent={kpiLeftContent}
                    rightContent={kpiRightContent}
                />
                <div className="details-chart">
                    <TasksChart className="details-chart__chart" />
                </div>
            </VStack>
        </ContainerCarrot>
    );
}

export default KpiDetails;