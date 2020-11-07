import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";

@hasDate("time")
export default class User extends Model {
    static columnNameMappers = snakeCaseMappers();
    static tableName = "users";
    static idColumn = "id";

    id!: number;
    time!: Date;
    coreprotectUid!: number;
    roles!: string[];

    coreProtectUser!: CoreProtectUser;

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

    $parseDatabaseJson(it: any) {
        it = super.$parseDatabaseJson(it);
        // MySQL doesn't support arrays, so we use JSON string for a list of roles
        if (it.roles) it.roles = JSON.parse(it.roles);
        return it;
    }
    $formatDatabaseJson(it: any) {
        it = super.$formatDatabaseJson(it);
        if (it.roles) it.roles = JSON.stringify(it.roles);
        return it;
    }
    $parseJson(it: any, opt: ModelOptions) {
        it = super.$parseJson(it, opt);
        return it;
    }
}

User.knex(knex);
