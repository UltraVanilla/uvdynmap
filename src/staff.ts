import Router from "koa-router";
import cheerio from "cheerio";

import Action from "./model/Action";
import knex from "./knex";

import * as api from "./auth/auth-api";

const router = new Router();

router.get("/actions", async (ctx) => {
    const $ = cheerio.load(`
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Staff Actions</title>
                <link href="/assets/ultravanilla.css" rel="stylesheet">
            </head>
            <body class="staff-logs">
                <table class="staff-logs-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Staff</th>
                            <th>Subject</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <!--<script type="application/javascript" src="/assets/staff-logs.js"></script>-->
            </body>
        </html>
    `);

    const actions = await Action.query();

    const tbody = $(".staff-logs-table tbody");

    for (const action of actions) {
        const row = $("<tr>");

        row.append($("<td>").text(action.id.toString()));
        row.append($("<td>").text(action.created.toISOString()));
        row.append($("<td>").text(action.expires == null ? "never" : action.expires.toISOString()));
        row.append($("<td>").text(action.type));
        row.append($("<td>").text(action.description));
        row.append($("<td>").text(action.sources));
        row.append($("<td>").text(action.targets));

        tbody.append(row);
    }

    ctx.body = $.root().html();
});

router.get("/coreprotect-tools", (ctx) => {
    ctx.body = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Coreprotect log tools</title>
                <link href="/assets/codemirror.css" rel="stylesheet">
                <link href="/assets/ultravanilla.css" rel="stylesheet">
            </head>
            <body class="coreprotect-tools">
                <form id="coreprotect-delta" class="coreprotect-delta">
                    <div><label for="coreprotect-delta-options">Coreprotect-delta options:</label></div>
                    <div><textarea id="coreprotect-delta-options"></textarea></div>
                    <div><label for="coreprotect-delta-logs">Coreprotect logs:</label></div>
                    <p>Place <code>[main/INFO]: [CHAT] ------ Current Lag ------</code> to ignore all of the logs above it (i.e. run <code>/lag</code> ingame before paging). Why <code>/lag</code>? I don't know</p>
                    <div><textarea id="coreprotect-delta-logs"></textarea></div>
                    <div><input type="submit" value="Compute delta" id="coreprotect-delta-submit" /></div>
                    <div><label for="coreprotect-delta-output">Results:</label></div>
                    <div><pre id="coreprotect-delta-output"></pre></div>
                    <div id="coreprotect-formatted"></div>
                </form>
                <script type="application/javascript" src="/assets/coreprotect-tools.js"></script>
            </body>
        </html>
    `;
});

router.post("/cancel-coreprotect-command", async (ctx) => {
    const processes = await knex.select("*").from("information_schema.processlist");
    const offendingProcess = processes.find((row) => {
        return row.STATE !== "Sleep" && row.INFO?.includes("FROM co_");
    });

    if (offendingProcess == null) {
        ctx.body = { commandExists: false };
        return;
    }

    await knex.raw("kill ?", offendingProcess.ID);

    const result: api.CancelCoreprotectCommandResult = {
        commandExists: true,
        command: offendingProcess.INFO,
        state: offendingProcess.STATE || "",
    };
    ctx.body = result;
});

export default router;
