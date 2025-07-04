import * as React from "react"; // นำเข้าโมดูลทั้งหมดที่ต้องการจาก React, ให้เราสามารถใช้งานฟีเจอร์ต่างๆ ของ React
import { styled, useTheme } from "@mui/material/styles"; // นำเข้าโมดูล "styled" และ "useTheme" จาก "@mui/material/styles" สำหรับการใช้งาน Styled Components และเข้าถึง Theme จาก Material-UI
import Box from "@mui/material/Box"; // นำเข้า Box จาก "@mui/material/Box" ซึ่งเป็นคอมโพเนนต์ที่ให้ความสะดวกในการจัดการ layout และ spacing
import MuiDrawer from "@mui/material/Drawer"; // นำเข้า Drawer จาก "@mui/material/Drawer" ซึ่งเป็นคอมโพเนนต์ที่เปิดเมนูแบบเลื่อนได้จากข้าง
import MuiAppBar from "@mui/material/AppBar"; // นำเข้า AppBar จาก "@mui/material/AppBar" ซึ่งเป็นคอมโพเนนต์สำหรับส่วนหัวของหน้าเว็บ
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Fuji from "/Fuji.png";
import { Link } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';

//*mui icon ******************************************************
import ComputerIcon from "@mui/icons-material/Computer";
import CableIcon from "@mui/icons-material/Cable";
import StayPrimaryPortraitIcon from "@mui/icons-material/StayPrimaryPortrait";
import MemoryIcon from "@mui/icons-material/Memory";
import DomainIcon from "@mui/icons-material/Domain";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import AccountMenu from "./AccountMenu";
//*---------------------------------------------------------------
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// สร้าง mixin สำหรับสไตล์ของ Drawer เมื่อถูกปิด
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navbar({ onToggle }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
    onToggle(true); // Notify parent component
  };

  const handleDrawerClose = () => {
    setOpen(false);
    onToggle(false); // Notify parent component
  };

  //bind value user from localstorage
  const userString = localStorage.getItem("userToken");
  const userObject = JSON.parse(userString);
  const userName = userObject?.user_name?.toUpperCase();
  const userSurname = userObject?.user_surname?.toUpperCase();
  // const userRole = userObject?.role_type;

  const userGuest = localStorage.getItem("guestToken");
  const userGuestObject = JSON.parse(userGuest);
  const userGuestName = userGuestObject?.user_login;
  // const userGuestRole = userGuestObject?.role_type;

  //*Menu name ******************************************************
  const [selectedMenu, setSelectedMenu] = React.useState("");
  const [menuName, setMenuName] = React.useState("Smart Waste Management");
  const [menuIcon, setMenuIcon] = React.useState(
    <img src="" alt="" width={30} />
    // <img src="/dashboard1.png" alt="" width={30} />
  );

  React.useEffect(() => {
    switch (location.pathname) {
      // case "/smartSus_monitoring_update_table":
      //   setMenuName("SUS Delivery Order Management");
      //   setMenuIcon(<img src="/sus-delivery.png" alt="" width={30} />);
      //   break;
      case "/EDI_Product_Special_List":
        setMenuName("SPECIAL LIST MANUAL CIM ROUTING");
        setMenuIcon(<img src="/special.png" alt="" width={30} />);
        setSelectedMenu("spe");
        break;
      case "/EDI_Product_Fix_Lead_Time":
        setMenuName("MASTER DATE FOR PRODUCT FIX LEAD TIME");
        setMenuIcon(<img src="/calendar.png" alt="" width={30} />);
        setSelectedMenu("fix");
        break;
      case "/EDI_Upload_Ecn_Excel":
        setMenuName("UPLOAD DATA ECN FOR UPDATE DETAILS");
        setMenuIcon(<img src="/upload.png" alt="" width={30} />);
        break;
      case "/EDI_Search_Ecn_Details":
        setMenuName("SEARCH HISTORY LOADING ROUTING FUNCTION");
        setMenuIcon(<img src="/save.png" alt="" width={30} />);
        setSelectedMenu("ecn");
        break;
      case "/EDI_Product_Wait_Confirm":
        setMenuName("PRODUCT WAITING PLANNER CONFIRM LOADING");
        setMenuIcon(<img src="/wait_confirm.png" alt="" width={30} />);
        setSelectedMenu("wait");
        break;
      case "/EDI_Product_Loading_Routing_Today":
        setMenuName("DAILY TREND LOADING ROUTING");
        setMenuIcon(<img src="/time-line.png" alt="" width={30} />);
        setSelectedMenu("trend");
        break;
      case "/EDI_New_Product_Load_by_Month":
        setMenuName("REPORT NEW PRODUCT FOR SEND TO COC");
        setMenuIcon(<img src="/new-product.png" alt="" width={30} />);
        setSelectedMenu("new");
        break;``
      case "/EDI_Check_location_Netterm":
        setMenuName("CHECK LOCATION NETTERM");
        setMenuIcon(<img src="/shelf.png" alt="" width={30} />);
        setSelectedMenu("loc");
        break;``
      case "/EDI_Product_Routing_List":
        setMenuName("PRODUCT ROUTING LIST");
        setMenuIcon(<img src="/list.png" alt="" width={30} />);
        break;``
      default:
        setMenuName("SMART EDI LOADING & MAINTENANCE ROUTING");
        setMenuIcon(<img src="/MainPage.png" alt="" width={30} />);
    }
  }, [location.pathname]);

  const getUserDataString = localStorage.getItem('userToken'); // Retrieve the string
    const getUserData = JSON.parse(getUserDataString); // Parse the string to an object
    const getUserRoleNo = getUserData.role_no; // Access the property
    // console.log(getUserRoleNo); // Output the value
  
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* HEADER MUI APPBAR */}

        <AppBar position="fixed" open={open}>
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between" }} // Add this
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {" "}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 4,
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  gap: 2
                }}
              >
                {menuIcon}
                {menuName}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="p" sx={{ mr: 1, fontWeight: "Bold" }}>
                {userName && userSurname
                  ? `${userName} ${userSurname}`
                  : userGuestName}
              </Typography>

              <AccountMenu />

              {/* If you have other elements, you can continue adding them here */}
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <Link to="/home">
              <img
                src={Fuji}
                alt="คำอธิบายภาพ"
                style={{
                  width: 180, // กำหนดความกว้างของภาพให้เต็มขนาดของพื้นที่ที่รองรับ
                  height: 45, // กำหนดความสูงของภาพให้ปรับแต่งตามอัตราส่วนต้นฉบับ
                }}
              />
            </Link>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />

          {/* ************************* Menu list ***************************** */}
          {/* EDI_Upload_Ecn_Excel */}
          {/* <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("UPLOAD DATA ECN FOR UPDATE DETAILS")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Upload_Ecn_Excel"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/upload.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="UPLOAD DETAILS"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div> */}

          {/* EDI_Search_Ecn_Details */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("SEARCH HISTORY LOADING ROUTING FUNCTION")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Search_Ecn_Details"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "ecn" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "ecn" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                    marginTop: -0.6, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/save.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="SEARCH FUNCTION"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_Product_Loading_Routing_Today */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("DAILY TREND LOADING ROUTING")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Product_Loading_Routing_Today"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "trend" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "trend" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                    // marginTop: -0.6, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/time-line.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="DAILY TREND"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_New_Product_Load_by_Month */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("REPORT NEW PRODUCT FOR SEND TO COC")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_New_Product_Load_by_Month"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "new" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "new" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                    // marginTop: -0.6, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/new-product.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="NEW PRODUCT"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_Check_location_Netterm */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("CHECK LOCATION NETTERM")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Check_location_Netterm"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "loc" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "loc" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                    // marginTop: -0.6, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/shelf.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="CHECK LOCATION"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_Product_Routing_List */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("PRODUCT ROUTING LIST")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Product_Routing_List"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/list.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="ROUTING LIST"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_Product_Special_List */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("SPECIAL LIST MANUAL CIM ROUTING")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Product_Special_List"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "spe" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "spe" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/special.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="SPECIAL LIST"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* EDI_Product_Fix_Lead_Time */}
          <div className={`${getUserRoleNo === 2 || getUserRoleNo === 3 ? "hidden" : "block"}`}>
            <List open={open}>
              <ListItem
                onClick={() => setMenuName("MASTER DATE FOR PRODUCT FIX LEAD TIME")}
                disablePadding
                sx={{ display: "block", color: "black" }}
                component={Link}
                to="/EDI_Product_Fix_Lead_Time"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    border: selectedMenu === "fix" ? "2px solid #1976d2" : "none", // เพิ่ม border เมื่อเลือก
                    borderRadius: "8px", // Optional: เพิ่มความโค้งของขอบ
                    backgroundColor: selectedMenu === "fix" ? "#E3F2FD" : "transparent", // Optional: เพิ่มสีพื้นหลังขณะ active
                    marginBottom: -1, // เพิ่มระยะห่างระหว่างรายการ
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit", // Set initial color
                      "&:hover": {
                        color: "primary.main", // Change color on hover
                      },
                    }}
                  >
                    <img src="/calendar.png" alt="" width={30} />
                  </ListItemIcon>
                  <ListItemText
                    primary="MASTER FIXED"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

        </Drawer>
      </Box>
    </>
  );
}
