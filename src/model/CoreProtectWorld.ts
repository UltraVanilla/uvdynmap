import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

export default class CoreProtectWorld extends Model {
    static tableName = "co_world";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    id!: number;
    world!: string;
}

CoreProtectWorld.knex(knex);
