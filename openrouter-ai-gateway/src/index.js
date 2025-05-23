/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import OpenAI from 'openai';

/**
 * Cloudflare Worker для интеграции с OpenRouter API
 * Предоставляет эндпоинты для анализа фото еды и получения итогов дня
 */

export default {
	/**
	 * Обрабатывает входящие запросы
	 * @param {Request} request - входящий HTTP запрос
	 * @param {Object} env - переменные окружения
	 * @param {Object} ctx - контекст выполнения
	 * @returns {Response} HTTP ответ
	 */
	async fetch(request, env, ctx) {
		// Настраиваем CORS для запросов с любого домена
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Обрабатываем preflight запросы
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		// Получаем путь запроса
		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// Маршрутизация запросов
			if (path === '/analyze-food' && request.method === 'POST') {
				return await this.analyzeFood(request, env, corsHeaders);
			} else if (path === '/daily-summary' && request.method === 'POST') {
				return await this.getDailySummary(request, env, corsHeaders);
			} else {
				// Базовая информация о доступных эндпоинтах
				return new Response(
					JSON.stringify({
						message: 'OpenRouter AI API для приложения питания',
						endpoints: [
							{ path: '/analyze-food', method: 'POST', description: 'Анализ фото еды' },
							{ path: '/daily-summary', method: 'POST', description: 'Итоги дня на основе приемов пищи' }
						]
					}),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					}
				);
			}
		} catch (error) {
			// Обработка ошибок
			console.error('Ошибка:', error);
			return new Response(
				JSON.stringify({
					success: false,
					error: error.message || 'Произошла ошибка при обработке запроса',
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}
	},

	/**
	 * Анализирует фото еды
	 * @param {Request} request - входящий HTTP запрос
	 * @param {Object} env - переменные окружения
	 * @param {Object} corsHeaders - заголовки CORS
	 * @returns {Response} HTTP ответ с результатами анализа
	 */
	async analyzeFood(request, env, corsHeaders) {
		// Проверяем наличие API ключа
		if (!env.OPENROUTER_API_KEY) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'API ключ не настроен. Используйте wrangler secret put OPENROUTER_API_KEY',
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}

		// Получаем данные из запроса
		const data = await request.json();
		const { imageBase64, description } = data;

		if (!imageBase64) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Не предоставлено изображение',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}

		// Инициализируем OpenAI клиент для работы с OpenRouter
		const openai = new OpenAI({
			apiKey: env.OPENROUTER_API_KEY,
			baseURL: 'https://openrouter.ai/api/v1',
		});

		try {
			// Отправляем запрос к API
			const response = await openai.chat.completions.create({
				model: 'anthropic/claude-3-haiku', // Можно заменить на любую другую модель
				messages: [
					{
						role: 'system',
						content: 'Ты эксперт по анализу питания. Проанализируй фото еды и предоставь информацию о БЖУ и калорийности. Формат ответа должен быть JSON с полями: {"name": "Название блюда", "calories": XXX, "protein": XX, "fat": XX, "carbs": XX, "description": "Краткое описание"}'
					},
					{
						role: 'user',
						content: [
							{ type: 'text', text: `Проанализируй это блюдо. ${description || ''}` },
							{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
						]
					}
				],
				max_tokens: 500,
				temperature: 0.7,
				http_referer: 'https://photocal.ai', // Заменить на ваш домен
				headers: {
					'HTTP-Referer': 'https://photocal.ai', // Заменить на ваш домен
					'X-Title': 'PhotocAI Nutrition Assistant'
				}
			});

			// Возвращаем результат
			return new Response(
				JSON.stringify({
					success: true,
					data: response.choices[0].message.content
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		} catch (error) {
			console.error('Ошибка при анализе фото:', error);
			
			return new Response(
				JSON.stringify({
					success: false,
					error: error.message || 'Ошибка при анализе фото'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}
	},

	/**
	 * Получает итоги дня на основе приемов пищи
	 * @param {Request} request - входящий HTTP запрос
	 * @param {Object} env - переменные окружения
	 * @param {Object} corsHeaders - заголовки CORS
	 * @returns {Response} HTTP ответ с итогами дня
	 */
	async getDailySummary(request, env, corsHeaders) {
		// Проверяем наличие API ключа
		if (!env.OPENROUTER_API_KEY) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'API ключ не настроен. Используйте wrangler secret put OPENROUTER_API_KEY',
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}

		// Получаем данные из запроса
		const data = await request.json();
		const { meals, userInfo } = data;

		if (!meals || !Array.isArray(meals) || meals.length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Не предоставлены данные о приемах пищи',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}

		// Инициализируем OpenAI клиент для работы с OpenRouter
		const openai = new OpenAI({
			apiKey: env.OPENROUTER_API_KEY,
			baseURL: 'https://openrouter.ai/api/v1',
		});

		try {
			// Подготавливаем данные о пользователе и приемах пищи
			const userInfoText = userInfo 
				? `Информация о пользователе: возраст - ${userInfo.age}, пол - ${userInfo.gender}, вес - ${userInfo.weight} кг, рост - ${userInfo.height} см, цель - ${userInfo.goal}`
				: 'Информация о пользователе отсутствует';

			// Calculate total nutrients for the day
			let totalCalories = 0;
			let totalProtein = 0;
			let totalFat = 0;
			let totalCarbs = 0;
			
			const mealsText = meals.map((meal, index) => {
				// Extract nutrients from meal object
				const nutrients = meal.nutrients || {};
				const calories = nutrients.calories || 0;
				const protein = nutrients.protein || 0;
				const fat = nutrients.fat || 0;
				const carbs = nutrients.carbs || 0;
				
				// Add to totals
				totalCalories += parseFloat(calories) || 0;
				totalProtein += parseFloat(protein) || 0;
				totalFat += parseFloat(fat) || 0;
				totalCarbs += parseFloat(carbs) || 0;
				
				return `Прием пищи ${index + 1}: ${meal.name || 'Без названия'}\n` +
				`Тип: ${meal.mealType || 'Не указано'}\n` +
				`Время: ${meal.timestamp ? new Date(meal.timestamp).toLocaleTimeString() : 'Не указано'}\n` +
				`Калории: ${calories} ккал\n` +
				`Белки: ${protein} г\n` +
				`Жиры: ${fat} г\n` +
				`Углеводы: ${carbs} г\n` +
				`Описание: ${meal.description || 'Нет описания'}`;
			}).join('\n\n');
			
			// Add summary of total nutrients
			const nutritionSummary = `
Итого за день:
- Калории: ${totalCalories.toFixed(1)} ккал
- Белки: ${totalProtein.toFixed(1)} г
- Жиры: ${totalFat.toFixed(1)} г
- Углеводы: ${totalCarbs.toFixed(1)} г
`;

			// Отправляем запрос к API
			const response = await openai.chat.completions.create({
				model: 'anthropic/claude-3-haiku', // Можно заменить на любую другую модель
				messages: [
					{
						role: 'system',
						content: 'Ты эксперт-диетолог. Проанализируй дневник питания пользователя и дай КРАТКИЕ, ЧЕТКИЕ рекомендации. В каждом пункте пиши не более 2-3 предложений, будь максимально конкретным. Ответ структурируй так: 1) Общая оценка рациона (1-2 предложения), 2) Анализ БЖУ и калорийности (2-3 предложения), 3) Рекомендации по улучшению (2-3 конкретных совета), 4) Советы на завтра (1-2 предложения). Основывай рекомендации на цели пользователя (похудение/набор массы/поддержание формы) и его физических параметрах.'
					},
					{
						role: 'user',
						content: `${userInfoText}\n\nДневник питания за день:\n\n${mealsText}\n\n${nutritionSummary}\n\nПроанализируй мой рацион и дай рекомендации.`
					}
				],
				max_tokens: 1000,
				temperature: 0.7,
				http_referer: 'https://photocal.ai', // Заменить на ваш домен
				headers: {
					'HTTP-Referer': 'https://photocal.ai', // Заменить на ваш домен
					'X-Title': 'PhotocAI Nutrition Assistant'
				}
			});

			// Возвращаем результат
			return new Response(
				JSON.stringify({
					success: true,
					data: response.choices[0].message.content
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		} catch (error) {
			console.error('Ошибка при получении итогов дня:', error);
			
			return new Response(
				JSON.stringify({
					success: false,
					error: error.message || 'Ошибка при получении итогов дня'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}
	}
};
