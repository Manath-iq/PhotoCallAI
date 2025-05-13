import { useState } from 'react';
import { useTelegram } from '../TelegramContext';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { compressImage } from '../utils/imageCompressor';
import { Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined, CameraOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from './common';
import './AddFood.css';

const { TextArea } = Input;
const { Option } = Select;

const AddFood = ({ onSave, onCancel }) => {
  const { webApp } = useTelegram();
  const [form] = Form.useForm();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Handle image selection
  const handlePhotoChange = async (info) => {
    if (info.file.status === 'uploading') {
      setIsCompressing(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get the file object
      const file = info.file.originFileObj;
      setPhoto(file);
      
      try {
        // Compress the image
        const compressedImage = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.7
        });
        
        setPhotoPreview(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        message.error('Ошибка при обработке изображения');
        
        // Fallback to original image if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Custom file upload button
  const uploadButton = (
    <div className="flex flex-col items-center justify-center h-full">
      {isCompressing ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Сжатие изображения...</p>
        </div>
      ) : (
        <>
          <CameraOutlined style={{ fontSize: '24px', color: '#00b96b' }} />
          <div className="mt-2">
            {photoPreview ? 'Изменить фото' : 'Добавить фото'}
          </div>
        </>
      )}
    </div>
  );

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    // Create a new food entry object
    const newFoodEntry = {
      id: Date.now(), // Using timestamp as a simple unique ID
      timestamp: new Date().toISOString(),
      mealType: values.mealType,
      name: values.foodName,
      description: values.foodDescription,
      photo: photoPreview, // Compressed image as base64
      nutrients: null, // Will be filled by AI analysis later
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Load existing entries for today
    const existingEntries = loadFromStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`) || [];
    
    // Add new entry
    const updatedEntries = [...existingEntries, newFoodEntry];
    
    // Save to localStorage
    saveToStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`, updatedEntries);
    
    // Call parent callback with the new entry
    onSave(newFoodEntry);
    
    setIsSubmitting(false);
  };

  // Set WebApp header for this screen
  if (webApp && webApp.BackButton) {
    webApp.BackButton.show();
    webApp.BackButton.onClick(onCancel);
  }

  return (
    <div className="p-4 max-w-full">
      <div className="flex items-center mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onCancel}
          className="mr-2"
        />
        <h2 className="text-xl font-bold text-gray-800 m-0">Добавить приём пищи</h2>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          mealType: 'breakfast',
          foodName: '',
          foodDescription: ''
        }}
        className="mt-4"
      >
        <Form.Item
          label="Тип приёма пищи"
          name="mealType"
          rules={[{ required: true, message: 'Пожалуйста, выберите тип' }]}
        >
          <Select>
            <Option value="breakfast">Завтрак</Option>
            <Option value="lunch">Обед</Option>
            <Option value="dinner">Ужин</Option>
            <Option value="snack">Перекус</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Название блюда"
          name="foodName"
          rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
        >
          <Input placeholder="Например: Овсянка с фруктами" />
        </Form.Item>

        <Form.Item
          label="Описание (ингредиенты, размер порции)"
          name="foodDescription"
        >
          <TextArea 
            placeholder="Например: 200г овсянки, банан, 10г мёда" 
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Добавить фото блюда">
          <Upload
            name="avatar"
            listType="picture-card"
            className="food-photo-uploader"
            showUploadList={false}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok", null);
              }, 0);
            }}
            onChange={handlePhotoChange}
          >
            {photoPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={photoPreview}
                  alt="Food"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>

        <Form.Item className="mt-6">
          <div className="flex gap-4">
            <Button 
              type="default" 
              onClick={onCancel} 
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isCompressing}
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddFood; 