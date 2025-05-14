/**
 * API клиент для взаимодействия с Cloudflare Worker и OpenRouter AI
 * Предоставляет функции для анализа фото еды и получения итогов дня
 */

const API_URL = 'https://openrouter-ai-gateway.todominate-ai.workers.dev';

/**
 * Анализирует фото еды с помощью AI
 * @param {string} imageBase64 - изображение в формате base64
 * @param {string} description - текстовое описание еды
 * @returns {Promise<Object>} - результат анализа
 */
export const analyzeFood = async (imageBase64, description = '') => {
  try {
    const response = await fetch(`${API_URL}/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        description,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка анализа фото');
    }
    
    // Пытаемся распарсить данные, если они в формате JSON
    try {
      const parsedData = JSON.parse(result.data);
      return parsedData;
    } catch {
      // Если не получается распарсить, возвращаем как есть
      return { 
        raw: result.data,
        name: 'Определено по фото', 
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        description: result.data 
      };
    }
  } catch (error) {
    console.error('Ошибка при обращении к API:', error);
    throw error;
  }
};

/**
 * Получает итоги дня и рекомендации на основе приемов пищи
 * @param {Array} meals - список приемов пищи
 * @param {Object} userInfo - информация о пользователе
 * @returns {Promise<string>} - текст с анализом и рекомендациями
 */
export const getDailySummary = async (meals, userInfo) => {
  try {
    const response = await fetch(`${API_URL}/daily-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meals,
        userInfo,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка получения итогов дня');
    }
    
    return result.data;
  } catch (error) {
    console.error('Ошибка при обращении к API:', error);
    throw error;
  }
}; 