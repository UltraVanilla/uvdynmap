import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";

@hasDate("time")
export default class LocationFolder extends Model {
    static columnNameMappers = snakeCaseMappers();
    static tableName = "location_folders";
    static idColumn = "id";

    id!: number;
    time!: Date;
    wiki!: number;
    iconWiki!: number;
    zoom_level!: number;
    locationFolder!: LocationFolder;

    static relationMappings = {
        coreProtectUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_user.rowid",
                to: "users.coreprotect_uid",
            },
        },
    };
}

LocationFolder.knex(knex);
