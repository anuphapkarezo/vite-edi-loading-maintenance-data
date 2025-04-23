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
    const handleSearch = async () => {
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

    const handleClear = () => {
      cancelLoading = true; // Cancel ongoing chunk loading
      setdistinctPrdRoutList([]);
    };

    const exportToExcel = async () => {
      // if (distinctPrdRoutList.length === 0) {
      //     alert("No data available to export.");
      //     return;
      // }

      try {
        cancelLoading = false;
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list`);
        const data = response.data;
        setdistinctPrdRoutList(data)
        // const chunks = chunkArray(data, 500);
        // let i = 0;
        // const loadChunk = () => {
        //   if (cancelLoading) return; // Stop loading if canceled
        //   setdistinctPrdRoutList(prev => [...prev, ...chunks[i]]);
        //   i++;
        //   if (i < chunks.length) {
        //     setTimeout(loadChunk, 0);
        //   }
        // };
        // loadChunk();
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } finally {
        setIsLoading(false); 
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Data');
  
      // Define headers
      const headers = [
          'ITEM TYPE', 'PRODUCT', 'CATEGORY', 'FACTORY', 'SEQ', 'UNIT', 'PROCESS', 'LT', 'WC', 'R/L', 'SHT-LOT', 'GATE',
      ];
  
      // Add headers to the worksheet
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 30;

      const headerStyle = {
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' } // Light blue fill DCE6F1
        },
        font: {
            name: 'Calibri',
            size: 8,
            bold: true,
            color: { argb: 'FFFFFF' },
        },
        alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
        }
      };

      headerRow.eachCell((cell, colNumber) => {
        cell.border = headerStyle.border;
        cell.fill = headerStyle.fill;
        cell.font = headerStyle.font;
        cell.alignment = headerStyle.alignment;

        if (colNumber === 2 || colNumber === 7) {
          worksheet.getColumn(colNumber).width = 15; // DETAILS column
        } else {
          worksheet.getColumn(colNumber).width = 10; // DETAILS column
        }
      });

      distinctPrdRoutList.forEach((agg_Row, index) => {
        const row = [
          agg_Row.item_type, 
          agg_Row.prd_name, 
          agg_Row.category, 
          agg_Row.factory_desc,
          agg_Row.seq,
          agg_Row.unit_desc,
          agg_Row.proc_disp,
          agg_Row.lt_day,
          agg_Row.wc,    
          agg_Row.roll_lot,    
          parseInt(agg_Row.sht_lot),
          agg_Row.gate_proc
        ];
      
        const excelRow = worksheet.addRow(row);
      
        const centerColumns = [2,7];
        centerColumns.forEach(colIndex => {
          excelRow.getCell(colIndex).alignment = { horizontal: 'middle', vertical: 'center' };
        });
        // const fillColor = index % 2 === 0 ? 'D9D9D9' : 'FFFFFF';
      
        // Loop over each cell in the row
        excelRow.eachCell((cell, colNumber) => {
          cell.font = {
            name: 'Calibri',
            size: 8
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          };

          if (colNumber === 12 && agg_Row.gate_proc === "Y") {
            // Yellow highlight for the rest of the row
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFA55D' } // 00FF9C
            };
          }
        });
      });
      // Save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `FPC Product routing list.xlsx`);
      setIsLoading(false); 
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    return (
        <>
        <Navbar onToggle={handleNavbarToggle}/>  
        <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
          {/* {/* <Box sx={{height: 600 , marginLeft: '60px'}}> */}
          <div style={{height: 750, width: 1800, marginLeft: '40px', }}>
            <div style={{height: 70, width: 1800, display: "flex", flexDirection: "row", }}>
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
              >
                  <img src="/excel.png" alt="" style={{ width: 60}} />
              </Button>
            </div>

            <div style={{
                        height: 680, 
                        width:1275 , 
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
                  <table style={{width:1250 , borderCollapse: 'collapse', }}>
                    <thead style={{fontSize: 16, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                      <tr>
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
                                width: "50px",
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
          </div>
        </Box>
        </>
    )
}