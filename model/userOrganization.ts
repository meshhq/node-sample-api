import {
	InitOptions,
	DataTypes,
	ModelAttributes,
	Model,
	Promise as Bluebird
} from 'sequelize'

import DB from '../config/db'

/**
 * Model Declaration
 */
export default class UserOrganization extends Model {
	public id: number
	public organizationID: number
	public userID: number
}

/**
 * Model Schema
 */
const userOrganizationsSchema: ModelAttributes = {
	id: {
		autoIncrement: true,
		field: 'id',
		primaryKey: true,
		type: DataTypes.INTEGER
	},
	organizationID: {
		field: 'organizationID',
		type: DataTypes.INTEGER
	},
	userID: {
		field: 'userID',
		type: DataTypes.INTEGER
	},
	uniqueIDX: {
		field: 'uniqueIDX',
		type: DataTypes.STRING
	}
}

/**
 * Model Init Options
 */
const opts: InitOptions = {
	indexes: [
		{
			fields: ['organizationID', 'userID', 'uniqueIDX']
		}
	],
	sequelize: DB.SharedInstance,
	timestamps: true
}

UserOrganization.init(userOrganizationsSchema, opts)
