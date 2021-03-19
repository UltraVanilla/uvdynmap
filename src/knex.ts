import knexfile from "./knexfile";
import Knex from "knex";

const environment = process.env.ENVIRONMENT || "development";

const knex = Knex(knexfile[environment]);
export const dbReady = knex.migrate.latest();

export default knex;

export const knexDynmap = Knex(knexfile.dynmap);
