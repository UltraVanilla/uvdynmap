import knex from "../knex";
import { Model, snakeCaseMappers } from "objection";

import { hasDate } from "../util/db";

import CoreProtectUsernameChange from "./CoreProtectUsernameChange";
import User from "./User";

@hasDate("time")
export default class CoreProtectUser extends Model {
    static tableName = "co_user";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/User`,
            join: {
                from: "co_user.rowid",
                to: "users.coreprotect_uid",
            },
        },
        usernameHistory: {
            relation: Model.HasManyRelation,
            modelClass: `${__dirname}/CoreProtectUsernameChange`,
            join: {
                from: "co_user.uuid",
                to: "co_username_log.uuid",
            },
        },
    };

    rowid!: number;
    time!: Date | string;
    user!: string;
    uuid!: string;

    usernameHistory!: CoreProtectUsernameChange[];
    userAccount!: User;
}

CoreProtectUser.knex(knex);
