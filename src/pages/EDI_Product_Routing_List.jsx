import React, { useState, useEffect , useRef } from "react";
import Box from '@mui/material/Box';
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import './styles/EDI_Product_Special_List.css'; // Import the CSS file
import Chart from 'react-apexcharts';
import ReactFileReader from 'react-file-reader';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import { Autocomplete, TextField } from "@mui/material";
import EDI_Comp_Search_Ecn_Details from "../components/SearchGroup/EDI_Comp_Search_Ecn_Details";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function EDI_Product_Routing_List({ onSearch }) {
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

    const [isLoading, setIsLoading] = useState(false);

    const [isNavbarOpen, setIsNavbarOpen] = React.useState(false);

    const [distinctPrdRoutList, setdistinctPrdRoutList] = useState([]);
    const [distinctFactoryList, setdistinctFactoryList] = useState([]);

    const [SelectedFactory, setSelectedFactory] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit, setLimit] = useState(100); // Records per page

    const handleNavbarToggle = (openStatus) => {
        setIsNavbarOpen(openStatus);
    };

    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    let cancelLoading = false;
    const handleSearch_first = async () => {
      try {
        cancelLoading = false;
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list`);
        const data = response.data;
        const chunks = chunkArray(data, 500);
        let i = 0;
        const loadChunk = () => {
          if (cancelLoading) return; // Stop loading if canceled
          setdistinctPrdRoutList(prev => [...prev, ...chunks[i]]);
          i++;
          if (i < chunks.length) {
            setTimeout(loadChunk, 0);
          }
        };
        loadChunk();
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } finally {
        setIsLoading(false); 
      }
    };

    const fetchFactory = async () => {
      try {
        const response = await axios.get(
          "http://10.17.100.115:3001/api/smart_edi/filter-factory-list-routing-list"
        );
        const data = response.data;
        setdistinctFactoryList(data);
      } catch (error) {
        console.error(`Error fetching distinct data Period List: ${error}`);
      }
    };

    const handleFactoryChange = (event, newValue) => {
      setSelectedFactory(newValue);
    };

    useEffect(() => {
      fetchFactory();
      if (distinctPrdRoutList.length > 0) { // Only search if we have data already
        setCurrentPage(1);
        handleSearch(1, limit);
      }
    }, [limit]);

    const handleSearch = async (page = 1, pageLimit = limit) => {
      try {
        // Check if at least one factory is selected
        if (!SelectedFactory || SelectedFactory.length === 0) {
          Swal.fire({
            title: 'Factory Required',
            text: 'Please select at least one factory to search',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return;
        }

        cancelLoading = false;
        setIsLoading(true);
        
        // Build query parameters
        // let queryParams = `page=${page}&limit=${limit}`;
        let queryParams = `page=${page}&limit=${pageLimit}`;
        
        // Add factory filter
        const factoryIds = SelectedFactory.map(factory => factory.factory_desc).join(',');
        
        queryParams += `&factories=${encodeURIComponent(factoryIds)}`;
        
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list-new?${queryParams}`);
        const data = response.data;
        
        // If using pagination response structure
        if (data.pagination) {
          setdistinctPrdRoutList(data.data);
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalRecords(data.pagination.totalRecords);
        } else {
          // If backend returns direct array (fallback)
          setdistinctPrdRoutList(data);
        }
        
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
        
        // Handle specific error responses
        if (error.response && error.response.status === 400) {
          Swal.fire({
            title: 'Factory Required',
            text: error.response.data.message || 'Please select at least one factory to search',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Update the exportToExcel function to also check for factory selection

    const handleClear = () => {
      cancelLoading = true; // Cancel ongoing chunk loading
      setdistinctPrdRoutList([]);
      setSelectedFactory([]);
      setCurrentPage(1); // Reset to first page
      setTotalPages(1);  // Reset total pages to 1 (this will disable Next button)
      setTotalRecords(0);   // Reset total records to 0
      setLimit(100);        // Reset to default limit
    };

    
    const formatNumberWithCommas = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Add this function to your component
    const exportToExcel = async () => {
      try {
        if (!SelectedFactory || SelectedFactory.length === 0) {
          Swal.fire({
            title: 'Factory Required',
            text: 'Please select at least one factory to export',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return;
        }

        setIsLoading(true);
        
        // Show progress dialog
        Swal.fire({
          title: 'Exporting Data',
          html: 'Fetching data...<br>Progress: <b>0%</b>',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const factoryIds = SelectedFactory.map(factory => factory.factory_desc).join(',');
        const chunkSize = 10000; // Fetch 10k records at a time
        let allData = [];
        let page = 1;
        let hasMoreData = true;
        let totalRecords = 0;

        // Fetch all data in chunks
        while (hasMoreData) {
          try {
            const response = await axios.get(
              `http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list-new?page=${page}&limit=${chunkSize}&factories=${encodeURIComponent(factoryIds)}`
            );
            
            const data = response.data;
            const records = data.data || data;
            
            if (records && records.length > 0) {
              allData = [...allData, ...records];
              
              // Get total records from first response
              if (page === 1 && data.pagination) {
                totalRecords = data.pagination.totalRecords;
              }
              
              // Update progress
              const progress = totalRecords > 0 ? 
                Math.round((allData.length / totalRecords) * 50) : // 50% for data fetching
                Math.round((page * chunkSize / (allData.length + chunkSize)) * 50);
              
              Swal.update({
                html: `Fetching data...<br>Progress: <b>${progress}%</b><br>Loaded: ${allData.length.toLocaleString()} records`
              });
              
              page++;
              
              // Check if we have more data
              if (data.pagination) {
                hasMoreData = page <= data.pagination.totalPages;
              } else {
                hasMoreData = records.length === chunkSize;
              }
              
              // Small delay to prevent server overload
              await new Promise(resolve => setTimeout(resolve, 50));
            } else {
              hasMoreData = false;
            }
          } catch (error) {
            console.error(`Error fetching chunk ${page}:`, error);
            if (allData.length === 0) {
              throw error; // If no data fetched at all, throw error
            }
            hasMoreData = false; // Continue with partial data
          }
        }

        if (allData.length === 0) {
          throw new Error('No data found to export');
        }

        // Update progress to show Excel generation
        Swal.update({
          html: `Generating Excel file...<br>Processing ${allData.length.toLocaleString()} records`
        });

        // Create Excel file using ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Product Routing List');

        // Add headers
        worksheet.columns = [
          { header: 'No.', key: 'no', width: 5 },
          { header: 'ITEM TYPE', key: 'item_type', width: 10 },
          { header: 'PRODUCT', key: 'prd_name', width: 20 },
          { header: 'CATEGORY', key: 'category', width: 10 },
          { header: 'FACTORY', key: 'factory_desc', width: 10 },
          { header: 'SEQ', key: 'seq', width: 10 },
          { header: 'UNIT', key: 'unit_desc', width: 10 },
          { header: 'PROCESS', key: 'proc_disp', width: 10 },
          { header: 'LT', key: 'lt_day', width: 10 },
          { header: 'WC', key: 'wc', width: 10 },
          { header: 'R/L', key: 'roll_lot', width: 5 },
          { header: 'SHT LOT', key: 'sht_lot', width: 10 },
          { header: 'GATE', key: 'gate_proc', width: 10 }
        ];

        // Style headers - UPDATED SECTION
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Apply background color only to columns 1-13 (header cells with content)
        for (let col = 1; col <= 13; col++) {
          const cell = headerRow.getCell(col);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4D55CC' }
          };
        }

        // Add data in smaller chunks to prevent memory issues - UPDATED SECTION
        const processingChunkSize = 5000;
        for (let i = 0; i < allData.length; i += processingChunkSize) {
          const chunk = allData.slice(i, i + processingChunkSize);
          const rows = chunk.map((item, index) => ({
            no: i + index + 1,
            item_type: item.item_type || '',
            prd_name: item.prd_name || '',
            category: item.category || '',
            factory_desc: item.factory_desc || '',
            seq: item.seq || '',
            unit_desc: item.unit_desc || '',
            proc_disp: item.proc_disp || '',
            lt_day: item.lt_day || '',
            wc: item.wc || '',
            roll_lot: item.roll_lot || '',
            sht_lot: parseInt(item.sht_lot) || '',
            gate_proc: item.gate_proc || ''
          }));
          
          const addedRows = worksheet.addRows(rows);
          
          // Style GATE column cells with "Y" value - NEW SECTION
          addedRows.forEach((row, rowIndex) => {
            const gateCell = row.getCell('gate_proc'); // Column M (GATE)
            if (gateCell.value === 'Y') {
              gateCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFA55D' } // Orange color same as table
              };
            }
          });
          
          // Update progress (50% + processing progress)
          const processingProgress = Math.round(((i + processingChunkSize) / allData.length) * 50);
          Swal.update({
            html: `Generating Excel file...<br>Progress: <b>${50 + Math.min(processingProgress, 50)}%</b>`
          });
          
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Generate and download file
        Swal.update({
          html: 'Finalizing Excel file...<br>Almost done!'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Create filename with format: ProductRoutingList_YYYYMMDD_HHMMSS.xlsx
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
        const fileName = `ProductRoutingList_${dateStr}_${timeStr}.xlsx`;

        saveAs(blob, fileName);

        Swal.fire({
          title: 'Success!',
          text: `Excel file with ${allData.length.toLocaleString()} records has been downloaded successfully`,
          icon: 'success',
          timer: 1500, // ปิดเองใน 1.5 วินาที
          confirmButtonText: "OK",
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Export error:', error);
        Swal.fire({
          title: 'Export Failed',
          text: error.message || 'Failed to export data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsLoading(false);
      }
    };


    return (
        <>
        <Navbar onToggle={handleNavbarToggle}/>  
        <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
          {/* {/* <Box sx={{height: 600 , marginLeft: '60px'}}> */}
          <div style={{height: 750, width: 1800, marginLeft: '40px', }}>
            <div style={{height: 70, width: 1800, display: "flex", flexDirection: "row", }}>
              <Autocomplete
                multiple
                disablePortal
                // freeSolo
                id="combo-box-demo-product"
                size="medium"
                options={distinctFactoryList}
                getOptionLabel={(option) => option && option.factory_desc}
                value={SelectedFactory}
                onChange={handleFactoryChange}
                sx={{ width: 450, height: 50, marginTop: 1, }}
                renderInput={(params) => (
                  <TextField {...params} label="Factory" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.factory_desc === value.factory_desc
                }
              />
              <Button 
                  className="btn_hover"
                  onClick={handleSearch}
              >
                  <img src="/search.png" alt="" style={{ width: 50, marginLeft: 5, }} />
              </Button>
              <Button 
                  className="btn_hover"
                  onClick={handleClear}
              >
                  <img src="/clear1.png" alt="" style={{ width: 50}} />
              </Button>
              <Button 
                  className="btn_hover"
                  onClick={exportToExcel}
                  disabled={isLoading}
              >
                  <img src="/excel.png" alt="" style={{ width: 60}} />
              </Button>
            </div>

            <div style={{
                        height: 650, 
                        width:1225 , 
                        // marginRight: 20, 
                        marginTop: 5 ,
                        // marginBottom: 5,
                        overflowY: 'auto', 
                        overflowX: 'hidden',
                        // border: 'solid black 1px',
                      }}>
              {isLoading ? (
                <Custom_Progress />
              ) : (
                  <table style={{width:1200 , borderCollapse: 'collapse', }}>
                    <thead style={{fontSize: 16, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                      <tr>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "30px",
                                border: 'solid white 1px',
                                }}
                          >
                            No.
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "60px",
                                border: 'solid white 1px',
                                }}
                          >
                            ITEM TYPE
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "120px",
                                border: 'solid white 1px',
                                }}
                          >
                            PRODUCT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "30px",
                                border: 'solid white 1px',
                                }}
                          >
                            CATEGORY
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "50px",
                                border: 'solid white 1px',
                                }}
                          >
                            FACTORY
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            SEQ
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "60px",
                                border: 'solid white 1px',
                                }}
                          >
                            UNIT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "40px",
                                border: 'solid white 1px',
                                }}
                          >
                            PROCESS
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            LT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            WC
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            R/L
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "55px",
                                border: 'solid white 1px',
                                }}
                          >
                            SHT LOT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "50px",
                                border: 'solid white 1px',
                                }}
                          >
                            GATE
                        </th>
                      </tr>
                    </thead>
                  <tbody style={{fontSize: 16}}>
                    {distinctPrdRoutList.map((item, index) => (
                      <tr key={index}>
                        <td style={{border: 'solid black 1px', 
                                    textAlign: 'center',
                                  }}
                            >
                            {index + 1}
                        </td>
                        <td style={{border: 'solid black 1px', 
                                    textAlign: 'center',
                                  }}
                            >
                            {item.item_type || ""}
                        </td>
                        <td style={{border: 'solid black 1px', 
                                    textAlign: 'left',
                                    paddingLeft : 10 ,
                                    height: "30px",
                                  }}
                            >
                            {item.prd_name || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.category || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.factory_desc || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.seq || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.unit_desc || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'left',
                                    paddingLeft : 10 ,
                                  }}
                            >
                            {item.proc_disp || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.lt_day || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.wc || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.roll_lot || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                             {parseInt(item.sht_lot)}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.gate_proc === "Y" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.gate_proc || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pagination Controls */}
            <div style={{ 
              width: 1225,
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: '20px',
              gap: '10px'
            }}>
              <button 
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage <= 1 ? '#ccc' : '#3674B5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                {'<'}
              </button>
              
              <span style={{ margin: '0 15px', fontSize: '16px' }}>
                Page {formatNumberWithCommas(currentPage)} of {formatNumberWithCommas(totalPages)}
                {/* Page {formatNumberWithCommas(currentPage)} of {formatNumberWithCommas(totalPages)} ({formatNumberWithCommas(totalRecords)} total records) */}
              </span>
              
              <button 
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage >= totalPages ? '#ccc' : '#3674B5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                {'>'}
              </button>
              
              {/* Page size selector */}
              <select 
                value={limit} 
                // onChange={async (e) => {
                //   const newLimit = parseInt(e.target.value);
                //   setLimit(newLimit);
                //   setCurrentPage(1); // Reset to first page
                //   await new Promise(resolve => setTimeout(resolve, 0));
                //   handleSearch(1); // Load first page with new limit
                // }}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  setLimit(newLimit);
                  setCurrentPage(1);
                  // The useEffect will handle the search when limit changes
                }}
                style={{
                  padding: '8px',
                  marginLeft: '15px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
               </select>
            </div>

          </div>
        </Box>
        </>
    )
}