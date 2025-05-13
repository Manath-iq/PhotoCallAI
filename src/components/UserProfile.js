import { useState, useEffect } from 'react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useTelegram } from '../TelegramContext';
import { Form, Input, Select, Radio, message } from 'antd';
import { UserOutlined, SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button } from './common';
import './UserProfile.css';

// Default profile values
const DEFAULT_PROFILE = {
  gender: '',
  age: '',
  height: '',
  weight: '',
  goal: '',
};

// Available goals
const GOALS = [
  { id: 'weight_loss', label: 'Похудение' },
  { id: 'maintenance', label: 'Поддержание формы' },
  { id: 'muscle_gain', label: 'Набор массы' },
];

const UserProfile = ({ onComplete }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Try to load existing profile
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      form.setFieldsValue(savedProfile);
    }
    
    // Set back button handler if available
    if (webApp) {
      webApp.BackButton.hide();
    }
  }, [webApp, form]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.USER_PROFILE, values);
      
      // Haptic feedback if available
      if (webApp && webApp.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      message.success({
        content: 'Профиль сохранен',
        icon: <CheckCircleOutlined style={{ color: '#00b96b' }} />,
        duration: 2
      });
      
      // Notify parent component
      if (onComplete) {
        onComplete(values);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      message.error('Ошибка при сохранении профиля');
      
      // Error haptic feedback
      if (webApp && webApp.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="px-4 py-2 max-w-full">
      <div className="mb-6">
        {user && (
          <div className="flex items-center mb-4">
            {user.photo_url ? (
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                {getInitials(user.first_name || 'User')}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-base">{user.first_name || 'Пользователь'}</span>
              {user.username && <span className="text-sm text-gray-500">@{user.username}</span>}
            </div>
          </div>
        )}
        <h2 className="text-xl font-bold mb-1">Заполните профиль</h2>
        <p className="text-gray-500 text-sm">Данные для оптимального подбора питания</p>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-4 w-full"
        initialValues={DEFAULT_PROFILE}
      >
        <Form.Item
          name="gender"
          label="Пол"
          rules={[{ required: true, message: 'Выберите пол' }]}
        >
          <Radio.Group className="flex w-full">
            <Radio.Button value="male" className="flex-1 text-center">Мужской</Radio.Button>
            <Radio.Button value="female" className="flex-1 text-center">Женский</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="age"
          label="Возраст (лет)"
          rules={[
            { required: true, message: 'Введите возраст' },
            { type: 'number', min: 16, max: 120, message: 'Укажите возраст от 16 до 120 лет' }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 30"
            min={16}
            max={120}
          />
        </Form.Item>
        
        <Form.Item
          name="height"
          label="Рост (см)"
          rules={[
            { required: true, message: 'Введите рост' },
            { type: 'number', min: 120, max: 250, message: 'Укажите рост от 120 до 250 см' }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 175"
            min={120}
            max={250}
          />
        </Form.Item>
        
        <Form.Item
          name="weight"
          label="Вес (кг)"
          rules={[
            { required: true, message: 'Введите вес' },
            { type: 'number', min: 30, max: 300, message: 'Укажите вес от 30 до 300 кг' }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 70"
            min={30}
            max={300}
          />
        </Form.Item>
        
        <Form.Item
          name="goal"
          label="Цель"
          rules={[{ required: true, message: 'Выберите цель' }]}
        >
          <Select placeholder="Выберите цель">
            {GOALS.map(goal => (
              <Select.Option key={goal.id} value={goal.id}>
                {goal.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item className="mt-4 mx-0 w-full">
          <Button 
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            icon={<SaveOutlined />}
            className="w-full"
          >
            Сохранить
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile; 