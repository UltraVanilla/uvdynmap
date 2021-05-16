import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

export default class CoreProtectEntityMap extends Model {
    static tableName = "co_entity_map";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    id!: number;
    entity!: string;
}

CoreProtectEntityMap.knex(knex);
