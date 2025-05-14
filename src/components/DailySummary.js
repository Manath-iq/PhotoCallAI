import { useState, useEffect, useRef } from 'react';
import { useTelegram } from '../TelegramContext';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';
import { getDailySummary } from '../utils/apiService';
import { Typography, Card, Spin, Result, Modal, Divider } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button } from './common';

const { Title, Paragraph, Text } = Typography;

const DailySummary = ({ onClose, onClearDiary }) => {
  const { webApp } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchDailySummary();

    // Set up back button
    if (webApp && webApp.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onClose);
    }

    // Expand WebApp to maximum height to enable scrolling
    if (webApp && typeof webApp.expand === 'function') {
      webApp.expand();
    }

    // Enable vertical swipes if supported (for newer Telegram clients)
    if (webApp && typeof webApp.enableVerticalSwipes === 'function') {
      webApp.enableVerticalSwipes();
    }

    return () => {
      if (webApp && webApp.BackButton) {
        webApp.BackButton.hide();
      }
    };
  }, [webApp]);

  const fetchDailySummary = async () => {
    setLoading(true);
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Load meals for today
      const meals = loadFromStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`) || [];
      
      if (meals.length === 0) {
        throw new Error('Нет данных о приемах пищи за сегодня');
      }
      
      // Load user profile
      const userProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
      
      // Get summary from API
      const result = await getDailySummary(meals, userProfile);
      setSummary(result);
    } catch (error) {
      console.error('Ошибка при получении итогов дня:', error);
      setError(error.message || 'Произошла ошибка при получении итогов дня');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDiary = () => {
    setClearConfirmVisible(true);
  };

  const confirmClearDiary = () => {
    // Clear diary for today
    onClearDiary();
    setClearConfirmVisible(false);
    onClose();
  };

  const cancelClearDiary = () => {
    setClearConfirmVisible(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Анализируем ваш рацион...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onClose}
            className="mr-2"
          />
          <h2 className="text-xl font-bold text-gray-800 m-0">Итоги дня</h2>
        </div>
        
        <Result
          status="warning"
          title="Не удалось получить итоги"
          subTitle={error}
          extra={
            <Button type="primary" onClick={onClose}>
              Вернуться
            </Button>
          }
        />
      </div>
    );
  }

  // Parse summary sections (formats the AI response into sections)
  const formatSummary = (text) => {
    if (!text) return { __html: '' };
    
    // Fix newlines in the text to preserve paragraphs
    const textWithParagraphs = text.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
    
    // Replace numbered list markers (1., 2., etc.) with section headers
    const formattedText = textWithParagraphs
      .replace(/1\.\s*(.*?)(?=<br\/>2\.|$)/s, '<strong class="text-lg">Общая оценка рациона</strong><p>$1</p>')
      .replace(/2\.\s*(.*?)(?=<br\/>3\.|$)/s, '<strong class="text-lg">Анализ БЖУ и калорийности</strong><p>$1</p>')
      .replace(/3\.\s*(.*?)(?=<br\/>4\.|$)/s, '<strong class="text-lg">Рекомендации по улучшению</strong><p>$1</p>')
      .replace(/4\.\s*(.*?)(?=$)/s, '<strong class="text-lg">Советы на завтра</strong><p>$1</p>');
    
    return { __html: formattedText };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" ref={containerRef}>
      {/* Fixed header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onClose}
            className="mr-2"
          />
          <h2 className="text-xl font-bold text-gray-800 m-0">Итоги дня</h2>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <Card className="mb-4">
          <Title level={4} className="text-primary mb-4">
            Анализ вашего питания
          </Title>
          
          <div 
            className="summary-content"
            dangerouslySetInnerHTML={formatSummary(summary)}
          />
        </Card>
      </div>
      
      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-center">
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleClearDiary}
          size="large"
        >
          Завершить день
        </Button>
      </div>
      
      <Modal
        title="Подтверждение"
        open={clearConfirmVisible}
        onOk={confirmClearDiary}
        onCancel={cancelClearDiary}
        okText="Да, очистить"
        cancelText="Отмена"
      >
        <p>Очистить дневник питания за сегодня? Данные будут удалены безвозвратно.</p>
      </Modal>
    </div>
  );
};

export default DailySummary; 