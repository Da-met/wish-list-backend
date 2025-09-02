const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    img: {
        type: DataTypes.TEXT, // Для хранения Base64
        
        allowNull: true,
        defaultValue: null,
    },
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    birthday: {type: DataTypes.STRING},
})

const List = sequelize.define('list', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    user_id:  { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: 'users', 
            key: 'id' 
        } 
    }
});

const Wish = sequelize.define('wish', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT},
    img: {
        type: DataTypes.TEXT, // Для хранения Base64
        allowNull: true,
        defaultValue: null,
    },
    url: {type: DataTypes.STRING},

    // is_reserved: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    
    user_id: {type: DataTypes.INTEGER},
    list_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: 'lists', 
            key: 'id' 
        } 
    },

    completed: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
})


const Reservation = sequelize.define('reservation', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }},
    wish_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'wishes', key: 'id' }},
});


const Subscription = sequelize.define('subscription', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    subscriber_id: { // пользователь, который подписывается
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subscribed_to_id: { // пользователь, на которого подписываются
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true, // Запрещает подписываться дважды на одного и того же пользователя
            fields: ['subscriber_id', 'subscribed_to_id'],
        },
    ],
});




User.hasMany(Wish, { foreignKey: 'user_id', as: 'wishes' });
Wish.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


User.hasMany(List, { foreignKey: 'user_id', as: 'lists', onDelete: 'CASCADE' });
List.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

List.hasMany(Wish, { foreignKey: 'list_id', as: 'wishes', onDelete: 'CASCADE'  });
Wish.belongsTo(List, { foreignKey: 'list_id', as: 'list' });


Wish.hasOne(Reservation, { foreignKey: 'wish_id', as: 'reservation'  })
Reservation.belongsTo(Wish, { foreignKey: 'wish_id', as: 'wish'  })

User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' })
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.belongsToMany(User, {
    as: 'Subscriptions', 
    through: Subscription, // модель-посредник
    foreignKey: 'subscriber_id', // подписчик (тот, кто подписывается)
    otherKey: 'subscribed_to_id', // на кого подписываются
});

User.belongsToMany(User, {
    as: 'Subscribers',
    through: Subscription, // модель-посредник
    foreignKey: 'subscribed_to_id', // тот, на кого подписаны
    otherKey: 'subscriber_id', // подписчик (кто подписывается)
});


module.exports = {
    User,
    List,
    Wish,
    Reservation,
    Subscription,
}