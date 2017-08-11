/* tslint:disable:only-arrow-functions */
/* tslint:disable:no-unused-expression */
/* tslint:disable:space-before-function-paren */

// External Dependencies
import 'mocha'
import { expect } from 'chai'
import { Agent, UnAuthorizedAgent } from '../config.test'

// Internal Deps
import Organization from '../../model/organization'
import User from '../../model/user'

// Factories
import { NewOrganization, CreateOrganization } from '../factories/organization'
import { NewUser, CreateUser } from '../factories/user'

describe('Organization Controller', function () {
	this.timeout(10000)
	let organization: Organization

	beforeEach(function () {
		return Organization.destroy({ where: {} }).then(() => {
			return User.destroy({ where: {} })
		}).then(() => {
			return CreateOrganization()
		}).then((newOrg: Organization) => {
			organization = newOrg
		})
	})

	//------------------------------------------------------------------------
	// POST
	//------------------------------------------------------------------------

	describe('POST /organizations', function () {
		it.skip('should return 401 status for unauthorized organizations', function (done) {
			const organizationPayload = NewOrganization()
			UnAuthorizedAgent.post('/organizations').send(organizationPayload).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 401 status for invalid payload', function (done) {
			const organizationPayload = {}
			Agent.put('/organizations').send(organizationPayload).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should successfully return the created organizations payload', function (done) {
			const organizationPayload = NewOrganization()
			Agent.post('/organizations').send(organizationPayload).end(function (err: Error, res: Response) {
				expect(err).to.not.exist
				expect(res).to.have.status(201)
				done(err)
			})
		})
	})

	//------------------------------------------------------------------------
	// GET
	//------------------------------------------------------------------------

	describe('GET /organizations', function () {
		it.skip('should return 401 status for unauthorized organizations', function (done) {
			UnAuthorizedAgent.get('/organizations').end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 404 status for not found organization', function (done) {
			Agent.get(`/organizations/10`).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should return an organization.', function (done) {
			Agent.get(`/organizations/${organization.id}`).end(function (err: Error, res: Response) {
				expect(res).to.have.status(200)
				done()
			})
		})

		it('should return 404 status for not found organizations from query.', function (done) {
			Agent.get(`/organizations`).query({ name: 'fake name' }).end(function (err: Error, res: Response) {
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should return organizations for a query.', function (done) {
			Agent.get(`/organizations`).query({ name: organization.name }).end(function (err: Error, res: Response) {
				expect(res).to.have.status(200)
				expect(res.body).to.have.lengthOf(1)
				done()
			})
		})
	})

	//------------------------------------------------------------------------
	// UPDATE
	//------------------------------------------------------------------------

	describe('PUT /organizations', function () {
		const updatePayload: Object = { name: "new name" }

		it.skip('should return 401 status for unauthorized organizations', function (done) {
			UnAuthorizedAgent.put('/organizations').send(updatePayload).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 422 status for invalid update body.', function (done) {
			Agent.put(`/organizations/10`).send({ badKey: "new name" }).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(422)
				done()
			})
		})

		it('should return 404 status for not found organization', function (done) {
			Agent.put(`/organizations/10`).send(updatePayload).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should update the organization.', function (done) {
			Agent.put(`/organizations/${organization.id}`).send(updatePayload).end(function (err: Error, res: Response) {
				expect(res).to.have.status(200)
				done()
			})
		})
	})

	//------------------------------------------------------------------------
	// DELETE
	//------------------------------------------------------------------------

	describe('DELETE /organizations', function () {
		it.skip('should return 401 status for unauthorized organizations', function (done) {
			UnAuthorizedAgent.del('/organizations').end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 404 status for not found organizations', function (done) {
			Agent.del(`/organizations/10`).end(function (err: Error, res: Response) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should successfully delete the organizations.', function (done) {
			Agent.del(`/organizations/${organization.id}`).end(function (err: Error, res: Response) {
				expect(res).to.have.status(200)
				done()
			})
		})
	})
})
