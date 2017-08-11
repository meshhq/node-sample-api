// External Deps
import { Express } from 'express'
import { Promise as Bluebird } from 'sequelize'
import * as express from 'express'
import * as path from 'path'
import * as logger from 'morgan'
import * as bodyParser from 'body-parser'
import * as expressSession from 'express-session'
import * as RedisStore from 'connect-redis'
import * as DotENV from 'dotenv'
import * as compression from 'compression'
import CORS from './cors'
import errorHandler = require('errorhandler')

// Internal Deps
import { SESSION_PREFIX, SESSION_SECRET } from '../utils/constants'

DotENV.config()

/** Configure application */
export default class MeshConfig {

	public static configureApplication(app: Express) {
		// Setup Bluebird
		// MeshConfig.configureBluebird()

		// Ensure ENVs Set
		DotENV.config()

		// Enable GZIP compression
		app.use(compression())

		// Set Views Path
		app.use(express.static(path.join(__dirname, 'public')))
		app.set('views', path.join(__dirname, 'views'))
		app.set('view engine', 'pug')

		// Setup Logger
		if (process.env.NODE_ENV !== 'test') {
			app.use(logger('dev'))
		}

		// mount json form parser
		app.use(bodyParser.json())

		// mount query string parser
		app.use(bodyParser.urlencoded({
			extended: true
		}))

		// catch 404 and forward to error handler
		app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
			res.status(404).send('You found a dead link! Sorry can\'t find that!')
		})

		// Setup CORS
		app.use(CORS)

		// error handling
		if (process.env.NODE_ENV === 'development') {
			// only use in development
			app.use(errorHandler())
		}
	}
}
