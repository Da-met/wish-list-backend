const { Reservation, Wish, User } = require('../models/models')



class ReservationController {
    // зарезервировать желание другого пользователя
    async reserve(req, res) {
        const { wishId } = req.body;
        const userId = req.user.id;


        try {
            const wish = await Wish.findByPk(wishId);
            if (!wish) return res.status(404).json({ error: 'Подарок не найден' });
            // if (wish.is_reserved) return res.status(400).json({ error: 'Подарок уже зарезервирован' });
        
            const existing = await Reservation.findOne({
                where: { wish_id: wishId, user_id: userId }
            });
            if (existing) {
                return res.status(400).json({ error: 'Вы уже зарезервировали этот подарок' });
            }
    
            const reservation = await Reservation.create({ wish_id: wishId, user_id: userId });
            await wish.update({ is_reserved: true });
    
            res.status(201).json({ message: 'Подарок успешно зарезервирован', reservation });

        } catch (error) {
            res.status(500).json({ error: 'Ошибка при резервировании подарка' });
        }
    }

    // отменить резервацию желания
    async unreserve(req, res) {
        const userId = req.user.id;
        const { wishId } = req.body;

    
        try {
            // Проверяем, существует ли резервация
            const reservation = await Reservation.findOne({
                where: { wish_id: wishId, user_id: userId }
            });
            if (!reservation) {
                return res.status(404).json({ error: 'Резервация не найдена' });
            }
            // Удаляем резервацию
            await reservation.destroy();
        
            // Обновляем флаг is_reserved в таблице Wish
            await Wish.update({ is_reserved: false }, { where: { id: wishId } });
        
            res.status(200).json({ message: 'Резервация успешно отменена' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при отмене резервации' });
        }
    }


    // получение всех желаний, зарезервированных конкретным пользователем
    async getReservationsByUser(req, res) {
        const userId = req.user.id;

        try {
            const reservations = await Reservation.findAll({
                where: { user_id: userId },
                include: [{ 
                    model: Wish, 
                    as: 'wish',
                    include: [{
                        model: User,
                        as: 'user', // 👈 если используешь алиас
                        attributes: ['id', 'name', 'img'] // что именно хочешь получить
                      }]
                }]
            });
        
            return res.status(200).json(reservations);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch reservations' });
        }
    }
}

module.exports = new ReservationController()