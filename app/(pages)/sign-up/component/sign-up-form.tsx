import { Avatar, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, Typography } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { RememberMe } from '@mui/icons-material';
import { Button } from '@/app/components/button';
import TextField from '@/app/components/textfield';

const SignUpForm = () => {
    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordAgain, setShowPasswordAgain] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handlePasswordAgainChange = (event) => {
        const value = event.target.value;
        setPasswordAgain(value);
        setPasswordError(value !== password);
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };
    return (
        <form className="space-y-3">
            <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
                <div className="flex flex-col items-center">
                    <Typography variant='h4' className="mb-4 text-l font-bold ">
                        Đăng ký tài khoản
                    </Typography>
                </div>
                <div className=' flex flex-col w-full relative pt-3'>
                    <div className='flex flex-col gap-4'>
                        <FormControl>
                            <Typography fontSize='14px' fontWeight={700}>Họ và tên<span style={{ color: 'red' }}>*</span></Typography>
                            <TextField
                                label="Nhập họ và tên"
                                // value={username}
                                // onChange={handleUsernameChange}
                                maxLength={50}
                            />
                        </FormControl>
                        <FormControl>
                            <Typography fontSize='14px' fontWeight={700}>Tên đăng nhập<span style={{ color: 'red' }}>*</span></Typography>
                            <TextField
                                label="Nhập tên đăng nhập"
                                // value={username}
                                // onChange={handleUsernameChange}
                                maxLength={50}
                            />
                        </FormControl>
                        <div className='flex'>
                            <FormControl>
                                <Typography fontSize='14px' fontWeight={700}>Nhập mật khẩu <span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    label="Nhập mật khẩu"
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOffIcon fontSize='small' sx={{ color: '#99BC4D' }} /> : <VisibilityIcon fontSize='small' sx={{ color: '#99BC4D' }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ paddingRight: '10px' }}
                                />
                            </FormControl>
                            <FormControl error={passwordError}>
                                <Typography fontSize='14px' fontWeight={700}>Nhập lại mật khẩu <span style={{ color: 'red' }}>*</span></Typography>
                                <TextField
                                    label="Nhập lại mật khẩu"
                                    fullWidth
                                    type={showPasswordAgain ? 'text' : 'password'}
                                    value={passwordAgain}
                                    onChange={handlePasswordAgainChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPasswordAgain((prev) => !prev)}
                                                    edge="end"
                                                >
                                                    {showPasswordAgain ? <VisibilityOffIcon fontSize='small' sx={{ color: '#99BC4D' }} /> : <VisibilityIcon fontSize='small' sx={{ color: '#99BC4D' }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText={passwordError ? 'Mật khẩu không khớp' : ''}
                                    FormHelperTextProps={{
                                        sx: {
                                            margin:0,
                                            fontSize: '12px',
                                            color: 'red',
                                        },
                                    }}
                                />
                            </FormControl>
                        </div>
                        <FormControl>
                            <Typography fontSize='14px' fontWeight={700}>Email<span style={{ color: 'red' }}>*</span></Typography>
                            <TextField
                                label="Nhập email"
                                // value={username}
                                // onChange={handleUsernameChange}
                                maxLength={50}
                            />
                        </FormControl>
                    </div>
                    <div className="flex items-center justify-center mt-2">
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
                            label={
                                <Typography sx={{ fontSize: '14px' }}>
                                    Đồng ý với <span style={{ color: '#99BC4D' }}>Điều khoản sử dụng</span> và <span style={{ color: '#99BC4D' }}>Chính sách bảo mật</span> của BeeSmart
                                </Typography>
                            }
                            sx={{
                                fontSize: '14px',
                                color: 'black', // This color can be removed or changed since the Typography handles it now
                            }}
                        />
                    </div>
                    <Button variant='contained' type="submit" className="mt-4 w-full">Đăng nhập</Button>
                </div>
            </div>
        </form>
    )
}

export default SignUpForm