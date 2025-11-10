import React, { useState } from 'react';
import { Card, Button, Typography, Space, Alert, Divider } from 'antd';
import { BugOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ApiDebuggerProps {
  baseUrl?: string;
}

const ApiDebugger: React.FC<ApiDebuggerProps> = ({ baseUrl = 'http://localhost:8080' }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Test basic connectivity
      const response = await fetch(`${baseUrl}/api/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const debugData = {
        url: `${baseUrl}/api/courses`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
        timestamp: new Date().toISOString(),
      };

      // Try to get response body
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            debugData.body = JSON.parse(text);
          } else {
            debugData.body = 'Empty response';
          }
        } else {
          debugData.body = `Non-JSON response (${contentType})`;
        }
      } catch (parseError) {
        debugData.parseError = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      }

      setDebugInfo(debugData);
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setIsLoading(true);
    setDebugInfo(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      const debugData = {
        url: `${baseUrl}/api/auth/me`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
        timestamp: new Date().toISOString(),
      };

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            debugData.body = JSON.parse(text);
          } else {
            debugData.body = 'Empty response';
          }
        } else {
          debugData.body = `Non-JSON response (${contentType})`;
        }
      } catch (parseError) {
        debugData.parseError = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      }

      setDebugInfo(debugData);
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={
      <Space>
        <BugOutlined />
        <span>API Debugger</span>
      </Space>
    }>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        <div>
          <Title level={5}>Test API Connection</Title>
          <Space>
            <Button 
              type="primary" 
              onClick={testApiConnection}
              loading={isLoading}
              icon={<ApiOutlined />}
            >
              Test Courses API
            </Button>
            <Button 
              onClick={testAuthEndpoint}
              loading={isLoading}
              icon={<ApiOutlined />}
            >
              Test Auth API
            </Button>
          </Space>
        </div>

        <Divider />

        {debugInfo && (
          <div>
            <Title level={5}>Debug Information</Title>
            <Card size="small">
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 6,
                overflow: 'auto',
                maxHeight: 400,
                fontSize: 12
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Card>
          </div>
        )}

        <Alert
          type="info"
          message="API Debugger"
          description={
            <div>
              <Paragraph>
                Sử dụng tool này để debug các vấn đề API:
              </Paragraph>
              <ul>
                <li><strong>Test Courses API:</strong> Kiểm tra kết nối đến API courses</li>
                <li><strong>Test Auth API:</strong> Kiểm tra authentication và token</li>
                <li><strong>Debug Info:</strong> Xem chi tiết response và headers</li>
              </ul>
              <Paragraph>
                <Text code>Base URL:</Text> {baseUrl}
              </Paragraph>
            </div>
          }
        />

      </Space>
    </Card>
  );
};

export default ApiDebugger;
