import StyledDaftarSiswaTrialPage from "./DaftarSiswaTrial.style";
import DataTableComponent from "@/components/Table";
import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { useQuery } from "@tanstack/react-query";
import { getTrialStudents } from "@/features/cso/csoApiService";
import { FiUsers, FiCalendar } from "react-icons/fi";
import { useMemo } from "react";
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

    // Get today's date for comparison
    const todayStudents = useMemo(() => {
        const today = new Date().toLocaleDateString('id-ID');
        return students.filter(student => {
            const studentDate = new Date(student.timestamp).toLocaleDateString('id-ID');
            return studentDate === today;
        });
    }, [students]);

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledDaftarSiswaTrialPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Siswa Trial - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <FiUsers size="30px" color="#FE7743" />
                                <p>Total Siswa Trial</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{students.length}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiCalendar size="30px" color="#FE7743" />
                                <p>Trial Hari Ini</p>
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{todayStudents.length}</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <DataTableComponent 
                        tableData={students} 
                        headerItems={headerItems} 
                        isLoading={isLoading} 
                    />
                </ContainerCarrot>
            </div>
        </StyledDaftarSiswaTrialPage>
    );
}

export default DaftarSiswaTrialPage;