import { Tabs, TabList, Tab, TabPanels, TabPanel, Box } from '@chakra-ui/react';
import DataTableComponent from '../Table';

function SistemTabs({ tabItems, tableData, headerItems, onAction, onCellChange }) {
    return (
        <Box 
            bg="white"
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
        >
            <Tabs variant="soft-rounded" colorScheme="gray">
                <TabList mb={4} justifyContent="center">
                    {tabItems.map((tab) => (
                        <Tab 
                            key={tab.key}
                            fontWeight="semibold"
                            _selected={{ 
                                color: 'white', 
                                bg: 'gray.800'
                            }}
                        >
                            {tab.label}
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {tabItems.map((tab) => (
                        <TabPanel key={`${tab.key}-panel`} p={0}>
                            <DataTableComponent 
                                tableData={tableData[tab.key] || []} 
                                headerItems={headerItems} 
                                onAction={onAction} 
                                onCellChange={onCellChange} 
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default SistemTabs;