import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Box, useBreakpointValue, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import DataTableComponent from '../Table';
import { FiChevronDown } from 'react-icons/fi';

function SistemTabs({ tabItems, tableData, headerItems, onAction, onCellChange, isLoading, getHeaderItemsForTab }) {
    const [tabIndex, setTabIndex] = useState(0);

    const isDesktop = useBreakpointValue({ base: false, md: true });
    const handleTabChange = (index) => {
        setTabIndex(index);
    };

    // Helper untuk mendapatkan header items yang tepat untuk tab
    const getHeaderForTab = (tabKey) => {
        if (getHeaderItemsForTab) {
            return getHeaderItemsForTab(tabKey);
        }
        return headerItems;
    };

    return (
        <Box 
            bg="white"
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
        >
            <Tabs 
                variant="unstyled"
                index={tabIndex} 
                onChange={(index) => setTabIndex(index)}
            >
                {isDesktop ? (
                    <TabList justifyContent="center">
                        {tabItems.map((tabName) => (
                            <Tab 
                                key={tabName.key}
                                mr={4}
                                px={5}
                                py={2}
                                fontWeight="semibold"
                                color="gray.500"
                                borderRadius="full"
                                _selected={{ 
                                    color: 'white', 
                                    bg: 'gray.800', 
                                    boxShadow: 'md' 
                                }}
                                _hover={{
                                    bg: 'gray.100'
                                }}
                            >
                                {tabName.label}
                            </Tab>
                        ))}
                    </TabList>
                ) : (
                    <Menu>
                        <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                            {tabItems[tabIndex].label}
                        </MenuButton>
                        <MenuList>
                            {tabItems.map((tabName, index) => (
                                <MenuItem 
                                    key={tabName.key} 
                                    onClick={() => handleTabChange(index)}
                                >
                                    {tabName.label}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                )}
                <TabPanels mt={6}>
                    {tabItems.map(tabName => (
                        <TabPanel key={`${tabName.key}-panel`} p={0}>
                            <DataTableComponent 
                                tableData={tableData[tabName.key] || []} 
                                headerItems={getHeaderForTab(tabName.key)} 
                                onAction={onAction} 
                                onCellChange={onCellChange}
                                isLoading={isLoading}
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default SistemTabs;