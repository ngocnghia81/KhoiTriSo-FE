'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Modal, Spin } from 'antd';
import { BookOutlined, KeyOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useBookActivation } from '../hooks/useBooks';

const { Title, Text, Paragraph } = Typography;

interface BookActivationProps {
  onActivationSuccess?: (bookId: number, bookTitle: string) => void;
}

const BookActivation: React.FC<BookActivationProps> = ({ onActivationSuccess }) => {
  const [form] = Form.useForm();
  const [activationCode, setActivationCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    bookId?: number;
    bookTitle?: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { validateCode, activateBook, loading, error } = useBookActivation();

  const handleCodeChange = async (value: string) => {
    setActivationCode(value);
    setValidationResult(null);
    
    if (value.length >= 8) { // Assume activation codes are at least 8 characters
      try {
        const result = await validateCode(value);
        setValidationResult(result);
      } catch (err) {
        setValidationResult({ isValid: false });
      }
    }
  };

  const handleActivate = async () => {
    if (!validationResult?.isValid) {
      return;
    }

    try {
      const result = await activateBook(activationCode);
      
      if (result.success) {
        setShowSuccessModal(true);
        onActivationSuccess?.(validationResult.bookId!, validationResult.bookTitle!);
        form.resetFields();
        setActivationCode('');
        setValidationResult(null);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const getValidationStatus = () => {
    if (!activationCode) return null;
    
    if (loading) {
      return (
        <Space>
          <Spin size="small" />
          <Text type="secondary">Đang kiểm tra mã...</Text>
        </Space>
      );
    }
    
    if (validationResult?.isValid) {
      return (
        <Alert
          type="success"
          message="Mã kích hoạt hợp lệ"
          description={
            <div>
              <Text strong>{validationResult.bookTitle}</Text>
              <br />
              <Text type="secondary">Bạn có thể kích hoạt sách này</Text>
            </div>
          }
          icon={<CheckCircleOutlined />}
          showIcon
        />
      );
    }
    
    if (validationResult?.isValid === false) {
      return (
        <Alert
          type="error"
          message="Mã kích hoạt không hợp lệ"
          description="Vui lòng kiểm tra lại mã kích hoạt"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      );
    }
    
    return null;
  };

  return (
    <div style={{ padding: '0' }}>
      <Card style={{
        borderRadius: '20px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
        border: 'none',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
      }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          
          {/* Header */}
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}>
              <KeyOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
            <Title level={2} style={{
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2rem'
            }}>
              Kích hoạt sách điện tử
            </Title>
            <Paragraph style={{
              fontSize: '1.1rem',
              color: '#666',
              marginTop: '8px',
              maxWidth: '500px',
              margin: '8px auto 0'
            }}>
              Nhập mã kích hoạt để truy cập video giải bài tập và nội dung số chất lượng cao
            </Paragraph>
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              type="error"
              message="Lỗi"
              description={error}
              showIcon
            />
          )}

          {/* Activation Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleActivate}
          >
            <Form.Item
              label="Mã kích hoạt"
              name="activationCode"
              rules={[
                { required: true, message: 'Vui lòng nhập mã kích hoạt' },
                { min: 8, message: 'Mã kích hoạt phải có ít nhất 8 ký tự' }
              ]}
            >
              <Input
                placeholder="Nhập mã kích hoạt sách"
                value={activationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                prefix={<BookOutlined />}
                size="large"
                style={{ fontSize: 16 }}
              />
            </Form.Item>

            {/* Validation Status */}
            {getValidationStatus()}

            {/* Activate Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                disabled={!validationResult?.isValid}
                style={{ width: '100%' }}
              >
                Kích hoạt sách
              </Button>
            </Form.Item>
          </Form>

          {/* Instructions */}
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
              Hướng dẫn sử dụng
            </Title>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>Nhập mã kích hoạt được cung cấp khi mua sách</li>
              <li>Mã kích hoạt chỉ có thể sử dụng một lần</li>
              <li>Sau khi kích hoạt, bạn có thể đọc sách ngay lập tức</li>
              <li>Sách đã kích hoạt sẽ xuất hiện trong "Sách của tôi"</li>
            </ul>
          </Card>
        </Space>
      </Card>

      {/* Success Modal */}
      <Modal
        title="Kích hoạt thành công!"
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        footer={[
          <Button type="primary" onClick={() => setShowSuccessModal(false)}>
            Đóng
          </Button>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4} style={{ color: '#52c41a' }}>
            Chúc mừng!
          </Title>
          <Paragraph>
            Bạn đã kích hoạt thành công sách <Text strong>{validationResult?.bookTitle}</Text>
          </Paragraph>
          <Paragraph type="secondary">
            Bây giờ bạn có thể đọc sách trong thư viện cá nhân của mình.
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default BookActivation;
