import React, { useState, useEffect , useRef } from "react";
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import './styles/EDI_Product_Special_List.css'; // Import the CSS file
import EDI_Search_Product_Special_List from "../components/SearchGroup/EDI_Search_Product_Special_List";

export default function EDI_Product_Special_List({ onSearch }) {
    const [isNavbarOpen, setIsNavbarOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCleardata, setSelectedCleardata] = useState(null);

    const [distinctDataSpecialList, setDistinctDataSpecialList] = useState([]);

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

    const fetchDataSpecialList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-data-special-list?prd_name=${selectedProduct}`);
        const data = await response.data;
        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: index, // You can use a better unique identifier here if available
        }));
        setDistinctDataSpecialList(rowsWithId);
        } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data user master NAP');
        } finally {
          setIsLoading(false); // Set isLoading back to false when fetch is complete
        }
    };

    const columns_special_list = [
      { field: 'prd_name', headerName: 'PRODUCT NAME', width: 155 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'left'},
      { field: 'special_details', headerName: 'DETAILS OF MANUAL', width: 540 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'left'},
      { field: 'special_rev', headerName: 'REVISION', width: 100 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'update_date', headerName: 'UPDATE DATE', width: 150 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center'},
      { field: 'special_status', headerName: 'STATUS', width: 150 , headerAlign: 'center' , headerClassName: 'bold-header' , align: 'center',
        renderCell: (params) => {
          let backgroundColor = '';
          let fontColor = '';

          switch (params.value) {
            case 'ACTIVE':
              backgroundColor = 'lightgreen';
              fontColor = 'black';
              break;
            case 'INACTIVE':
              backgroundColor = '#FADA7A';
              fontColor = 'black';
              break;
            default:
              break;
          }
          return (
            <div style={{ backgroundColor: backgroundColor, width: '100%', height: '100%', textAlign: 'center' , paddingTop: 5, color: fontColor}}>
              {params.value}
            </div>
          );
        }
      },
    ]

    useEffect(() => {
      fetchDataSpecialList();
      if (selectedCleardata) {
        setDistinctDataSpecialList([])
      } 
    }, [selectedProduct, selectedCleardata]);

    return (
        <>
          <Navbar onToggle={handleNavbarToggle}/>
          <Box marginLeft={isNavbarOpen ? "220px" : 4} marginTop={10}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <EDI_Search_Product_Special_List
                  onSearch={(queryParams) => {
                    setSelectedProduct(queryParams.product);
                    setSelectedCleardata(queryParams.clear_data);
                  }}
                />
              </div>
              <Box sx={{width: 1120 , height: 715, backgroundColor: '#E8F9FF', borderRadius: 3, }}>
                {isLoading ? (
                  <Custom_Progress />
                ) : (
                  <>
                    <DataGrid
                      columns={columns_special_list}
                      rows={distinctDataSpecialList}
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
                        
                      // }}
                      // getRowClassName={(params) =>
                      //   params.row.special_status === 'INACTIVE' ? 'inactive-row' : 'active-row'
                      // }
                      // sx={{
                      //   '& .MuiDataGrid-row.active-row': {
                      //     backgroundColor: '#B9F3E4', // Green for active rows
                      //     color: 'black',
                      //   },
                      //   '& .MuiDataGrid-row.inactive-row': {
                      //     backgroundColor: '#F6D6D6', // Red for inactive rows
                      //     color: 'black',
                      //   },
                      }}
                    />
                  </>
                )}
              </Box>
          </Box>
        </>
    );
}