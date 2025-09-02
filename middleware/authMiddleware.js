const jwt = require('jsonwebtoken');


// module.exports = function (req, res, next) {
//     if (req.method === 'OPTIONS') {
//         return next();
//     }


//     try {
//         const token = req.headers.authorization.split(' ')[1]
//         if (!token) {
//             return res.status(401).json({message: "Не авторизован"})
//         }
//         const decoded = jwt.verify(token, process.env.SECRET_KEY)

//         req.user = decoded
//         next()
//     } catch (error) {
//         res.status(401).json({message: "Не авторизован"})
//     }
// }

    // ИЗМЕНЕННЫЙ
module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        return next();
    }
    
    try {
        const authHeader = req.headers.authorization;
    
        if (!authHeader) {
        return res.status(401).json({ message: 'Нет токена' });
        }
    
        const token = authHeader.split(' ')[1];
    
        if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
        }
    
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
    
        return next();
    } catch (e) {
        console.error('Ошибка авторизации:', e);
        return res.status(401).json({ message: 'Не авторизован' });
    }
};