/**
 * Pre-start is where we want to place things that must run BEFORE the express 
 * server is started. This is useful for environment variables, command-line 
 * arguments, and cron-jobs.
 */

// NOTE: DO NOT IMPORT ANY SOURCE CODE HERE
/* eslint-disable node/no-process-env */
import path from 'path';
import dotenv from 'dotenv';

// **** Setup **** //

// Get Env Name
const env: string = process.env.ENVIRONMENT ?? 'local'

// Set the env file
const result = dotenv.config({
  path: path.join(__dirname, `../env/${env}.env`),
});
if (result.error) {
  throw result.error;
}
