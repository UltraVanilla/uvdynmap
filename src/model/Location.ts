import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";
import LocationFolder from "./LocationFolder";

@hasDate("time")
export default class Location extends Model {
    static columnNameMappers = snakeCaseMappers();
    static tableName = "locations";
    static idColumn = "id";

    id!: number;
    time!: Date;
    wiki!: number;
    iconWiki!: number;
    zoomLevel!: number;

    folder!: LocationFolder;

    static relationMappings = {
        folder: {
            relation: Model.BelongsToOneRelation,
            modelClass: `${__dirname}/LocationFolder`,
            join: {
                from: "location_folders.id",
                to: "locations.location_folder_id",
            },
        },
    };
}

Location.knex(knex);
