
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";

const DialogPopup = ({
  open,
  onClose,
  onQuizUpdated,
  dialogType,
  quizData,
  selectedLessonId,
  selectedTopicId,
}: any) => {
  console.log("selectedLESSON", selectedLessonId);
  console.log("selectedTOPIC", selectedTopicId);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizDuration, setQuizDuration] = useState<number>(10);
  // Fetch quiz data if editing
  useEffect(() => {
    if (dialogType === "edit" && quizData) {
      setTitle(quizData.title || "");
      setDescription(quizData.description || "");
      setQuizDuration(quizData.quizDuration || 10);
    }
  }, [dialogType, quizData]);

  const handleSave = () => {
    setLoading(true);
    const payload = { title, description, quizDuration };
  
    // Check for the API endpoint based on the IDs
    let apiUrl = "";
  
    if (selectedLessonId && selectedTopicId) {
      // If both selectedLessonId and selectedTopicId are present, call the lesson-based API
      apiUrl = `/quizzes/lesson/${selectedLessonId}`;
    } else if (selectedTopicId) {
      // If only selectedTopicId is present, call the topic-based API
      apiUrl = `/quizzes/topic/${selectedTopicId}`;
    } else {
      console.error("No valid ID provided.");
      setLoading(false);
      return;
    }
  
    if (dialogType === "add") {
      // Call API to create quiz
      apiService
        .post(apiUrl, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data); // Pass the new quiz data back
          onClose();
        })
        .catch((error) => console.error("Error creating quiz:", error))
        .finally(() => setLoading(false));
    } else if (dialogType === "edit" && quizData) {
      // Call API to update quiz
      apiService
        .put(`/quizzes/${quizData.quizId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data); // Pass updated quiz data back
          onClose();
        })
        .catch((error) => console.error("Error updating quiz:", error))
        .finally(() => setLoading(false));
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {dialogType === "add" ? "Thêm mới Quiz" : "Chỉnh sửa Quiz"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tiêu đề"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Mô tả"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Thời lượng (phút)"
          type="number"
          fullWidth
          margin="normal"
          value={quizDuration}
          onChange={(e) => setQuizDuration(parseInt(e.target.value) || 10)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPopup;