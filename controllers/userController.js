const ApiError = require('../error/ApiError')
const { User, Wish, Subscription, List, Reservation } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const path = require('path');
const tokenService = require('../services/tokenService');


const SECRET_KEY = process.env.SECRET_KEY
const generateJwt = (id, name, email) => {
    return jwt.sign(
        {id, name, email}, 
        SECRET_KEY, 
        { expiresIn: '24h' }
    )
}


class UserController {

    // регистрация нового пользователя
    async registration (req, res, next) {
        const { username, email, password, birthday } = req.body;

        if (!username || !email || !password || !birthday) {
            return next(ApiError.badRequest('Некорректные данные'))
        }

        if (!req.body || !req.body.img) {
            return next(ApiError.badRequest('Изображение профиля не загружено'));
        }

        const img = req.body.img; // Убедись, что имя поля совпадает

        try {
            const candidateEmail = await User.findOne({where: {email}})
            if (candidateEmail) {
                return next(ApiError.badRequest('Текущая почта уже используется'))
            }
            const candidateName = await User.findOne({where: { name: username }})
            if (candidateName) {
                return next(ApiError.badRequest('Пользователь с таким именем уже существует'))
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name: username, img: img, email, password: hashedPassword, birthday });
            console.log(user)
            // Генерация JWT
            const token = generateJwt(user.id, user.name, user.email);

            return res.status(201).json({
                token, // обязательно!
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    img: user.img,
                    birthday: user.birthday
                }
            });
        } catch (error) {
            // console.error(error);
            res.status(500).json({ error: 'Ошибка при регистрации 2' });
        }
    }

    // аутентификация пользователя (вход)
    // async login (req, res) {
    //     const { email, password } = req.body;
    //     try {
    //         const user = await User.findOne({ where: { email } });
    //         if (!user) return next(ApiError.internal('Пользователь не найден'));
        
    //         const isPasswordValid = await bcrypt.compare(password, user.password);
    //         if (!isPasswordValid) return next(ApiError.internal('Неверные данные'));

    //         const token = generateJwt(user.id, user.name, user.email);
    //         return res.status(201).json({
    //             token, // обязательно!
    //             user: {
    //                 id: user.id,
    //                 name: user.name,
    //                 email: user.email,
    //                 img: user.img,
    //                 birthday: user.birthday
    //             }
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: 'Failed to login' });
    //     }
    // }

    // ИЗМЕНЕННЫЙ
    async login(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
    
        if (!user) {
            return res.status(401).json({ message: 'Неверные данные' });
        }
    
        const isPassValid = await bcrypt.compare(password, user.password);
        if (!isPassValid) {
            return res.status(401).json({ message: 'Неверные данные' });
        }
    
        const { accessToken, refreshToken } = tokenService.generateTokens({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'lax',
        });
    
        return res.status(200).json({
            accessToken,
            user,
        });
    }


    // получение профиля пользователя, включая список его желаний и подписки
    async getUserProfile (req, res) {
        // console.log(req)
        const { id } = req.params;
        try {
            const user = await User.findByPk(id, {
                include: [
                    { model: Wish, as: 'wishes' }, // Желания пользователя
                    { model: User, as: 'Subscriptions', attributes: ['id', 'name', 'img'] }, // Подписки
                    { model: User, as: 'Subscribers', attributes: ['id', 'name'] }, // Подписчики
                    { 
                        model: List, 
                        as: 'lists',
                        include: [
                            { model: Wish, as: 'wishes', include: [{ model: Reservation, as: 'reservation', attributes: ['user_id'] }] }
                        ]
                    },
                ]
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
    
            const userJSON = user.toJSON();

            // добавляем isReserved для всех желаний пользователя
            if (userJSON.wishes) {
                userJSON.wishes = userJSON.wishes.map(w => ({ ...w, isReserved: !!w.reservation }));
            }

            // добавляем isReserved для всех желаний в списках
            if (userJSON.lists) {
                userJSON.lists = userJSON.lists.map(list => {
                    if (list.wishes) {
                        list.wishes = list.wishes.map(w => ({ ...w, isReserved: !!w.reservation }));
                    }
                    return list;
                });
            }

            return res.status(200).json(userJSON);

            // return res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    }

    
    async update(req, res) {
        const { id } = req.params;
        const { name, img } = req.body; // Извлекаем name и img (Base64 строка)
        console.log( req.body )
        try {
            // Находим пользователя по ID
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            console.log( user )
            // Формируем данные для обновления
            const updatedData = {
                name: name || user.name, // Если новое имя не передано, оставляем старое
                img: img || user.img,   // Если новое изображение не передано, оставляем старое
            };

            // Обновляем данные пользователя
            await user.update(updatedData);
            
            // Отправляем успешный ответ с обновлёнными данными
            return res.status(200).json(
                user
        );
        } catch (error) {
            console.error('Failed to update profile:', error);
            return res.status(500).json({ error: 'Failed to update profile' });
        }
    }
    


    async refreshToken (req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
    
            if (!refreshToken) {
                return res.status(401).json({ message: 'Нет refresh токена' });
            }
    
            const userData = tokenService.validateRefreshToken(refreshToken);
            if (!userData) {
                return res.status(403).json({ message: 'Refresh токен недействителен' });
            }
    
            const { exp, iat, ...cleanUserData } = userData;
            // const newTokens = tokenService.generateTokens(userData);
            const newTokens = tokenService.generateTokens(cleanUserData);

            // Обновляем refreshToken в cookie
            res.cookie('refreshToken', newTokens.refreshToken, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                secure: false, // true для прода
                sameSite: 'lax',
            });
    
            return res.json({
                accessToken: newTokens.accessToken,
                user: cleanUserData,
                // user: userData,
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при обновлении токена' });
        }
    };




}

module.exports = new UserController()