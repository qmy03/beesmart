// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
// } from "@mui/material";
// import { Button } from "@/app/components/button";
// import TextField from "@/app/components/textfield";
// import { Close } from "@mui/icons-material";
// interface QuestionDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (questionData: any) => void;
// }

// const QuestionDialog: React.FC<QuestionDialogProps> = ({
//   open,
//   onClose,
//   onSave,
// }) => {
//   const [questionText, setQuestionText] = useState("");
//   const [imageUrl, setImageUrl] = useState(""); // Added field for image URL
//   const [optionA, setOptionA] = useState("");
//   const [optionB, setOptionB] = useState("");
//   const [optionC, setOptionC] = useState("");
//   const [optionD, setOptionD] = useState("");
//   const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | string>(
//     ""
//   );

//   const handleSave = () => {
//     if (
//       questionText &&
//       imageUrl &&
//       optionA &&
//       optionB &&
//       optionC &&
//       optionD &&
//       correctAnswerIndex !== ""
//     ) {
//       onSave({
//         content: questionText,
//         image: imageUrl,
//         options: [optionA, optionB, optionC, optionD], // options as an array
//         correctAnswerIndex: Number(correctAnswerIndex), // Ensure it's a number
//       });
//       // Clear the form
//       setQuestionText("");
//       setImageUrl("");
//       setOptionA("");
//       setOptionB("");
//       setOptionC("");
//       setOptionD("");
//       setCorrectAnswerIndex("");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
//         <Typography variant="h6" sx={{ flexGrow: 1 }}>
//           Thêm Câu hỏi Mới
//         </Typography>
//         <Close onClick={onClose} fontSize="small" sx={{ cursor: "pointer" }} />
//       </DialogTitle>
//       <DialogContent>
//         <Box sx={{ display: "flex", flexDirection: "column" }}>
//           <TextField
//             label="Câu hỏi"
//             variant="outlined"
//             fullWidth
//             value={questionText}
//             onChange={(e) => setQuestionText(e.target.value)}
//           />
//           <TextField
//             label="URL Hình ảnh"
//             variant="outlined"
//             fullWidth
//             value={imageUrl}
//             onChange={(e) => setImageUrl(e.target.value)}
//           />
//           <TextField
//             label="Option A"
//             variant="outlined"
//             fullWidth
//             value={optionA}
//             onChange={(e) => setOptionA(e.target.value)}
//           />
//           <TextField
//             label="Option B"
//             variant="outlined"
//             fullWidth
//             value={optionB}
//             onChange={(e) => setOptionB(e.target.value)}
//           />
//           <TextField
//             label="Option C"
//             variant="outlined"
//             fullWidth
//             value={optionC}
//             onChange={(e) => setOptionC(e.target.value)}
//           />
//           <TextField
//             label="Option D"
//             variant="outlined"
//             fullWidth
//             value={optionD}
//             onChange={(e) => setOptionD(e.target.value)}
//           />
//           <FormControl fullWidth>
//             {/* <InputLabel>Chọn Đáp Án Chính Xác</InputLabel> */}
//             <TextField
//               select
//               value={correctAnswerIndex}
//               onChange={(e) => setCorrectAnswerIndex(e.target.value)}
//               label="Chọn Đáp Án Chính Xác"
//             >
//               <MenuItem value={0}>A</MenuItem>
//               <MenuItem value={1}>B</MenuItem>
//               <MenuItem value={2}>C</MenuItem>
//               <MenuItem value={3}>D</MenuItem>
//             </TextField>
//           </FormControl>
//         </Box>
//       </DialogContent>
//       <DialogActions sx={{paddingRight: 3}}>
//         {/* <Button onClick={onClose} color="secondary">
//           Hủy
//         </Button> */}
//         <Button onClick={handleSave} color="primary" >
//           Lưu
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default QuestionDialog;
import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import { Close } from "@mui/icons-material";

interface QuestionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (questionData: any) => void;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Added field for image URL
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | string>(
    ""
  );
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]); // For MULTI_SELECT

  const handleSave = () => {
    if (questionText) {
      const questionData: any = {
        content: questionText,
        image: imageUrl,
        questionType,
      };

      if (questionType === "MULTIPLE_CHOICE") {
        questionData.options = [optionA, optionB, optionC, optionD];
        questionData.correctAnswer = [optionA, optionB, optionC, optionD][
          Number(correctAnswerIndex)
        ];
      } else if (questionType === "MULTI_SELECT") {
        questionData.options = [optionA, optionB, optionC, optionD];
        questionData.correctAnswers = correctAnswers;
      } else if (questionType === "FILL_IN_THE_BLANK") {
        questionData.answers = [optionA]; // You can customize how answers are provided for FILL_IN_THE_BLANK
      }

      onSave(questionData);
      // Clear the form
      setQuestionText("");
      setImageUrl("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswerIndex("");
      setCorrectAnswers([]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (index === 0) setOptionA(value);
    if (index === 1) setOptionB(value);
    if (index === 2) setOptionC(value);
    if (index === 3) setOptionD(value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Thêm Câu hỏi Mới
        </Typography>
        <Close onClick={onClose} fontSize="small" sx={{ cursor: "pointer" }} />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            label="Câu hỏi"
            variant="outlined"
            fullWidth
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <TextField
            label="URL Hình ảnh"
            variant="outlined"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {/* Question Type Select */}
          <FormControl fullWidth>
            {/* <InputLabel>Loại Câu Hỏi</InputLabel> */}
            <TextField
              select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              label="Loại Câu Hỏi"
            >
              <MenuItem value="MULTIPLE_CHOICE">Chọn 1 đáp án</MenuItem>
              <MenuItem value="MULTI_SELECT">Chọn nhiều đáp án</MenuItem>
              <MenuItem value="FILL_IN_THE_BLANK">Điền vào chỗ trống</MenuItem>
            </TextField>
          </FormControl>

          {/* Render Options based on question type */}
          {questionType !== "FILL_IN_THE_BLANK" && (
            <>
              <TextField
                label="Option A"
                variant="outlined"
                fullWidth
                value={optionA}
                onChange={(e) => handleOptionChange(0, e.target.value)}
              />
              <TextField
                label="Option B"
                variant="outlined"
                fullWidth
                value={optionB}
                onChange={(e) => handleOptionChange(1, e.target.value)}
              />
              <TextField
                label="Option C"
                variant="outlined"
                fullWidth
                value={optionC}
                onChange={(e) => handleOptionChange(2, e.target.value)}
              />
              <TextField
                label="Option D"
                variant="outlined"
                fullWidth
                value={optionD}
                onChange={(e) => handleOptionChange(3, e.target.value)}
              />
            </>
          )}

          {/* Correct Answer / Answers Field */}
          {questionType === "MULTIPLE_CHOICE" && (
            <FormControl fullWidth>
              {/* <InputLabel>Chọn Đáp Án Chính Xác</InputLabel> */}
              <TextField
              select
                value={correctAnswerIndex}
                onChange={(e) => setCorrectAnswerIndex(e.target.value)}
                label="Chọn Đáp Án Chính Xác"
              >
                <MenuItem value={0}>A</MenuItem>
                <MenuItem value={1}>B</MenuItem>
                <MenuItem value={2}>C</MenuItem>
                <MenuItem value={3}>D</MenuItem>
              </TextField>
            </FormControl>
          )}

          {questionType === "MULTI_SELECT" && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <TextField
                label="Chọn đáp án chính xác"
                variant="outlined"
                fullWidth
                value={correctAnswers.join(", ")}
                onChange={(e) =>
                  setCorrectAnswers(
                    e.target.value.split(",").map((val) => val.trim())
                  )
                }
              />
            </Box>
          )}

          {questionType === "FILL_IN_THE_BLANK" && (
            <TextField
              label="Điền vào chỗ trống"
              variant="outlined"
              fullWidth
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ paddingRight: 3 }}>
        <Button onClick={handleSave} color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog;
