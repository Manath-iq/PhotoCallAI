import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, debugStorage } from '../utils/storage';
import UserProfile from './UserProfile';
import ProfileIcon from './ProfileIcon';
import EmptyFoodDiary from './EmptyFoodDiary';
import AddFood from './AddFood';
import DailySummary from './DailySummary';
import NutritionGauges from './NutritionGauges';
import { useTelegram } from '../TelegramContext';
import { Empty, List, Tag, Divider, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusOutlined, CalendarOutlined, LineChartOutlined } from '@ant-design/icons';
import { Button, Card } from './common';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [foodDiary, setFoodDiary] = useState([]);
  const [nutritionTotals, setNutritionTotals] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [animateGauges, setAnimateGauges] = useState(false);
  const prevFoodDiaryLengthRef = useRef(0);
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Debug localStorage contents
    console.log('HomePage mounted - debugging localStorage:');
    debugStorage();
    
    // Check if user profile exists
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    console.log('HomePage: Loading user profile', savedProfile);
    
    if (savedProfile) {
      setUserProfile(savedProfile);
      setShowProfileForm(false);
    } else {
      console.warn('No user profile found, showing profile form');
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
      if (!showProfileForm && !showAddFood && !showDailySummary) {
        // Main screen - show "Add Food" button
        webApp.MainButton.setText('Добавить приём пищи');
        webApp.MainButton.setParams({
          color: '#00b96b',
          text_color: '#ffffff',
        });
        webApp.MainButton.onClick(handleAddFood);
        webApp.MainButton.show();
      } else {
        // Hide main button on other screens
        webApp.MainButton.hide();
        webApp.MainButton.offClick(handleAddFood);
      }
    }

    // Cleanup
    return () => {
      if (webApp && webApp.MainButton && !showProfileForm) {
        webApp.MainButton.offClick(handleAddFood);
      }
    };
  }, [webApp, showProfileForm, showAddFood, showDailySummary]);

  // Calculate nutrition totals whenever the food diary changes
  useEffect(() => {
    const totals = calculateNutritionTotals(foodDiary);
    setNutritionTotals(totals);
    
    // Trigger animation if a new item was added or removed
    if (foodDiary.length !== prevFoodDiaryLengthRef.current) {
      setAnimateGauges(true);
      const timer = setTimeout(() => setAnimateGauges(false), 1000);
      prevFoodDiaryLengthRef.current = foodDiary.length;
      return () => clearTimeout(timer);
    }
  }, [foodDiary]);

  // Calculate the total nutrition values from all food items
  const calculateNutritionTotals = (foodItems) => {
    return foodItems.reduce((totals, item) => {
      const nutrients = item.nutrients || {};
      return {
        calories: totals.calories + (parseFloat(nutrients.calories) || 0),
        protein: totals.protein + (parseFloat(nutrients.protein) || 0),
        fat: totals.fat + (parseFloat(nutrients.fat) || 0),
        carbs: totals.carbs + (parseFloat(nutrients.carbs) || 0)
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  };

  const handleProfileComplete = (profile) => {
    console.log('Profile completed with data:', profile);
    setUserProfile(profile);
    setShowProfileForm(false);

    // Force the UI to update with the new profile data
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      console.log('Successfully verified saved profile data:', savedProfile);
    }
  };

  const handleEditProfile = () => {
    // Reload the latest profile data before showing the form
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      setUserProfile(savedProfile);
    }
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

  const handleShowDailySummary = () => {
    if (foodDiary.length === 0) {
      message.warning('Добавьте хотя бы один приём пищи для получения итогов дня');
      return;
    }
    setShowDailySummary(true);
  };

  const handleCloseDailySummary = () => {
    setShowDailySummary(false);
  };

  const handleClearDiary = () => {
    // Clear diary for today
    const today = new Date().toISOString().split('T')[0];
    saveToStorage(`${STORAGE_KEYS.FOOD_DIARY}_${today}`, []);
    setFoodDiary([]);
    message.success('Дневник питания за сегодня очищен');
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

  if (showDailySummary) {
    return <DailySummary onClose={handleCloseDailySummary} onClearDiary={handleClearDiary} />;
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
      <div className="px-3 py-2">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <ProfileIcon onProfileClick={handleEditProfile} />
          </div>
          <div className="ml-auto flex items-center text-gray-700">
            <CalendarOutlined className="mr-2 text-xl" />
            <span className="font-medium text-lg">{formatDate()}</span>
          </div>
        </div>
      </div>
      
      {foodDiary.length === 0 ? (
        <div className="flex-1 overflow-hidden">
          <EmptyFoodDiary />
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 pb-2">
          <div>
            {/* Nutrition Gauges */}
            <NutritionGauges
              calories={nutritionTotals.calories}
              protein={nutritionTotals.protein}
              fat={nutritionTotals.fat}
              carbs={nutritionTotals.carbs}
              showAnimation={animateGauges}
            />
            
            <Card className="mt-3 mb-4 overflow-hidden p-0" style={{ borderRadius: '12px' }}>
              <List
                itemLayout="vertical"
                dataSource={foodDiary}
                className="food-list p-0 m-0"
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    className="p-0 mb-4 overflow-hidden"
                    style={{ borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}
                    actions={[
                      <Button
                        key="delete"
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#fff' }} />}
                        onClick={() => handleDeleteFood(item.id)}
                        style={{ backgroundColor: '#f5222d', color: '#fff', borderRadius: '8px' }}
                      >
                        Удалить
                      </Button>
                    ]}
                    extra={
                      item.photo && (
                        <div className="w-full overflow-hidden" style={{ borderRadius: '12px', margin: '0' }}>
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-64 object-cover"
                            style={{ display: 'block', margin: '0' }}
                          />
                        </div>
                      )
                    }
                  >
                    <div className="px-4 pt-2 pb-2">
                      {item.description && <p className="text-gray-600 mb-2">{item.description}</p>}
                      
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{item.name}</span>
                        <Tag color={getMealTypeColor(item.mealType)}>
                          {getMealTypeText(item.mealType)}
                        </Tag>
                      </div>
                      
                      {item.nutrients && (
                        <div className="flex flex-nowrap justify-between items-center gap-1 mt-3">
                          <div className="px-2 py-1 rounded-md text-white font-medium text-xs" style={{ backgroundColor: '#3b82f6' }}>
                            Б: {item.nutrients.protein}г
                          </div>
                          <div className="px-2 py-1 rounded-md text-white font-medium text-xs" style={{ backgroundColor: '#f59e0b' }}>
                            Ж: {item.nutrients.fat}г
                          </div>
                          <div className="px-2 py-1 rounded-md text-white font-medium text-xs" style={{ backgroundColor: '#dc2626' }}>
                            У: {item.nutrients.carbs}г
                          </div>
                          <div className="px-2 py-1 rounded-md text-white font-medium text-xs" style={{ backgroundColor: '#00b96b' }}>
                            {item.nutrients.calories} ккал
                          </div>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
            
            <div className="text-center mt-2 mb-3">
              <Tooltip title="Получите анализ вашего питания за день и рекомендации от AI">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<LineChartOutlined />} 
                  onClick={handleShowDailySummary}
                >
                  Получить итоги дня
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 