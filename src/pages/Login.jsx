import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginLogo from "../assets/login-logo.png";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Swal from "sweetalert2";
import axios from "axios";
import "./styles/Login.css";
import { Link } from "react-router-dom";

function LoginNew() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const navigate = useNavigate();

  // const userDatabase = `http://10.17.100.115:3001/api/smart_planning/filter-user-login?user_login=${userLogin}`;
  const userDatabase = `http://10.17.100.115:3001/api/smart_edi/filter-user-login-smart-edi?user_login=${userLogin}`;


  const handleLogin = (event) => {
    event.preventDefault();

    axios
      .get(userDatabase)
      .then((response) => {
        const data = response.data;
        console.log(data);
        if (
          data[0].user_login === userLogin &&
          data[0].user_password === password &&
          data[0]?.system_no === 9
        ) {
          localStorage.setItem("userToken", JSON.stringify(data[0]));
          console.log("Logged in successfully");
          Swal.fire({
            icon: "success",
            title: "Login Success",
            text: "Welcome to Smart EDI Loading & Maintenance Routing",
          });
          navigate("/home");
        } else {
          console.log("Login failed");
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Please check your username or password or permission",
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the request:", error.message);
        Swal.fire({
          icon: "error",
          title: "User does not exist",
          text: "Please check your username or password or permission",
        });
      });
  };

  const handleGuest = () => {
    localStorage.setItem(
      "guestToken",
      JSON.stringify({
        user_login: "Guest",
        user_role: "Guest",
      })
    );
    Swal.fire({
      icon: "warning",
      title: "Guest Mode",
      text: "Guest mode for read only",
    });
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src={LoginLogo} alt="LoginLogo" className="login-logo"/>
        {/* <p className="login-title">dashboard monitoring table</p> */}
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            // placeholder="Username"
            variant="outlined"
            margin="normal"
            value={userLogin}
            onChange={(e) => setUserLogin(e.target.value)}
            autoComplete="username"
            fullWidth
            required
            InputProps={{
              sx: {
                color: 'blue', // สีตัวอักษรภายในช่องกรอก
              },
            }}
          />
          <TextField
            label="Password"
            // placeholder="Password"
            variant="outlined"
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            required
            InputProps={{
              sx: {
                color: 'blue', // สีตัวอักษรภายในช่องกรอก
              },
            }}
          // InputLabelProps={{
          //   sx: {
          //     color: 'blue', // สีของ label (คำว่า Password)
          //   },
          // }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 1 }}
            disabled={loading}
          >
            Login <LockOpenOutlinedIcon sx={{ ml: 1 }} />
          </Button>
        </form>
      </div>
      {/* SVG wave background */}
      <svg className="login-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          fill="#d0eaff"         // ฟ้าอ่อนมาก
          fillOpacity="1"
          d="M0,224 C360,320 1080,120 1440,224 L1440,320 L0,320 Z"
        />
        <path
          fill="#a6d8fa"         // ฟ้าอ่อน
          fillOpacity="0.8"
          d="M0,256 C480,320 960,160 1440,256 L1440,320 L0,320 Z"
        />
        <path
          fill="#7cc3f7"         // ฟ้ากลาง
          fillOpacity="0.7"
          d="M0,288 C600,340 840,180 1440,288 L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}

export default LoginNew;