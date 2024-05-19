/**
 * Setup express server.
 */

import morgan from "morgan"
import path from "path"
import helmet from "helmet"
import express, { Request, Response, NextFunction } from "express"
import logger from "jet-logger"

import "express-async-errors"

import EnvVars from "@src/constants/EnvVars"
import HttpStatusCodes from "@src/constants/HttpStatusCodes"

import { NodeEnvs } from "@src/constants/misc"
import { RouteError } from "@src/other/classes"
import { ApiController } from "@src/controllers/ApiController"

// **** Variables **** //

const app = express()

const apiController = ApiController.fromVars({
  mailgunDomain: EnvVars.MailgunDomain,
  mailgunKey: EnvVars.MailgunApiKey,
  adminEmail: EnvVars.AdminEmail,
})

// **** Setup **** //

// Basic middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan("dev"))
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet())
}

// Add error handler
app.use(
  (
    err: Error,
    _: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ) => {
    console.log("!!!")
    if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
      logger.err(err, true)
    }
    let status = HttpStatusCodes.BAD_REQUEST
    if (err instanceof RouteError) {
      console.log(err)
      console.log("!!!")
      status = err.status
    }
    return res.status(status).json({ error: err.message })
  },
)

// ** Front-End Content ** //

// Set views directory (html)
const viewsDir = path.join(__dirname, "views")
app.set("views", viewsDir)

// Set static directory (js and css).
const staticDir = path.join(__dirname, "public")
app.use(express.static(staticDir))

// Nav to users pg by default
app.get("/", (_: Request, res: Response) => {
  return res.sendFile("cv_island.html", { root: viewsDir })
})

// Redirect to login if not logged in.
app.post("/api/contact", apiController.sendContact.bind(apiController))

// **** Export default **** //

export default app
