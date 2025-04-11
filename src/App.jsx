import * as React from "react"; // นำเข้าโมดูลทั้งหมดที่ต้องการจาก React, ให้เราสามารถใช้งานฟีเจอร์ต่างๆ ของ React
import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/auth/ProtectedRoutes";
import ProtectedRoutesSupper from "./components/auth/ProtectedRoutesSupper";
import Login from "./pages/Login";
import Navbar from "./components/navbar/Navbar";

import EDI_Product_Special_List from "./pages/EDI_Product_Special_List";
import EDI_Product_Fix_Lead_Time from "./pages/EDI_Product_Fix_Lead_Time";
import EDI_Upload_Ecn_Excel from "./pages/EDI_Upload_Ecn_Excel";
import EDI_Search_Ecn_Details from "./pages/EDI_Search_Ecn_Details";
import EDI_Product_Wait_Confirm from "./pages/EDI_Product_Wait_Confirm";

export default function App() {
  
  return (
    
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/home" element={<Navbar />} />
              <Route path="/EDI_Product_Special_List" element={<EDI_Product_Special_List />}/>
              <Route path="/EDI_Product_Fix_Lead_Time" element={<EDI_Product_Fix_Lead_Time />}/>
              <Route path="/EDI_Upload_Ecn_Excel" element={<EDI_Upload_Ecn_Excel />}/>
              <Route path="/EDI_Search_Ecn_Details" element={<EDI_Search_Ecn_Details />}/>
              <Route path="/EDI_Product_Wait_Confirm" element={<EDI_Product_Wait_Confirm />}/>
            </Route>
        </Routes>
  );
}
