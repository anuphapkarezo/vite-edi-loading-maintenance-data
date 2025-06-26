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

export default function EDI_Check_location_Netterm({ onSearch }) {
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

    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [selectedToDate, setSelectedToDate] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [distinctProduct, setdistinctProduct] = useState([]);
    const [distinctProductCheck, setdistinctProductCheck] = useState([]);

    const fromDate = selectedFromDate ? dayjs(selectedFromDate).format('DD/MM/YYYY') : null;
    const toDate = selectedToDate ? dayjs(selectedToDate).format('DD/MM/YYYY') : null;
    const productName = selectedProduct ? selectedProduct.prd_name : 'ALL PRODUCT';

    const fetchProductList = async () => {
        try {
          let from_Date = '';
          if (!fromDate) {
            from_Date = 'ALL';
          } else {
            from_Date = fromDate
          }

          let to_Date = '';
          if (!toDate) {
            to_Date = 'ALL';
          } else {
            to_Date = toDate
          }
          
          // if (fromDate !== null && toDate !== null){
          const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-product-list-check-location?start_date=${from_Date}&end_date=${to_Date}`);
          const data  = response.data;
          // console.log('data' , data);
          setdistinctProduct(data);
          // }
        } catch (error) {
          console.error(`Error fetching distinct data Product List: ${error}`);
        }
    };

    useEffect(() => {
        fetchProductList();
    }, [selectedFromDate, selectedToDate, selectedProduct, fromDate, toDate]);

    const handleNavbarToggle = (openStatus) => {
        setIsNavbarOpen(openStatus);
    };

    const handleFromDateChange = (newValue) => {
      setSelectedFromDate(newValue);
      setSelectedToDate(null)
      setSelectedProduct(null)
      setdistinctProduct([])
    }

    const handleToDateChange = (newValue) => {
      setSelectedToDate(newValue);
    }

    const handleProductChange = (event, newValue) => {
      setSelectedProduct(newValue);
    }
    

    const handleSearch = async () => {
      // console.log('fromDate' , fromDate);
      // console.log('toDate' , toDate);
      // console.log('productName' , productName);
      let from_Date = '';
      if (!fromDate) {
        from_Date = 'ALL';
      } else {
        from_Date = fromDate
      }

      let to_Date = '';
      if (!toDate) {
        to_Date = 'ALL';
      } else {
        to_Date = toDate
      }

      if (from_Date === 'ALL' && to_Date === 'ALL' && productName === 'ALL PRODUCT') {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT AT LEAST ONE CHOICE.',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (from_Date !== 'ALL' && to_Date === 'ALL') {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT TO DATE.',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (from_Date === 'ALL' && to_Date !== 'ALL') {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'PLEASE SELECT FROM DATE.',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      if (toDate < fromDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "TO DATE CAN'T BE EARLIER THAN FROM DATE.",
          confirmButtonText: 'OK'
        });
        setSelectedFromDate(null)
        setSelectedToDate(null)
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://10.17.100.115:3001/api/smart_edi/filter-check-location-netterm?start_date=${from_Date}&to_date=${to_Date}&prd_name=${productName}`
        );
        const data = response.data;
        setdistinctProductCheck(data);
      } catch (error) {
        console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      } finally {
        setIsLoading(false); 
      }
    };

    const handleClear = () => {
      setSelectedFromDate(null)
      setSelectedToDate(null)
      setSelectedProduct(null)
      setdistinctProduct([])
      setdistinctProductCheck([])
    };

    return (
        <>
        <Navbar onToggle={handleNavbarToggle}/>  
        <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
          {/* {/* <Box sx={{height: 600 , marginLeft: '60px'}}> */}
          <div style={{height: 750, width: 1800, marginLeft: '40px', }}>
            <div style={{height: 70, width: 1800, display: "flex", flexDirection: "row", }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                      <DatePicker 
                          label="CHECK FROM DATE" 
                          value={selectedFromDate}
                          onChange={(newDate) => handleFromDateChange(newDate)}
                          renderInput={(params) => <TextField {...params} />}
                          format="DD/MM/YYYY"
                      />
                  </DemoContainer>
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                      <DatePicker 
                          label="CHECK TO DATE" 
                          value={selectedToDate}
                          sx={{marginLeft: 2, }}
                          onChange={(newDate) => handleToDateChange(newDate)}
                          renderInput={(params) => <TextField {...params} />}
                          format="DD/MM/YYYY"
                      />
                  </DemoContainer>
              </LocalizationProvider>
              <Autocomplete
                  disablePortal
                  options={distinctProduct}
                  getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                  value={selectedProduct}
                  onChange={handleProductChange}
                  sx={{
                          width: 230 , 
                          marginLeft: 2 , 
                          marginTop: 1 ,
                          // backgroundColor: '#E8F9FF', 
                          borderRadius: 3, 
                          '& .MuiOutlinedInput-root': {
                              textAlign: 'left', // Aligns input text center
                              '& input': {
                                  textAlign: 'left', // Ensures the typed or selected value is centered
                              },
                          },
                      }}
                  isOptionEqualToValue={(option, value) => option.prd_name === value.prd_name}
                  renderInput={(params) => (
                      <TextField
                          {...params}
                          label="PRODUCT NAME"
                          variant="outlined"
                          InputProps={{
                              ...params.InputProps,
                              sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                          }}
                          // sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'left', } }} // Ensures input text is blue
                      />
                  )}
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
            </div>

            <div style={{
                        height: 680, 
                        width:1645 , 
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
                  <table style={{width:1620 , borderCollapse: 'collapse', }}>
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
                                width: "120px",
                                border: 'solid black 1px',
                                }}
                          >
                            PRODUCT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "45px",
                                width: "60px",
                                border: 'solid black 1px',
                                }}
                          >
                            ITEM FPC
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            PROCESS FPC
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            WC ROUTING
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            WC NETTERM
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            CHECK LOC. FPC
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#ECEFCA",
                                height: "45px",
                                width: "60px",
                                border: 'solid black 1px',
                                }}
                          >
                            ITEM SMT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#ECEFCA",
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            PROCESS SMT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#ECEFCA",
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            LOC MASTER
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#ECEFCA",
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            LOC NETTERM
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#ECEFCA",
                                height: "45px",
                                width: "100px",
                                border: 'solid black 1px',
                                }}
                          >
                            CHECK LOC. FPC
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
                            DATE LOAD
                        </th>
                      </tr>
                    </thead>
                  <tbody style={{fontSize: 16}}>
                    {distinctProductCheck.map((item, index) => (
                      <tr key={index}>
                        <td style={{
                            border: 'solid black 1px',
                            textAlign: 'center',
                            height: "30px",
                          }}>
                            {index + 1}
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
                                    textAlign: 'center',
                                    backgroundColor: item.check_loc === "OK" ? "#00FF9C" :
                                                     item.check_loc === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.item_type || ""}
                        </td>
                        <td style={{border: 'solid black 1px', 
                                    textAlign: 'center',
                                    textAlign: 'center',
                                    backgroundColor: item.check_loc === "OK" ? "#00FF9C" :
                                                     item.check_loc === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.proc_disp || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    paddingLeft: 10,
                                    textAlign: 'center',
                                    backgroundColor: item.check_loc === "OK" ? "#00FF9C" :
                                                     item.check_loc === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.wc_rout || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    paddingLeft: 10,
                                    textAlign: 'center',
                                    backgroundColor: item.check_loc === "OK" ? "#00FF9C" :
                                                     item.check_loc === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.wc_netterm || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_loc === "OK" ? "#00FF9C" :
                                                     item.check_loc === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.check_loc || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_status === "OK" ? "#00FF9C" :
                                    item.check_status === "NO" ? "#FFA55D" : "transparent",
                                    paddingLeft: 10,
                                  }}
                            >
                            {item.item_type_fg || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_status === "OK" ? "#00FF9C" :
                                    item.check_status === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.proc_disp_fg || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_status === "OK" ? "#00FF9C" :
                                    item.check_status === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.pt_loc || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_status === "OK" ? "#00FF9C" :
                                    item.check_status === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.loc_master || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                    backgroundColor: item.check_status === "OK" ? "#00FF9C" :
                                                     item.check_status === "NO" ? "#FFA55D" : "transparent",
                                  }}
                            >
                            {item.check_status || ""}
                        </td>
                        <td style={{border: 'solid black 1px',
                                    textAlign: 'center',
                                  }}
                            >
                            {item.date_load_comp || ""}
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