// External Dependencies
import { Router } from 'express'

// Controller
import OrganizationController from '../controllers/organization'
import UserController from '../controllers/user'

export default function createOrganizationRoutes(router: Router) {

	// Non-named resource routes.
	router.post('/organizations', OrganizationController.createOrganization)
	router.get('/organizations', OrganizationController.getOrganizations)

	// Named resource routes.
	router.get('/organizations/:organization_id', OrganizationController.getOrganization)
	router.put('/organizations/:organization_id', OrganizationController.updateOrganization)
	router.delete('/organizations/:organization_id', OrganizationController.deleteOrganization)

	// Organization Users routes
	router.post('/organizations/:organization_id/users', UserController.createUserForOrganization)
	router.get('/organizations/:organization_id/users', UserController.getUsersForOrganization)
}
