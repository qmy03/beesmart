import {
  TextField as MuiTextField,
  InputAdornment,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import { SxProps } from "@mui/system";
import theme from "./theme";

interface TextFieldProps extends Omit<MuiTextFieldProps, "InputProps"> {
  label?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
  endAdornment?: React.ReactNode;
  InputProps?: any;
  error?: boolean;
  helperText?: string;
  FormHelperTextProps?: any; // Add this line
  sx?: SxProps;
}

// const TextField: React.FC<TextFieldProps> = ({
//     label,
//     value,
//     onChange,
//     type = 'text',
//     maxLength,
//     endAdornment,
//     error = false,
//     helperText,
//     FormHelperTextProps, // Destructure this prop
//     sx,
//     ...muiProps
// }) => (
//     <MuiTextField
//         fullWidth
//         margin="normal"
//         size="small"
//         label={label}
//         variant="outlined"
//         value={value}
//         onChange={onChange}
//         type={type}
//         inputProps={{ maxLength }}
//         InputProps={{
//             endAdornment: endAdornment && (
//                 <InputAdornment position="end">{endAdornment}</InputAdornment>
//             ),
//         }}
//         error={error}
//         helperText={helperText}
//         FormHelperTextProps={{
//             sx: {
//                 margin: 0,
//                 fontSize: '14px',
//                 color: 'red', // Ensure the helper text is red
//             },
//             ...FormHelperTextProps, // Spread any additional props
//         }}
//         sx={{
//             ".css-186ql75-MuiFormHelperText-root.Mui-error": {
//             color: "red"
//           },
//             '& .css-1pzfmz2-MuiInputBase-input-MuiOutlinedInput-input':{
//                 fontSize: '14px',
//             },
//             '& .css-1881zc6-MuiFormControl-root-MuiTextField-root':{
//                 fontSize: '14px',
//             },
//             '& .MuiOutlinedInput-root:hover fieldset': {
//                 borderColor: theme.palette.primary.main,
//             },
//             '& .MuiOutlinedInput-root.Mui-focused fieldset': {
//                 borderColor: theme.palette.primary.main,
//             },
//             '& label.Mui-focused': {
//                 color: theme.palette.primary.main,
//             },
//             '& .MuiInputLabel-root': {
//                 fontSize: '14px',
//             },
//             ...sx,
//         }}
//         {...muiProps}
//     />
// );

// export default TextField;
const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
  endAdornment,
  error = false,
  helperText,
  FormHelperTextProps,
  sx,
  ...muiProps
}) => (
  <MuiTextField
    fullWidth
    margin="normal"
    size="small"
    label={label}
    variant="outlined"
    value={value}
    onChange={onChange}
    type={type}
    inputProps={{ maxLength }}
    InputProps={{
      endAdornment: endAdornment && (
        <InputAdornment position="end">{endAdornment}</InputAdornment>
      ),
    }}
    error={error}
    helperText={helperText}
    FormHelperTextProps={{
      sx: {
        margin: 0,
        fontSize: "14px",
        color: "red", // Helper text in red
      },
      ...FormHelperTextProps,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: error ? "red" : "rgba(0, 0, 0, 0.23)", // Default border
        },
        "&:hover fieldset": {
          borderColor: error ? "red" : theme.palette.primary.main, // Hover effect
        },
        "&.Mui-focused fieldset": {
          borderColor: error ? "red" : theme.palette.primary.main, // Focus effect
        },
      },
      "& .MuiInputLabel-root.Mui-error": {
        color: "red", // Label color when error
      },
      "& .MuiFormHelperText-root.Mui-error": {
        color: "red", // Ensure helper text is red
      },
      "& .MuiInputLabel-root": {
        fontSize: "14px",
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: theme.palette.primary.main, // Label color when focused
      },
      "& .MuiOutlinedInput-input": {
        fontSize: "14px",
      },
      ...sx,
    }}
    {...muiProps}
  />
);

export default TextField;
