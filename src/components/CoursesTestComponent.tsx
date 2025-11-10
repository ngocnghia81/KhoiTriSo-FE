import React from 'react';
import { Card, List, Typography, Space, Tag, Button } from 'antd';
import { useCourses } from '../hooks/useCourses';

const { Title, Text, Paragraph } = Typography;

const CoursesTestComponent: React.FC = () => {
  const { courses, loading, error, refetch } = useCourses();

  return (
    <Card title="Courses Test Component" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* Status */}
        <div>
          <Title level={4}>Status</Title>
          <Space>
            <Tag color={loading ? 'processing' : 'success'}>
              Loading: {loading ? 'Yes' : 'No'}
            </Tag>
            <Tag color={error ? 'error' : 'success'}>
              Error: {error || 'None'}
            </Tag>
            <Tag color="blue">
              Courses Count: {courses.length}
            </Tag>
          </Space>
        </div>

        {/* Actions */}
        <div>
          <Button type="primary" onClick={refetch} loading={loading}>
            Refresh Courses
          </Button>
        </div>

        {/* Raw Data Debug */}
        <div>
          <Title level={4}>Raw Data Debug</Title>
          <Card size="small">
            <pre style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 6,
              overflow: 'auto',
              maxHeight: 300,
              fontSize: 12
            }}>
              {JSON.stringify({ courses, loading, error }, null, 2)}
            </pre>
          </Card>
        </div>

        {/* Courses List */}
        <div>
          <Title level={4}>Courses List</Title>
          {loading ? (
            <Text>Loading courses...</Text>
          ) : error ? (
            <Text type="danger">Error: {error}</Text>
          ) : courses.length === 0 ? (
            <Text type="secondary">No courses found</Text>
          ) : (
            <List
              dataSource={courses}
              renderItem={(course) => (
                <List.Item>
                  <List.Item.Meta
                    title={course.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {course.description}
                        </Paragraph>
                        <Space>
                          <Tag color={course.isFree ? 'green' : 'blue'}>
                            {course.isFree ? 'Free' : `$${course.price}`}
                          </Tag>
                          <Tag>Level {course.level}</Tag>
                          <Tag>Duration: {course.estimatedDuration}h</Tag>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

      </Space>
    </Card>
  );
};

export default CoursesTestComponent;
