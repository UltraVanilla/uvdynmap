import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";
import CoreProtectWorld from "./CoreProtectWorld";

@hasDate("time")
export default class CoreProtectSign extends Model {
    static tableName = "co_sign";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_sign.user",
                to: "co_user.rowid",
            },
        },
        world: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectWorld`,
            join: {
                from: "co_sign.wid",
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
    color!: number;
    line_1!: string;
    line_2!: string;
    line_3!: string;
    line_4!: string;
    action!: number;

    userAccount!: CoreProtectUser;
    world!: CoreProtectWorld;
}

CoreProtectSign.knex(knex);
