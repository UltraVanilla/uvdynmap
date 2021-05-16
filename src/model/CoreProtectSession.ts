import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";
import CoreProtectWorld from "./CoreProtectWorld";

@hasDate("time")
export default class CoreProtectSession extends Model {
    static tableName = "co_session";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_session.user",
                to: "co_user.rowid",
            },
        },
        world: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectWorld`,
            join: {
                from: "co_session.wid",
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
    action!: number;

    userAccount!: CoreProtectUser;
    world!: CoreProtectWorld;
}

CoreProtectSession.knex(knex);
