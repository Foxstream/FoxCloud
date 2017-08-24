/**
 * Global configuration of the application, as provided by `conf.js` or `conf_debug.js`.
 */
export interface Myconfig {
  /**
   * Enable debug mode. Most of the services will use mocks and fake data instead of sending requests.
   * TODO: Use `process.env.NODE_ENV !== "production"` and webpack define instead, to allow for dead-code elimination.
   */
  debug: boolean;

  /**
   * Base URI of the API.
   */
  apiUri: string;
}
