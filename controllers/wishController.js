const uuid = require('uuid')
const path = require('path')
const {Wish, User, Subscription, List, Reservation} = require('../models/models')
const ApiError = require('../error/ApiError')


class WishController {
    // создание нового желания
    async create(req, res) {

        try {
            const {name, description, img, url, list_id,  user_id} = req.body

            const wish = await Wish.create({
                name, 
                description, 
                img,
                url, 
                // is_reserved, 
                user_id, 
                list_id
            })
            return res.json(wish)
        } catch (error) {
            // next(ApiError.badRequest(message))
            console.error(error);
            res.status(500).json({ error: 'Ошибка при создании' });
        }
    }


    async getAll(req, res) {
        try {        
            console.log('📦 Request query:', req.query);

            const userId = req.query.u
            // Извлекаем параметры из запроса
            const limit = parseInt(req.query.limit) || 6; // Лимит записей на странице
            const page = parseInt(req.query.page) || 1; // Номер страницы
            const offset = (page - 1) * limit; // Смещение
            const sort = req.query.sort || 'createdAt'; // Поле для сортировки, по умолчанию 'createdAt'
            const order = req.query.order || 'asc'; // Порядок сортировки, по умолчанию 'asc'
            const search = req.query.q || ''; // Поисковый запрос
            // const filter = req.query.filter || 'all'; 
            const scope = req.query.scope || req.query.filter || 'all';   // all | subscriptions
            const status = req.query.status || 'active';
            
            let whereClause = {};
            const { Op } = require('sequelize');
            // Если задан поисковый запрос, добавляем условие для поиска
            if (search) {
                whereClause.name = { [Op.iLike]: `%${search}%` }; // Поиск по полю
            }

            // статусный фильтр
            if (status === 'active') {
            whereClause.completed = false;  // показываем только невыполненные
            }
    
            // Если фильтр 'subscriptions', фильтруем желания по пользователям, на которых подписан текущий пользователь
            if (scope === 'subscriptions' && userId) {
                try {
                    const subscribedUserIds = await Subscription.findAll({
                        where: { subscriber_id: userId }, // Текущий пользователь
                        attributes: ['subscribed_to_id'], // Только ID подписанных пользователей
                    }).then(subscriptions => subscriptions.map(sub => sub.subscribed_to_id));
           
                    if (subscribedUserIds.length === 0) {
                        return res.status(200).json([]); // Нет подписок
                    }
                    whereClause.user_id = { [Op.in]: subscribedUserIds }; // Условие: пользователь в подписках
                } catch (err) {
                    return res.status(500).json({ message: 'Ошибка при получении подписок', error: err.message });
                }
            }
    
            const validSortFields = ['name', 'createdAt'];
            const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

            // Основной запрос
            const wishes = await Wish.findAll({
                where: whereClause,
                limit,
                offset,
                order: [[sortField, order]],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['name', 'img'],
                    },
                    {
                        model: Reservation,
                        as: 'reservation',
                        attributes: ['user_id'],
                    }
                ],
                
            });

            // Добавляем поле isReserved
            const wishesWithReserved = wishes.map(wish => {
                const obj = wish.toJSON();
                obj.isReserved = !!obj.reservation;
                return obj;
            });

            return res.status(200).json(wishesWithReserved);

            // Отправляем результат
            // return res.status(200).json(wishes);
        } catch (error) {
            console.error('❌ Error in /api/wish:', error);
            // Обработка ошибок
            return res.status(500).json({ message: 'Ошибка при получении желаний', error });
        }
    }
    


    // получение всех желаний конкретного пользователя
    async getUserAll(req, res) {
        try {
            const { userId } = req.params;
            const userWishes = await Wish.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Reservation,
                        as: 'reservation',
                        attributes: ['user_id']
                    }
                ]
            });

            // Преобразуем каждый wish в объект с isReserved
            const wishesWithReserved = userWishes.map(wish => {
                const obj = wish.toJSON();
                obj.isReserved = !!obj.reservation;
                return obj;
            });

            return res.status(200).json(wishesWithReserved);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка при получении желаний пользователя', error });
        }
    }

    //получение одного желания по его ID
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const wish = await Wish.findOne({
                where: { id },
                include: [
                    { 
                        model: User,
                        as: 'user', // Это должно совпадать с ассоциацией в модели
                        attributes: ['name', 'img'], // Поля, которые нужны
                    },
                    {
                        model: List,
                        as: 'list',
                        attributes: ['id', 'name'], // ⬅️ Добавляем это
                    },
                    {
                        model: Reservation,
                        as: 'reservation',
                        attributes: ['id', 'user_id'], // ⬅️ Добавляем это
                    },
                ]
            });
            if (!wish) {
                return res.status(404).json({ message: 'Желание не найдено' });
            }
            // Преобразуем в обычный объект и добавляем isReserved
            const wishObj = wish.toJSON();
            wishObj.isReserved = !!wishObj.reservation;

            return res.status(200).json(wishObj);
            // return res.status(200).json(wish);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка при получении желания', error });
        }
    }

    async getWishesByListId(req, res, next) {
        try {
            const { listId } = req.params;

            const wishes = await Wish.findAll({
                where: { list_id: listId },
                include: [
                    {
                        model: User,
                        as: 'user', // если у тебя есть связь
                        attributes: ['id', 'name', 'img'],
                    },
                    {   
                        model: Reservation, 
                        as: 'reservation', 
                        attributes: ['id', 'user_id'] 
                    },
                ],
                order: [['createdAt', 'ASC']], // можешь поменять сортировку
            });

            // Преобразуем и добавляем isReserved
            const formattedWishes = wishes.map(w => {
                const wishObj = w.toJSON();
                wishObj.isReserved = !!wishObj.reservation;
                return wishObj;
            });
            return res.json(formattedWishes);
            // return res.json(wishes);
        } catch (error) {
            console.error('Ошибка при получении подарков списка:', error);
            res.status(500).json({ message: 'Ошибка при получении подарков списка' });
        }
    }

    async update(req, res) {
        try {
            // Получаем ID желания из параметров и данные для обновления из тела запроса
            const { id } = req.params;
            // const { name, img, url, is_reserved } = req.body;
            const { name, img, url, is_reserved, description, list_id, user_id } = req.body;
    
            // Ищем желание по ID
            const wish = await Wish.findByPk(id);
            if (!wish) {
                return res.status(404).json({ message: 'Желание не найдено' });
            }
    
            // Обновляем данные желания
            await wish.update({
                name,
                img,
                url,
                is_reserved,
                description,
                list_id,
                // user_id,
            });
    
            return res.status(200).json({
                message: 'Желание успешно обновлено',
                wish,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Ошибка при обновлении желания',
                error,
            });
        }
    }

    // удаление желания
    async delete(req, res) {
        try {
            const { id } = req.params;
            console.log('Удаляем желание с ID:', id);
            const wish = await Wish.findOne({ where: { id } });
            if (!wish) {
                return res.status(404).json({ message: 'Желание не найдено' });
            }
            await wish.destroy();
            return res.status(200).json({ message: 'Желание успешно удалено' });
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка при удалении желания', error });
        }
    }



    async setCompleted(req, res) {
        try {
          const { id } = req.params;
          const { completed } = req.body; // boolean
    
          const wish = await Wish.findByPk(id);
          if (!wish) return res.status(404).json({ message: 'Подарок не найден' });
    
          wish.completed = Boolean(completed);
          await wish.save();
    
          return res.json(wish); // вернём обновлённый объект
        } catch (e) {
          console.error('Ошибка при обновлении completed:', e);
          return res.status(500).json({ message: 'Ошибка сервера' });
        }
      }

}

module.exports = new WishController()