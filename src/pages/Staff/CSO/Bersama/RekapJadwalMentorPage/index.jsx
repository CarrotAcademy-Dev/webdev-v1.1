import ContainerCarrot from "@/components/Container";
import InfoCard from "@/components/InfoCard";
import { useQuery } from "@tanstack/react-query";
import { getRekapJadwalMentor } from "@/features/cso/csoApiService";
import { StyledRekapJadwalMentorPage } from "./RekapJadwalMentor.styled";
import { LuUsers, LuClock, LuCalendar } from "react-icons/lu";
import React from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function RekapJadwalMentorPage() {
    const { data = [], isLoading, isError, error } = useQuery({
        queryKey: ['rekapJadwalMentor'],
        queryFn: getRekapJadwalMentor,
    });

    const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Total', 'Monthly', 'Hari Kosong'];

    const calculateTotals = () => {
        if (!data || data.length < 3) return { totalKosong: 0, totalSesi: 0, totalSiswa: 0 };
        
        let totalKosong = 0;
        let totalSesi = 0;
        let totalSiswa = 0;

        for (let i = 2; i < data.length; i++) {
            for (let j = 1; j < data[i].length; j += 3) {
                totalKosong += parseInt(data[i][j] || 0);
                totalSesi += parseInt(data[i][j + 1] || 0);
                totalSiswa += parseInt(data[i][j + 2] || 0);
            }
        }

        return { totalKosong, totalSesi, totalSiswa };
    };

    const totals = calculateTotals();

    if (isError) return <div>Error: {error.message}</div>;

    const mentorNames = data[0]?.filter(name => name !== "") || [];

    const getCellClassName = (hari, colIndex) => {
        const isKosongCol = colIndex % 3 === 0;
        const isSesiCol = colIndex % 3 === 1;
        const isSiswaCol = colIndex % 3 === 2;

        if (hari === 'Total' && isSiswaCol) return 'highlighted';      // Baris Total -> Kolom Total Siswa
        if (hari === 'Monthly' && isSesiCol) return 'highlighted';     // Baris Monthly -> Kolom Total Sesi
        if (hari === 'Hari Kosong' && isKosongCol) return 'highlighted'; // Baris Hari Kosong -> Kolom Total Jam Kosong

        return '';
    };

    const getDividerClassName = (colIndex) => {
        return colIndex % 3 === 2 ? 'mentor-divider' : '';
    };
    
    const isSummaryRow = (hari) => ['Total', 'Monthly', 'Hari Kosong'].includes(hari);

    return (
        <StyledRekapJadwalMentorPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Rekap Jadwal Mentor</h1>
                        <div className="stats-grid">
                            <InfoCard>
                                <LuClock size="30px" />
                                <p>Total Jam Kosong</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.totalKosong}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuCalendar size="30px" />
                                <p>Total Sesi</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.totalSesi}</p>}
                            </InfoCard>
                            <InfoCard>
                                <LuUsers size="30px" />
                                <p>Total Siswa</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.totalSiswa}</p>}
                            </InfoCard>
                        </div>
                    </div>
                </div>
                <div className="table-container">
                    <table className="rekap-table">
                        <thead>
                            <tr>
                                <th rowSpan="2" className="fixed-column">Hari</th>
                                {mentorNames.map((mentor, index) => (
                                    <th key={index} colSpan="3" className="mentor-header">{mentor}</th>
                                ))}
                            </tr>
                            <tr>
                                {mentorNames.map((_, index) => (
                                    <React.Fragment key={index}>
                                        <th>Kosong</th>
                                        <th>Sesi</th>
                                        <th className="mentor-divider">Siswa</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HARI.map((hari, rowIndex) => (
                                <tr key={hari} className={isSummaryRow(hari) ? 'summary-row' : ''}>
                                    <td className="fixed-column">{hari}</td>
                                    {data[rowIndex + 2]?.slice(1).map((value, colIndex) => (
                                        <td 
                                            key={colIndex}
                                            className={`${getCellClassName(hari, colIndex)} ${getDividerClassName(colIndex)}`.trim()}
                                        >
                                            {value || '0'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ContainerCarrot>
        </StyledRekapJadwalMentorPage>
    );
}

export default RekapJadwalMentorPage;
