import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';
import UserProfile from './UserProfile';
import ProfileIcon from './ProfileIcon';
import EmptyFoodDiary from './EmptyFoodDiary';
import AddFood from './AddFood';
import { useTelegram } from '../TelegramContext';
import { Empty, List, Tag, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card } from './common';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodDiary, setFoodDiary] = useState([]);
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Check if user profile exists
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      setUserProfile(savedProfile);
      setShowProfileForm(false);
    } else {
      setShowProfileForm(true);
    }

    // Load food diary entries for today
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const savedFoodDiary = loadFromStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`) || [];
    setFoodDiary(savedFoodDiary);
    
    // Setup MainButton if available
    if (webApp && webApp.MainButton) {
      webApp.MainButton.setText('Добавить приём пищи');
      webApp.MainButton.setParams({
        color: '#00b96b',
        text_color: '#ffffff',
      });
    }
  }, [webApp]);

  // Set up MainButton visibility and callback
  useEffect(() => {
    if (webApp && webApp.MainButton) {
      if (!showProfileForm && !showAddFood) {
        webApp.MainButton.onClick(handleAddFood);
        webApp.MainButton.show();
      } else {
        webApp.MainButton.hide();
      }
    }

    // Cleanup
    return () => {
      if (webApp && webApp.MainButton) {
        webApp.MainButton.offClick(handleAddFood);
      }
    };
  }, [webApp, showProfileForm, showAddFood]);

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setShowProfileForm(false);
  };

  const handleEditProfile = () => {
    setShowProfileForm(true);
  };

  const handleAddFood = () => {
    setShowAddFood(true);
  };
  
  const handleFoodSave = (newEntry) => {
    // Add the new food entry to the state
    setFoodDiary([...foodDiary, newEntry]);
    setShowAddFood(false);
  };
  
  const handleCancelAddFood = () => {
    setShowAddFood(false);
  };
  
  const handleDeleteFood = (entryId) => {
    // Remove the entry from the array
    const updatedDiary = foodDiary.filter(entry => entry.id !== entryId);
    setFoodDiary(updatedDiary);
    
    // Update in storage
    const today = new Date().toISOString().split('T')[0];
    saveToStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`, updatedDiary);
  };

  // Format date as readable string
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Show appropriate screen based on state
  if (showProfileForm) {
    return <UserProfile onComplete={handleProfileComplete} />;
  }
  
  if (showAddFood) {
    return <AddFood onSave={handleFoodSave} onCancel={handleCancelAddFood} />;
  }

  // Get meal type tag color
  const getMealTypeColor = (mealType) => {
    switch(mealType) {
      case 'breakfast': return 'blue';
      case 'lunch': return 'green';
      case 'dinner': return 'purple';
      case 'snack': return 'orange';
      default: return 'default';
    }
  };

  // Get meal type text
  const getMealTypeText = (mealType) => {
    switch(mealType) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      case 'snack': return 'Перекус';
      default: return 'Приём пищи';
    }
  };

  return (
    <div className="flex flex-col h-full bg-light-bg overflow-x-hidden">
      <div className="px-4 pt-2">
        <div className="flex justify-between items-center mb-4">
          <ProfileIcon onProfileClick={handleEditProfile} />
          <div className="flex items-center text-gray-700">
            <CalendarOutlined className="mr-2" />
            <span className="font-medium">{formatDate()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-4 pb-4">
        {foodDiary.length === 0 ? (
          <EmptyFoodDiary />
        ) : (
          <div className="mb-4">
            <Card>
              <List
                itemLayout="vertical"
                dataSource={foodDiary}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button
                        key="delete"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteFood(item.id)}
                      >
                        Удалить
                      </Button>
                    ]}
                    extra={
                      item.photo && (
                        <div className="w-28 h-28 overflow-hidden rounded-lg">
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    }
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">{item.name}</span>
                          <Tag color={getMealTypeColor(item.mealType)}>
                            {getMealTypeText(item.mealType)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          {item.description && <p className="text-gray-600">{item.description}</p>}
                          {item.nutrients && (
                            <div className="flex items-center mt-2 text-xs">
                              <span className="mr-3">Б: {item.nutrients.protein}г</span>
                              <span className="mr-3">Ж: {item.nutrients.fat}г</span>
                              <span className="mr-3">У: {item.nutrients.carbs}г</span>
                              <span>Калории: {item.nutrients.calories}ккал</span>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 