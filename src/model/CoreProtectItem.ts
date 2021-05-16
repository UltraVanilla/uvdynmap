import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate, hasBool } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";
import CoreProtectWorld from "./CoreProtectWorld";

@hasDate("time")
@hasBool("rolledBack")
export default class CoreProtectItem extends Model {
    static tableName = "co_item";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_item.user",
                to: "co_user.rowid",
            },
        },
        world: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectWorld`,
            join: {
                from: "co_item.wid",
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
    amount!: number;
    data!: Buffer;
    action!: number;
    rolledBack!: boolean;

    userAccount!: CoreProtectUser;
    world!: CoreProtectWorld;
}

CoreProtectItem.knex(knex);
