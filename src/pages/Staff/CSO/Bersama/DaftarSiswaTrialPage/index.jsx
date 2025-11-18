import StyledDaftarSiswaTrialPage from "./DaftarSiswaTrial.style";
import DataTableComponent from "@/components/Table";
import { Heading } from "@chakra-ui/react";
import ContainerCarrot from "@/components/Container";
import { useQuery } from "@tanstack/react-query";
import { getTrialStudents } from "@/features/cso/csoApiService";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const headerItems = [
    { key: 'no', label: 'No' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'jam', label: 'Jam' },
    { key: 'nama', label: 'Nama' },
    { key: 'modul', label: 'Modul' },
    { key: 'ageGroup', label: 'Age Group' },
    { key: 'mentor', label: 'Mentor' },
    { key: 'proactive', label: 'Proactive' },
    { key: 'briefAcception', label: 'Brief Acception' },
    { key: 'visualization', label: 'Visualization' },
    { key: 'artworkQuality', label: 'Artwork Quality' },
    { key: 'creativity', label: 'Creativity' },
    { key: 'basicSkill', label: 'Basic Skill' },
    { key: 'focus', label: 'Focus' },
    { key: 'review', label: 'Review' }
];

function DaftarSiswaTrialPage() {
    const { data: students = [], isLoading, isError, error } = useQuery({
        queryKey: ['trialStudents'],
        queryFn: getTrialStudents,
    });

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledDaftarSiswaTrialPage>
            <div className="main-content-section">
                <ContainerCarrot>
                    <Heading mb="2rem">Daftar Siswa Trial</Heading>
                    <DataTableComponent tableData={students} headerItems={headerItems} isLoading={isLoading} />
                </ContainerCarrot>
            </div>
        </StyledDaftarSiswaTrialPage>
    );
}

export default DaftarSiswaTrialPage;