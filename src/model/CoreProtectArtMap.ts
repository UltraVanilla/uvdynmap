import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

export default class CoreProtectArtMap extends Model {
    static tableName = "co_art_map";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    rowid!: number;
    id!: number;
    art!: string;
}

CoreProtectArtMap.knex(knex);
