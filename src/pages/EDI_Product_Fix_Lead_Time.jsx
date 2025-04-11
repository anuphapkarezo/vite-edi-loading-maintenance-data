import React, { useState, useEffect , useRef } from "react";
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import './styles/EDI_Product_Fix_Lead_Time.css'; // Import the CSS file
import EDI_Search_Product_Fix_Leadtime from "../components/SearchGroup/EDI_Search_Product_Fix_Leadtime";


export default function EDI_Product_Fix_Lead_Time({ onSearch }) {
    const [isNavbarOpen, setIsNavbarOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCleardata, setSelectedCleardata] = useState(null);

    const [distinctDataProductFixLT, setDistinctDataProductFixLT] = useState([]);

    const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({});
  
    const [filterModel, setFilterModel] = React.useState({
      items: [],
      quickFilterExcludeHiddenColumns: true,
      quickFilterValues: [''],
    });

    const Custom_Progress = () => (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div className="loader"></div>
      <div style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>Loading Data...</div>
        <style jsx>{`
          .loader {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

    const handleNavbarToggle = (openStatus) => {
      setIsNavbarOpen(openStatus);
    };

    const fetchDataProductFixLT = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-data-master-date-product-fix-lead-time?prd_name=${selectedProduct}`);
        const data = await response.data;
        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: index, // You can use a better unique identifier here if available
        }));
        setDistinctDataProductFixLT(rowsWithId);
        } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data user master NAP');
        } finally {
          setIsLoading(false); // Set isLoading back to false when fetch is complete
        }
    };

    const columns_product_fix = [
      { field: 'seq', headerName: 'SEQ', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'product', headerName: 'PRODUCT NAME', width: 170 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'left'},
      { field: 'factory', headerName: 'FACTORY', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'proc', headerName: 'PROCESS', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'left'},
      { field: 'unit', headerName: 'UNIT', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'item', headerName: 'ITEM TYPE', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'fix_day', headerName: 'FIXED DAY', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center', cellClassName: 'orange-bg',},
    ]

    useEffect(() => {
      fetchDataProductFixLT();
      if (selectedCleardata) {
        setDistinctDataProductFixLT([])
      } 
    }, [selectedProduct, selectedCleardata]);

    return (
        <>
          <Navbar onToggle={handleNavbarToggle}/>
          <Box marginLeft={isNavbarOpen ? "220px" : 4} marginTop={10}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <EDI_Search_Product_Fix_Leadtime
                  onSearch={(queryParams) => {
                    setSelectedProduct(queryParams.product);
                    setSelectedCleardata(queryParams.clear_data);
                  }}
                />
              </div>
              <Box sx={{width: 805 , height: 715, backgroundColor: '#E8F9FF', borderRadius: 3, }}>
                {isLoading ? (
                  <Custom_Progress />
                ) : (
                  <>
                    <DataGrid
                      columns={columns_product_fix}
                      rows={distinctDataProductFixLT}
                      slots={{ toolbar: GridToolbar }}
                      filterModel={filterModel}
                      onFilterModelChange={(newModel) => setFilterModel(newModel)}
                      slotProps={{ toolbar: { showQuickFilter: true } }}
                      columnVisibilityModel={columnVisibilityModel}
                      onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibilityModel(newModel)
                      }
                      getRowHeight={() => 37.5}
                      sx={{
                        '& .MuiDataGrid-row': {
                          backgroundColor: '#FFFFDD', // Change to desired color
                        },
                      }}
                    />
                  </>
                )}
              </Box>
          </Box>
        </>
    );
}