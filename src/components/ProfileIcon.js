import { useState, useEffect, useRef } from 'react';
import { useTelegram } from '../TelegramContext';
import { STORAGE_KEYS, loadFromStorage } from '../utils/storage';
import { Avatar, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import './ProfileIcon.css';

const ProfileIcon = ({ onProfileClick }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useTelegram();
  const dropdownRef = useRef(null);

  // Function to load user profile data
  const loadUserProfile = () => {
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      console.log('Loaded profile data:', savedProfile);
      setUserProfile(savedProfile);
    } else {
      console.warn('No profile data found in localStorage');
    }
  };

  // Загружаем данные профиля из localStorage при монтировании компонента
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Закрываем дропдаун при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Получаем инициалы пользователя для аватара
  const getUserInitials = () => {
    if (user && user.first_name) {
      const firstInitial = user.first_name.charAt(0).toUpperCase();
      const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
      return firstInitial + lastInitial;
    }
    return '?';
  };

  // Получаем текст цели из ID
  const getGoalText = (goalId) => {
    switch (goalId) {
      case 'weight_loss':
        return 'Похудение';
      case 'maintenance':
        return 'Поддержание формы';
      case 'muscle_gain':
        return 'Набор массы';
      default:
        return 'Не указана';
    }
  };

  // Рассчитываем ИМТ
  const calculateBMI = () => {
    if (!userProfile || !userProfile.height || !userProfile.weight) {
      return null;
    }
    
    const heightInMeters = parseFloat(userProfile.height) / 100;
    const weightInKg = parseFloat(userProfile.weight);
    
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Получаем статус ИМТ
  const getBMIStatus = (bmi) => {
    if (bmi === null) return null;
    
    if (bmi < 18.5) return 'Недостаточный вес';
    if (bmi < 25) return 'Нормальный вес';
    if (bmi < 30) return 'Избыточный вес';
    return 'Ожирение';
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);
  
  const handleProfileToggle = () => {
    // Reload user profile data when toggling the dropdown
    loadUserProfile();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = () => {
    setShowDropdown(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-lg py-1"
        onClick={handleProfileToggle}
      >
        {user && user.photo_url ? (
          <Avatar 
            src={user.photo_url} 
            size={44}
            className="mr-2"
          />
        ) : (
          <Avatar
            size={44}
            icon={<UserOutlined className="text-xl" />}
            className="mr-2 bg-primary text-white"
          >
            {getUserInitials()}
          </Avatar>
        )}
        
        <div className="flex flex-col text-left">
          <span className="font-medium text-lg text-gray-800">
            {user ? user.first_name : 'Пользователь'}
          </span>
          {user?.username && (
            <span className="text-sm text-gray-500">@{user.username}</span>
          )}
        </div>
      </div>

      {showDropdown && userProfile && (
        <div className="absolute top-full left-0 bg-white rounded-xl shadow-lg mt-2 pt-3 px-4 pb-4 z-10 animate-fadeIn w-full min-w-[280px]">
          <div className="flex flex-col items-center mb-1">
            <h3 className="text-lg font-bold text-gray-800 m-0 w-full text-center">Профиль</h3>
            <Button 
              onClick={handleEditClick}
              className="bg-primary hover:bg-primary-dark text-white w-full mt-2"
              icon={<EditOutlined />}
              type="primary"
            >
              Изменить
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="py-2 text-center">
                <p className="text-sm text-gray-500 m-0">Возраст</p>
                <p className="font-semibold m-0">{userProfile.age} лет</p>
              </div>
              
              <div className="py-2 text-center">
                <p className="text-sm text-gray-500 m-0">Пол</p>
                <p className="font-semibold m-0">
                  {userProfile.gender === 'male' ? 'Мужской' : 'Женский'}
                </p>
              </div>
              
              <div className="py-2 text-center">
                <p className="text-sm text-gray-500 m-0">Рост</p>
                <p className="font-semibold m-0">{userProfile.height} см</p>
              </div>
              
              <div className="py-2 text-center">
                <p className="text-sm text-gray-500 m-0">Вес</p>
                <p className="font-semibold m-0">{userProfile.weight} кг</p>
              </div>
              
              <div className="py-2 text-center">
                <p className="text-sm text-gray-500 m-0">Цель</p>
                <p className="font-semibold m-0">{getGoalText(userProfile.goal)}</p>
              </div>
              
              {bmi && (
                <div className="py-2 text-center">
                  <p className="text-sm text-gray-500 m-0">ИМТ</p>
                  <p className="font-semibold m-0">{bmi} ({bmiStatus})</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon; 