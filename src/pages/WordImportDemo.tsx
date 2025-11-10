import React from 'react';
import { PageHeader, Card, Typography, Space, Button } from 'antd';
import { FileWordOutlined, CheckCircleOutlined, BugOutlined } from '@ant-design/icons';
import WordImportManager from '../components/WordImportManager';
import ApiDebugger from '../components/ApiDebugger';
import CoursesTestComponent from '../components/CoursesTestComponent';
import AssignmentImportTest from '../components/AssignmentImportTest';

const { Title, Paragraph } = Typography;

const WordImportDemo: React.FC = () => {
  const handleImportSuccess = (result: any) => {
    console.log('Import successful:', result);
    // Có thể redirect hoặc refresh danh sách bài tập
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Demo Import Bài Tập Từ Word"
        subTitle="Test flow validate và import file Word"
      />
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* Instructions */}
        <Card>
          <Title level={4}>
            <FileWordOutlined style={{ marginRight: 8 }} />
            Hướng dẫn sử dụng
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              <strong>Bước 1:</strong> Chọn file Word (.docx hoặc .doc) chứa bài tập
            </Paragraph>
            <Paragraph>
              <strong>Bước 2:</strong> Hệ thống sẽ tự động validate file để kiểm tra:
            </Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li>Định dạng file có đúng không</li>
              <li>Cấu trúc bài tập có hợp lệ không</li>
              <li>Số lượng câu hỏi ước tính</li>
            </ul>
            <Paragraph>
              <strong>Bước 3:</strong> Nếu file hợp lệ, nhấn "Import Bài Tập" để tạo bài tập mới
            </Paragraph>
            <Paragraph>
              <strong>Bước 4:</strong> Xem kết quả import và thông tin bài tập đã tạo
            </Paragraph>
          </Space>
        </Card>

        {/* API Endpoints Info */}
        <Card>
          <Title level={4}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            API Endpoints được sử dụng
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>POST /api/assignments/validate-word</strong>
              <br />
              <span style={{ color: '#666' }}>Kiểm tra file Word có hợp lệ không</span>
            </div>
            <div>
              <strong>POST /api/assignments/import-word</strong>
              <br />
              <span style={{ color: '#666' }}>Import bài tập từ file Word đã validate</span>
            </div>
          </Space>
        </Card>

        {/* API Debugger */}
        <ApiDebugger baseUrl="http://localhost:8080" />

        {/* Courses Test */}
        <CoursesTestComponent />

        {/* Assignment Import Test */}
        <AssignmentImportTest />

        {/* Import Component */}
        <WordImportManager 
          lessonId={1} // Thay bằng lessonId thực tế
          onImportSuccess={handleImportSuccess}
        />

        {/* Test Files */}
        <Card>
          <Title level={4}>File Test</Title>
          <Paragraph>
            Để test component này, bạn cần có file Word (.docx) chứa bài tập với cấu trúc hợp lệ.
            File sẽ được validate trước khi import.
          </Paragraph>
          <Button type="dashed" disabled>
            Download File Mẫu (Coming Soon)
          </Button>
        </Card>

      </Space>
    </div>
  );
};

export default WordImportDemo;
