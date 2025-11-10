'use client';

import React from 'react';
import { 
  Card, 
  List, 
  Button, 
  Typography, 
  Space, 
  Spin, 
  Alert, 
  Empty, 
  Popconfirm,
  Image,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  ShoppingCartOutlined, 
  DeleteOutlined, 
  MinusOutlined, 
  PlusOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types/cart';

const { Title, Text } = Typography;

export default function Cart() {
  const { cart, loading, error, removeFromCart, clearCart } = useCart();

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && !cart) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Đang tải giỏ hàng...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '16px' }}
      />
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <Card style={{ margin: '16px' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
          description="Giỏ hàng trống"
        >
          <Button type="primary" href="/books">
            Mua sắm ngay
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <ShoppingCartOutlined style={{ marginRight: '12px' }} />
                Giỏ hàng của bạn
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {cart.totalItems} sản phẩm
              </Text>
            </Col>
            <Col>
              <Popconfirm
                title="Xóa toàn bộ giỏ hàng?"
                description="Bạn có chắc muốn xóa tất cả sản phẩm?"
                onConfirm={handleClearCart}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button 
                  danger 
                  icon={<ClearOutlined />}
                  disabled={loading}
                >
                  Xóa tất cả
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </div>

        <List
          dataSource={cart.cartItems}
          renderItem={(item: CartItem) => (
            <List.Item
              key={item.id}
              style={{
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                marginBottom: '12px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Row style={{ width: '100%' }} align="middle">
                <Col span={4}>
                  <Image
                    src={item.book?.coverImage || '/placeholder-book.jpg'}
                    alt={item.book?.title}
                    style={{ 
                      width: '80px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    fallback="/placeholder-book.jpg"
                  />
                </Col>
                
                <Col span={12} style={{ paddingLeft: '16px' }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                    {item.book?.title}
                  </Title>
                  <Text type="secondary">
                    Tác giả: {item.book?.author || 'Không rõ'}
                  </Text>
                  <br />
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(item.book?.price || 0)}
                  </Text>
                </Col>
                
                <Col span={4} style={{ textAlign: 'center' }}>
                  <Space>
                    <Button 
                      icon={<MinusOutlined />}
                      size="small"
                      disabled={loading}
                    />
                    <Text strong>{item.quantity}</Text>
                    <Button 
                      icon={<PlusOutlined />}
                      size="small"
                      disabled={loading}
                    />
                  </Space>
                </Col>
                
                <Col span={4} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                    {formatPrice((item.book?.price || 0) * item.quantity)}
                  </Text>
                </Col>
              </Row>
              
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <Popconfirm
                  title="Xóa sản phẩm này?"
                  description="Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?"
                  onConfirm={() => handleRemoveItem(item.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    size="small"
                    disabled={loading}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            border: 'none',
            borderRadius: '12px'
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Tổng cộng
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {cart.totalItems} sản phẩm
              </Text>
            </Col>
            <Col>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                {formatPrice(cart.totalAmount)}
              </Title>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button 
              type="primary" 
              size="large"
              style={{ 
                background: 'white',
                color: '#f5576c',
                border: 'none',
                fontWeight: 'bold',
                height: '48px',
                paddingLeft: '32px',
                paddingRight: '32px'
              }}
            >
              Thanh toán ngay
            </Button>
          </div>
        </Card>
      </Card>
    </div>
  );
}
