'use client';

import React, { useState } from 'react';
import { Tabs, Typography, Space, Button, Card } from 'antd';
import { BookOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import BookList from '../components/BookList';
import BookActivation from '../components/BookActivation';
import BookReader from '../components/BookReader';
import { Book } from '../services/bookApi';

const { Title } = Typography;

const BooksPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState('library');

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setActiveTab('reader');
  };

  const handleActivationSuccess = (bookId: number, bookTitle: string) => {
    // Refresh the library to show newly activated book
    setActiveTab('library');
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setActiveTab('library');
  };

  const tabItems = [
    {
      key: 'library',
      label: (
        <span>
          <BookOutlined />
          Thư viện sách
        </span>
      ),
      children: (
        <BookList
          onBookSelect={handleBookSelect}
          showFilters={true}
        />
      )
    },
    {
      key: 'activation',
      label: (
        <span>
          <KeyOutlined />
          Kích hoạt sách
        </span>
      ),
      children: (
        <BookActivation
          onActivationSuccess={handleActivationSuccess}
        />
      )
    },
    {
      key: 'my-books',
      label: (
        <span>
          <UserOutlined />
          Sách của tôi
        </span>
      ),
      children: (
        <BookList
          onBookSelect={handleBookSelect}
          showFilters={false}
        />
      )
    }
  ];

  // If a book is selected, show the reader
  if (selectedBook) {
    return (
      <BookReader
        bookId={selectedBook.id}
        onBack={handleBackToLibrary}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Title level={1} style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>
              📚 Thư viện sách điện tử
            </Title>
            <Typography.Text style={{
              fontSize: '1.1rem',
              color: '#666',
              marginTop: '8px',
              display: 'block'
            }}>
              Khám phá, kích hoạt và đọc các cuốn sách chất lượng cao với video giải bài tập chi tiết
            </Typography.Text>
          </div>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<BookOutlined />}
              onClick={() => setActiveTab('library')}
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Khám phá sách
            </Button>
            <Button
              size="large"
              icon={<KeyOutlined />}
              onClick={() => setActiveTab('activation')}
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
                border: '2px solid #667eea',
                color: '#667eea',
                fontSize: '16px',
                fontWeight: '600',
                background: 'rgba(102, 126, 234, 0.1)'
              }}
            >
              Kích hoạt sách
            </Button>
          </Space>
        </div>
      </div>
      
      {/* Content Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{
            '& .ant-tabs-tab': {
              fontSize: '16px',
              fontWeight: '600',
              padding: '12px 24px'
            },
            '& .ant-tabs-tab-active': {
              color: '#667eea'
            }
          }}
        />
      </div>
    </div>
  );
};

export default BooksPage;
