'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Button, List, Tag, Divider, Spin, Alert, Row, Col } from 'antd';
import { BookOutlined, EyeOutlined, QuestionCircleOutlined, FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useBook, useBookChapters, useBookQuestions } from '../hooks/useBooks';
import { Book, BookChapter, BookQuestion } from '../services/bookApi';

const { Title, Text, Paragraph } = Typography;

interface BookReaderProps {
  bookId: number;
  onBack?: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ bookId, onBack }) => {
  const [selectedChapter, setSelectedChapter] = useState<BookChapter | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const { book, loading: bookLoading, error: bookError } = useBook(bookId);
  const { chapters, loading: chaptersLoading, error: chaptersError } = useBookChapters(bookId);
  const { questions, loading: questionsLoading, error: questionsError } = useBookQuestions(bookId);

  const handleChapterSelect = (chapter: BookChapter) => {
    setSelectedChapter(chapter);
    setShowQuestions(false);
  };

  const handleShowQuestions = () => {
    setShowQuestions(true);
    setSelectedChapter(null);
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} VNĐ`;
  };

  if (bookLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải thông tin sách...</Text>
        </div>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <Alert
        type="error"
        message="Lỗi tải sách"
        description={bookError || 'Không thể tải thông tin sách'}
        showIcon
        action={
          <Button onClick={onBack}>
            Quay lại
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Book Info Sidebar */}
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              
              {/* Book Cover & Info */}
              <div style={{ textAlign: 'center' }}>
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{ width: '100%', maxWidth: 200, borderRadius: 8 }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      borderRadius: 8
                    }}
                  >
                    <BookOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  </div>
                )}
                
                <Title level={3} style={{ marginTop: 16 }}>
                  {book.title}
                </Title>
                
                <Text type="secondary">
                  Tác giả: {book.authorName || 'Không xác định'}
                </Text>
                
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ color: book.isFree ? '#52c41a' : '#1890ff' }}>
                    {formatPrice(book.price, book.isFree)}
                  </Text>
                </div>
              </div>

              {/* Book Description */}
              {book.description && (
                <div>
                  <Title level={5}>Mô tả</Title>
                  <Paragraph>{book.description}</Paragraph>
                </div>
              )}

              {/* Book Stats */}
              <div>
                <Title level={5}>Thống kê</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {book.totalChapters && (
                    <div>
                      <FileTextOutlined style={{ marginRight: 8 }} />
                      <Text>{book.totalChapters} chương</Text>
                    </div>
                  )}
                  {book.totalQuestions && (
                    <div>
                      <QuestionCircleOutlined style={{ marginRight: 8 }} />
                      <Text>{book.totalQuestions} câu hỏi</Text>
                    </div>
                  )}
                </Space>
              </div>

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={() => setShowQuestions(false)}
                  style={{ width: '100%' }}
                >
                  Đọc sách
                </Button>
                <Button
                  icon={<QuestionCircleOutlined />}
                  onClick={handleShowQuestions}
                  style={{ width: '100%' }}
                >
                  Luyện tập
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Content Area */}
        <Col xs={24} lg={16}>
          {showQuestions ? (
            /* Questions View */
            <Card title="Câu hỏi luyện tập">
              {questionsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Spin />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Đang tải câu hỏi...</Text>
                  </div>
                </div>
              ) : questionsError ? (
                <Alert
                  type="error"
                  message="Lỗi tải câu hỏi"
                  description={questionsError}
                  showIcon
                />
              ) : questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <QuestionCircleOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Chưa có câu hỏi nào</Text>
                  </div>
                </div>
              ) : (
                <List
                  dataSource={questions}
                  renderItem={(question, index) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>Câu {index + 1}:</Text>
                            <Text>{question.question}</Text>
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div>
                              <Text type="secondary">Các lựa chọn:</Text>
                              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex}>
                                    <Text>{String.fromCharCode(65 + optIndex)}. {option}</Text>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {question.explanation && (
                            <div>
                              <Text type="secondary">Giải thích:</Text>
                              <Paragraph style={{ margin: '8px 0 0 0' }}>
                                {question.explanation}
                              </Paragraph>
                            </div>
                          )}
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          ) : (
            /* Chapters View */
            <Card title="Danh sách chương">
              {chaptersLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Spin />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Đang tải danh sách chương...</Text>
                  </div>
                </div>
              ) : chaptersError ? (
                <Alert
                  type="error"
                  message="Lỗi tải chương"
                  description={chaptersError}
                  showIcon
                />
              ) : chapters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Chưa có chương nào</Text>
                  </div>
                </div>
              ) : (
                <>
                  <List
                    dataSource={chapters}
                    renderItem={(chapter) => (
                      <List.Item>
                        <Card
                          hoverable
                          size="small"
                          style={{ width: '100%' }}
                          onClick={() => handleChapterSelect(chapter)}
                        >
                          <Space>
                            <Text strong>Chương {chapter.orderIndex}:</Text>
                            <Text>{chapter.title}</Text>
                            {chapter.isPublished ? (
                              <Tag color="green">Đã xuất bản</Tag>
                            ) : (
                              <Tag color="orange">Chưa xuất bản</Tag>
                            )}
                          </Space>
                        </Card>
                      </List.Item>
                    )}
                  />
                  
                  {/* Chapter Content */}
                  {selectedChapter && (
                    <>
                      <Divider />
                      <Card title={`Chương ${selectedChapter.orderIndex}: ${selectedChapter.title}`}>
                        {selectedChapter.content ? (
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                            {selectedChapter.content}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: 48 }}>
                            <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
                            <div style={{ marginTop: 16 }}>
                              <Text type="secondary">Chưa có nội dung</Text>
                            </div>
                          </div>
                        )}
                      </Card>
                    </>
                  )}
                </>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BookReader;
