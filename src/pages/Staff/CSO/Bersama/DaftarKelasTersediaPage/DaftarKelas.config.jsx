export const HEADER_CONFIG = [
    { label: 'Foundation', colspan: 2, subHeaders: ['Offline', 'Online'] },
    { label: 'Drawing', colspan: 6, subHeaders: ['DV Offline', 'DV Online', 'M Offline', 'M Online', 'P Offline', 'P Online'] },
    { label: 'Painting', colspan: 6, subHeaders: ['DV Offline', 'DV Online', 'M Offline', 'M Online', 'P Offline', 'P Online'] },
    { label: 'Digital', colspan: 6, subHeaders: ['DV Offline', 'DV Online', 'M Offline', 'M Online', 'P Offline', 'P Online'] },
    { label: 'Portfolio', colspan: 2, subHeaders: ['Offline', 'Online'] },
];

export const TOTAL_COLUMNS = HEADER_CONFIG.reduce((acc, curr) => acc + curr.colspan, 0);