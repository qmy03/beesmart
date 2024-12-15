"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import { Button } from "@/app/components/button";
import theme from "@/app/components/theme";

const AboutUsPage: React.FC = () => {
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
          Về Chúng Tôi
        </Typography>

        {/* Nội dung */}
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
            BeeSmart là nền tảng học toán trực tuyến dành riêng cho học sinh tiểu học từ lớp 1 đến lớp 5. Chúng tôi được thành lập với mục tiêu mang đến một phương pháp học tập sáng tạo, giúp học sinh tiếp cận kiến thức toán học một cách dễ dàng và thú vị, đồng thời phát triển tư duy logic và kỹ năng giải quyết vấn đề.
          </Typography>

          <Typography paragraph>
            Với sự kết hợp giữa công nghệ tiên tiến và nội dung học tập được thiết kế kỹ lưỡng bởi các chuyên gia giáo dục hàng đầu, BeeSmart luôn cam kết mang lại những giá trị vượt trội cho người học. Chúng tôi không chỉ là một nền tảng học tập, mà còn là người bạn đồng hành trên hành trình chinh phục tri thức của học sinh.
          </Typography>

          <Typography fontSize="20px" fontWeight={600} pt={3}>
            Tầm nhìn của chúng tôi
          </Typography>
          <Typography paragraph pt={2}>
            BeeSmart hướng tới việc trở thành nền tảng giáo dục trực tuyến hàng đầu, nơi mọi học sinh, dù ở bất kỳ đâu, đều có thể tiếp cận kiến thức chất lượng cao một cách thuận tiện và hiệu quả. Chúng tôi tin rằng công nghệ không chỉ là công cụ mà còn là cầu nối giúp giáo dục trở nên dễ tiếp cận hơn với mọi người.
          </Typography>

          <Typography variant="h6" fontSize="20px" fontWeight={600} pt={3}>
            Sứ mệnh của chúng tôi
          </Typography>
          <Typography paragraph pt={2}>
            Sứ mệnh của BeeSmart là xây dựng một môi trường học tập trực tuyến toàn diện, nơi học sinh được khuyến khích phát huy tối đa tiềm năng của mình thông qua các bài giảng chất lượng cao, bài kiểm tra thú vị, và các trò chơi học tập sáng tạo. Chúng tôi mong muốn truyền cảm hứng học tập và tạo ra niềm vui khi học toán cho mỗi học sinh.
          </Typography>

          <Typography variant="h6" fontSize="20px" fontWeight={600} pt={3}>
            Giá trị cốt lõi
          </Typography>
          <Typography paragraph pt={2}>
            <strong>1. Chất lượng:</strong> Đảm bảo nội dung học tập được biên soạn kỹ lưỡng, phù hợp với từng độ tuổi và trình độ của học sinh.  
          </Typography>
          <Typography paragraph>
            <strong>2. Sáng tạo:</strong> Tích hợp công nghệ và phương pháp học tập hiện đại để mang đến trải nghiệm học tập thú vị và hiệu quả.  
          </Typography>
          <Typography paragraph>
            <strong>3. Hỗ trợ:</strong> Đội ngũ chăm sóc khách hàng và giáo viên luôn sẵn sàng hỗ trợ học sinh và phụ huynh trong suốt quá trình sử dụng nền tảng.  
          </Typography>
          <Typography paragraph>
            <strong>4. Tương tác:</strong> Khuyến khích học sinh tham gia vào các hoạt động nhóm, diễn đàn thảo luận để phát triển kỹ năng giao tiếp và làm việc nhóm.
          </Typography>

          <Typography paragraph>
            Chúng tôi tin rằng mỗi học sinh đều có tiềm năng riêng biệt, và BeeSmart luôn sẵn sàng đồng hành cùng các em để phát triển năng lực ấy. Với BeeSmart, học toán không chỉ là một nhiệm vụ mà còn là một hành trình khám phá đầy thú vị và bổ ích.
          </Typography>
        </Box>

        {/* Nút quay về */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.history.back()}
          sx={{
            marginTop: "20px",
          }}
        >
          Quay lại
        </Button>
      </Box>
    </Layout>
  );
};

export default AboutUsPage;
