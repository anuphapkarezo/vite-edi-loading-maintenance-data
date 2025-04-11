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

function EDI_Search_Product_Special_List({ onSearch }) {
    const [error , setError] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [distinctProduct, setdistinctProduct] = useState([]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    const fetchProductList = async () => {
        try {
          const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-product-special-list`);
          const data  = response.data;

          setdistinctProduct(data);
        } catch (error) {
          console.error(`Error fetching distinct data Product List: ${error}`);
        }
    };

    useEffect(() => {
        fetchProductList();
    }, [selectedProduct]);

    const handleProductChange = (event, newValue) => {
        setSelectedProduct(newValue);
    }

    const handleSearch = () => {
        const product = selectedProduct == null ? 'ALL PRODUCT' : selectedProduct.prd_name;

        const queryParams = {
            product
        };
        // console.log('Query Params:', queryParams);
        onSearch(queryParams);
    };

    const handleClear = () => {
        setSelectedProduct(null);

        const clear_data = 'Clear Data';

        const queryParams = {
            clear_data
        };
        // console.log('Query Params:', queryParams);
        onSearch(queryParams);
    };

    return (
        <React.Fragment>
            <Box maxWidth="xl" sx={{ height: 80 }}>
                <Grid container spacing={0} > 
                    <Grid item xs={2} md={1} style={{  display: 'flex',}}>
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                            <Autocomplete
                                disablePortal
                                options={distinctProduct}
                                getOptionLabel={(option) => (option ? String(option.prd_name) : '')}
                                value={selectedProduct}
                                onChange={handleProductChange}
                                sx={{
                                        width: 250 , 
                                        marginTop: '10px' , 
                                        backgroundColor: '#ECE8DD', 
                                        borderRadius: 3, 
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    }}
                                isOptionEqualToValue={(option, value) => option.prd_name === value.prd_name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Please Select Product"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            sx: { border: 'none', boxShadow: 'none', color: 'blue' }, // Removes border and sets font color
                                        }}
                                        sx={{ '& .MuiInputBase-input': { color: 'blue', fontSize: 18 } }} // Ensures input text is blue
                                    />
                                )}
                            />
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', marginLeft: 10, }}>
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
                    </Grid>
                </Grid>
            </Box>
        </React.Fragment>
    );
}

export default EDI_Search_Product_Special_List