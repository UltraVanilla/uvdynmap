import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";

@hasDate("time")
export default class CoreProtectUsernameChange extends Model {
    static tableName = "co_username_log";
    static columnNameMappers = snakeCaseMappers();
    static idColumn = "rowid";

    static relationMappings = {
        userAccount: {
            relation: Model.HasOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_username_log.uuid",
                to: "co_user.uuid",
            },
        },
    };

    rowid!: number;
    time!: Date | string;
    user!: string;
    uuid!: string;
    userAccount!: CoreProtectUser;
}

CoreProtectUsernameChange.knex(knex);
