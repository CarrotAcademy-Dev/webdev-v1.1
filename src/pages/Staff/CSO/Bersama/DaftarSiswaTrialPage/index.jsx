import StyledDaftarSiswaTrialPage from "./DaftarSiswaTrial.style";
import DataTableComponent from "@/components/Table";
import { Heading } from "@chakra-ui/react";
import ContainerCarrot from "@/components/Container";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { getTrialStudents } from "@/features/cso/csoApiService";

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
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setErr] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTrialStudents();
                setStudents(data);
            } catch (err) {
                setErr(err.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loading />
    if (error) return <div>Error: {error}</div>;

    return (
        <StyledDaftarSiswaTrialPage>
            <div className="main-content-section">
                <ContainerCarrot>
                    <Heading mb="2rem">Daftar Siswa Trial</Heading>
                    <DataTableComponent tableData={students} headerItems={headerItems} />
                </ContainerCarrot>
            </div>
        </StyledDaftarSiswaTrialPage>
    );
}

export default DaftarSiswaTrialPage;