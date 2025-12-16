import ContainerCarrot from "@/components/Container";
import { useQuery } from "@tanstack/react-query";
import { getDaftarKelasTersedia } from "@/features/cso/csoApiService";
import { StyledDaftarKelasTersediaPage } from "./DaftarKelasTersedia.styled";
import { HEADER_CONFIG, TOTAL_COLUMNS } from "./DaftarKelas.config";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useColorMode } from "@chakra-ui/react";

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function DaftarKelasTersediaPage() {
    const { colorMode } = useColorMode();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['daftarKelasTersedia'],
        queryFn: getDaftarKelasTersedia,
    });

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledDaftarKelasTersediaPage data-theme={colorMode}>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daftar Kelas Tersedia</h1>
                    </div>
                </div>
                <div className="table-container">
                    <table className="jadwal-table">
                        <thead>
                            <tr>
                                <th className="fixed-column" rowSpan={2}>Hari</th>
                                {HEADER_CONFIG.map((header, index) => (
                                    <th key={index} colSpan={header.colspan} className="main-header">
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {HEADER_CONFIG.flatMap(header => header.subHeaders).map((subHeader, index) => (
                                    <th key={index} className="sub-header">{subHeader}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                HARI.map((hari) => (
                                    <tr key={hari}>
                                        <td className="fixed-column">{hari}</td>
                                        {Array.from({ length: TOTAL_COLUMNS }).map((_, colIndex) => (
                                            <td key={colIndex}>
                                                <Skeleton height="20px" width="80%" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                HARI.map((hari, rowIndex) => (
                                    <tr key={hari}>
                                        <td className="fixed-column">{hari}</td>
                                        {Array.from({ length: TOTAL_COLUMNS }).map((_, colIndex) => (
                                            <td key={colIndex}>
                                                {data?.[rowIndex]?.[colIndex] && data[rowIndex][colIndex] !== '-' ? (
                                                    data[rowIndex][colIndex].split(', ').map((jam, i) => (
                                                        <div key={i} className="jadwal-item">{jam}</div>
                                                    ))
                                                ) : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ContainerCarrot>
        </StyledDaftarKelasTersediaPage>
    );
}

export default DaftarKelasTersediaPage;
