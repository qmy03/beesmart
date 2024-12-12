// useSignupForm.ts
import { useState } from "react";
import { useAuth } from "./AuthContext"; // Adjust the import path as necessary

const useSignupForm = (setSnackbarMessage: (message: string | null) => void) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [email, setEmail] = useState("");
  const [userNameError, setUserNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordAgainError, setPasswordAgainError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const { registerUser } = useAuth(); // Get the register function

  const register = async (data: { role: string }) => {
    const { role } = data;
  
    setUserNameError(!userName);
    setPasswordError(!password);
    setEmailError(!email);
    setPasswordMismatchError(password !== passwordAgain);
  
    if (userName && password && email && password === passwordAgain) {
      const userData = {
        username: userName,
        email: email,
        password: password,
        role: role, // Truyền vai trò được chọn
      };
  
      const responseMessage = await registerUser(userData);
      // setSnackbarMessage(responseMessage);
    }
  };
  

  return {
    userName,
    userNameError,
    password,
    passwordAgain,
    passwordError,
    passwordAgainError,
    passwordMismatchError,
    email,
    emailError,
    setUserName,
    setPassword,
    setPasswordAgain,
    setEmail,
    register,
  };
};

export default useSignupForm;
