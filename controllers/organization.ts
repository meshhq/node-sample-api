// External Dependencies
import { Request, Response } from 'express'

// Logger
import Logger from '../config/logger'
import RequestError from '../utils/error'
import Validator from '../utils/validator'

// Models
import Organization from '../model/Organization'
import User from '../model/user'

const bodyParams = ['name']
const validator = new Validator(bodyParams)

export default class OrganizationController {

	/**
	 * Creates a new Organization for a Organization.
	 * @param req Express Request
	 * @param req.body The payload contaning organization information.
	 * @param res Express Response
	 */
	public static createOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to update organizations. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Creating Organization info: ${req.body}`)
		Organization.create(req.body).then((organization: Organization) => {
			Logger.info(`Created organization with ID: ${organization.id} info: ${req.body}`)
			return res.status(201).send(organization)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Gets all Organization for a Organization constrained by the supplied query parameters.
	 * @param req Express Request
	 * @param req.params.organization_id The organizationID for the organization to be fetched.
	 * @param res Express Response
	 */
	public static getOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to find an organization. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Fetching organization with id: ${req.params.organization_id}`)
		Organization.findById(req.params.organization_id).then((organization: Organization) => {
			if (!organization) {
				throw new RequestError(404, `Failed to find qrganization with id: ${req.params.organization_id}`)
			}
			Logger.info(`Found organization: ${organization}`)
			res.status(200).json(organization)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Gets all Organization for a Organization constrained by the supplied query parameters.
	 * @param req Express Request
	 * @param req.query The query values to be used in the query.
	 * @param res Express Response
	 */
	public static getOrganizations(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to find organizations. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Fetching organizations for query: ${req.query}`)
		Organization.findAll({ where: req.query }).then((organizations: Organization[]) => {
			if (organizations.length === 0) {
				throw new RequestError(404, `Failed to find Organization for query: ${req.query}`)
			}
			Logger.info(`Found organizations: ${organizations} for query: ${req.query} `)
			res.status(200).json(organizations)
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Updates an Organization with the supplied information.
	 * @param req Express Request - will contain the Authorized Organization info
	 * @param req.params.organization_id The organizationID for the organization to be updated.
	 * @param req.body The paylod containg update information for the organization.
	 * @param res Express Response
	 */
	public static async updateOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to update organization. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Updating organization with ID ${req.params.organization_id}`)
		Organization.updateById(req.params.organization_id, req.body).then((organization: Organization) => {
			if (!organization) {
				throw new RequestError(404, `Failed to find Organization for query: ${req.query}`)
			}
			Logger.info(`Updated organization: ${organization}`)
			res.status(200).json(organization)
		}).catch((err: Error | RequestError) => {
			RequestError.handle(err, req, res)
		})
	}

	/**
	 * Get a single Organization the authorized Organization belongs to
	 * @param req Express Request - will contain the Authorized Organization info
	 * @param req.params.organization_id The organizationID for the organization to be deleted.
	 * @param res Express Response
	 */
	public static async deleteOrganization(req: Request, res: Response) {
		const valid = validator.ValidateRequest(req)
		if (!valid) {
			const err = new RequestError(422, `Failed to update organizations. Req parameters are invalid: ${req}`)
			return RequestError.handle(err, req, res)
		}

		Logger.info(`Deleting organization with ID ${req.params.organization_id}`)
		Organization.destroy({ where: { 'id': req.params.organization_id } }).then((rows: number) => {
			if (rows === 0) {
				throw new RequestError(404, `Failed to delete organization with id: ${req.params.organization_id}. Not found`)
			}
			Logger.info(`Delete organization with ID: ${req.params.organization_id} `)
			res.status(200).json()
		}).catch((err: Error) => {
			RequestError.handle(err, req, res)
		})
	}
}