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
import EDI_Search_Product_Special_List from "../components/SearchGroup/EDI_Search_Product_Special_List";

export default function EDI_Upload_Ecn_Excel({ onSearch }) {
  const Custom_Progress = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <div className="loader"></div>
    <div style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>Uploading Data...</div>
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
  const [FileName, setFileName] = useState(['']);
  const [csvData, setCsvData] = useState([]);
  
  const handleNavbarToggle = (openStatus) => {
    setIsNavbarOpen(openStatus);
  };

  // const handleImportFiles = (files) => {
  //   const file = files[0];
  //   setFileName(file.name)

  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     const content = event.target.result;
  //     const rows = content.split('\n');
  //     const parsedData = rows.map(row => {
  //       const rowData = row.split(',');
  //       return rowData;
  //     });
  //     setCsvData(parsedData);
  //   };
  //   reader.readAsText(file);
  // };

  const handleImportFiles = (files) => {
    const file = files[0];
    setFileName(file.name)

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        
        // Use PapaParse to parse CSV data with proper handling of quoted fields
        Papa.parse(content, {
            complete: (result) => {
                const parsedData = result.data; // Array of rows with each row as an array of fields
                setCsvData(parsedData);
            },
            header: false,  // Since you might not want headers in the data
            skipEmptyLines: true,  // Skip any empty lines in the CSV
        });
    };
    reader.readAsText(file);
  };

  const handleCancelUpload = () => {
    setFileName('');
    setCsvData([]);
  };

  const HandleUpload = () => {
    const DataStockFin = csvData.map(row => row);
    const swalWithZIndex = Swal.mixin({
      customClass: {
          popup: 'my-swal-popup', // Define a custom class for the SweetAlert popup
      },
    });
    if (FileName == '' ) {
      alert("Please select the file you want to upload.")
    } else {
      swalWithZIndex.fire({
        title: "Confirm Save",
        text: "Are you sure want to upload data ECN Details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Save",
        cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
              async function fetchData() {
                setIsLoading(true);
                if (isLoading) {
                  return <Custom_Progress />;
                }
                const promises = csvData.map(async (row, index) => {
                  const [eng_name, date_load, date_load_comp, wait_status, issue_doc, mfg_145, mfg_147, 
                         mfg_1416, half_prd, lot_roll, re_cal_rout, smt_fg, ecn_by_prd
                        ] = row;
                  if (index === 0) return;
                  if (ecn_by_prd === '' ) return;

                  // // for check date_load
                  // const [datePart, timePart] = date_load.split(" ");
                  // const [day, month, year] = datePart.split("/");
                  // const formattedYear = "20" + year;
                  // const trans_date_load = date_load ? `${day}/${month}/${year} ${timePart}` : 'null';

                  // // for check date_load_comp
                  // const [datePart_comp, timePart_comp] = date_load_comp.split(" ");
                  // const [day_comp, month_comp, year_comp] = datePart_comp.split("-");
                  // const formattedYear_comp = "20" + year_comp;
                  // const trans_date_load_comp = `${day_comp}/${month_comp}/${formattedYear_comp} ${timePart_comp}`;

                  // // for check date_check
                  // const [day_check, month_check, year_check] = date_check.split("-");
                  // const formattedYear_check = "20" + year_check;
                  // const trans_date_check = `${day_check}/${month_check}/${formattedYear_check}`;

                  // for check every field is null
                  const chk_eng_name = eng_name ? eng_name : ' '; 
                  const chk_date_load = date_load ? date_load : ' '; 
                  const chk_date_load_comp = date_load_comp ? date_load_comp : ' '; 
                  const chk_wait_status = wait_status ? wait_status : ' '; 
                  const chk_issue_doc = issue_doc ? issue_doc : ' '; 
                  const chk_mfg_145 = mfg_145 ? mfg_145 : ' '; 
                  const chk_mfg_147 = mfg_147 ? mfg_147 : ' '; 
                  const chk_mfg_1416 = mfg_1416 ? mfg_1416 : ' '; 
                  const chk_half_prd = half_prd ? half_prd : ' '; 
                  const chk_lot_roll = lot_roll ? lot_roll : ' '; 
                  const chk_re_cal_rout = re_cal_rout ? re_cal_rout : ' '; 
                  const chk_smt_fg = smt_fg ? smt_fg : ' '; 

                  console.log('eng_name :' , chk_eng_name);
                  console.log('date_load :' , chk_date_load);
                  console.log('date_load_comp :' , chk_date_load_comp);
                  console.log('wait_status :' , chk_wait_status);
                  console.log('issue_doc :' , chk_issue_doc);
                  console.log('mfg_145 :' , chk_mfg_145);
                  console.log('mfg_147 :' , chk_mfg_147);
                  console.log('mfg_1416 :' , chk_mfg_1416);
                  console.log('half_prd :' , chk_half_prd);
                  console.log('lot_roll :' , chk_lot_roll);
                  console.log('re_cal_rout :' , chk_re_cal_rout);
                  console.log('smt_fg :' , chk_smt_fg);
                  console.log('ecn_by_prd :' , ecn_by_prd);
                  console.log('--------------------------------------');

                  // if (mat_item === '') return;
                  // if (lot_size === '') return;

                  try {
                    axios.get(
                      `http://10.17.100.115:3001/api/smart_edi/update-ecn-details-from-upload?eng_name=${chk_eng_name}&date_load=${chk_date_load}&date_load_comp=${chk_date_load_comp}&wait_status=${chk_wait_status}&issue_doc=${chk_issue_doc}&mfg_145=${chk_mfg_145}&mfg_147=${chk_mfg_147}&mfg_1416=${chk_mfg_1416}&half_prd=${chk_half_prd}&lot_roll=${chk_lot_roll}&re_cal_rout=${chk_re_cal_rout}&smt_fg=${chk_smt_fg}&ecn_by_prd=${ecn_by_prd}`
                    )
                  } catch (error) {
                    console.error(`Error processing row ${index + 1}:`, error.message);
                  }
                });

                Promise.all(promises)
                    .then(() => {
                        Swal.fire({
                            icon: "success",
                            title: "Save Success",
                            text: "Data ECN Details saved successfully",
                            confirmButtonText: "OK",
                        });
                        setFileName('')
                        setCsvData('')
                    })
                    .catch((error) => {
                        console.error("Error saving data:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Save Error",
                            text: "An error occurred while saving data",
                            confirmButtonText: "OK",
                        });
                    });
              }
              fetchData()

            } else {
              handleCancelUpload()
            }
        });
    }
  };

  return (
    <>
    <Navbar onToggle={handleNavbarToggle}/>  
    <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
      <Box sx={{height: 80 , marginTop: '10px' , marginLeft: '60px'}}>
        <div style={{display: 'inline-flex', alignItems: 'center' , }}>
          <ReactFileReader handleFiles={handleImportFiles} fileTypes={'.csv'}>
            <Button
              className='btn_active'
              style={{
                border: '1px solid black',
                fontSize: 12,
                width: 150,
                height: 55,
                backgroundColor: '#EEEEEE',
                fontWeight: 'bold',
                marginTop: 10,
                marginLeft: 20,
                borderRadius: 10,
              }}
              endIcon={<CloudUploadIcon />}
            >
              Upload file
            </Button>
          </ReactFileReader>
          <p style={{marginTop: 10, marginLeft: '10px' , fontSize: 12 , width: 300 }}>({FileName})</p>
          <Button 
              className='btn_hover' 
              style={{marginTop: 10, fontWeight:'bold', fontSize: 12 , backgroundColor: '#74E291' , width: 120 , height: 50, color: "black", borderRadius: 10, }} 
              onClick={HandleUpload}
            >
              Upload
          </Button> 
          <Button 
              className='btn_hover' 
              style={{marginTop: 10, fontWeight: 'bold', fontSize: 12, backgroundColor: '#FF0000', width: 120, height: 50, color: 'white' , marginLeft: 5, borderRadius: 10,}}
              onClick={handleCancelUpload}
            >
              Cancel
          </Button>
        </div>
      </Box>
    </Box>
    </>
  )
}