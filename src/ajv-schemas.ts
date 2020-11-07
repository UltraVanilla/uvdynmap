import Ajv from "ajv";

import * as authApi from "./auth/auth-api";

const schemas = new Ajv();

schemas.addSchema(authApi.authTokenSchema, "authToken");
schemas.addSchema(authApi.bulkAuthTokenSchema, "bulkAuthToken");

export default schemas;
