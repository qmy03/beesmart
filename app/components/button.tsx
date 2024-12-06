import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import React from 'react';
import theme from './theme';

interface ButtonProps extends MuiButtonProps {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "error" | "secondary";
}

export function Button({ children, variant = "contained", color = "primary", ...rest }: ButtonProps) {
  return (
    <MuiButton 
      variant={variant} 
      color={color} 
      {...rest} 
      sx={{
        textTransform:'none',
        '&.MuiButton-contained': {
          backgroundColor: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          color: color === "error" ? '#fff' : '#fff',
          '&:disabled': {
            backgroundColor: theme.palette.secondary.light,
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
          },
        },
        '&.MuiButton-outlined': {
          color: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          borderColor: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: color === "error" ? theme.palette.error.light : theme.palette.primary.light,
          },
        },
        '&.MuiButton-text': {
          
          color: color === "primary" ? "#FFFFFF" : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: color === "primary" ? "#B8D07F" : theme.palette.primary.light,
          },
        }
      }}
    >
      {children}
    </MuiButton>
  );
}
