import { knexDynmap as knex } from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { simpleColumnMapper, hasDate } from "../util/db";

import DmMap from "./DmMap";

@hasDate("lastUpdate", 1)
export default class DmTile extends Model {
    static columnNameMappers = simpleColumnMapper({
        mapID: "MapID",
        x: "x",
        y: "y",
        zoom: "zoom",
        hashCode: "HashCode",
        lastUpdate: "LastUpdate",
        format: "Format",
        image: "Image",
    });
    static tableName = "dm_Tiles";
    static idColumn = ["MapID", "x", "y", "zoom"];

    mapID!: number;
    x!: number;
    y!: number;
    zoom!: number;
    hashCode!: number;
    lastUpdate!: number;
    format!: number;
    image!: Buffer;

    map!: DmMap;

    static relationMappings = {
        map: {
            relation: Model.BelongsToOneRelation,
            modelClass: `${__dirname}/DmMap`,
            join: {
                from: "dm_Tiles.MapID",
                to: "dm_Maps.ID",
            },
        },
    };
}

DmTile.knex(knex);
