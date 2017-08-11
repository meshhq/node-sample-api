// External Dependencies
import { Express, Router } from 'express'

// Routes
import OrganizationRoutes from './organization'
import UserRoutes from './user'

export default class MeshRoutes {

	public static mountRoutes(app: Express) {
		// Generate routes
		const router = Router()

		UserRoutes(router)
		OrganizationRoutes(router)

		// Mount routes to express app
		app.use('/', router)
	}
}
