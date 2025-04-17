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

export default function EDI_Search_Ecn_Details({ onSearch }) {
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

  const [selectedCaseType, setSelectedCaseType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedEcnNo, setSelectedEcnNo] = useState(null);
  const [selectedCleardata, setSelectedCleardata] = useState(null);
  const [selectedRefresh, setSelectedRefresh] = useState(null);
  const [selectedTakeNote, setSelectedTakeNote] = useState(null);
  const [manualRouting, setManualRouting] = useState('');
  const [revSpecial, setRevSpecial] = useState('');
  const [dateSpecial, setDateSpecial] = useState('');
  const [distinctTakeNote, setdistinctTakeNote] = useState(["WAIT FPC POS", 
                                                            "WAIT SMT POS", 
                                                            "WAIT CONFIRM", 
                                                            "POS INACTIVE",
                                                            "SE CHECK",
                                                            "PRE PROCEED",
                                                            "PLN HOLDING",
                                                            "REMAIN MFG/PRO",
                                                            "PROCESS BEFORE FLOOD"
                                                          ]);
  
  const [distinctEcnKpiDetails, setdistinctEcnKpiDetails] = useState([]);
  const [distinctSpecialList, setdistinctSpecialList] = useState([]);
  const [distinctContPrdFixLT, setdistinctContPrdFixLT] = useState();

  const saveOptions = ["COMP" , "PROB"];
  const [selectedValue, setSelectedValue] = useState("");
  const [checkedValues, setCheckedValues] = useState({});

  const fetchEcnKpiDetails = async () => {
    try {
      setIsLoading(true);
      if (selectedCaseType == 'ALL CASE' && selectedProduct == 'ALL PRODUCT' && selectedEcnNo == 'ALL ECN') {
        // alert("Please select at least 1 options");
      } 
      else {
        setSelectedValue("")
        setCheckedValues({});
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-ecn-kpi-details?case_type=${selectedCaseType}&prd_name=${selectedProduct}&ecn_no=${selectedEcnNo}`);
        const data  = response.data;
        setdistinctEcnKpiDetails(data);

        const response_s = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-special-list-manual-routing-by-product?prd_name=${selectedProduct}`);
        const data_s  = response_s.data;
        setdistinctSpecialList(data_s);

        let rev_special = 0;
        let date_special = '';
        if (response_s.data && response_s.data.length > 0) {
          rev_special = response_s.data[response_s.data.length - 1].special_rev;
          date_special = response_s.data[response_s.data.length - 1].update_date;
        }
        setRevSpecial(rev_special);
        setDateSpecial(date_special);

        fetchContPrdFixLT();
      }
    } catch (error) {
      console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };

  const fetchContPrdFixLT = async () => {
    try {
      setIsLoading(true);
      if (selectedProduct == 'ALL PRODUCT') {
        // alert("Please select at least 1 options");
      } 
      else {
        const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-count-product-fix-leadtime?prd=${selectedProduct}`);
        const count_prd = parseInt(response.data[0].count_prd, 10);
        if (count_prd > 0) {
          alert("THIS PRODUCT MUST BE FIXED LEADTIME");
        }
        setdistinctContPrdFixLT(count_prd);
      }
    } catch (error) {
      console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchEcnKpiDetails();
    if (selectedCleardata) {
      setdistinctEcnKpiDetails([]);
      setSelectedValue("")
      setCheckedValues({});
      setSelectedCleardata(null);
      setManualRouting('');
    }
    if (selectedRefresh) {
      fetchEcnKpiDetails();
      setSelectedRefresh(null);
    }
  }, [selectedCaseType, selectedProduct, selectedEcnNo, selectedCleardata, selectedRefresh]);

  const now_x = new Date();
  const year = now_x.getFullYear();
  const month_x = (now_x.getMonth() + 1).toString().padStart(2, '0');
  const date = now_x.getDate().toString().padStart(2, '0');
  const hours = now_x.getHours().toString().padStart(2, '0');
  const minutes = now_x.getMinutes().toString().padStart(2, '0');
  const date_load = date +'/'+ month_x +'/'+ year + ' 08:00';
  const date_load_comp = date +'/'+ month_x +'/'+ year +' '+ hours +':'+ minutes;
  const date_time_special = date +'/'+ month_x +'/'+ year;
  let ecn_no_string = '';

  // const HandleSaveandCim_R = async () => {
  //   if (!distinctEcnKpiDetails || distinctEcnKpiDetails.length === 0) {
  //     alert("No data available to process.");
  //     // console.log("No data available to process.");
  //     return;
  //   }

  //   const ecn_details = [""];
  //   const ecn_no = [];
  //   let ChkAlert = '';

  //   for (const [index, row] of distinctEcnKpiDetails.entries()) {
  //     if (row.wait_status === "COMPLETED") {
  //       continue; // Skip this row and move to the next one
  //     }

  //     if (selectedValue[index] === "COMP") {
  //         const valueFor_1_4_7 = checkedValues["1.4.7"] ? "Y" : "";
  //         const valueFor_1_4_5 = checkedValues["1.4.5"] ? "Y" : "";
  //         const valueFor_1_4_16 = checkedValues["1.4.16"] ? "Y" : "";

  //         const valueFor_half_prd = checkedValues["half_prd"] ? "Y" : "";
  //         const valueFor_lot_roll = checkedValues["lot_roll"] ? "Y" : "";
  //         const valueFor_re_cal = checkedValues["re_cal"] ? "Y" : "";
  //         const valueFor_smt_finish = checkedValues["smt_finish"] ? "Y" : "";

  //         const valueFor_pos = checkedValues["POS"] ? "A" : "";
  //         const valueFor_mos = checkedValues["MOS"] ? "B" : "";
  //         const valueFor_rcs = checkedValues["RCS"] ? "C" : "";
  //         const valueFor_bom = checkedValues["BOM"] ? "D" : "";
  //         const issue_doc = valueFor_pos + valueFor_mos + valueFor_rcs + valueFor_bom
    
  //         // console.log("ecn_no:", row.ecn_no);
  //           // console.log("prd_name:", row.prd_name);
  //           // console.log("ecn_by_prd:", row.ecn_no + row.prd_name);
    
  //           // console.log("eng_name:", row.eng_name);
  //           // console.log("date_load:", date_load);
  //           // console.log("date_load_comp:", date_load_comp);
  //           // console.log("wait_status: COMPLETED");
  //           // console.log("issue_doc:", issue_doc);
  //           // console.log("valueFor_1_4_7:", valueFor_1_4_7);
  //           // console.log("valueFor_1_4_5:", valueFor_1_4_5);
  //           // console.log("valueFor_1_4_16:", valueFor_1_4_16);
  //           // console.log("valueFor_half_prd:", valueFor_half_prd);
  //           // console.log("valueFor_lot_roll:", valueFor_lot_roll);
  //           // console.log("valueFor_re_cal:", valueFor_re_cal);
  //           // console.log("valueFor_smt_finish:", valueFor_smt_finish);
  //           // console.log("-----------------------");

  //         const url = `http://10.17.100.115:3001/api/smart_edi/filter-count-ecn-by-prd-kpi?ecn_by_prd=${row.ecn_no + row.prd_name}`;
  //         axios.get(url)
  //           .then(response => {
  //             const data = response.data;
  //             let count_data = parseInt(data[0].count_data, 10);
  //             if (count_data === 0) {
  //               axios
  //               .get(
  //                 `http://10.17.100.115:3001/api/smart_edi/insert-kpi-database?eng_name=${row.eng_name}&date_load=${date_load}&date_load_comp=${date_load_comp}&wait_status=COMPLETED&issue_doc=${issue_doc}&mfg_145=${valueFor_1_4_5}&mfg_147=${valueFor_1_4_7}&mfg_1416=${valueFor_1_4_16}&half_prd=${valueFor_half_prd}&lot_roll=${valueFor_lot_roll}&re_cal_rout=${valueFor_re_cal}&smt_fg=${valueFor_smt_finish}&ecn_by_prd=${row.ecn_no + row.prd_name}`
  //               )
  //               .then((response) => {
  //                 // console.log('Insert Successful:', response.data);
  //                 ChkAlert = 'Y';
  //               })
  //               .catch((error) => {
  //                 console.error('Insert Error:', error);
  //               });
  //               // console.log(`Row ${index}: count_data is 0, inserting data...`);
  //             } else {
  //               axios
  //               .get(
  //                 `http://10.17.100.115:3001/api/smart_edi/update-kpi-database?date_load_comp=${date_load_comp}&wait_status=COMPLETED&issue_doc=${issue_doc}&mfg_145=${valueFor_1_4_5}&mfg_147=${valueFor_1_4_7}&mfg_1416=${valueFor_1_4_16}&half_prd=${valueFor_half_prd}&lot_roll=${valueFor_lot_roll}&re_cal_rout=${valueFor_re_cal}&smt_fg=${valueFor_smt_finish}&ecn_by_prd=${row.ecn_no + row.prd_name}`
  //               )
  //               .then((response) => {
  //                 // console.log('Insert Successful:', response.data);
  //                 ChkAlert = 'Y';
  //               })
  //               .catch((error) => {
  //                 console.error('Insert Error:', error);
  //               });
  //               // console.log(`Row ${index}: count_data is not 0, updating data...`);
  //             }
              
  //             ecn_details.push(row.ecn_details);
  //             ecn_no.push(row.ecn_no);

  //             ecn_no_string = ecn_no.join(", ");
  //             setEcn_Number(ecn_no_string)
  //             console.log('ecn_no_string 1' , ecn_no_string);

  //             // console.log('Ecn_Number' , Ecn_Number);

  //             // alert("SAVED ENTRY DATA SUCCESSFUL.");
  //             // setSelectedValue("")
  //             // setCheckedValues({});
  //             // fetchEcnKpiDetails();
  //         })
  //       }
  //   }
  //   // RMI-020S-2A

  //   // if (ChkAlert = 'Y') {
  //   //   alert("SAVED ENTRY DATA SUCCESSFUL.");
  //   //   ChkAlert = ''
  //   // }
    
  //   // If there are recipients, generate the mailto link
  //   console.log('ecn_no_string 2' , ecn_no_string);
  //   const ecn_mail = ecn_no_string
  //   const recipients = ["Anupab.K@th.fujikura.com"];
  //   const ccRecipients = ["Thongpan.S@th.fujikura.com"];
  //   const subject = selectedProduct + " : FPC SYSTEM COMPLETED LOADING AND REVISED ROUTING";
  //   const body = "DEAR PLANNER, \n\n" +
  //                "COMPLETED LOADING AND REVISED ROUTING FOR PRODUCT : " + selectedProduct + " \n\n" +
  //                "ECN NO : " + ecn_mail + " \n\n";
  //   // const body = "Hello, \n\nThis is a reminder for our upcoming meeting.\n\nBest regards.";
  //   if (recipients.length > 0) {
  //     // ?cc=${ccRecipients ? ccRecipients.join(",") : ""}


  //     const mailtoLink = `mailto:${recipients.join(",")}?cc=${ccRecipients ? ccRecipients.join(",") : ""}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  //     // const mailtoLink = `mailto:${recipients.join(",")}?subject=ECN KPI Update&body=${encodeURIComponent(emailBody)}`;
  //     window.location.href = mailtoLink;
  //   } else {
  //     alert("No email recipients found.");
  //   }
  // }

  const HandleSaveandCim = async () => {
    if (!distinctEcnKpiDetails || distinctEcnKpiDetails.length === 0) {
      alert("No data available to process.");
      return;
    }
  
    const ecn_no = [];
    const ecn_details = [""];
    let ChkAlert = 0;
    let ChkTakeNote = 0;
  
    const requests = distinctEcnKpiDetails.map(async (row, index) => {
      if (row.wait_status === "COMPLETED") return;
  
      if (selectedValue[index] === "COMP") {
        const valueFor_1_4_7 = checkedValues["1.4.7"] ? "Y" : "";
        const valueFor_1_4_5 = checkedValues["1.4.5"] ? "Y" : "";
        const valueFor_1_4_16 = checkedValues["1.4.16"] ? "Y" : "";
  
        const valueFor_half_prd = checkedValues["half_prd"] ? "Y" : "";
        const valueFor_lot_roll = checkedValues["lot_roll"] ? "Y" : "";
        const valueFor_re_cal = checkedValues["re_cal"] ? "Y" : "";
        const valueFor_smt_finish = checkedValues["smt_finish"] ? "Y" : "";
  
        const valueFor_pos = checkedValues["POS"] ? "A" : "";
        const valueFor_mos = checkedValues["MOS"] ? "B" : "";
        const valueFor_rcs = checkedValues["RCS"] ? "C" : "";
        const valueFor_bom = checkedValues["BOM"] ? "D" : "";
        const issue_doc = valueFor_pos + valueFor_mos + valueFor_rcs + valueFor_bom;

        if (issue_doc === "") {
          alert("PLEASE CHECK LIST FOR ISSUE DOCUMENT.");
          return;
        }

        if (valueFor_re_cal === "") {
          alert("PLEASE CHECK LIST FOR RE-CALCULATE.");
          return;
        }

        const ChkSMT = row.prd_name.charAt(3);
        if (ChkSMT === "Z" && valueFor_smt_finish === "") {
          alert("PLEASE CHECK LIST FOR SMT FINISH GOODS.");
          return;
        }

        const url = `http://10.17.100.115:3001/api/smart_edi/filter-count-ecn-by-prd-kpi?ecn_by_prd=${row.ecn_no + row.prd_name}`;
  
        try {
          const response = await axios.get(url);
          const count_data = parseInt(response.data[0].count_data, 10);
          
          if (count_data === 0) {
            try {
              await axios.get(`http://10.17.100.115:3001/api/smart_edi/insert-kpi-database?eng_name=${row.eng_name}&date_load=${date_load}&date_load_comp=${date_load_comp}&wait_status=COMPLETED&issue_doc=${issue_doc}&mfg_145=${valueFor_1_4_5}&mfg_147=${valueFor_1_4_7}&mfg_1416=${valueFor_1_4_16}&half_prd=${valueFor_half_prd}&lot_roll=${valueFor_lot_roll}&re_cal_rout=${valueFor_re_cal}&smt_fg=${valueFor_smt_finish}&ecn_by_prd=${row.ecn_no + row.prd_name}`);
              ChkAlert += 1;
            } catch (error) {
              console.error('Insert Error:', error);
            }
          } else {
            try {
              await axios.get(`http://10.17.100.115:3001/api/smart_edi/update-kpi-database?date_load_comp=${date_load_comp}&wait_status=COMPLETED&issue_doc=${issue_doc}&mfg_145=${valueFor_1_4_5}&mfg_147=${valueFor_1_4_7}&mfg_1416=${valueFor_1_4_16}&half_prd=${valueFor_half_prd}&lot_roll=${valueFor_lot_roll}&re_cal_rout=${valueFor_re_cal}&smt_fg=${valueFor_smt_finish}&ecn_by_prd=${row.ecn_no + row.prd_name}`);
              ChkAlert += 1;
            } catch (error) {
              console.error('Update Error:', error);
            }
          }

          ecn_no.push(row.ecn_no);
          ecn_details.push(row.ecn_details);
          return true;
        } catch (error) {
          console.error('Error fetching:', error);
        }
      }

      if (selectedValue[index] === "PROB") {
        if (!selectedTakeNote) {
          alert("PLEASE SELECT PROBLEM FOR TAKE NOTE.");
          return;
        }
        const url = `http://10.17.100.115:3001/api/smart_edi/filter-count-ecn-by-prd-kpi?ecn_by_prd=${row.ecn_no + row.prd_name}`;
        try {
          const response = await axios.get(url);
          const count_data = parseInt(response.data[0].count_data, 10);

          if (count_data === 0) {
            try {
              await axios.get(`http://10.17.100.115:3001/api/smart_edi/insert-status-take-note?eng_name=${row.eng_name}&date_load=${date_load_comp}&wait_status=${selectedTakeNote}&ecn_by_prd=${row.ecn_no + row.prd_name}`);
              ChkTakeNote += 1;
            } catch (error) {
              console.error('Insert Error:', error);
            }
          } else {
            try {
              await axios.get(`http://10.17.100.115:3001/api/smart_edi/update-status-take-note?wait_status=${selectedTakeNote}&ecn_by_prd=${row.ecn_no + row.prd_name}`);
              ChkTakeNote += 1;
            } catch (error) {
              console.error('Update Error:', error);
            }
          }

          ecn_no.push(row.ecn_no);
          ecn_details.push(row.ecn_details);
          return true;
        } catch (error) {
          console.error('Error fetching:', error);
        }
      }
    });
  // RMI-020S-2A
    // Wait for all requests to finish
    await Promise.all(requests);

    // console.log('ChkAlert' , ChkAlert);
    
    if (ChkAlert > 0) {
      alert("SAVED ENTRY DATA SUCCESSFUL.");
      setSelectedValue("")
      setCheckedValues({});
      fetchEcnKpiDetails();

      if (distinctContPrdFixLT > 0) {
        handleOpenFixLeadTime();
        setdistinctContPrdFixLT();
      }
  
      const ecn_no_string = ecn_no.join(", ");
      const ecn_details_string = ecn_details.join("\n");
  
      // const recipients = ["Anupab.K@th.fujikura.com"];
      const recipients = [
        "PLANNER AYT",
        "PLANNER KBN",
        "PLANNER NVK",
        "PLANNER PCN"
      ];
      // const ccRecipients = ["Thongpan.S@th.fujikura.com"];
      const ccRecipients = [
        "Thongpan.S@th.fujikura.com", 
        "Anupab.K@th.fujikura.com", 
        "rungtawan.r@th.fujikura.com", 
        "napaporn.t@th.fujikura.com"
      ];
      const subject = selectedProduct + " : FPC SYSTEM COMPLETED LOADING AND REVISED ROUTING";
      const body = "DEAR ALL PLANNER, \n\n" +
        "COMPLETED LOADING AND REVISED ROUTING FOR PRODUCT : " + selectedProduct + " \n\n" +
        "ECN NO : \n" + 
        ecn_no_string + " \n\n" +
        "DETAILS : " + ecn_details_string + " \n\n" +
        "PLANNING DIVISION. (SYSTEM TEAM)"
        ;
    
      if (recipients.length > 0) {
        const mailtoLink = `mailto:${recipients.join(";")}?cc=${ccRecipients.join(";")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else {
        alert("No email recipients found.");
      }
      ChkAlert = 0
    }

    if (ChkTakeNote > 0) {
      alert("TAKE NOTE SUCCESSFUL.");
      setSelectedTakeNote(null)
      fetchEcnKpiDetails();
      ChkTakeNote = 0
    }
  };

  const HandleManualCimRouting = async () => {
    console.log('selectedProduct: ',selectedProduct);
    console.log('manualRouting: ',manualRouting);
    if (!selectedProduct) {
      alert("PLEASE SELECT PRODUCT")
      return;
    } 
    if (!manualRouting) {
      alert("PLEASE INPUT DETAILS FOR CIM MANUAL")
      return;
    } 

    const swalWithZIndex = Swal.mixin({
      customClass: {
          popup: 'my-swal-popup', // Define a custom class for the SweetAlert popup
      },
    });

    swalWithZIndex.fire({
      title: "CONFIRM SAVE",
      text: "CONFIRM TO MANUAL CIM ROUTING PLEASE PRESS YES?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "YES, CIM",
      cancelButtonText: "CANCEL",
    }).then((result) => {
      if (result.isConfirmed) {
        const Newrev = revSpecial + 1
        if (revSpecial == 0) { 
          const url_insert = (`http://10.17.100.115:3001/api/smart_edi/insert-special-list-status-by-product?prd_name=${selectedProduct}&details=${manualRouting}&date_time=${date_time_special}&rev=${Newrev}`);
          axios.get(url_insert)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "CIM SECCESS",
              text: "MANUAL CIM ROUTING SECCESSFULLY",
              confirmButtonText: "OK",
            });
          })
          .catch((error) => {
            console.error("ERROR CIM ROUTING:", error);
            Swal.fire({
              icon: "error",
              title: "CIM ERROR",
              text: "AN ERROR OCCURRED WHILE CIM data",
              confirmButtonText: "OK",
            });
          });
          fetchEcnKpiDetails();
          handleClearManualRoutingChange()
        } else {
          const url_update = (`http://10.17.100.115:3001/api/smart_edi/update-special-list-status-by-product?prd_name=${selectedProduct}&date_time=${dateSpecial}&rev=${revSpecial}`);
          const url_insert_update = (`http://10.17.100.115:3001/api/smart_edi/insert-special-list-status-by-product?prd_name=${selectedProduct}&details=${manualRouting}&date_time=${date_time_special}&rev=${Newrev}`);
          axios.get(url_update)
          .then(() => axios.get(url_insert_update))
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "CIM SECCESS",
              text: "MANUAL CIM ROUTING SECCESSFULLY",
              confirmButtonText: "OK",
            });
          })
          .catch((error) => {
            console.error("ERROR CIM ROUTING:", error);
            Swal.fire({
              icon: "error",
              title: "CIM ERROR",
              text: "AN ERROR OCCURRED WHILE CIM data",
              confirmButtonText: "OK",
            });
          });
          fetchEcnKpiDetails();
          handleClearManualRoutingChange()
        }
      } else {
        handleClearManualRoutingChange()
      }
    });
  };

  

  const handleSaveOptionsChange = (index, event, newValue) => {
    setSelectedValue((prevState) => ({
      ...prevState,
      [index]: newValue, // Store selected value for the specific row
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedValues((prev) => ({
      ...prev,
      [name]: checked, // Update state with checkbox name and checked status
    }));
  };

  const handleManualRoutingChange = (value) => {
    setManualRouting(value);
  };
  const handleClearManualRoutingChange = (value) => {
    setManualRouting('');
  };

  const handleTakeNoteChange = (event, newValue) => {
    setSelectedTakeNote(newValue);
  }

  const handleSendMail = () => {
    window.open('/EDI_Product_Wait_Confirm', '_blank');
  };

  const handleOpenFixLeadTime = () => {
    window.open('http://10.17.66.242:8162/', '_blank');
  };

  return (
    <>
    <Navbar onToggle={handleNavbarToggle}/>  
    <Box marginLeft={isNavbarOpen ? "220px" : 3} marginTop={10}>
      <Box sx={{height: 600 , marginLeft: '60px'}}>

        <div style={{
                      // border: 'solid black 1px',
                      height: 200,
                      width: 1800 ,
                      marginBottom : 10 ,
                      textAlign: 'center',
                      display: "flex",
                      flexDirection: "row",
                    }}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <EDI_Comp_Search_Ecn_Details
              onSearch={(queryParams) => {
                setSelectedCaseType(queryParams.case_type);
                setSelectedProduct(queryParams.product);
                setSelectedEcnNo(queryParams.ecn_no);
                setSelectedCleardata(queryParams.clear_data);
                setSelectedRefresh(queryParams.refresh);
              }}
            />
          </div>
          {/* DIV BOX 1 */}
          <div style={{border: 'solid black 1px', height: '100%', width: 515, marginLeft: 10, }}>
            <p style={{fontSize: 16 , fontWeight: 'bold', backgroundColor: '#AFEEEE', }}>ENTRY DATA TO DATABASE</p>
            <div style={{height: 170, width: 900 , display: 'flex',}}>
                <div style={{ height: 173, width: 150 , backgroundColor: '#AFEEEE', }}>
                  <p style={{fontSize: 16 , textAlign: 'left', paddingLeft : 5, textDecoration: 'underline', textDecorationStyle: 'double', }}>MFG / PRO MENU</p>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="1.4.7" checked={checkedValues["1.4.7"] || false} onChange={handleCheckboxChange}/>
                    1.4.7 */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="1.4.7"
                        checked={checkedValues["1.4.7"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>1.4.7</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small"  name="1.4.5" checked={checkedValues["1.4.5"] || false} onChange={handleCheckboxChange}/>
                    1.4.5 */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="1.4.5"
                        checked={checkedValues["1.4.5"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>1.4.5</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small"  name="1.4.16" checked={checkedValues["1.4.16"] || false} onChange={handleCheckboxChange}/>
                    1.4.16 */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="1.4.16"
                        checked={checkedValues["1.4.16"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>1.4.16</span>
                    </label>
                  </div>
                </div>
                <div style={{height: 173, width: 210 , marginLeft: 1, backgroundColor: '#AFEEEE',}}>
                  <p style={{fontSize: 16 ,textAlign: 'left', paddingLeft : 5, textDecoration: 'underline', textDecorationStyle: 'double', }}>SPECIAL EDIT</p>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="half_prd" checked={checkedValues["half_prd"] || false} onChange={handleCheckboxChange}/>
                    HALF PRODUCT */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="half_prd"
                        checked={checkedValues["half_prd"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>HALF PRODUCT</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="lot_roll" checked={checkedValues["lot_roll"] || false} onChange={handleCheckboxChange}/>
                    CHANGE LOT TO ROLL */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="lot_roll"
                        checked={checkedValues["lot_roll"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>CHANGE LOT TO ROLL</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="re_cal" checked={checkedValues["re_cal"] || false} onChange={handleCheckboxChange}/>
                    RE-CALCULATE */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="re_cal"
                        checked={checkedValues["re_cal"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>RE-CALCULATE</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="smt_finish" checked={checkedValues["smt_finish"] || false} onChange={handleCheckboxChange}/>
                    SMT FINISH GOODS */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="smt_finish"
                        checked={checkedValues["smt_finish"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>SMT FINISH GOODS</span>
                    </label>
                  </div>
                </div>
                <div style={{height: 173, width: 150 , marginLeft: 1, backgroundColor: '#AFEEEE',}}>
                  <p style={{fontSize: 16 ,textAlign: 'left', paddingLeft : 5, textDecoration: 'underline', textDecorationStyle: 'double', }}>DOCUMENT</p>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="POS" checked={checkedValues["POS"] || false} onChange={handleCheckboxChange} />
                    POS (A) */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="POS"
                        checked={checkedValues["POS"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>POS (A)</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="MOS" checked={checkedValues["MOS"] || false} onChange={handleCheckboxChange} />
                    MOS (B) */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="MOS"
                        checked={checkedValues["MOS"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>MOS (B)</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="RCS" checked={checkedValues["RCS"] || false} onChange={handleCheckboxChange} />
                    RCS (C) */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="RCS"
                        checked={checkedValues["RCS"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>RCS (C)</span>
                    </label>
                  </div>
                  <div style={{textAlign: 'left', }}>
                    {/* <Checkbox size="small" name="BOM" checked={checkedValues["BOM"] || false} onChange={handleCheckboxChange} />
                    BOM (D) */}
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        name="BOM"
                        checked={checkedValues["BOM"] || false}
                        onChange={handleCheckboxChange}
                      />
                      <span>BOM (D)</span>
                    </label>
                  </div>
                </div>
            </div>  
          </div>

          {/* DIV BOX 2 */}
          <div style={{border: 'solid black 1px', height: '100%', width: 535, marginLeft: 10,}}>
            <p style={{fontSize: 16 , fontWeight: 'bold', backgroundColor: '#AFEEEE', }}>MANUAL MAINTAIN ROUTING</p>
            <div style={{textAlign: 'left', backgroundColor: '#AFEEEE',}}>
              <input style={{ 
                              border: 'solid black 1px', 
                              boxShadow: '3px 3px 5px grey',
                              width: 515, 
                              height: 50, 
                              fontSize: 16,
                              marginTop: 5, 
                              marginLeft: 7, 
                              marginRight: 8,
                              paddingLeft: 10,
                              textTransform: 'uppercase',
                              color: 'blue' ,
                      }} 
                      type="text" 
                      // placeholder="Key Weight"
                      value={manualRouting}
                      onChange={(e) => handleManualRoutingChange(e.target.value.toUpperCase())}
              />
            </div>
            <div style={{textAlign: 'left', backgroundColor: '#AFEEEE', display: "flex", flexDirection: "row",}}>
              <Button 
                  className="btn_hover"
                  onClick={handleClearManualRoutingChange}
                  style={{
                          marginTop: 10 ,
                          marginBottom: 10 ,
                          marginLeft: 7,
                          width: '48%', 
                          height: 40,
                          backgroundColor: 'orange',
                          color: 'green',
                          fontWeight: 'bold',
                        }}
                  >
                  RESET
              </Button>
              <Button 
                  className="btn_hover"
                  onClick={HandleManualCimRouting}
                  style={{
                          marginTop: 10,
                          marginBottom: 10 ,
                          marginLeft: 10,
                          width: '48%', 
                          height: 40,
                          backgroundColor: '#D69ADE',
                          color: 'green',
                          fontWeight: 'bold',
                        }}
                  >
                  MANUAL CIM ROUTING
              </Button>
            </div>
            <div style={{textAlign: 'left', display: "flex", flexDirection: "row", backgroundColor: '#AFEEEE',}}>
              <div style={{textAlign: 'right', height: 50, marginTop: 10 , width: '35%'}}>
                <p style={{marginTop: 15 , }}>PROBLEM TAKE NOTE :</p>
              </div>
              <div style={{textAlign: 'right', height: 50, marginTop: 5 , width: '65%', marginLeft: 7,}}>
                <Autocomplete
                    disablePortal
                    options={distinctTakeNote}
                    getOptionLabel={(option) => option}
                    // getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                    value={selectedTakeNote}
                    onChange={handleTakeNoteChange}
                    sx={{
                            width: 335 , 
                            height: 50 ,
                            // marginTop: '10px' , 
                            backgroundColor: '#E8F9FF', 
                            borderRadius: 3, 
                            '& .MuiOutlinedInput-root': {
                                textAlign: 'left', // Aligns input text center
                                '& input': {
                                    textAlign: 'left', // Ensures the typed or selected value is centered
                                },
                            },
                        }}
                    // isOptionEqualToValue={(option, value) => option.prd_name === value.prd_name}
                    renderInput={(params) => (
                      <TextField
                          {...params}
                          label="TAKE NOTE LIST"
                          variant="outlined"
                          InputProps={{
                              ...params.InputProps,
                              sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                          }}
                          sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 14, textAlign: 'left', } }} // Ensures input text is blue
                      />
                    )}
                />
              </div>
            </div>
          </div>

          {/* DIV BOX 3 */}
          <div style={{border: 'solid black 1px', height: '100%', width: 235, marginLeft: 10, textAlign: 'center', backgroundColor: '#AFEEEE',}}>
            <p style={{fontSize: 16 , fontWeight: 'bold', }}>SEND CONFIRM</p>
              <Button 
                    className="btn_hover"
                    onClick={handleSendMail}
                    style={{
                            margin: 5,
                            width: '90%', 
                            height: '80%', 
                            backgroundColor: '#B5FCCD',
                            fontWeight: 'bold',
                            border: 'solid black 1px',
                            borderRadius: 10 ,
                            boxShadow: '3px 3px 5px grey',
                          }}
                    >
                    SEND MAIL PRODUCT WAITING CONFIRM
              </Button>
          </div>
        </div>

        <p style={{fontSize: 16, color: 'brown',}}>*** HISTORY LOADING ROUTING ***</p>
        <div style={{
                      height: 370, 
                      width:1800 , 
                      marginRight: 25, 
                      fontSize: 14, 
                      overflow: 'auto', 
                      paddingBottom: 15, 
                      paddingRight: 5, 
                      border: '1px solid grey', 
                      // overflowX: 'auto', 
                      // overflowY: 'auto',
                      // border: 'solid black 1px',
                      // borderRadius: 10,
                    }}>
            {isLoading ? (
              <Custom_Progress />
            ) : (
              <table style={{width:2450 , borderCollapse: 'collapse',}}>
                <thead style={{fontSize: 16, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                  <tr>
                  <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "130px",
                            border: 'solid black 1px',
                            }}
                      >
                        SAVE & CIM
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "95px",
                            border: 'solid black 1px',
                            }}
                      >
                        CASE TYPE
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
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
                            height: "50px",
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
                            height: "50px",
                            width: "500px",
                            border: 'solid black 1px',
                            }}
                      >
                        DETAIL OF REVISED
                    </th>
                    
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
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
                            height: "50px",
                            width: "120px",
                            border: 'solid black 1px',
                            }}
                      >
                        DATE ISSUE
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "150px",
                            border: 'solid black 1px',
                            }}
                      >
                        LOAD COMPLETED
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "120px",
                            border: 'solid black 1px',
                            }}
                      >
                        STATUS
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "100px",
                            border: 'solid black 1px',
                            }}
                      >
                        ISSUE DOC
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        1.4.7
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        1.4.5
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        1.4.16
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        H/P
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        L/R
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        RE-CAL
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        SMT
                    </th>
                    <th
                      style={{
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            height: "50px",
                            width: "70px",
                            border: 'solid black 1px',
                            }}
                      >
                        FAC
                    </th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 15}}>
                  {distinctEcnKpiDetails.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: 'solid black 1px',}}>
                        {item.wait_status !== "COMPLETED" ? (
                          <Autocomplete
                            options={saveOptions}
                            value={selectedValue[index] || ""}
                            onChange={(event, newValue) => handleSaveOptionsChange(index, event, newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                sx={{
                                  backgroundColor:
                                    selectedValue[index] === "COMP"
                                      ? "red"
                                      : selectedValue[index] === "PROB"
                                      ? "yellow"
                                      : "white",
                                  color:
                                    selectedValue[index] === "COMP"
                                      ? "yellow"
                                      : selectedValue[index] === "PROB"
                                      ? "red"
                                      : "black",
                                  "& .MuiInputBase-input": {
                                    color:
                                      selectedValue[index] === "COMP"
                                        ? "yellow"
                                        : selectedValue[index] === "PROB"
                                        ? "red"
                                        : "black",
                                  },
                                  height: "100%",
                                }}
                                
                              />
                            )}
                            style={{ width: "100%", height: 35, fontSize: 1 }}
                          />
                        ) : null}
                      </td>
                      <td style={{border: 'solid black 1px', textAlign: 'center', height: "40px",}}>{item.case_type || ""}</td>
                      <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.ecn_no || ""}</td>
                      <td style={{border: 'solid black 1px', paddingLeft: 10}}>{item.prd_name || ""}</td>

                      {/* show original value  */}
                      {/* <td style={{ border: 'solid black 1px', paddingLeft: 10 }}>
                        {item.ecn_details?.replace(/[\r\n]+/g, " ") || ""}
                      </td> */}

                      {/* show sepearate any row value  */}
                      {/* <td style={{ border: 'solid black 1px', paddingLeft: 10 }}>
                        {item.ecn_details?.split("\r\n").map((line, index) => (
                          <div key={index}>{line}</div>
                        )) || ""}
                      </td> */}

                      {/* show original value and hide value if over column */}
                      {/* <td style={{ 
                        border: 'solid black 1px', 
                        paddingLeft: 10, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '200px' // Adjust the width as needed
                      }}>
                        {item.ecn_details?.replace(/[\r\n]+/g, " ") || ""}
                      </td> */}

                      {/* show original value and hide value if over column and can click to show full value*/}
                      <td
                        style={{ 
                          border: 'solid black 1px', 
                          paddingLeft: 10, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          maxWidth: '200px' ,
                          cursor: item.ecn_details ? "pointer" : "default" ,
                        }}
                        onMouseDown={(e) => e.currentTarget.style.whiteSpace = "normal"}
                        onMouseUp={(e) => e.currentTarget.style.whiteSpace = "nowrap"}
                        onMouseLeave={(e) => e.currentTarget.style.whiteSpace = "nowrap"} // Reset if mouse leaves
                      >
                        {item.ecn_details?.replace(/[\r\n]+/g, " ") || ""}
                      </td>


                      <td style={{border: 'solid black 1px', textAlign: 'left' , paddingLeft: 5,}}>{item.eng_name || ""}</td>
                      <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.issue_date || ""}</td>
                      <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.date_load_comp || ""}</td>
                      {/* <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.wait_status || ""}</td> */}
                      <td
                        style={{ 
                          border: 'solid black 1px', 
                          textAlign: 'center',
                          fontWeight: 'bold' ,
                          backgroundColor: item.wait_status === "WAIT PROCEED" ? "#00FF9C" : 
                                          item.wait_status === "WAIT CONFIRM" ? "lightgray" : 
                                          item.wait_status === "WAIT FPC POS" ? "red" : 
                                          item.wait_status === "WAIT SMT POS" ? "red" : 
                                          item.wait_status === "SE CHECK" ? "red" : 
                                          item.wait_status === "PLN HOLDING" ? "violet" : 
                                          item.wait_status === "PROCESS BEFORE FLOOD" ? "purple" : 
                                          item.wait_status === "POS INACTIVE" ? "orange" : "transparent",
                          color: item.wait_status === "WAIT FPC POS" ? "orange" : 
                                 item.wait_status === "WAIT SMT POS" ? "orange" : 
                                 item.wait_status === "SE CHECK" ? "orange" : 
                                 item.wait_status === "PLN HOLDING" ? "white" : 
                                 item.wait_status === "PROCESS BEFORE FLOOD" ? "white" :
                                 item.wait_status === "POS INACTIVE" ? "green" : "black",
                        }}
                      >
                        {item.wait_status === "COMPLETED" ? "" : item.wait_status}
                      </td>
                      <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.issue_doc || ""}</td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.mfg_147 === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.mfg_147 || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.mfg_145 === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.mfg_145 || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.mfg_1416 === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.mfg_1416 || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.half_prd === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.half_prd || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.lot_roll === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.lot_roll || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.re_cal_rout === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.re_cal_rout || ""}
                      </td>
                      <td style={{
                            border: 'solid black 1px', 
                            textAlign: 'center',
                            backgroundColor: item.smt_fg === "Y" ? "#E8F9FF" : "transparent",
                          }}
                      >
                        {item.smt_fg || ""}
                      </td>
                      <td style={{border: 'solid black 1px', textAlign: 'center'}}>{item.fac_item || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div>
              <Button 
                  className="btn_hover"
                  onClick={HandleSaveandCim}
                  style={{
                          marginBottom: 10,
                          marginTop: 20 ,
                          width: 135, 
                          height: 50,
                          backgroundColor: 'green',
                          color: 'yellow',
                        }}
                  >
                  SAVE & CIM
              </Button>
            </div>
          </div>
          <p style={{marginTop: 10, fontSize: 16, color: 'brown',}}>*** SPECIAL MAINTAIN BY MANUAL ***</p>
          <div style={{border: '1px solid grey', height: 150, width: 1200, overflowY: 'auto', overflowX: 'hidden', }}>
            {isLoading ? (
                <Custom_Progress />
              ) : (
              <table style={{width:1200 , borderCollapse: 'collapse',}}>
                  <thead style={{fontSize: 16, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                    <tr>
                      <th
                        style={{
                              textAlign: "center",
                              backgroundColor: "#AED2FF",
                              height: "35px",
                              width: 200,
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
                              width: 650,
                              border: 'solid black 1px',
                              }}
                        >
                          DETAILS
                      </th>
                      <th
                        style={{
                              textAlign: "center",
                              backgroundColor: "#AED2FF",
                              height: "35px",
                              width: 150,
                              border: 'solid black 1px',
                              }}
                        >
                          DATE
                      </th>
                      <th
                        style={{
                              textAlign: "center",
                              backgroundColor: "#AED2FF",
                              height: "35px",
                              width: 150,
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
                              width: 100,
                              border: 'solid black 1px',
                              }}
                        >
                          REV.
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 16}}>
                  {distinctSpecialList.map((item, index) => (
                      <tr key={index}>
                        <td style={{border: 'solid black 1px', textAlign: 'center', height: "30px",}}>{item.prd_name}</td>
                        <td style={{border: 'solid black 1px', paddingLeft: 10}}>{item.special_details}</td>
                        <td style={{border: 'solid black 1px', textAlign: 'center',}}>{item.update_date}</td>
                        <td style={{border: 'solid black 1px', textAlign: 'center', backgroundColor: item.special_status === "ACTIVE" ? "lightgreen" : "transparent",}}>{item.special_status}</td>
                        <td style={{border: 'solid black 1px', textAlign: 'center',}}>{item.special_rev}</td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            )}
          </div>
      </Box>
    </Box>
    </>
  )
}