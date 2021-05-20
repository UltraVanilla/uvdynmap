import CoreProtectWorld from "../model/CoreProtectWorld";
import CoreProtectUser from "../model/CoreProtectUser";
import CoreProtectEntity from "../model/CoreProtectEntity";
import CoreProtectBlock from "../model/CoreProtectBlock";
import CoreProtectContainer from "../model/CoreProtectContainer";
import CoreProtectItem from "../model/CoreProtectItem";
import CoreProtectUsernameChange from "../model/CoreProtectUsernameChange";
import CoreProtectBlockDataMap from "../model/CoreProtectBlockDataMap";
import CoreProtectEntityMap from "../model/CoreProtectEntityMap";
import CoreProtectMaterialMap from "../model/CoreProtectMaterialMap";
import CoreProtectArtMap from "../model/CoreProtectArtMap";
import CoreProtectSession from "../model/CoreProtectSession";
import CoreProtectSkull from "../model/CoreProtectSkull";
import CoreProtectSign from "../model/CoreProtectSign";

async function timezoneGraph() {
    const firstSession = (
        await CoreProtectSession.query().orderBy("rowid").limit(1).withGraphFetched("userAccount")
    )[0];
    const lastSession = (
        await CoreProtectSession.query().orderBy("rowid", "desc").limit(1).withGraphFetched("userAccount")
    )[0];

    const minuteTotals: { [name: string]: number } = {};

    let playerCountsLog: [Date, number][] = [];

    let players = 0;

    let lastSeenDay = 0;
    let first = true;
    let totalDays = 0;

    for (let i = firstSession.rowid; i <= lastSession.rowid; i += 1000) {
        const results = await CoreProtectSession.query()
            .where("rowid", ">=", i)
            .andWhere("rowid", "<", i + 1000)
            .withGraphFetched("userAccount");

        for (const action of results) {
            if (!(action.time instanceof Date)) throw new Error();

            if (!first && action.time.getUTCHours() >= 14 && action.time.getUTCDay() !== lastSeenDay) {
                lastSeenDay = action.time.getUTCDay();
                totalDays++;

                const start = new Date(playerCountsLog[playerCountsLog.length - 1][0]);

                start.setUTCHours(14);
                start.setUTCMinutes(0);
                start.setUTCSeconds(0);
                start.setUTCMilliseconds(0);

                for (let i = start.getTime(); i < start.getTime() + 86400000; i += 60000) {
                    const target = new Date(i);
                    const nearest = playerCountsLog.find((val) => {
                        if (val[0].getTime() <= i) return true;
                        else return false;
                    });
                    if (nearest == null) continue;
                    const formatted = `${target
                        .getUTCHours()
                        .toString()
                        .padStart(2, "0")}:${target.getUTCMinutes().toString().padStart(2, "0")}`;
                    if (minuteTotals[formatted] == null) minuteTotals[formatted] = 0;
                    minuteTotals[formatted] += nearest[1];
                }

                players = 0;
                playerCountsLog = [];
            }
            first = false;

            if (action.action === 1) {
                players++;
            } else {
                players--;
            }
            playerCountsLog.unshift([action.time, players]);
        }
    }

    const x = [];
    const y = [];

    for (let [time, total] of Object.entries(minuteTotals)) {
        x.push(time);
        total /= totalDays;
        y.push(total);
    }

    console.log(JSON.stringify({ x, y, type: "line" }));
}

async function playerActivityGraph() {
    const firstSession = (
        await CoreProtectSession.query().orderBy("rowid").limit(1).withGraphFetched("userAccount")
    )[0];
    const lastSession = (
        await CoreProtectSession.query().orderBy("rowid", "desc").limit(1).withGraphFetched("userAccount")
    )[0];

    const start = firstSession.time.valueOf() as number;
    const end = lastSession.time.valueOf() as number;

    const daysTimes = [];
    const daysStats = [];

    const days = 7;
    const day = 86400000 * days;
    for (let i = end; i >= start; i -= day) {
        const logins = new Set();

        const min = i;
        const max = i + day;
        daysTimes.unshift(new Date(max));
        const results = await CoreProtectSession.query()
            .where("time", ">=", min / 1000)
            .andWhere("time", "<", max / 1000)
            .withGraphFetched("userAccount");

        for (const result of results) {
            logins.add(result.userAccount.user);
        }
        daysStats.unshift(logins.size);
    }

    daysStats.pop();
    daysTimes.pop();
    console.log(JSON.stringify({ x: daysTimes, y: daysStats, type: "line" }));
}

async function mostCommonNonUsers() {
    const frequencies: { [username: string]: number } = {};
    for (let i = 0; ; i++) {
        const max = ((await CoreProtectItem.query().orderBy("rowid", "desc").limit(1))[0] as any).rowid || 0;

        const start = Math.floor((max - 256) * Math.random());
        const finish = start + 256;

        const results = await CoreProtectItem.query()
            .where("rowid", ">=", start)
            .andWhere("rowid", "<", finish)
            .withGraphFetched("userAccount");

        for (let action of results) {
            const user = action.userAccount.user;

            if (user[0] !== "#") break;

            if (frequencies[user] == null) frequencies[user] = 0;
            frequencies[user]++;
        }
        console.log(frequencies);
    }
}
// mostCommonNonUsers();
// playerActivityGraph();
timezoneGraph();
