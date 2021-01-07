import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate } from "../util/db";

@hasDate("created")
@hasDate("expires")
export default class Action extends Model {
    static columnNameMappers = snakeCaseMappers();
    static tableName = "actions";
    static idColumn = "id";

    id!: number;
    created!: Date;
    expires!: Date;
    type!: string;
    description!: string;
    sources!: string;
    targets!: string;
    links!: string;
}

Action.knex(knex);
