import { useState, useEffect } from 'react';
import { Empty } from 'antd';
import './EmptyFoodDiary.css';

const EmptyFoodDiary = () => {
  const [randomImage, setRandomImage] = useState(1);
  const [randomText, setRandomText] = useState('');
  const [showEmptyFallback, setShowEmptyFallback] = useState(false);
  
  const emptyStateTexts = [
    'Кажется, ты еще не ел...',
    'Время добавить свой первый прием пищи!',
    'Дневник пуст. Давай это исправим!',
    'Что у нас сегодня на обед?',
    'Пора подкрепиться!',
    'Не забывай питаться правильно!',
    'Запиши свой первый прием пищи',
    'Твой дневник питания ждет!',
    'Питайся регулярно для хорошего результата',
    'Пора восполнить энергию!'
  ];
  
  // Выбираем случайную картинку и текст при каждом рендере
  useEffect(() => {
    // Определяем общее количество картинок - предполагается, что в папке есть картинки с 1 по 5
    const totalImages = 5; 
    const randomImageNumber = Math.floor(Math.random() * totalImages) + 1;
    const randomTextIndex = Math.floor(Math.random() * emptyStateTexts.length);
    
    setRandomImage(randomImageNumber);
    setRandomText(emptyStateTexts[randomTextIndex]);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <p className="text-3xl font-bold text-gray-700 mb-8 mt-0">{randomText}</p>
      
      <div className="w-full flex justify-center items-center">
        {showEmptyFallback ? (
          <Empty 
            description="Добавьте прием пищи" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="my-8"
          />
        ) : (
          <img 
            src={`/images/emojis/emoji_food_${randomImage}.png`} 
            alt="Food emoji"
            className="w-auto h-auto max-w-[90%] max-h-[50vh] object-contain"
            onError={(e) => {
              // Если одна картинка не загрузилась, попробуем другую
              e.target.onerror = null;
              
              // Всегда пробуем первую картинку как запасной вариант
              if (randomImage !== 1) {
                e.target.src = '/images/emojis/emoji_food_1.png';
              } else {
                // Если и первая не загрузилась, покажем Empty из Ant Design
                setShowEmptyFallback(true);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EmptyFoodDiary; 