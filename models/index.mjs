import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gameUserModel from './gamesUser.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.UserGame = gameUserModel(sequelize, Sequelize.DataTypes);

db.Game.belongsToMany(db.User, { through: 'game_user' });
db.User.belongsToMany(db.Game, { through: 'game_user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
