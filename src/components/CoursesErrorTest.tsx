import React from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { useCourses } from '../hooks/useCourses';

const { Title, Text } = Typography;

const CoursesErrorTest: React.FC = () => {
  const { courses, loading, error, refetch } = useCourses();

  return (
    <Card title="Courses Error Test" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        <div>
          <Title level={4}>Status</Title>
          <Space>
            <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
            <Text>Error: {error || 'None'}</Text>
            <Text>Courses: {courses.length}</Text>
          </Space>
        </div>

        <div>
          <Button type="primary" onClick={refetch} loading={loading}>
            Test Fetch Courses
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            message="Error Details"
            description={error}
            showIcon
          />
        )}

        {courses.length > 0 && (
          <Alert
            type="success"
            message="Success!"
            description={`Loaded ${courses.length} courses successfully`}
            showIcon
          />
        )}

      </Space>
    </Card>
  );
};

export default CoursesErrorTest;
