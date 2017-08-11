import {
	InitOptions,
	DataTypes,
	ModelAttributes,
	Model,
	UpdateOptions,
	DestroyOptions,
	BelongsToManyAddAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	Promise as Bluebird
} from 'sequelize'

import DB from '../config/db'

/**
 * Interface Declaration
 */
export interface OrganizationInterface {
	name: string
	Users?: User[]
}

/**
 * Model Declaration
 */
export default class Organization extends Model {

	public id: number
	public name: string
	public Users?: User[]

	public addUser: BelongsToManyAddAssociationMixin<User, number>
	public getUsers: BelongsToManyGetAssociationsMixin<User>

	public static updateById(id: number, values: Object): Bluebird<{}> {
		const options: UpdateOptions = { where: { 'id': id }, returning: true }
		return Organization.update(values, options).spread((number: number, organizations: Organization[]) => {
			if (number === 0) {
				return null
			}
			return organizations[0]
		})
	}
}

/**
 * Model Schema
 */
const organizationSchema: ModelAttributes = {
	id: {
		autoIncrement: true,
		field: 'id',
		primaryKey: true,
		type: DataTypes.INTEGER,
		unique: true
	},
	name: {
		field: 'info',
		type: DataTypes.STRING
	},
}

/**
 * Model Init Options
 */
const opts: InitOptions = {
	sequelize: DB.SharedInstance,
	timestamps: true
}

Organization.init(organizationSchema, opts)

import User from './user'
import UserOrganization from './userOrganization'
Organization.belongsToMany(User, { through: UserOrganization })