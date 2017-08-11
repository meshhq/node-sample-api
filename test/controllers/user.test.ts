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

/* 
Questions 
1. Query parameters v nested resources?
2. JSON Validation?
3. UserOrganization actions where?
*/
describe('UserController', function () {
	this.timeout(10000)

	let user: User
	let organization: Organization

	beforeEach(function () {
		return Organization.destroy({ where: {} }).then(() => {
			return User.destroy({ where: {} })
		}).then(() => {
			return CreateOrganization()
		}).then((newOrg: Organization) => {
			organization = newOrg
			return CreateUser()
		}).then((newUser: User) => {
			user = newUser
		})
	})

	//------------------------------------------------------------------------
	// User Route Tests
	//------------------------------------------------------------------------

	describe('POST /users', function () {
		it.skip('should return 401 status for unauthorized user', function (done) {
			const userPayload = NewUser()
			UnAuthorizedAgent.post('/users').send(userPayload).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 401 status for invalid payload', function (done) {
			const userPayload = { 'badParam': 'test' }
			Agent.post('/users').send(userPayload).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(422)
				done()
			})
		})

		it('should successfully return the created user payload', function (done) {
			const userPayload = NewUser()
			Agent.post('/users').send(userPayload).end(function (err: Error, res) {
				expect(res).to.have.status(201)
				done(err)
			})
		})
	})

	describe('GET /users', function () {
		it.skip('should return 401 status for unauthorized user', function (done) {
			UnAuthorizedAgent.get('/users').end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 404 status for not found user', function (done) {
			Agent.get(`/users/10`).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should return the correct user.', function (done) {
			Agent.get(`/users/${user.id}`).end(function (err: Error, res) {
				expect(res).to.have.status(200)
				done(err)
			})
		})
	})

	describe('PUT /users', function () {
		it.skip('should return 401 status for unauthorized user', function (done) {
			UnAuthorizedAgent.put('/users').send({}).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it('should return 422 status for invalid payload', function (done) {
			Agent.put(`/users/${user.id}`).send({}).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(422)
				done()
			})
		})

		it('should return 404 status for not found user', function (done) {
			let payload = { firstName: 'New Name' }
			Agent.put(`/users/10`).send(payload).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should return the user.', function (done) {
			let payload = { firstName: 'New Name' }
			Agent.put(`/users/${user.id}`).send(payload).end(function (err: Error, res) {
				expect(res).to.have.status(200)
				done(err)
			})
		})
	})

	describe('DELETE /users', function () {
		it.skip('should return 401 status for unauthorized user', function (done) {
			UnAuthorizedAgent.del('/users').end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(401)
				done()
			})
		})

		it.skip('should return 404 status for not found user', function (done) {
			Agent.del(`/users/10`).end(function (err: Error, res) {
				expect(err).to.exist
				expect(res).to.have.status(404)
				done()
			})
		})

		it('should successfully delete the user.', function (done) {
			Agent.del(`/users/${user.id}`).end(function (err: Error, res) {
				expect(res).to.have.status(200)
				done(err)
			})
		})
	})

	//------------------------------------------------------------------------
	// Organization User Route Tests
	//------------------------------------------------------------------------

	//------------------------------------------------------------------------
	// POST
	//------------------------------------------------------------------------

	describe('Organization User Actions', function () {

		describe('POST /organizations/:organization_id/users', function () {

			const userPayload = NewUser()
			it.skip('should return 401 status for unauthorized organizations', function (done) {
				UnAuthorizedAgent.post('/organizations').send({}).end(function (err: Error, res: Response) {
					expect(err).to.exist
					expect(res).to.have.status(401)
					done()
				})
			})

			it('should return 422 status for invalid payload', function (done) {
				Agent.post(`/organizations/${organization.id}/users`).send({}).end(function (err: Error, res: Response) {
					expect(err).to.exist
					expect(res).to.have.status(422)
					done()
				})
			})

			it('should return 404 status for not found org', function (done) {
				Agent.post(`/organizations/10/users`).send(userPayload).end(function (err: Error, res: Response) {
					expect(err).to.exist
					expect(res).to.have.status(404)
					done()
				})
			})

			it('should successfully return the created organizations payload', function (done) {
				Agent.post(`/organizations/${organization.id}/users`).send(userPayload).end(function (err: Error, res: Response) {
					expect(err).to.not.exist
					expect(res).to.have.status(201)
					done(err)
				})
			})
		})

		describe('GET /organizations/:organization_id/users', function () {

			const userPayload = NewUser()
			it.skip('should return 401 status for unauthorized organizations', function (done) {
				UnAuthorizedAgent.get('/organizations').send({}).end(function (err: Error, res: Response) {
					expect(err).to.exist
					expect(res).to.have.status(401)
					done()
				})
			})

			it('should return 404 status for not found org', function (done) {
				Agent.get(`/organizations/10/users`).send({}).end(function (err: Error, res: Response) {
					expect(err).to.exist
					expect(res).to.have.status(404)
					done()
				})
			})

			describe('When users exist', function () {

				it('should successfully return users for the organization', function (done) {
					CreateUser().then((newUser: User) => {
						return organization.addUser(newUser)
					}).then(() => {
						Agent.get(`/organizations/${organization.id}/users`).send(userPayload).end(function (err: Error, res: Response) {
							expect(err).to.not.exist
							expect(res).to.have.status(200)
							expect(res.body).to.have.length(1)
							done(err)
						})
					})
				})
			})

			describe('when users dont exist', function () {
				it('should not return users for the organization', function (done) {
					Agent.get(`/organizations/${organization.id}/users`).send(userPayload).end(function (err: Error, res: Response) {
						expect(err).to.not.exist
						expect(res).to.have.status(200)
						expect(res.body).to.have.length(0)
						done(err)
					})
				})
			})
		})
	})
})
