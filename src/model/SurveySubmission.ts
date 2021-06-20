import knex from "../knex";
import { Model, snakeCaseMappers, ModelOptions } from "objection";

import { hasDate, hasEmbeddedJson } from "../util/db";
import CoreProtectUser from "./CoreProtectUser";

@hasDate("time")
@hasEmbeddedJson("responses")
export default class SurveySubmission extends Model {
    static columnNameMappers = snakeCaseMappers();
    static tableName = "survey_submissions";
    static idColumn = "id";

    id!: number;
    time!: Date;
    coreprotectUid!: number;
    surveyId!: string;
    responses!: { [questionId: string]: string };

    coreProtectUser!: CoreProtectUser;

    static relationMappings = {
        coreProtectUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: `${__dirname}/CoreProtectUser`,
            join: {
                from: "co_user.rowid",
                to: "survey_submissions.coreprotect_uid",
            },
        },
    };
}

SurveySubmission.knex(knex);
