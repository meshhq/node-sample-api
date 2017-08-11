import {
	InitOptions,
	DataTypes,
	ModelAttributes,
	Model,
	UpdateOptions,
	Promise as Bluebird
} from 'sequelize'

// Interfaces
import DB from '../config/db'

// Logger
import Logger from '../config/logger'

/**
 * Model Declaration
 */
export interface UserInterface {
	email: String
	firstName: string
	lastName: string
	Organizations?: Organization[]
}

/**
 * Model Declaration
 */
export default class User extends Model {
	public id: number
	public email: String
	public firstName: string
	public lastName: string
	public Organizations?: Organization[]

	public static updateById(id: number, values: Object): Bluebird<{}> {
		const options: UpdateOptions = { where: { 'id': id }, returning: true }
		return User.update(values, options).spread((number: number, users: User[]) => {
			if (number === 0) {
				return null
			}
			return users[0]
		})
	}
}

/**
 * Model Schema
 */
const userSchema: ModelAttributes = {
	id: {
		autoIncrement: true,
		field: 'id',
		primaryKey: true,
		type: DataTypes.INTEGER
	},
	email: {
		field: 'email',
		type: DataTypes.STRING
	},
	firstName: {
		field: 'firstName',
		type: DataTypes.STRING
	},
	lastName: {
		field: 'lastName',
		type: DataTypes.STRING
	},
	password: {
		field: 'password',
		type: DataTypes.STRING
	}
}

/**
 * Model Init Options
 */
const opts: InitOptions = {
	sequelize: DB.SharedInstance,
	timestamps: true  // Will add a createdAt/updatedAt timestamp
}

User.init(userSchema, opts)

import Organization from './organization'
import UserOrganization from './userOrganization'
User.belongsToMany(Organization, { through: UserOrganization })