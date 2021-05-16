import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate, hasBool } from "../util/db";

@hasDate("time")
export default class CoreProtectEntity extends Model {
    static tableName = "co_entity";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    time!: Date | string;
    data!: Buffer;
}

CoreProtectEntity.knex(knex);
