import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate } from "../util/db";

@hasDate("time")
export default class CoreProtectSkull extends Model {
    static tableName = "co_skull";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    time!: Date | string;
    owner!: string;
}

CoreProtectSkull.knex(knex);
