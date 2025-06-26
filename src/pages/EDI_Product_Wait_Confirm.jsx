import React, { useState, useEffect , useRef } from "react";
import Box from '@mui/material/Box';
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import './styles/EDI_Product_Special_List.css'; // Import the CSS file
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

export default function EDI_Product_Wait_Confirm({ onSearch }) {
    const Custom_Progress = () => (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="loader"></div>
        <div style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>Processing Data...</div>
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
  
    const handleNavbarToggle = (openStatus) => {
        setIsNavbarOpen(openStatus);
    };

    const [distinctPrdWaitConfirm, setdistinctPrdWaitConfirm] = useState([]);
    const [distinctNoPrd, setdistinctNoPrd] = useState([]);
    const fetchEcnKpiDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-data-product-wait-confirm`);
            const data  = response.data;
            setdistinctPrdWaitConfirm(data);
            setdistinctNoPrd(response.data.length);
            // console.log('Lenght:' , response.data.length);
        } catch (error) {
          console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
        } finally {
          setIsLoading(false); 
        }
    };

    const handleClear = () => {
        setdistinctPrdWaitConfirm([]);
        setdistinctNoPrd([])
    };

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const formattedDateTime = `${year}${month}${date}`;
    const DateSendMail = date +'/'+ month +'/'+ year;

    const exportToExcel = async () => {
        if (distinctPrdWaitConfirm.length === 0) {
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
            'ECN NUMBER', 'PRODUCT', 'DETAILS', 'DESIGN','ISSUE DATE', 'STATUS', 'FAC', 'PLANNER', 'CR',
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
            worksheet.getColumn(colNumber).width = 15; // DETAILS column
          } else if (colNumber === 2) {
            worksheet.getColumn(colNumber).width = 20; // DETAILS column
          } else if (colNumber === 3) {
            worksheet.getColumn(colNumber).width = 65; // DETAILS column
          } else if (colNumber === 4) {
            worksheet.getColumn(colNumber).width = 30; // DETAILS column
          } else if (colNumber === 7) {
            worksheet.getColumn(colNumber).width = 10; // DETAILS column
          } else {
            worksheet.getColumn(colNumber).width = 15; // DETAILS column
          } 
        });

        distinctPrdWaitConfirm.forEach(agg_Row => {
          const row = [
            agg_Row.ecn_no, 
            agg_Row.prd_name, 
            agg_Row.ecn_details, 
            agg_Row.eng_name, 
            agg_Row.issue_date, 
            agg_Row.wait_status, 
            agg_Row.fac_item,
            agg_Row.planner_name,
            agg_Row.cr_name
          ];
        
          const excelRow = worksheet.addRow(row);
        
          const centerColumns = [1, 5, 6, 7];
          centerColumns.forEach(colIndex => {
            excelRow.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
          });
        
          // Always set background color for wait_status column (6)
          excelRow.getCell(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF085' }
          };
        
          // Loop over each cell in the row
          excelRow.eachCell((cell, colNumber) => {
            // Apply border
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
        
            // If days_diff > 60, override background color
            if (colNumber === 6) {
              // Special background for wait_status only
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF085' }
              };
            } else if (agg_Row.days_diff > 60) {
              // Yellow highlight for the rest of the row
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF00' }
              };
            }
          });
        });
        // distinctPrdWaitConfirm.forEach(agg_Row => {
        //   const row = [
        //       agg_Row.ecn_no, 
        //       agg_Row.prd_name, 
        //       agg_Row.ecn_details, 
        //       agg_Row.eng_name, 
        //       agg_Row.issue_date, 
        //       agg_Row.wait_status, 
        //       agg_Row.fac_item,
        //       agg_Row.planner_name,
        //       agg_Row.cr_name,
        //   ];
        //   const excelRow = worksheet.addRow(row);
        //   const centerColumns = [1, 5, 6, 7];
        //   centerColumns.forEach(colIndex => {
        //     excelRow.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
        //   });
        //   excelRow.getCell(6).fill = {
        //     type: 'pattern',
        //     pattern: 'solid',
        //     fgColor: { argb: 'FFF085' } // Yellow background
        //   };

        //   excelRow.eachCell((cell) => {
        //     cell.border = {
        //       top: { style: 'thin' },
        //       left: { style: 'thin' },
        //       bottom: { style: 'thin' },
        //       right: { style: 'thin' }
        //     };
        //   });

        //   if (agg_Row.days_diff > 60) {
        //     cell.fill = {
        //       type: 'pattern',
        //       pattern: 'solid',
        //       fgColor: { argb: 'FFFF00' } // Bright yellow
        //     };
        //   }
        // });
      
    
        // Save the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Product waiting planner confirm ${formattedDateTime}.xlsx`);
    };

    const handleSendMail = () => {
      if (distinctPrdWaitConfirm.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "NO DATA AVAILABLE TO SEND MAIL.",
          confirmButtonText: 'OK'
        });
        return;
      }

      const recipients = [
        "PLANNER AYT",
        "PLANNER KBN",
        "PLANNER NVK",
        "PLANNER PCN"
      ];
      const ccRecipients = ["Nikul.W@th.fujikura.com", 
                            "nongyao.o@th.fujikura.com", 
                            "Thongpan.S@th.fujikura.com", 
                            "Anupab.K@th.fujikura.com", 
                            "rungtawan.r@th.fujikura.com", 
                            "napaporn.t@th.fujikura.com"
                          ];

      const subject ="Product waiting planner confirm " + "(" + (DateSendMail) + ")";
      const body = "Dear All Planner, \n\n\n" +
        "                    Please be informed. \n" +
        "                    I'll to inform all of product waiting Planner confirm. \n" +
        "                    Please see details in attached file and confirm comeback to Me and My Team only ASAP. \n\n\n" + 
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
            <Box sx={{height: 600 , marginLeft: '60px'}}>
            
              <div style={{}}>
                  <Button 
                      className="btn_hover"
                      onClick={fetchEcnKpiDetails}
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
                    style={{marginLeft: 370}}
                >
                    <img src="/excel.png" alt="" style={{ width: 50}} />
                </Button>
                <Button 
                    className="btn_hover"
                    onClick={handleSendMail}
                >
                    <img src="/send-mail.png" alt="" style={{ width: 50}} />
                </Button>
              </div>
            <p style={{width:630 ,fontSize: 16, color: 'brown', marginTop: 10 , backgroundColor: "yellow",}}>***PRODUCT WAITING PLANNER CONFIRM OVER 60 DAYS. PLEASE URGENT CHECKING***</p>
            <div style={{
                      height: 650, 
                      width:1800 , 
                      marginRight: 20, 
                      marginTop: 5 ,
                      overflowY: 'auto', 
                      overflowX: 'hidden',
                      border: 'solid black 1px',
                    }}>
            {isLoading ? (
              <Custom_Progress />
            ) : (
                <table style={{height:'100%', width:1775 , borderCollapse: 'collapse',}}>
                    <thead style={{fontSize: 14, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                    <tr>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
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
                            height: "35px",
                            width: "160px",
                            border: 'solid black 1px',
                            }}
                      >
                        PRODUCT
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
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
                            height: "35px",
                            width: "285px",
                            border: 'solid black 1px',
                            }}
                      >
                        NAME DESIGN
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
                            width: "110px",
                            border: 'solid black 1px',
                            }}
                      >
                        DATE ISSUE
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
                            width: "115px",
                            border: 'solid black 1px',
                            }}
                      >
                        STATUS
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        FAC
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
                            width: "120px",
                            border: 'solid black 1px',
                            }}
                      >
                        PLANNER
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "35px",
                            width: "120px",
                            border: 'solid black 1px',
                            }}
                      >
                        CR
                    </th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 15}}>
                  {distinctPrdWaitConfirm.map((item, index) => (
                      <tr key={index}>
              
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",
                                    }}
                              >
                              {item.ecn_no || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",
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
                                  maxWidth: '200px' ,
                                  cursor: item.ecn_details ? "pointer" : "default" ,
                                  backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",
                              }}
                              onMouseDown={(e) => e.currentTarget.style.whiteSpace = "normal"}
                              onMouseUp={(e) => e.currentTarget.style.whiteSpace = "nowrap"}
                              onMouseLeave={(e) => e.currentTarget.style.whiteSpace = "nowrap"} // Reset if mouse leaves
                              >
                              {item.ecn_details?.replace(/[\r\n]+/g, " ") || ""}
                          </td>
                          <td style={{border: 'solid black 1px', textAlign: 'left' , paddingLeft: 5, backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",}}>{item.eng_name || ""}</td>
                          <td style={{border: 'solid black 1px', textAlign: 'center', backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",}}>{item.issue_date || ""}</td>
                          <td
                              style={{ 
                                  border: 'solid black 1px', 
                                  textAlign: 'center',
                                  // fontWeight: 'bold' ,
                                  backgroundColor: item.wait_status === "WAIT CONFIRM" ? "#FFF085" : "transparent",

                              }}
                          >
                              {item.wait_status || ""}
                          </td>
                          <td style={{border: 'solid black 1px', textAlign: 'center', backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",}}>{item.fac_item || ""}</td>
                          <td style={{border: 'solid black 1px', textAlign: 'center', backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",}}>{item.planner_name || ""}</td>
                          <td style={{border: 'solid black 1px', textAlign: 'center', backgroundColor: item.days_diff > 60 ? "yellow" : "transparent",}}>{item.cr_name || ""}</td>

                      </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p style={{width:630 ,fontSize: 16, color: 'brown', marginTop: 10 ,}}>***PRODUCT WAITING PLANNER CONFIRM : {distinctNoPrd} Product***</p>
          </Box>
        </Box>
        </>
    )
}


// const recipients = [
        // "kittiya.l@th.fujikura.com",
        // "Maliwan.m@th.fujikura.com",
        // "Areerat.S@th.fujikura.com",
        // "saruta.d@th.fujikura.com",
        // "asama.s@th.fujikura.com",
        // "Jiraporn.S@th.fujikura.com",
        // "Mayuree.C@th.fujikura.com",
        // "Sathid.i@th.fujikura.com",
        // "Sairung.Y@th.fujikura.com",
        // "yupawan.s@th.fujikura.com",
        // "patrawan.r@th.fujikura.com",
        // "thanya.k@th.fujikura.com",
        // "Nalinrat.R@th.fujikura.com",
        // "Napaporn.T@th.fujikura.com",
        // "Kanjana.Kh@th.fujikura.com",
        // "Pawana.w@th.fujikura.com",
        // "pornpimon.p@th.fujikura.com",
        // "preeyaporn.p@th.fujikura.com",
        // "Ratchadaporn.Cha@th.fujikura.com",
        // "sukunya.m@th.fujikura.com",
        // "Tuenjai.S@th.fujikura.com",
        // "yupawan.S@th.fujikura.com",
        // "benjaporn.f@th.fujikura.com",
        // "Orawan.kh@th.fujikura.com",
        // "Pathum.U@th.fujikura.com",
        // "rossarin.p@th.fujikura.com",
        // "Kanlaya.C@th.fujikura.com",
        // "Naphasorn.P@th.fujikura.com",
        // "piyaporn.pr@th.fujikura.com",
        // "SATHITA.R@TH.FUJIKURA.COM",
        // "Thabthim.S@th.fujikura.com",
        // "ketwarang.s@th.fujikura.com",
        // "Warittha.T@th.fujikura.com",
        // "Laksika.J@th.fujikura.com",
        // "Patcharaporn.R@th.fujikura.com",
        // "pattareeya.p@th.fujikura.com",
        // "namfon.pi@th.fujikura.com",
        // "yuwanan.s@th.fujikura.com",
        // "Watanya.T@th.fujikura.com",
        // "Trined.K@th.fujikura.com",
        // "patwarun.t@th.fujikura.com",
        // "pathum.u@th.fujikura.com",
        // "input.pcnf1.local@th.fujikura.com",
        // "papada.s@th.fujikura.com",
        // "pornvinus.p@th.fujikura.com",
        // "Narumol.Sr@th.fujikura.com",
        // "sujitra.k@th.fujikura.com",
        // "supaporn.kh@th.fujikura.com",
        // "Watcharaporn.N@th.fujikura.com",
        // "Sasina.Y@th.fujikura.com",
        // "panassaya.p@th.fujikura.com",
        // "jariya.t@th.fujikura.com",
        // "Sirinya.P@th.fujikura.com",
        // "Patcharida.Ng@th.fujikura.com",
        // "Oonanong.B@th.fujikura.com"
      // ];