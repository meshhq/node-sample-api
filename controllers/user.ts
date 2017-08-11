// External Dependencies
import { Request, Response } from 'express'
import { Promise as Bluebird } from 'sequelize'

// Models
import User from '../model/user'
import Organization from '../model/organization'

// Logger
import Logger from '../config/logger'
import RequestError from '../utils/error'
import Validator from '../utils/validator'

// Acceptable Body Params
const bodyParams = ['email', 'firstName', 'lastName']
const validator = new Validator(bodyParams)

export default class UserController {

	/**
	 * Creates a new User for a user.
	 * @param req Express Request
	 * @param req.body The payload contaning user information.
	 * @param res Express Response
	 */
	public static createUser(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to update organizations. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Creating Organization info: ${req.body}`)
		User.create(req.body).then((user: User) => {
			Logger.info(`Created User with ID ${user.id} info: ${req.body}`)
			res.status(201).send(user)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Gets all User for a user constrained by the supplied query parameters.
	 * @param req Express Request
	 * @param req.params.user_id The userID for the user to be fetched.
	 * @param res Express Response
	 */
	public static getUser(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to find user. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Fetching user with id: ${req.params.user_id}`)
		User.findById(req.params.user_id).then((user: User) => {
			if (!user) {
				throw new RequestError(404, `Failed to find user with id: ${req.params.user_id}`)
			}
			Logger.info(`Found user: ${user}`)
			res.status(200).json(user)
		}).catch((err: Error) => {

			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Gets all User for a user constrained by the supplied query parameters.
	 * @param req Express Request
	 * @param req.query The query values to be used in the query.
	 * @param res Express Response
	 */
	public static getUsers(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to find users. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info('Find all Users for User: ', req.user.githubHandle)
		User.findAll({ where: req.query }).then((users: User[]) => {
			if (users.length === 0) {
				throw new RequestError(404, `Failed to find users for query: ${req.query}`)
			}
			Logger.info(`Found users: ${users} for query: ${req.query} `)
			res.status(200).json(users)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Updates an User with the supplied information.
	 * @param req Express Request
	 * @param req.params.user_id The user)D for the user to be updated.
	 * @param req.body The paylod containg update information for the user.
	 * @param res Express Response
	 */
	public static async updateUser(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to update user. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}


		Logger.info(`Updating user with ID ${req.params.user_id}`)
		User.updateById(req.params.user_id, req.body).then((user: User) => {
			if (!user) {
				throw new RequestError(404, `Failed to find user for query: ${req.query}`)
			}
			Logger.info(`Updated User ${user}`)
			res.status(200).json(user)
		}).catch((err: Error | RequestError) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Get a single User the authorized user belongs to
	 * @param req Express Request - will contain the Authorized User info
	 * @param req.params.user_id The userID for the user to be deleted.
	 * @param res Express Response
	 */
	public static async deleteUser(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to delete organizations. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Deleting user with ID ${req.params.user_id}`)
		User.destroy({ where: { 'id': req.params.user_id } }).then((rows: number) => {
			if (rows === 0) {
				throw new RequestError(404, `Failed to delete user with id: ${req.params.user_id}. Not found`)
			}
			Logger.info(`Deleted user with ID: ${req.params.user_id}`)
			res.status(200).json()
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	//-----------------------------------------------------------
	// Organization Users
	//-----------------------------------------------------------

	/**
	 * Creates a new User for a user.
	 * @param req Express Request
	 * @param res Express Response
	 */
	public static createUserForOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to create user for organization. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		let user: User
		let organization: Organization
		Organization.findById(req.params.organization_id).then((fetchedOrganization: Organization) => {
			if (!fetchedOrganization) {
				throw new RequestError(404, `Failed to find organization with query: ${req.params.organization_id}`)
			}
			Logger.info(`Found organization: ${organization} for id: ${req.params.organization_id} `)
			organization = fetchedOrganization
			return User.create(req.body)
		}).then((newUser: User) => {
			user = newUser
			return organization.addUser(user)
		}).then(() => {
			Logger.info(`Created user: ${user} for organization with id: ${req.params.organization_id}`)
			res.status(201).send(user)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Creates a new User for a user.
	 * @param req Express Request
	 * @param res Express Response
	 */
	public static getUsersForOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to gets users for organization. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Organization.findById(req.params.organization_id).then((organization: Organization) => {
			if (!organization) {
				throw new RequestError(404, `Failed to find organization with query: ${req.params.organization_id}`)
			}
			Logger.info(`Found organization: ${organization} for id: ${req.params.organization_id} `)
			return organization.getUsers()
		}).then((users: User[]) => {
			Logger.info(`Fetched users: ${users} for organization with id: ${req.params.organization_id}`)
			res.status(200).send(users)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}
}
