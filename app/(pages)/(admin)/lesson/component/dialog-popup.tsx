import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  MenuItem,
} from "@mui/material";
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
import apiService from "@/app/untils/api";
import { Close } from "@mui/icons-material";

interface DialogPopupProps {
  open: boolean;
  onClose: () => void;
  onTopicAdded: () => void;
  accessToken: string;
  selectedGradeId: string;
  selectedSemester: string;
  selectedLessonId: string; // Use this prop for lesson fetching

}

const DialogPopup: React.FC<
  DialogPopupProps & { type: "add" | "edit"; topic?: any; lesson?: any, topicId?: any }
> = ({
  open,
  onClose,
  onTopicAdded,
  accessToken,
  selectedGradeId,
  selectedSemester,
  type,
  topic,
  lesson,
  topicId,
}) => {
  const [topicName, setTopicName] = useState(topic?.topicName || "");
  const [topicNumber, setTopicNumber] = useState(topic?.topicNumber || 1);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topic?.topicId || ""
  );
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);
console.log(topicId)
  // Fetch lesson data when the selectedLessonId changes
  useEffect(() => {
    if (lesson) {
      apiService
        .get(`/lessons/${lesson}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const fetchedLesson = response.data.data;
          console.log("fetchLesson", fetchedLesson); // Assume lesson data is here
          setTopicName(fetchedLesson.lessonName || "");
          console.log("lessonNumber", fetchedLesson.lessonNumber);
          setTopicNumber(fetchedLesson.lessonNumber || 1);
          setDescription(fetchedLesson.description || "");
          setContent(fetchedLesson.content || "");
        })
        .catch((error) => {
          console.error("Error fetching lesson data:", error);
        });
    }
  }, [lesson, accessToken]); // Re-run when selectedLessonId changes

  // Fetch available topics when selectedGradeId or selectedSemester changes
  useEffect(() => {
    if (selectedGradeId && selectedSemester) {
      apiService
        .get(
          `/topics/grade/${selectedGradeId}/semester?semester=${selectedSemester}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        .then((response) => {
          const fetchedTopics = response.data.data.topics;
          console.log("fetchedTopics", fetchedTopics);
          if (Array.isArray(fetchedTopics)) {
            setAvailableTopics(fetchedTopics);
          } else {
            console.error("Expected an array but got:", fetchedTopics);
          }
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
        });
    }
  }, [selectedGradeId, selectedSemester, accessToken]);
  
  console.log("ABC", topic);
  const handleSubmit = () => {
    const body = {
      lessonName: topicName,
      lessonNumber: topicNumber,
      description: description,
      content: content,
    };
    

    if (type === "add") {
      apiService
        .post(`/lessons/topic/${selectedTopicId}`, body, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          console.log("Lesson added:", response);
          onTopicAdded();
          onClose();
        })
        .catch((error) => {
          console.error("Error adding lesson:", error);
        });
    } else if (type === "edit") {
      apiService
        .put(`/lessons/${lesson}`, body, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          console.log("Lesson updated:", response);
          onTopicAdded();
          onClose();
        })
        .catch((error) => {
          console.error("Error updating lesson:", error);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {type === "add" ? "Thêm Bài Học Mới" : "Chỉnh Sửa Bài Học"}
        </Typography>
        <Close onClick={onClose} fontSize="small" sx={{ cursor: "pointer" }} />
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tên Bài Học"
          fullWidth
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
        />
        <TextField
          label="Số Bài Học"
          fullWidth
          value={topicNumber}
          onChange={(e) => setTopicNumber(Number(e.target.value))}
          type="number"
        />
        <TextField label="Học Kì" fullWidth value={selectedSemester} disabled />

        {type === "add" && (
          <TextField
            select
            label="Chọn Chủ Đề"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            fullWidth
          >
            {availableTopics.map((topic) => (
              <MenuItem key={topic.topicId} value={topic.topicId}>
                {topic.topicName}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Mô tả"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Nội dung"
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ paddingRight: 3 }}>
        <Button onClick={handleSubmit} color="primary">
          {type === "add" ? "Lưu" : "Cập Nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPopup;
