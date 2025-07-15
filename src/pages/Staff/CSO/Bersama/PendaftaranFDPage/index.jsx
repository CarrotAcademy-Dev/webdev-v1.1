import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import Loading from "@/components/Loading";
import { getPendaftaranFD } from "@/features/cso/csoApiService";
import DataTableComponent from "@/components/Table";
import { BiTask, BiTaskX } from "react-icons/bi";
import StyledPendaftaranFdPage from "./PendaftaranFd.styled";
import { useQuery } from "@tanstack/react-query";

const headerItems = [
    { key: 'no', 'label': 'No' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'tahun', label: 'Tahun' },
    { key: 'noFd', label: 'No FD' },
    { key: 'nis', label: 'NIS'},
    { key: 'nama', label: 'Nama'},
    { key: 'linkPendaftaran', label: 'Link Pendaftaran Lanjutan'},
    { key: 'done_reminderH9', label: 'Reminder H-9'},
    { key: 'done_reminderH6', label: 'Keterangan Detail'},
    { key: 'done_reminderH4', label: 'Tanggal Mulai Cuti'},
    { key: 'done_reminderH2', label: 'Tanggal Akhir Cuti'},
    { key: 'done_reminderH1', label: 'Last Day'},
    { key: 'done_reminderH11', label: 'Schedule Sudah Dirapihkan?'},
    { key: 'done_reminderH12', label: 'Reminder Whatsapp'}
];

function PendaftaranFdPage() {
    const { data: pendaftaranFd = [], isLoading, isError, error } = useQuery({
        queryKey: ['pendaftaranFD'],
        queryFn: getPendaftaranFD
    });

    const doneCount = pendaftaranFd.filter(item => item.done).length;
    const notDoneCount = pendaftaranFd.length - doneCount;

    if (isLoading) return <Loading />
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledPendaftaranFdPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Pendaftaran Fulltime Course - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard><BiTask size="30px" /> <p>Done</p> <p className="card__points">{doneCount}</p></InfoCard>
                            <InfoCard><BiTaskX size="30px" /> <p>Not Done</p> <p className="card__points">{notDoneCount}</p></InfoCard>
                        </div>
                    </div>
                    {/* <div className="hero-section__right">
                        <InfoCard>
                            <ProgressBarChart />
                        </InfoCard>
                    </div> */}
                </div>
            </ContainerCarrot>
            <ContainerCarrot>
                <div className="main-content-section">
                    <DataTableComponent tableData={pendaftaranFd} headerItems={headerItems} />
                </div>
            </ContainerCarrot>
        </StyledPendaftaranFdPage>
    );
}

export default PendaftaranFdPage;