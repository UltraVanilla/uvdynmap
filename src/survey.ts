import Koa from "koa";
import CoreProtectUser from "./model/CoreProtectUser";
import SurveySubmission from "./model/SurveySubmission";

import { ultravanillaSession } from "./auth/";

export default [
    ...ultravanillaSession(() => true),
    async (ctx: Koa.Context): Promise<void> => {
        const login = ctx.coreProtectUser;

        const form = ctx.request.body;
        if (form == null) ctx.throw(400, "No form submitted");

        const user = await CoreProtectUser.query().findOne({ user: form.username });
        if (user == null) ctx.throw(400, "That username has never logged into UltraVanilla");
        if (login != null && login.uuid !== user.uuid)
            ctx.throw(400, "Stop trying to submit responses on other people's behalf you weirdo");

        const surveyId = ctx.params.survey.toString();

        // make sure if there is an existing submission, we update it instead of creating a new one
        const surveySubmission =
            (await SurveySubmission.query().findOne({ coreprotect_uid: user.rowid, survey_id: surveyId })) ||
            SurveySubmission.fromJson({});

        if (surveySubmission.id != null && login == null)
            ctx.throw(
                400,
                "Response has already been submitted for this username, login with /token to make changes to it",
            );

        delete form.username;
        surveySubmission.coreProtectUser = user;
        surveySubmission.surveyId = surveyId;
        surveySubmission.responses = form;

        await SurveySubmission.query().upsertGraph(surveySubmission, { relate: true });

        ctx.body = "Your response has been recorded!";
    },
];
