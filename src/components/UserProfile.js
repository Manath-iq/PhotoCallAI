import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useTelegram } from '../TelegramContext';
import { Form, Input, Select, Radio, message } from 'antd';
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
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
  const formContainerRef = useRef(null);
  const mainButtonIntervalRef = useRef(null);

  // Функция для настройки и показа MainButton
  const setupMainButton = () => {
    if (webApp && webApp.MainButton) {
      webApp.MainButton.setText('Сохранить');
      webApp.MainButton.setParams({
        color: '#00b96b',
        text_color: '#ffffff',
        is_active: true,
        is_visible: true
      });
      webApp.MainButton.onClick(handleMainButtonClick);
      webApp.MainButton.show();
    }
  };

  useEffect(() => {
    // Try to load existing profile
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    console.log('UserProfile useEffect - loaded profile:', savedProfile);
    
    if (savedProfile) {
      console.log('Setting form values with saved profile');
      form.setFieldsValue(savedProfile);
    } else {
      console.log('No saved profile found, using default values');
      form.setFieldsValue(DEFAULT_PROFILE);
    }
    
    // Set back button handler if available
    if (webApp) {
      webApp.BackButton.hide();
      
      // Настраиваем MainButton и устанавливаем интервал для проверки видимости
      setupMainButton();
      
      // Устанавливаем интервал, который будет проверять видимость кнопки
      // и показывать её, если она скрыта
      mainButtonIntervalRef.current = setInterval(() => {
        if (webApp.MainButton && !webApp.MainButton.isVisible) {
          setupMainButton();
        }
      }, 300);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (webApp && webApp.MainButton) {
        webApp.MainButton.offClick(handleMainButtonClick);
      }
      
      // Очищаем интервал при размонтировании компонента
      if (mainButtonIntervalRef.current) {
        clearInterval(mainButtonIntervalRef.current);
      }
    };
  }, [webApp, form]);
  
  // Fix for keyboard appearance and cursor position issues
  useEffect(() => {
    // Fix for focusing form inputs in mobile
    const handleFocus = () => {
      // Small delay to let the keyboard open first
      setTimeout(() => {
        if (formContainerRef.current) {
          // This helps ensure the cursor is visible
          const activeElement = document.activeElement;
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        // Повторно показываем MainButton при фокусе на поле ввода,
        // так как клавиатура может скрывать кнопку
        setupMainButton();
      }, 300);
    };
    
    // Add listeners to all inputs in the form
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
    });
    
    return () => {
      // Clean up
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
      });
    };
  }, []);

  const handleMainButtonClick = () => {
    form.submit();
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Convert numeric string values to numbers
      const numericFields = ['age', 'height', 'weight'];
      numericFields.forEach(field => {
        if (values[field]) {
          values[field] = Number(values[field]);
        }
      });
      
      console.log('Saving profile with data:', values);
      
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.USER_PROFILE, values);
      
      // Verify data was saved correctly
      const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
      console.log('Verification - saved profile:', savedProfile);
      
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
        onComplete({...values}); // Pass a copy of values to ensure reference is updated
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

  // Обработчик изменения формы - показываем кнопку при каждом изменении
  const handleFormChange = () => {
    setupMainButton();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="px-4 py-2 max-w-full profile-container" ref={formContainerRef}>
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
        className="space-y-4 w-full pb-16"
        initialValues={DEFAULT_PROFILE}
        validateTrigger="onBlur"
        onValuesChange={handleFormChange}
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
            { 
              validator: (_, value) => {
                const num = Number(value);
                if (isNaN(num) || num < 16 || num > 120) {
                  return Promise.reject('Укажите возраст от 16 до 120 лет');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 30"
            min={16}
            max={120}
            onFocus={() => setupMainButton()}
          />
        </Form.Item>
        
        <Form.Item
          name="height"
          label="Рост (см)"
          rules={[
            { required: true, message: 'Введите рост' },
            { 
              validator: (_, value) => {
                const num = Number(value);
                if (isNaN(num) || num < 120 || num > 250) {
                  return Promise.reject('Укажите рост от 120 до 250 см');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 175"
            min={120}
            max={250}
            onFocus={() => setupMainButton()}
          />
        </Form.Item>
        
        <Form.Item
          name="weight"
          label="Вес (кг)"
          rules={[
            { required: true, message: 'Введите вес' },
            { 
              validator: (_, value) => {
                const num = Number(value);
                if (isNaN(num) || num < 30 || num > 300) {
                  return Promise.reject('Укажите вес от 30 до 300 кг');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="number"
            placeholder="Например: 70"
            min={30}
            max={300}
            onFocus={() => setupMainButton()}
          />
        </Form.Item>
        
        <Form.Item
          name="goal"
          label="Цель"
          rules={[{ required: true, message: 'Выберите цель' }]}
        >
          <Select 
            placeholder="Выберите цель"
            onFocus={() => setupMainButton()}
          >
            {GOALS.map(goal => (
              <Select.Option key={goal.id} value={goal.id}>
                {goal.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile; 