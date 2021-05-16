import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

export default class CoreProtectMaterialMap extends Model {
    static tableName = "co_material_map";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    id!: number;
    material!: string;
}

CoreProtectMaterialMap.knex(knex);
