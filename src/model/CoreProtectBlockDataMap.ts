import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

export default class CoreProtectBlockDataMap extends Model {
    static tableName = "co_blockdata_map";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    id!: number;
    data!: string;
}

CoreProtectBlockDataMap.knex(knex);
