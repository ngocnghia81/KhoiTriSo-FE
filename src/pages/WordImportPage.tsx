import React from 'react';
import { PageHeader } from 'antd';
import WordImportManager from '../components/WordImportManager';

const WordImportPage: React.FC = () => {
  const handleImportSuccess = (result: any) => {
    console.log('Import successful:', result);
    // Có thể redirect hoặc refresh danh sách bài tập
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Import Bài Tập Từ Word"
        subTitle="Upload và import bài tập từ file Word (.docx)"
      />
      
      <div style={{ marginTop: 24 }}>
        <WordImportManager 
          lessonId={1} // Thay bằng lessonId thực tế
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
};

export default WordImportPage;
