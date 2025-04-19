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

export default function EDI_Product_Loading_Routing_Today({ onSearch }) {
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

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const formattedDateTime = date +'/'+ month +'/'+ year;
    // const formattedDateTime = `${year}${month}${date}`;

    const [isLoading, setIsLoading] = useState(false);

    const [isNavbarOpen, setIsNavbarOpen] = React.useState(false);
  
    const handleNavbarToggle = (openStatus) => {
        setIsNavbarOpen(openStatus);
    };

    const [distinctPrdLoadToday, setdistinctPrdLoadToday] = useState([]);
    const [distinctDailytrend, setdistinctDailytrend] = useState([]);

    const fetchPrdLoadToday = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-product-loading-routing-today`);
        const data  = response.data;
        setdistinctPrdLoadToday(data);
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } finally {
        setIsLoading(false); 
      }
    };

    const fetchPrdDailytrend = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-product-daily-trend-loading-routing-chart`);
        const data  = response.data;
        setdistinctDailytrend(data);
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } finally {
        setIsLoading(false); 
      }
    };

    useEffect(() => {
      fetchPrdLoadToday();
      fetchPrdDailytrend();
    }, []);

    const handleRefresh = () => {
      fetchPrdLoadToday();
      fetchPrdDailytrend();
    };

    const chartOptions = {
      chart: {
        type: 'bar',
        height: 350,
      },
      title: {
        text: 'Daily trend loading routing [10 Days]',
        align: 'center',
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          distributed: true,
          dataLabels: {
            position: 'top', // Show values on top
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: val => val,
        offsetY: -25,
        style: {
          fontSize: '14px',
          colors: ['#333'],
        },
      },
      xaxis: {
        categories: distinctDailytrend.map(item => item.date_load_comp),
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        title: {
          text: 'Number of products',
        },
        axisBorder: {
          show: true,
          color: '#9EC6F3', // y-axis line color > 123458
        },
        axisTicks: {
          show: true,
          color: '#000', // y-axis tick marks color
        },
        labels: {
          style: {
            colors: '#000', // y-axis label color (optional)
            fontSize: '12px',
          },
        },
      },
      grid: {
        borderColor: '#9EC6F3', // horizontal grid lines (y-axis lines) > 123458
        strokeDashArray: 1,  // solid line
      },
      fill: {
        // colors: ['#5DADE2'],
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#DBDBDB'], // 👈 black border
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} Product`,
        },
      },
    };
    // const totalLoad = distinctDailytrend.reduce((sum, item) => sum + Number(item.count_date), 0);
    const chartSeries = [
      {
        name: `Load `,
        data: distinctDailytrend.map(item => Number(item.count_date)),
      },
    ];
    

    const exportToExcel = async () => {
      if (distinctPrdLoadToday.length === 0) {
          alert("No data available to export.");
          return;
      }
      // const formattedDateTime = `${year}${month}${date}${now.getHours()}${now.getMinutes()}`;
  
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Data');
  
      // Define headers
      const headers = [
          'No.', 'DATE', 'CASE', 'ECN NUMBER', 'PRODUCT', 'DETAIL OF REVISED',
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
            fgColor: { argb: 'DCE6F1' } // Light blue fill
        },
        // font: {
        //     bold: true
        // },
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

        if (colNumber === 1) {
          worksheet.getColumn(colNumber).width = 5; // DETAILS column
        } else if (colNumber === 2) {
          worksheet.getColumn(colNumber).width = 15; // DETAILS column
        } else if (colNumber === 3) {
          worksheet.getColumn(colNumber).width = 5; // DETAILS column
        } else if (colNumber === 4) {
          worksheet.getColumn(colNumber).width = 15; // DETAILS column
        } else if (colNumber === 5) {
          worksheet.getColumn(colNumber).width = 20; // DETAILS column
        } else if (colNumber === 6) {
          worksheet.getColumn(colNumber).width = 100; // DETAILS column
        }
      });

      distinctPrdLoadToday.forEach((agg_Row, index) => {
        const row = [
          index + 1, 
          agg_Row.date_load_comp, 
          agg_Row.case_type, 
          agg_Row.ecn_no, 
          agg_Row.prd_name, 
          agg_Row.ecn_details || ""
        ];
      
        const excelRow = worksheet.addRow(row);
      
        const centerColumns = [1, 2, 3, 4 ];
        centerColumns.forEach(colIndex => {
          excelRow.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
        });
      
        // Always set background color for wait_status column (6)
        // excelRow.getCell(6).fill = {
        //   type: 'pattern',
        //   pattern: 'solid',
        //   fgColor: { argb: 'FFF085' }
        // };
      
        // Loop over each cell in the row
        excelRow.eachCell((cell, colNumber) => {
          // Apply border
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          if (colNumber === 3 && agg_Row.case_type === "A") {
            // Yellow highlight for the rest of the row
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '00FF9C' } // 00FF9C
            };
          } else if (colNumber === 3 && agg_Row.case_type === "B") {
            // Yellow highlight for the rest of the row
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F1EFEC' } // F1EFEC
            };
          }
        });
      });
      // Save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Product loading routing ${formattedDateTime}.xlsx`);
    };

    return (
        <>
        <Navbar onToggle={handleNavbarToggle}/>  
        <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
            <Box sx={{height: 600 , marginLeft: '60px'}}>
            {/* <Button 
                className="btn_hover"
                // onClick={handleRefresh}
            >
                <img src="/refresh.png" alt="" style={{ width: 50}} />
            </Button> */}
            <div style={{height: 360, width:1400, display: "flex", flexDirection: "row",}}>

              <div style={{
                        height: 350, 
                        width:1300 , 
                        // marginRight: 20, 
                        // marginTop: 5 ,
                        // marginBottom: 5,
                        overflowY: 'auto', 
                        overflowX: 'hidden',
                        // border: 'solid black 1px',
                      }}>
              {isLoading ? (
                <Custom_Progress />
              ) : (
                  <table style={{width:1275 , borderCollapse: 'collapse',}}>
                    <thead style={{fontSize: 14, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                      <tr>
                      <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "40px",
                                border: 'solid black 1px',
                                }}
                          >
                            No.
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            DATE
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "50px",
                                border: 'solid black 1px',
                                }}
                          >
                            CASE
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "120px",
                                border: 'solid black 1px',
                                }}
                          >
                            ECN NUMBER
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "140px",
                                border: 'solid black 1px',
                                }}
                          >
                            PRODUCT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "600px",
                                border: 'solid black 1px',
                                }}
                          >
                            DETAIL OF REVISED
                        </th>
                      </tr>
                    </thead>
                  <tbody style={{fontSize: 15}}>
                    {distinctPrdLoadToday.map((item, index) => (
                        <tr key={index}>
                          <td style={{
                              border: 'solid black 1px',
                              textAlign: 'center',
                              height: "30px",
                            }}>
                              {index + 1}
                            </td>
                            <td style={{border: 'solid black 1px', 
                                        textAlign: 'center',
                                        height: "30px",
                                      }}
                                >
                                {item.date_load_comp || ""}
                            </td>
                            <td style={{border: 'solid black 1px', 
                                        textAlign: 'center',
                                        backgroundColor: item.case_type === "A" ? "#00FF9C" : 
                                                         item.case_type === "B" ? "#F1EFEC" : "transparent",
                                      }}
                                >
                                {item.case_type || ""}
                            </td>
                            <td style={{border: 'solid black 1px', 
                                        textAlign: 'center',
                                      }}
                                >
                                {item.ecn_no || ""}
                            </td>
                            <td style={{border: 'solid black 1px',
                                        paddingLeft: 10,
                                      }}
                                >
                                {item.prd_name || ""}
                            </td>
                            <td
                                style={{ 
                                    border: 'solid black 1px', 
                                    paddingLeft: 10, 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    maxWidth: '550px' ,
                                    cursor: item.ecn_details ? "pointer" : "default" ,
                                }}
                                onMouseDown={(e) => e.currentTarget.style.whiteSpace = "normal"}
                                onMouseUp={(e) => e.currentTarget.style.whiteSpace = "nowrap"}
                                onMouseLeave={(e) => e.currentTarget.style.whiteSpace = "nowrap"} // Reset if mouse leaves
                                >
                                {item.ecn_details?.replace(/[\r\n]+/g, " ") || ""}
                            </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
                
              )}
            </div>
            <div style={{width: 100, }}>
              <Button 
                  className="btn_hover"
                  onClick={handleRefresh}
              >
                  <img src="/refresh.png" alt="" style={{ width: 60, marginLeft: 10}} />
              </Button>
              <Button 
                  className="btn_hover"
                  onClick={exportToExcel}
              >
                  <img src="/excel.png" alt="" style={{ width: 60, marginLeft: 10}} />
              </Button>
            </div>
          </div>

          <div style={{
                      height: 400, 
                      width:1300 , 
                      marginRight: 20, 
                      marginTop: 15 ,
                      overflowY: 'auto', 
                      overflowX: 'hidden',
                      border: 'solid #123458 1px',
                      backgroundColor: '#EFEFEF',
                      paddingTop: 10 ,
                      paddingLeft: 15 ,
                    }}>
            {isLoading ? (
              <Custom_Progress />
            ) : (
              <Chart options={chartOptions} series={chartSeries} type="bar" height={370} />
            )}
          </div>
          </Box>
        </Box>
        </>
    )
}