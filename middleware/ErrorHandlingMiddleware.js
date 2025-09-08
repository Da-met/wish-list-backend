const ApiError = require('../error/ApiError')

// module.exports = function (err, req, res, next) {
//     if (err instanceof ApiError) {
//         return res.status(err.status).json({message: err.message})
//     }
//     return res.status(500).json({message: 'Непредвиденная ошибка!'})
// }


// middleware/ErrorHandlingMiddleware.js
module.exports = (err, req, res, next) => {
    // Всегда логируем стек — попадёт в Vercel Logs
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
  
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    // В проде лучше не отдавать stack клиенту, но временно можно вернуть короткий debugMessage
    res.status(status).json({
      message,
      // debug: process.env.NODE_ENV !== 'production' ? err.stack : undefined
      // Лучше не включать stack в продакшн; для диагностики достаточно логов
    });
  };