const { Subscription, User } = require('../models/models');

class SubscriptionController {
    // добавление подписки на другого пользователя
    async add(req, res) {
        console.log(req.body)
        const { userId, subscriptionId } = req.body;
        try {
            await Subscription.create({subscriber_id: userId, subscribed_to_id: subscriptionId });
            res.status(201).json({ message: 'Успешно добавлено' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Не удалось добавить' });
        }
    }

    // удаление подписки
    async delete(req, res) {
        console.log(req.params)

        const { userId, subscriptionId } = req.params;
        try {
            const subscription = await Subscription.findOne({
                where: { subscriber_id: userId, subscribed_to_id: subscriptionId }
            });
            
            await subscription.destroy();
            res.status(200).json({ message: 'Subscription removed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to remove subscription' });
        }
    }

    async getAllFriends(req, res, next) {
        try {

            const userId = req.params.id; // ID текущего пользователя (из токена)
            
            // 1. Получаем ID пользователей, на которых подписан текущий пользователь
            const subscriptions = await Subscription.findAll({
                where: { subscriber_id: userId },
                attributes: ['subscribed_to_id'], // Берем только ID подписок
            });

            // Преобразуем в массив ID
            const friendIds = subscriptions.map(sub => sub.subscribed_to_id);

            // 2. Получаем данные о друзьях (на кого подписан)
            const friends = await User.findAll({
                where: { id: friendIds },
                attributes: ['id', 'name', 'img', 'birthday'], // Выбираем нужные поля
            });

            return res.json(friends);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Ошибка при получении списка друзей'));
        }
    }

}

module.exports = new SubscriptionController()