import { Avatar, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, Typography } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { RememberMe } from '@mui/icons-material';
import { Button } from '@/app/components/button';
import TextField from '@/app/components/textfield';

const LoginForm = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <form className="space-y-3">
            <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
                <div className="flex flex-col items-center gap-2">
                    <Typography variant='h6' className="mb-3 text-l font-bold">
                        Đăng nhập vào hệ thống
                    </Typography>
                    <Image
                        src="/logo.png"
                        width={144}
                        height={98}
                        alt="Logo" />
                </div>
                <div className=' flex flex-col w-full relative pt-3'>
                    <FormControl>
                        <Typography fontSize='14px' fontWeight={700}>Tên đăng nhập <span style={{ color: 'red' }}>*</span></Typography>
                        <TextField
                            label="Nhập tên đăng nhập"
                            // value={username}
                            // onChange={handleUsernameChange}
                            maxLength={50}
                        />
                    </FormControl>
                    <FormControl sx={{paddingTop: '16px'}}>
                        <Typography fontSize='14px' fontWeight={700}>Mật khẩu <span style={{ color: 'red' }}>*</span></Typography>
                        <TextField
                            label="Nhập mật khẩu"
                            fullWidth
                            type={showPassword ? 'text' : 'password'} // Toggle between text and password
                            value={password}
                            onChange={handlePasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon fontSize='small' sx={{color: '#99BC4D'}} /> : <VisibilityIcon fontSize='small' sx={{color: '#99BC4D'}} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </FormControl>
                    <div className='flex items-center justify-between mt-2'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    sx={{
                                        color: '#99BC4D', // Default color
                                        '&.Mui-checked': {
                                            color: '#99BC4D', // Color when checked
                                        },
                                        '&:hover': {
                                            backgroundColor: '#EDF0ED', // Background color on hover
                                        },
                                        '&.MuiCheckbox-colorPrimary.Mui-checked:hover': {
                                            backgroundColor: '#EDF0ED', // Background color on hover when checked
                                        },
                                    }}
                                />
                            }
                            label="Nhớ đăng nhập"
                            sx={{ fontSize: '14px', color: 'black', '& .css-rizt0-MuiTypography-root':{
                                fontSize: '14px'
                            } }}
                        />
                        <Button
                            variant='text'
                        // onClick={handleForgotPassword}
                        >
                            Quên mật khẩu?
                        </Button>
                    </div>
                    <Button variant='contained' type="submit" className="mt-4 w-full">Đăng nhập</Button>
                </div>
            </div>
        </form>
    )
}

export default LoginForm