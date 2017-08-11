// External Deps
import * as express from 'express'

// Config
import Config from './config/app'

// Routes
import Router from './routes'

// Logger
import Logger from './config/logger'

/**
 * Flagging app start and exit
 */
Logger.info(`Node Process Started`)
process.on('exit', (code: number) => {
	Logger.info(`About to exit process with code: ${code}`)
})

/** The server. */
export default class Server {
	// Configure ENVs

	/** Bootstrap the application. */
	public static bootstrap(): express.Express {
		return new Server().app
	}

	public app: express.Express

	/** Constructor. */
	constructor() {
		// Generate Base Express App
		this.app = express()

		// Configure Server App
		Config.configureApplication(this.app)

		// Mount Routes
		Router.mountRoutes(this.app)
	}
}
