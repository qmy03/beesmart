import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CheckIcon,
} from "@mui/material";

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
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | string>("");

  const handleSave = () => {
    if (questionText && imageUrl && optionA && optionB && optionC && optionD && correctAnswerIndex !== "") {
      onSave({
        content: questionText,
        image: imageUrl,
        options: [optionA, optionB, optionC, optionD], // options as an array
        correctAnswerIndex: Number(correctAnswerIndex), // Ensure it's a number
      });
      // Clear the form
      setQuestionText("");
      setImageUrl("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswerIndex("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tạo Câu Hỏi</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          <TextField
            label="Option A"
            variant="outlined"
            fullWidth
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />
          <TextField
            label="Option B"
            variant="outlined"
            fullWidth
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />
          <TextField
            label="Option C"
            variant="outlined"
            fullWidth
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />
          <TextField
            label="Option D"
            variant="outlined"
            fullWidth
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Chọn Đáp Án Chính Xác</InputLabel>
            <Select
              value={correctAnswerIndex}
              onChange={(e) => setCorrectAnswerIndex(e.target.value)}
              label="Chọn Đáp Án Chính Xác"
            >
              <MenuItem value={0}>A</MenuItem>
              <MenuItem value={1}>B</MenuItem>
              <MenuItem value={2}>C</MenuItem>
              <MenuItem value={3}>D</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleSave} color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog;
