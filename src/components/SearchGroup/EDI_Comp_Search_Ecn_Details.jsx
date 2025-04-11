import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import SearchIcon from '@mui/icons-material/Search';
import BackspaceIcon from '@mui/icons-material/Backspace';

function EDI_Search_Ecn_Details({ onSearch }) {
    const [error , setError] = useState(null);

    const [distinctCaseType, setdistinctCaseType] = useState(["A", "B"]);
    const [distinctProduct, setdistinctProduct] = useState([]);
    const [distinctEcnNo, setdistinctEcnNo] = useState([]);

    const [selectedCaseType, setSelectedCaseType] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedEcnNo, setSelectedEcnNo] = useState(null);

    if (error) {
        return <div>Error: {error}</div>;
    }

    const fetchProductList = async () => {
        try {
          const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-product-list`);
          const data  = response.data;

          setdistinctProduct(data);
        } catch (error) {
          console.error(`Error fetching distinct data Product List: ${error}`);
        }
    };

    const fetchEcnNotList = async () => {
        try {
            let product_selected = '';
            if (selectedProduct) {
                product_selected = selectedProduct.prd_name;
            } else {
                product_selected = 'ALL PRODUCT'
            }
            const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-ecn-no-list?prd_name=${product_selected}`);
            const data  = response.data;

            setdistinctEcnNo(data);
        } catch (error) {
          console.error(`Error fetching distinct data Product List: ${error}`);
        }
    };

    useEffect(() => {
        fetchProductList();
        fetchEcnNotList();
    }, [selectedProduct]);

    const handleCaseTypeChange = (event, newValue) => {
        setSelectedCaseType(newValue);
        setSelectedProduct(null);
        setSelectedEcnNo(null);
    }

    const handleProductChange = (event, newValue) => {
        setSelectedProduct(newValue);
        setSelectedCaseType(null);
        setSelectedEcnNo(null);
    }

    const handleEcnNoChange = (event, newValue) => {
        setSelectedEcnNo(newValue);
        setSelectedCaseType(null);
    }

    const handleSearch = () => {
        const case_type = selectedCaseType == null ? 'ALL CASE' : selectedCaseType;
        const product = selectedProduct == null ? 'ALL PRODUCT' : selectedProduct.prd_name;
        const ecn_no = selectedEcnNo == null ? 'ALL ECN' : selectedEcnNo.ecn_no;

        const queryParams = {
            case_type,
            product,
            ecn_no
        };
        // console.log('Query Params:', queryParams);
        onSearch(queryParams);
    };

    const handleClear = () => {
        setSelectedCaseType(null);
        setSelectedProduct(null);
        setSelectedEcnNo(null);

        const clear_data = 'Clear Data';

        const queryParams = {
            clear_data
        };
        // console.log('Query Params:', queryParams);
        onSearch(queryParams);
    };

    const handleRefresh = () => {
        const case_type = selectedCaseType == null ? 'ALL CASE' : selectedCaseType;
        const product = selectedProduct == null ? 'ALL PRODUCT' : selectedProduct.prd_name;
        const ecn_no = selectedEcnNo == null ? 'ALL ECN' : selectedEcnNo.ecn_no;
        const refresh = 'refresh';

        const queryParams = {
            case_type,
            product,
            ecn_no,
            refresh
        };
        // console.log('Query Params:', queryParams);
        onSearch(queryParams);
    };

    return (
        <React.Fragment>
            <Box sx={{height: '100%'}}>
            <div style={{border: 'solid black 1px', height: '100%', width: 515,}}>
                <p style={{fontSize: 16 , fontWeight: 'bold', backgroundColor: '#AFEEEE',}}>SEARCH FUNCTION</p>
                <div style={{width: '100%', height: '30%', display: "flex", flexDirection: "row", backgroundColor: '#AFEEEE', }}>
                    <div style={{width: '50%', }}>
                        <Autocomplete
                            disablePortal
                            options={distinctCaseType}
                            getOptionLabel={(option) => option}
                            // getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                            value={selectedCaseType}
                            onChange={handleCaseTypeChange}
                            sx={{
                                    width: '95%' , 
                                    marginLeft: '10px' , 
                                    marginTop: '5px' ,
                                    backgroundColor: '#E8F9FF', 
                                    borderRadius: 3, 
                                    '& .MuiOutlinedInput-root': {
                                        textAlign: 'center', // Aligns input text center
                                        '& input': {
                                            textAlign: 'center', // Ensures the typed or selected value is centered
                                        },
                                    },
                                }}
                            isOptionEqualToValue={(option, value) => option.prd_name === value.prd_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="CASE TYPE"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                                    }}
                                    sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'center', } }} // Ensures input text is blue
                                />
                            )}
                        />
                    </div>
                    <div style={{width: '50%', textAlign: 'left',}}>
                        <Autocomplete
                            disablePortal
                            options={distinctProduct}
                            getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                            value={selectedProduct}
                            onChange={handleProductChange}
                            sx={{
                                    width: '98%' , 
                                    // marginLeft: '5px' , 
                                    marginTop: '5px' ,
                                    backgroundColor: '#E8F9FF', 
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
                                    sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'left', } }} // Ensures input text is blue
                                />
                            )}
                        />
                    </div>
                </div>
                <div style={{width: '100%', height: '30%', display: "flex", flexDirection: "row", backgroundColor: '#AFEEEE',}}>
                    <div style={{width: '50%', }}>
                        <Autocomplete
                            disablePortal
                            options={distinctEcnNo}
                            getOptionLabel={(option) => (option ? String(option.ecn_no) : '')}
                            value={selectedEcnNo}
                            onChange={handleEcnNoChange}
                            sx={{
                                    width: '95%' , 
                                    marginLeft: '10px' , 
                                    marginTop: '15px' ,
                                    backgroundColor: '#E8F9FF', 
                                    borderRadius: 3, 
                                    '& .MuiOutlinedInput-root': {
                                        textAlign: 'left', // Aligns input text center
                                        '& input': {
                                            textAlign: 'left', // Ensures the typed or selected value is centered
                                        },
                                    },
                                }}
                            isOptionEqualToValue={(option, value) => option.ecn_no === value.ecn_no}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="ECN NUMBER"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                                    }}
                                    sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'left', } }} // Ensures input text is blue
                                />
                            )}
                        />
                    </div>
                    <div style={{width: '50%', textAlign: 'center', marginTop: '15px' , }}>
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
                            onClick={handleRefresh}
                        >
                            <img src="/refresh.png" alt="" style={{ width: 50}} />
                        </Button>
                    </div>
                </div>
                <div style={{width: '100%', height: '30%', display: "flex", flexDirection: "row", backgroundColor: '#AFEEEE',}}>
                    <div style={{width: '50%', }}>
                        
                    </div>
                    <div style={{width: '50%', textAlign: 'left',}}>

                    </div>
                </div>
            </div>
                {/* <Grid container spacing={0} > 
                    <Grid item xs={2} md={1} style={{  display: 'flex',}}>
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                            <Autocomplete
                                disablePortal
                                options={distinctCaseType}
                                getOptionLabel={(option) => option}
                                // getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                                value={selectedCaseType}
                                onChange={handleCaseTypeChange}
                                sx={{
                                        width: 160 , 
                                        marginTop: '10px' , 
                                        backgroundColor: '#E8F9FF', 
                                        borderRadius: 3, 
                                        '& .MuiOutlinedInput-root': {
                                            textAlign: 'center', // Aligns input text center
                                            '& input': {
                                                textAlign: 'center', // Ensures the typed or selected value is centered
                                            },
                                        },
                                    }}
                                isOptionEqualToValue={(option, value) => option.prd_name === value.prd_name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="CASE TYPE"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                                        }}
                                        sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'center', } }} // Ensures input text is blue
                                    />
                                )}
                            />
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center',marginLeft: 15, }}>
                            <Autocomplete
                                disablePortal
                                options={distinctProduct}
                                getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                                value={selectedProduct}
                                onChange={handleProductChange}
                                sx={{
                                        width: 250 , 
                                        marginTop: '10px' , 
                                        backgroundColor: '#E8F9FF', 
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
                                        sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'left', } }} // Ensures input text is blue
                                    />
                                )}
                            />
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center',marginLeft: 15, }}>
                            <Autocomplete
                                disablePortal
                                options={distinctEcnNo}
                                getOptionLabel={(option) => (option ? String(option.ecn_no) : '')}
                                value={selectedEcnNo}
                                onChange={handleEcnNoChange}
                                sx={{
                                        width: 220 , 
                                        marginTop: '10px' , 
                                        backgroundColor: '#E8F9FF', 
                                        borderRadius: 3, 
                                        '& .MuiOutlinedInput-root': {
                                            textAlign: 'left', // Aligns input text center
                                            '& input': {
                                                textAlign: 'left', // Ensures the typed or selected value is centered
                                            },
                                        },
                                    }}
                                isOptionEqualToValue={(option, value) => option.ecn_no === value.ecn_no}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="ECN NUMBER"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            sx: { border: 'none', boxShadow: 'none', color: 'blue'}, // Removes border and sets font color
                                        }}
                                        sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18, textAlign: 'left', } }} // Ensures input text is blue
                                    />
                                )}
                            />
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', marginLeft: 20, }}>
                            <Button 
                                className="btn_hover"
                                onClick={handleSearch}
                                style={{marginTop: '10px'}}
                                // variant="contained" 
                                // // size="small"
                                // onClick={handleSearch}
                                // endIcon={<SearchIcon />}
                                >
                                <img src="/search.png" alt="" style={{ width: 60}} />
                            </Button>
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', }}>
                            <Button 
                                className="btn_hover"
                                onClick={handleClear}
                                style={{marginTop: '10px'}}
                                // variant="contained" 
                                // size="small"
                                // style={{width: '130px', height: '50px' , marginTop: '10px', fontSize: '16px', backgroundColor: 'gray'}}
                                // onClick={handleClear}
                                // endIcon={<BackspaceIcon style={{ fontSize: '20px' , marginLeft: 5}}/>}
                                >
                                <img src="/clear1.png" alt="" style={{ width: 60}} />
                            </Button>
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', }}>
                            <Button 
                                className="btn_hover"
                                onClick={handleRefresh}
                                style={{marginTop: '10px'}}
                                // variant="contained" 
                                // size="small"
                                // style={{width: '130px', height: '50px' , marginTop: '10px', fontSize: '16px', backgroundColor: 'gray'}}
                                // onClick={handleClear}
                                // endIcon={<BackspaceIcon style={{ fontSize: '20px' , marginLeft: 5}}/>}
                                >
                                <img src="/refresh.png" alt="" style={{ width: 60}} />
                            </Button>
                        </div>
                    </Grid>
                </Grid> */}
            </Box>
        </React.Fragment>
    );
}

export default EDI_Search_Ecn_Details