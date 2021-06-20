import Koa from "koa";
import CoreProtectUser from "./model/CoreProtectUser";
import SurveySubmission from "./model/SurveySubmission";

export default async (ctx: Koa.Context): Promise<void> => {
    const form = ctx.request.body;
    if (form == null) ctx.throw(400, "No form submitted");

    const user = await CoreProtectUser.query().findOne({ user: form.username });
    if (user == null) ctx.throw(400, "That username has never logged into UltraVanilla");

    const surveyId = ctx.params.survey.toString();

    // make sure if there is an existing submission, we update it instead of creating a new one
    const surveySubmission =
        (await SurveySubmission.query().findOne({ coreprotect_uid: user.rowid, survey_id: surveyId })) ||
        SurveySubmission.fromJson({});

    delete form.username;
    surveySubmission.coreProtectUser = user;
    surveySubmission.surveyId = surveyId;
    surveySubmission.responses = form;

    await SurveySubmission.query().upsertGraph(surveySubmission, { relate: true });

    ctx.body = "Your response has been recorded!";
};
