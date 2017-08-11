// External Deps
const gulpcopy = require('gulp-copy')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const plumber = require('gulp-plumber')
const cache = require('gulp-cached')
const shell = require('gulp-shell')
const tslint = require('gulp-tslint')
const sequelize = require('sequelize')
const del = require('del')
const fs = require('fs')
const path = require('path')
const jeditor = require("gulp-json-editor");
const jsonToYaml = require('gulp-json-to-yaml');
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const AWS = require('aws-sdk');
const async = require('async');
const DotENV = require('dotenv');

// Setup config
DotENV.config()

// Config AWS
AWS.config.update({region: 'us-west-2'});

// Internal Deps
const tsProject = ts.createProject('tsconfig.json', { noImplicitAny: true, outDir: 'dist' })

// Constant
const PROD_API_IMAGE = 'meshstudios/standupapi'
const DEV_API_IMAGE = 'meshstudios/standupapidev'

const AWS_API_CLUSTER = 'StandupAPI'
const AWS_PROD_SERVICE = 'StandupAPIProd'
const AWS_DEV_SERVICE = 'StandupAPIDev'

// Args
var options = process.argv.slice(2)

// ECS Specific
const ecs = new AWS.ECS();
const taggedImage = `${PROD_API_IMAGE}:${Date.now()}`

// Source
const filesToWatch = [
	'./**/*.ts',
	'./**/*.test.ts',
	'!./node_modules/**/*.ts', 
	'!./dist/**/*.ts',
	'!./typings/**/*.ts'
]

/**
 * Cleaning commands
 */
const cleanDistFolder = 'clean:dist'
gulp.task(cleanDistFolder, function () {
  return del([
    'dist/**/*'
  ])
})

/**
 * Gulp Transpiling
 */

// Copies non-ts files to dist
const copyStaticResources = 'copyStaticResources'
gulp.task(copyStaticResources, () => {
	let emailTemplatesSouce = ['lib/emailTemplates/*.html']
	return gulp.src(emailTemplatesSouce)
	.pipe(gulpcopy('./dist/'))
})

const transpileTS = 'transpileTS'
gulp.task(transpileTS, [cleanDistFolder], () => {
	// Kick off the copy
	gulp.start(copyStaticResources)

	// Begin Transpile
	return tsProject.src()
	.pipe(plumber())
	.pipe(cache('transpileTS'))
	.pipe(tsProject())
	.once("error", function () {
		if (options.indexOf('--force') === -1) {
			this.once("finish", () => process.exit(1))
		}
  	})
	.js.pipe(gulp.dest('dist'))
})

/**
 * Server Start
 */
const startServer = 'startServer'
const serverStartCommand = 'node --trace-warnings ./bin/www'
gulp.task(startServer, [transpileTS], shell.task(serverStartCommand))

/**
 *  TSLint
 */
gulp.task('tslint', () => {
	return gulp
	.src(filesToWatch)
	.pipe(tslint())
	.pipe(tslint.report({ emitError: false }))
})

/**
 * Deployment
 */

/**
 * Skeleton for ECS Definition
 */
let baseECSDefinition = {
  "taskRoleArn": "arn:aws:iam::266182953919:role/StandupECSTaskS3BucketPolicy",
  "containerDefinitions": [
    {
      "memory": 7900,
      "memoryReservation": 7900,
      "portMappings": [
        {
          "hostPort": 8080,
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "name": "standup",
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-region": "us-west-2"
        }
      },
      "readonlyRootFilesystem": false,
      "image": "meshstudios/standupapi:latest",
      "cpu": 0,
      "privileged": false,
    }
  ],
  "family": AWS_PROD_SERVICE
}

/**
 * Registers the new container w/ the container
 * registry (dockerhub for now)
 */
const buildContainer = 'buildContainer'
gulp.task(buildContainer, [transpileTS], (cb) => {
	return gulp.src('*.js', {read: false})
	.pipe(shell([
		    'eval $(docker-machine env)',
			`docker build -t ${PROD_API_IMAGE} .`,
			`docker tag ${PROD_API_IMAGE} ${taggedImage}`,
			`docker push ${taggedImage}`
	]))
})

/**
 * Calls ECS w/ the new docker container to update the container service
 */
const deployProd = 'deploy-prod'
gulp.task(deployProd, [buildContainer], (cb) => {

	// Set the Defined task
	const baseContainer = baseECSDefinition.containerDefinitions[0]
	baseContainer.image = taggedImage
	baseContainer.logConfiguration.options['awslogs-group'] = AWS_PROD_SERVICE
	baseECSDefinition.containerDefinitions[0] = baseContainer

	// Register task
	ecs.registerTaskDefinition(baseECSDefinition, function(err, data) {
		if (err) {
			return cb(err)
		}

		// Define new Task ARN
		const taskARN = data.taskDefinition.taskDefinitionArn
		const serviceUpdateParams = {
			cluster: AWS_API_CLUSTER,
			service: AWS_PROD_SERVICE,
			taskDefinition: taskARN
		}

		// Update ECS Service
		ecs.updateService(serviceUpdateParams, function(err, data) {
			cb()			
		})
	})
})

/**
 * Forces the resignation of the current task and redeploys prod. Normally
 * the ECS makes a 0.0 downtime deploy, this forces down the existing container
 * instead of draining its connections.
 */
const deployProdForce = 'deploy-prod-force'
gulp.task(deployProdForce, [deployProd], () => {
	gulp.start(stopProdServiceTask);
})


/**
 * Calls ECS w/ the new docker container to update the container service
 */
const stopProdServiceTask = 'stopProdServiceTask'
gulp.task(stopProdServiceTask, (cb) => {
	// Find Current Task
	const params = {
		cluster: AWS_API_CLUSTER,
		family: AWS_PROD_SERVICE,
		desiredStatus: 'RUNNING'
	}

	ecs.listTasks(params, (err, data) => {
		if (err) {
			return cb(err)
		}
		let ops = []
		for (let i = 0; i < data.taskArns.length; i++) {
			ops.push((done) => {
				const stopTaskParams = {
					task: data.taskArns[i],
					cluster: AWS_API_CLUSTER
				}

				console.log("Stopping Task: ", data.taskArns[i])
				ecs.stopTask(stopTaskParams, (err, data) => {
					done()
				})
			})
		}
		async.parallel(ops, cb)
	})
})

/**
 * Set ENV
 */
var setProdENV = '__setProdENV'
gulp.task(setProdENV, () => {
	process.env.NODE_ENV = 'production'
})

var setDevENV = '__setDevENV'
gulp.task(setDevENV, (done) => {
	process.env.NODE_ENV = 'development'
	done()
})

var setTestENV = '__setTestENV'
gulp.task(setTestENV, (done) => {
	process.env.NODE_ENV = 'test'
	done()
})

/**
 * Watcher
 */
const watchTS = 'watchTS';
gulp.task(watchTS, [setDevENV, transpileTS, startServer], function () {
    return gulp.watch(filesToWatch, [transpileTS, startServer])
})

/**
 * Flush DB and Schema
 */
var __flushDB = '__flushDB'
gulp.task(__flushDB, [transpileTS], (done) => {
	const db = require('./dist/config/db')

	const modelsDir = `${__dirname}/dist/model`
	fs.readdirSync(modelsDir)
	.forEach(function(file) {
		// Require each model, which will load it into memory and populate
		// the related sequelize shared instance with the schema def
		require(path.join(modelsDir, file))
	})
	
	// Return the sync promise
	db.default.SharedInstance.sync({force: true}).then(() => {
	  done()
	})
	done()
})

var prodLogs = '__prodLogs'
gulp.task(prodLogs, () => {
	let stream = shell.task("awslogs get StandupAPIProd --start='1m ago' --watch | cut -d ' ' -f 3-")
	console.log(stream())
})

var devLogs = '__devLogs'
gulp.task(devLogs, () => {
	let stream = shell.task("awslogs get StandupAPIDev --start='1m ago' --watch | cut -d ' ' -f 3-")
	console.log(stream())
})

/**
 * Gulp Tasks
 */
gulp.task('reset-prod-db-force', [setProdENV, __flushDB])
gulp.task('reset-dev-db', [setDevENV, __flushDB])
gulp.task('reset-test-db', [setTestENV, __flushDB])
gulp.task('default', [watchTS])
gulp.task('logs-prod', [prodLogs])
gulp.task('logs-dev', [devLogs])

gulp.on('stop', () => { process.exit(0); });
gulp.on('err', () => { process.exit(1); });
