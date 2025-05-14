import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchDailySummary();

    // Set up back button
    if (webApp && webApp.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onClose);
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
    // Replace numbered list markers (1., 2., etc.) with section headers
    const formattedText = text
      .replace(/1\.\s*(.*?)(?=\n|$)/g, '<strong class="text-lg">Общая оценка рациона</strong><p>$1</p>')
      .replace(/2\.\s*(.*?)(?=\n|$)/g, '<strong class="text-lg">Анализ БЖУ и калорийности</strong><p>$1</p>')
      .replace(/3\.\s*(.*?)(?=\n|$)/g, '<strong class="text-lg">Рекомендации по улучшению</strong><p>$1</p>')
      .replace(/4\.\s*(.*?)(?=\n|$)/g, '<strong class="text-lg">Советы на завтра</strong><p>$1</p>');
    
    return { __html: formattedText };
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onClose}
          className="mr-2"
        />
        <h2 className="text-xl font-bold text-gray-800 m-0">Итоги дня</h2>
      </div>
      
      <Card className="mb-4">
        <Title level={4} className="text-primary mb-4">
          Анализ вашего питания
        </Title>
        
        <div 
          className="summary-content" 
          dangerouslySetInnerHTML={formatSummary(summary)}
        />
      </Card>
      
      <div className="flex justify-center">
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