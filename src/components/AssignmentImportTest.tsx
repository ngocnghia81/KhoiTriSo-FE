import React, { useState } from 'react';
import { Card, Button, Typography, Space, Alert, Upload, message, Input } from 'antd';
import { UploadOutlined, FileWordOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AssignmentImportTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lessonId, setLessonId] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (info: any) => {
    if (info.file.originFileObj) {
      setFile(info.file.originFileObj);
    }
  };

  const testValidateWord = async () => {
    if (!file) {
      message.error('Vui lòng chọn file Word');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const fileBuffer = await file.arrayBuffer();

      const response = await fetch('http://localhost:8080/api/assignments/validate-word', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/octet-stream',
          'X-File-Name': file.name,
          'X-Content-Type': file.type
        },
        body: fileBuffer
      });

      const data = await response.json();
      
      console.log('Validate Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      setResult({
        type: 'validate',
        status: response.status,
        data,
        success: response.ok
      });

      if (response.ok) {
        message.success('Validate thành công!');
      } else {
        message.error(`Validate thất bại: ${response.status}`);
      }
    } catch (error) {
      console.error('Validate Error:', error);
      setResult({
        type: 'validate',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
      message.error('Lỗi khi validate file');
    } finally {
      setLoading(false);
    }
  };

  const testImportWord = async () => {
    if (!file) {
      message.error('Vui lòng chọn file Word');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const fileBuffer = await file.arrayBuffer();

      const response = await fetch(`http://localhost:8080/api/assignments/import-word?lessonId=${lessonId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/octet-stream',
          'X-File-Name': file.name,
          'X-Content-Type': file.type
        },
        body: fileBuffer
      });

      const data = await response.json();
      
      console.log('Import Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      setResult({
        type: 'import',
        status: response.status,
        data,
        success: response.ok
      });

      if (response.ok) {
        message.success('Import thành công!');
      } else {
        message.error(`Import thất bại: ${response.status}`);
      }
    } catch (error) {
      console.error('Import Error:', error);
      setResult({
        type: 'import',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
      message.error('Lỗi khi import file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Assignment Import Test" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* File Upload */}
        <div>
          <Title level={5}>1. Chọn File Word</Title>
          <Upload
            accept=".docx,.doc"
            beforeUpload={() => false}
            onChange={handleFileChange}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              {file ? file.name : 'Chọn File Word'}
            </Button>
          </Upload>
          {file && (
            <div style={{ marginTop: 8 }}>
              <FileWordOutlined style={{ marginRight: 8 }} />
              <Text>{file.name} ({(file.size / 1024).toFixed(2)} KB)</Text>
            </div>
          )}
        </div>

        {/* Lesson ID */}
        <div>
          <Title level={5}>2. Lesson ID</Title>
          <Input
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            placeholder="Nhập Lesson ID"
            style={{ width: 200 }}
          />
        </div>

        {/* Test Buttons */}
        <div>
          <Title level={5}>3. Test API</Title>
          <Space>
            <Button
              type="primary"
              onClick={testValidateWord}
              loading={loading}
              disabled={!file}
            >
              Test Validate Word
            </Button>
            <Button
              onClick={testImportWord}
              loading={loading}
              disabled={!file}
            >
              Test Import Word
            </Button>
          </Space>
        </div>

        {/* Results */}
        {result && (
          <div>
            <Title level={5}>4. Kết quả</Title>
            <Alert
              type={result.success ? 'success' : 'error'}
              message={`${result.type === 'validate' ? 'Validate' : 'Import'} ${result.success ? 'thành công' : 'thất bại'}`}
              description={
                <div>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    fontSize: 12,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              }
            />
          </div>
        )}

        {/* Instructions */}
        <Alert
          type="info"
          message="Hướng dẫn test"
          description={
            <div>
              <p>1. Chọn file Word (.docx hoặc .doc)</p>
              <p>2. Nhập Lesson ID (mặc định: 1)</p>
              <p>3. Test Validate Word trước để kiểm tra file</p>
              <p>4. Test Import Word để import bài tập</p>
              <p>5. Xem kết quả trong console và UI</p>
            </div>
          }
        />

      </Space>
    </Card>
  );
};

export default AssignmentImportTest;
