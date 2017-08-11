// External Dependencies
import { Router } from 'express'

// Controller
import UserController from '../controllers/user'

export default function createUserRoutes(router: Router) {

	// Non-Named resource routes.
	router.post('/users', UserController.createUser)
	router.get('/users', UserController.getUsers)

	// Named resource routes.
	router.get('/users/:user_id', UserController.getUser)
	router.put('/users/:user_id', UserController.updateUser)
	router.delete('/users/:user_id', UserController.deleteUser)
}
