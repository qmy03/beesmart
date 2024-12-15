"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import { Button } from "@/app/components/button";
import theme from "@/app/components/theme";

const HomePage: React.FC = () => {
  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px",
          gap: "20px",
        }}
      >
        {/* Tiêu đề */}
        <Typography
          fontSize="32px"
          color={theme.palette.primary.main}
          fontWeight={700}
          textAlign="center"
        >
          Quy định chung của BeeSmart
        </Typography>

        {/* Nội dung quy định */}
        <Box
          sx={{
            maxWidth: "800px",
            textAlign: "justify",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#555",
            pt: 2,
          }}
        >
          <Typography paragraph>
            Chào mừng bạn đến với nền tảng học toán BeeSmart. Khi sử dụng nền
            tảng này, bạn cần tuân thủ các quy định sau để đảm bảo môi trường
            học tập trực tuyến an toàn và hiệu quả:
          </Typography>

          <Typography paragraph>
            <strong>1. Quy định về tài khoản:</strong> Người dùng cần cung cấp
            thông tin chính xác khi đăng ký tài khoản. Việc sử dụng tài khoản
            của người khác hoặc chia sẻ thông tin đăng nhập là không được phép.
          </Typography>

          <Typography paragraph>
            <strong>2. Nội dung học tập:</strong> Toàn bộ nội dung học tập trên
            BeeSmart được bảo vệ bởi luật bản quyền. Nghiêm cấm sao chép, chia
            sẻ hoặc sử dụng vào mục đích thương mại khi chưa được sự đồng ý.
          </Typography>

          <Typography paragraph>
            <strong>3. Quy định về hành vi:</strong> Người dùng cần giữ thái độ
            văn minh khi tham gia các hoạt động trên nền tảng, bao gồm diễn đàn
            hoặc lớp học trực tuyến. Các hành vi xúc phạm hoặc quấy rối sẽ bị
            xử lý nghiêm.
          </Typography>

          <Typography paragraph>
            <strong>4. Quyền lợi và trách nhiệm:</strong> BeeSmart cam kết bảo vệ
            thông tin cá nhân của người dùng và cung cấp môi trường học tập tốt
            nhất. Người dùng có trách nhiệm báo cáo các sự cố hoặc hành vi vi
            phạm.
          </Typography>

          <Typography paragraph>
            Chúng tôi hy vọng rằng các quy định trên sẽ giúp BeeSmart trở thành
            một nơi học tập lý tưởng cho tất cả mọi người.
          </Typography>
        </Box>

        {/* Nút quay về */}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => window.history.back()}
          sx={{
            marginTop: "20px",
          }}
        >
          Quay lại
        </Button> */}
      </Box>
    </Layout>
  );
};

export default HomePage;