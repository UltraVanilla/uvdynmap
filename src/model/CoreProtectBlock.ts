import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate, hasBool } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";
import CoreProtectWorld from "./CoreProtectWorld";

@hasDate("time")
@hasBool("rolledBack")
export default class CoreProtectBlock extends Model {
    static tableName = "co_block";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_block.user",
                to: "co_user.rowid",
            },
        },
        world: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectWorld`,
            join: {
                from: "co_block.wid",
                to: "co_world.rowid",
            },
        },
    };

    rowid!: number;
    time!: Date | string;
    user!: number;
    wid!: number;
    x!: number;
    y!: number;
    z!: number;
    type!: number;
    data!: number;
    meta!: Buffer;
    blockdata!: Buffer;
    action!: number;
    rolledBack!: boolean;

    userAccount!: CoreProtectUser;
    world!: CoreProtectWorld;
}

CoreProtectBlock.knex(knex);
