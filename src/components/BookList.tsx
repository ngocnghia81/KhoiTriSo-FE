'use client';

import React, { useState } from 'react';
import { Card, List, Typography, Space, Tag, Button, Input, Select, Row, Col, Spin, Alert, Empty, message } from 'antd';
import { BookOutlined, SearchOutlined, FilterOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useBooks, BookFilters } from '../hooks/useBooks';
import { Book } from '../services/bookApi';
import { useAddToCart } from '../hooks/useCart';
import { toast } from 'sonner';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface BookListProps {
  onBookSelect?: (book: Book) => void;
  showFilters?: boolean;
  categoryId?: number;
}

const BookList: React.FC<BookListProps> = ({ onBookSelect, showFilters = true, categoryId }) => {
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    categoryId,
    approvalStatus: 1, // Only approved books
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [loadingBooks, setLoadingBooks] = useState<Set<number>>(new Set());
  const { books, loading, error, refetch } = useBooks(filters);
  const { addToCart } = useAddToCart();

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof BookFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleBookClick = (book: Book) => {
    onBookSelect?.(book);
  };

  const handleAddToCart = async (book: Book) => {
    if (book.isFree) {
      message.info('Sách miễn phí không cần thêm vào giỏ hàng');
      return;
    }

    // Set loading state for this specific book
    setLoadingBooks(prev => new Set(prev).add(book.id));

    try {
      debugger;
      const response : any = await addToCart({ ItemId: book.id, ItemType: 0 }); 
      if(response.MessageCode === 'BOOK_ALREADY_OWNED') {
        toast.info(response.Message as string);
      }else{
        toast.error(response.Message as string);
      }
    } finally {
      setLoadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} VNĐ`;
  };

  const getApprovalStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag color="orange">Chờ duyệt</Tag>;
      case 1: return <Tag color="green">Đã duyệt</Tag>;
      case 2: return <Tag color="red">Từ chối</Tag>;
      default: return <Tag color="default">Không xác định</Tag>;
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}

      {/* Filters */}
      {showFilters && (
        <Card style={{ 
          marginBottom: 32,
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          border: 'none',
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
        }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm sách..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Sắp xếp"
                style={{ width: '100%' }}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
              >
                <Option value="createdAt">Mới nhất</Option>
                <Option value="title">Tên A-Z</Option>
                <Option value="price">Giá thấp-cao</Option>
                <Option value="totalQuestions">Số câu hỏi</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Thứ tự"
                style={{ width: '100%' }}
                value={filters.sortOrder}
                onChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <Option value="desc">Giảm dần</Option>
                <Option value="asc">Tăng dần</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<FilterOutlined />}
                onClick={refetch}
                loading={loading}
                style={{ width: '100%' }}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={refetch}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải danh sách sách...</Text>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && books.length === 0 && (
        <Empty
          description="Không tìm thấy sách nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={refetch}>
            Làm mới
          </Button>
        </Empty>
      )}

      {/* Books List */}
      {!loading && books.length > 0 && (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={books}
          renderItem={(book) => (
            <List.Item>
              <Card
                hoverable
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
                }}
                cover={
                  book.coverImage ? (
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        alt={book.title}
                        src={book.coverImage}
                        style={{ 
                          height: 240, 
                          objectFit: 'cover',
                          width: '100%',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(102, 126, 234, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {book.isFree ? 'MIỄN PHÍ' : `${book.price.toLocaleString('vi-VN')} VNĐ`}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        height: 240,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%)'
                      }}
                    >
                      <BookOutlined style={{ fontSize: 64, color: '#667eea' }} />
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleBookClick(book)}
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Xem chi tiết
                  </Button>,
                  <Button
                    icon={<ShoppingCartOutlined />}
                    onClick={() => book.isFree ? handleBookClick(book) : handleAddToCart(book)}
                    loading={loadingBooks.has(book.id)}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #667eea',
                      color: '#667eea',
                      fontWeight: '600',
                      background: 'rgba(102, 126, 234, 0.1)'
                    }}
                  >
                    {book.isFree ? 'Đọc ngay' : 'Thêm vào giỏ'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <Text strong ellipsis={{ tooltip: book.title }}>
                        {book.title}
                      </Text>
                      {getApprovalStatusTag(book.approvalStatus)}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ margin: 0, fontSize: 12 }}
                      >
                        {book.description}
                      </Paragraph>
                      <div>
                        <Text strong style={{ color: book.isFree ? '#52c41a' : '#1890ff' }}>
                          {formatPrice(book.price, book.isFree)}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Tác giả: {book.authorName || 'Không xác định'}
                        </Text>
                      </div>
                      {book.totalQuestions && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {book.totalQuestions} câu hỏi
                          </Text>
                        </div>
                      )}
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Pagination Info */}
      {!loading && books.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Hiển thị {books.length} sách
          </Text>
        </div>
      )}
    </div>
  );
};

export default BookList;
