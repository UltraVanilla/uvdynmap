import { knexDynmap as knex } from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { simpleColumnMapper } from "../util/db";

import DmTile from "./DmTile";

export default class DmMap extends Model {
    static columnNameMappers = simpleColumnMapper({
        id: "ID",
        worldID: "WorldID",
        mapID: "MapID",
        variant: "Variant",
        serverID: "ServerID",
    });
    static tableName = "dm_Maps";
    static idColumn = "ID";

    id!: number;
    worldID!: string;
    mapID!: string;
    variant!: string;
    serverID!: number;

    tiles!: DmTile[];

    static relationMappings = {
        tiles: {
            relation: Model.HasManyRelation,
            modelClass: `${__dirname}/DmTile`,
            join: {
                from: "dm_Maps.ID",
                to: "dm_Tiles.MapID",
            },
        },
    };
}

DmMap.knex(knex);
