const { List, User, Wish, Reservation } = require('../models/models');
const ApiError = require('../error/ApiError');

class ListController {
    // Создать новый список
    async createList (req, res) {
        try {
            const { name, user_id } = req.body;
            if (!name || !user_id) {
                return res.status(400).json({ message: 'Необходимо указать название и ID пользователя' });
            }
            const newList = await List.create({ name, user_id });
            res.status(201).json(newList);
        } catch (error) {
            console.error('Ошибка при создании списка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    };

    async getAllLists(req, res, next) {
        try {
            const userId = req.params.id; // ID текущего пользователя (из токена)

            const lists = await List.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Wish,
                        as: 'wishes', // Обязательно совпадает с `as` в ассоциации
                        attributes: ['id', 'name', 'img', 'completed' ], // Возвращай только нужные поля
                         include: [
                            {
                                model: Reservation,
                                as: 'reservation',
                                attributes: ['id', 'user_id'] // только нужные поля
                            }
                        ]
                    },
                ],
                order: [['createdAt', 'ASC']],
            });


            // ------------------------------------------------------------------
            const plain = lists.map((l) => {
                const list = l.get({ plain: true });
                // optionally добавим удобный флаг
                list.wishes = (list.wishes || []).map((w) => ({
                  ...w,
                  isReserved: !!w.reservation,
                }));
                return list;
            });
        
            return res.json(plain);
            // return res.json(lists);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Ошибка при получении списка'));
        }
    }

    // Получить один список по его ID
    async getListById(req, res) {
        try {
            const { id } = req.params;

            const listInstance = await List.findByPk(id, {
                include: [
                    {
                        model: Wish,
                        as: 'wishes',
                        attributes: ['id', 'name', 'img', 'completed'],
                        include: [
                            {
                                model: Reservation,
                                as: 'reservation',
                                attributes: ['id', 'user_id'] // только нужные поля
                            }
                        ]
                    },
                ],
            });

            // if (!list) {
            //     return res.status(404).json({ message: 'Список не найден' });
            // }

            
            if (!listInstance) {
                return res.status(404).json({ message: 'Список не найден' });
              }
        
              const list = listInstance.get({ plain: true });
              list.wishes = (list.wishes || []).map((w) => ({
                ...w,
                isReserved: !!w.reservation,
              }));
        
              return res.json(list);
              
        } catch (error) {
            console.error('Ошибка при получении списка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Изменение имени списка
    async updateList(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const list = await List.findByPk(id);
            if (!list) {
                return res.status(404).json({ message: 'Список не найден' });
            }

            list.name = name || list.name;
            await list.save();

            res.json({ message: 'Список обновлён', list });
        } catch (error) {
            console.error('Ошибка при обновлении списка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление списка и всех его подарков
    async deleteList(req, res) {
        try {
            const { id } = req.params;
            console.log(id)
            const list = await List.findByPk(id, {
                include: [{ model: Wish, as: 'wishes' }],
            });

            if (!list) {
                return res.status(404).json({ message: 'Список не найден' });
            }

            // Удаляем все подарки, связанные с этим списком
            await Wish.destroy({ where: { list_id: id } });

            // Удаляем сам список
            await list.destroy();

            res.json({ message: 'Список и все связанные подарки удалены' });
        } catch (error) {
            console.error('Ошибка при удалении списка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ListController()