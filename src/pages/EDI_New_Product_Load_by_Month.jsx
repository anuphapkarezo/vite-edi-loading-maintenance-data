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

export default function EDI_New_Product_Load_by_Month({ onSearch }) {
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

    const [selectedFromMonth, setSelectedFromMonth] = useState(null);
    const [selectedToMonth, setSelectedToMonth] = useState(null);

    const [distinctMonthSelect, setdistinctMonthSelect] = useState([]);
    const [distinctNewProduct, setdistinctNewProduct] = useState([]);

    const fetchMonthSelect = async () => {
      try {
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-generate-month-new-product`);
        const data  = response.data;
        setdistinctMonthSelect(data);
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } 
    };

    // const fetchNewProduct = async () => {
    //   try {
    //     setIsLoading(true);
    //     const response = await axios.get(
    //       `http://10.17.100.115:3001/api/smart_edi/filter-new-product-by-month?start_month=${formattedFrom}&end_month=${formattedTo}`
    //     );
    //     const data = response.data;
    //     setdistinctNewProduct(data);
    //     console.log('distinctNewProduct:' , distinctNewProduct);
        
    //   } catch (error) {
    //     console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
    //   } finally {
    //     setIsLoading(false); 
    //   }
    // };

    useEffect(() => {
      fetchMonthSelect();
    }, []);

    const handleFromMonthChange = (event, newValue) => {
      setSelectedFromMonth(newValue);
      setSelectedToMonth(null);
    }
    const handleToMonthChange = (event, newValue) => {
      setSelectedToMonth(newValue);
    }

    const getFirstDayOfMonth = (monthYear) => {
      const date = new Date(`01-${monthYear}`); // e.g. "01-Jan-2025"
      return date.toLocaleDateString('en-GB');  // "01/01/2025"
    };
    const getLastDayOfMonth = (monthYear) => {
      const date = new Date(`01-${monthYear}`);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0); // last day of the month
      return lastDay.toLocaleDateString('en-GB'); // "28/02/2025" or "29/02/2024"
    };

    const handleSearch = async () => {
      if (!selectedFromMonth?.month_year && !selectedToMonth?.month_year) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT RANGE MONTH.',
          confirmButtonText: 'OK'
        });
        return;
      }
      if (!selectedFromMonth?.month_year) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT FROM MONTH.',
          confirmButtonText: 'OK'
        });
        return;
      }
      if (!selectedToMonth?.month_year) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT TO MONTH.',
          confirmButtonText: 'OK'
        });
        return;
      }
      const FromMonth = selectedFromMonth.month_year
      const ToMonth = selectedToMonth.month_year

      const formattedFrom = getFirstDayOfMonth(FromMonth); // "01/01/2025"
      const formattedTo = getLastDayOfMonth(ToMonth);      // "28/02/2025"
      const fromDate = new Date(formattedFrom.split('/').reverse().join('-')); // "2025-03-01"
      const toDate = new Date(formattedTo.split('/').reverse().join('-'));     // "2025-01-31"
      if (toDate < fromDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "TO MONTH CAN'T BE EARLIER THAN FROM MONTH.",
          confirmButtonText: 'OK'
        });
        setSelectedFromMonth(null);
        setSelectedToMonth(null);
        return; // Exit function early
      } else {
        // fetchNewProduct();
          try {
            setIsLoading(true);
            const response = await axios.get(
              `http://10.17.100.115:3001/api/smart_edi/filter-new-product-by-month?start_month=${formattedFrom}&end_month=${formattedTo}`
            );
            const data = response.data;
            setdistinctNewProduct(data);
            // console.log('distinctNewProduct:' , distinctNewProduct);
            
          } catch (error) {
            console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
          } finally {
            setIsLoading(false); 
          }
;      }
    };

    const handleClear = async () => {
      setdistinctNewProduct([]);
      setSelectedFromMonth(null);
      setSelectedToMonth(null);
    };

    const exportToExcel = async () => {
      if (distinctNewProduct.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "NO DATA AVAILABLE TO EXPORT.",
          confirmButtonText: 'OK'
        });
        return;
      }
      // const formattedDateTime = `${year}${month}${date}${now.getHours()}${now.getMinutes()}`;
  
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Data');
  
      // Define headers
      const headers = [
          'ECN NUMBER', 'ITEM', 'PRODUCT', 'DETAIL OF REVISED', 'ISSUE DATE', 'ENG. NAME', 'DATE COMP', 'MONTH COMP',
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

        if (colNumber === 1) {
          worksheet.getColumn(colNumber).width = 10; // DETAILS column
        } else if (colNumber === 2) {
          worksheet.getColumn(colNumber).width = 5; // DETAILS column
        } else if (colNumber === 3) {
          worksheet.getColumn(colNumber).width = 15; // DETAILS column
        } else if (colNumber === 4) {
          worksheet.getColumn(colNumber).width = 70; // DETAILS column
        } else if (colNumber === 5) {
          worksheet.getColumn(colNumber).width = 10; // DETAILS column
        } else if (colNumber === 6) {
          worksheet.getColumn(colNumber).width = 25; // DETAILS column
        } else if (colNumber === 7) {
          worksheet.getColumn(colNumber).width = 10; // DETAILS column
        } else if (colNumber === 8) {
          worksheet.getColumn(colNumber).width = 10; // DETAILS column
        }
      });

      distinctNewProduct.forEach((agg_Row, index) => {
        const row = [
          agg_Row.ecn_no, 
          agg_Row.fac_item, 
          agg_Row.prd_name, 
          agg_Row.ecn_details || "",
          agg_Row.issue_date,
          agg_Row.eng_name,
          agg_Row.date_load_comp,
          agg_Row.month_load_comp    
        ];
      
        const excelRow = worksheet.addRow(row);
      
        const centerColumns = [1, 2, 5, 7, 8];
        centerColumns.forEach(colIndex => {
          excelRow.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
        });
        const fillColor = index % 2 === 0 ? 'D9D9D9' : 'FFFFFF';
      
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
            fgColor: { argb: fillColor }
          };
        });
      });
      // Save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const FromMonth = selectedFromMonth.month_year
      const ToMonth = selectedToMonth.month_year
      let fileName = ''
      if (FromMonth === ToMonth) {
        fileName = `New product of ${FromMonth}.xlsx`
      } else {
        fileName = `New product of ${FromMonth}-${ToMonth}.xlsx`
      }
      saveAs(blob, fileName);
    };

    const handleSendMail = () => {
      if (distinctNewProduct.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "NO DATA AVAILABLE TO SEND MAIL.",
          confirmButtonText: 'OK'
        });
        return;
      }
      const FromMonth = selectedFromMonth.month_year
      const ToMonth = selectedToMonth.month_year
      let SubjectName = ''
      if (FromMonth === ToMonth) {
        SubjectName = `New product of ${FromMonth}.`
      } else {
        SubjectName = `New product of ${FromMonth}-${ToMonth}.`
      }

      const recipients = [
        "massupa.p@th.fujikura.com"
      ];
      const ccRecipients = [
                            "Anupab.K@th.fujikura.com", 
                            "rungtawan.r@th.fujikura.com", 
                            "napaporn.t@th.fujikura.com"
                          ];

      const subject = SubjectName;
      const body = "Dear P' Kwang, \n\n" +
        "                    New Product as attached file. \n\n" +
        "PLANNING DIVISION. (SYSTEM TEAM)"
        ;
    
      if (recipients.length > 0) {
        const mailtoLink = `mailto:${recipients.join(";")}?cc=${ccRecipients.join(";")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "NO EMAIL RECIPIENTS FOUND.",
          confirmButtonText: 'OK'
        });
      }
    };

    return (
        <>
        <Navbar onToggle={handleNavbarToggle}/>  
        <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
          {/* {/* <Box sx={{height: 600 , marginLeft: '60px'}}> */}
          <div style={{height: 750, width: 1800, marginLeft: '40px', }}>
            <div style={{height: 60, width: 1800, display: "flex", flexDirection: "row", }}>
              {/* FROM MONTH */}
              <Autocomplete
                disablePortal
                options={distinctMonthSelect}
                getOptionLabel={(option) => option?.month_year || ''}
                value={selectedFromMonth}
                onChange={handleFromMonthChange}
                sx={{
                  width: 200,
                  backgroundColor: '#E8F9FF',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    textAlign: 'center',
                    '& input': {
                      textAlign: 'center',
                    },
                  },
                }}
                isOptionEqualToValue={(option, value) => option.month_year === value.month_year}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="FROM MONTH"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        border: 'none',
                        boxShadow: 'none',
                        color: 'blue',
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'blue',
                        fontSize: 18,
                        textAlign: 'center',
                      },
                    }}
                  />
                )}
              />

              {/* TO MONTH */}
              <Autocomplete
                disablePortal
                options={distinctMonthSelect}
                getOptionLabel={(option) => option?.month_year || ''}
                value={selectedToMonth}
                onChange={handleToMonthChange}
                sx={{
                  width: 200,
                  backgroundColor: '#E8F9FF',
                  marginLeft: '10px' , 
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    textAlign: 'center',
                    '& input': {
                      textAlign: 'center',
                    },
                  },
                }}
                isOptionEqualToValue={(option, value) => option.month_year === value.month_year}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="TO MONTH"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        border: 'none',
                        boxShadow: 'none',
                        color: 'blue',
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'blue',
                        fontSize: 18,
                        textAlign: 'center',
                      },
                    }}
                  />
                )}
              />

              <Button 
                  className="btn_hover"
                  onClick={handleSearch}
              >
                  <img src="/search.png" alt="" style={{ width: 50}} />
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
              <Button 
                  className="btn_hover"
                  onClick={handleSendMail}
              >
                  <img src="/send-mail.png" alt="" style={{ width: 50}} />
              </Button>
            </div>

            <div style={{
                        height: 680, 
                        width:1795 , 
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
                  <table style={{width:1770 , borderCollapse: 'collapse', }}>
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
                            ECN NUMBER
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
                            ITEM
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
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "90px",
                                border: 'solid black 1px',
                                }}
                          >
                            ISSUE DATE
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "230px",
                                border: 'solid black 1px',
                                }}
                          >
                            ENG. NAME
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "90px",
                                border: 'solid black 1px',
                                }}
                          >
                            DATE COMP
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#AED2FF",
                                height: "45px",
                                width: "90px",
                                border: 'solid black 1px',
                                }}
                          >
                            MONTH COMP
                        </th>
                      </tr>
                    </thead>
                  <tbody style={{fontSize: 15}}>
                    {distinctNewProduct.map((item, index) => (
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
                            {item.ecn_no || ""}
                        </td>
                        <td style={{border: 'solid black 1px', 
                                    textAlign: 'center',
                                  }}
                            >
                            {item.fac_item || ""}
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
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.issue_date || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    paddingLeft: 10,
                                  }}
                            >
                            {item.eng_name || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.date_load_comp || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.month_load_comp || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {/* </Box> */}
        </Box>
        </>
    )
}