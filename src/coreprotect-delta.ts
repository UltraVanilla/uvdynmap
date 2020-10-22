import { parse, add, sub } from "date-fns";

function parseData(data: string) {
    const startPos = data.match(/\[main\/INFO\]: \[CHAT\] ------ Current Lag ------/)?.index || 0;

    data = data.slice(startPos);

    const uncombinedLogs = data.split("\n").filter((str) => {
        return (
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*/) ||
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f        [ ]+   §/)
        );
    });

    let logs: string[] = [];

    let skipped = false;

    uncombinedLogs.forEach((line, i) => {
        if (skipped) {
            skipped = false;
            return;
        }

        let newLine = line;
        // scan forward to next line
        if (
            uncombinedLogs[i + 1] &&
            uncombinedLogs[i + 1].match(/\[.*\] \[main\/INFO\]: \[CHAT\] §f [ ]+  §/) != null
        ) {
            newLine += "\n" + uncombinedLogs[i + 1];
            skipped = true;
        }

        logs.push(newLine);
    });

    // in case there is a stray coordinate line, prevent it from choking the parsing
    logs = logs.reverse().filter((log) => log.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f [ ]+  §/) == null);

    let timeTweak = 0;
    const logs2 = logs.map((text) => {
        let timeOfCommand = parse(text.match(/\[([\d:]+)\]/)![1], "HH:mm:ss", new Date());

        const timeAgo = parseFloat(text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7(\d*\.?\d*)/)![1]);
        const timeAgoUnit = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/(.)/)![1];

        // add a millisecond every time we scan the next log, to separate entries that fall within
        // same margin of error
        timeTweak += 1;
        timeOfCommand = add(timeOfCommand, { seconds: timeTweak / 1000 });

        function timeAgoUnitToDuration(timeAgoUnit: string, timeAgo: number) {
            const duration: Duration = {};
            switch (timeAgoUnit) {
                case "w":
                    duration.weeks = timeAgo;
                    break;
                case "d":
                    duration.days = timeAgo;
                    break;
                case "h":
                    duration.hours = timeAgo;
                    break;
                case "m":
                    duration.minutes = timeAgo;
                    break;
                case "s":
                    duration.seconds = timeAgo;
                    break;
            }
            return duration;
        }

        const timestamp = sub(timeOfCommand, timeAgoUnitToDuration(timeAgoUnit, timeAgo));

        const isRolledBack = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- §m/) != null;
        const username = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago ?§f ?- (§m)?(.*):? §f/)![2];
        let action: string;
        try {
            action = text.match(
                /\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- .* §f(§m)?(added|removed|dropped|picked up|placed|broke|clicked|killed)/,
            )![2];
        } catch (err) {
            // sign has a totally different formatting, too much a pain in the ass to detect
            //console.log(text);
            action = "sign";
        }

        let itemTx: ItemTransaction | undefined = undefined;

        if (action === "added" || action === "removed" || action === "picked up" || action === "dropped") {
            let direction: string;
            if (action === "added" || action === "dropped") {
                direction = "+";
            } else {
                direction = "-";
            }

            const qty = parseInt(
                text.match(
                    /\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- .* §f(§m)?(added|removed|dropped|picked up) x(\d+)/,
                )![3],
            );
            const subject = text.match(
                /\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- .* §f(§m)?(added|removed|dropped|picked up) x\d+ (§m)?(.*)§f/,
            )![4];

            const net = direction === "+" ? qty : -qty;

            itemTx = {
                net,
                direction,
                subject,
                qty,
            };
        }

        let blockTx: BlockTransaction | undefined = undefined;

        if (action === "clicked" || action === "broke" || action === "placed") {
            const subject = text.match(
                /\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- .* §f(§m)?(clicked|broke|placed) (.*)§f/,
            )![3];

            let direction: "+" | "-" | undefined = undefined;
            if (action === "placed") {
                direction = "+";
            } else if (action === "broke") {
                direction = "-";
            }
            blockTx = { subject, direction };
        }

        const secondLine = text.match(/.*\n(.*)/);
        let location;
        if (secondLine) {
            const coords = text.match(
                /\[.*\] \[main\/INFO\]: \[CHAT\] §f        [ ]+   §.*\(x(-?\d+)\/y(-?\d+)\/z(-?\d+)\/(.*)\)/,
            )!;
            location = {
                x: parseInt(coords[1]),
                y: parseInt(coords[2]),
                z: parseInt(coords[3]),
                dim: coords[4],
            };
        }

        return {
            timestamp,
            isRolledBack,
            action,
            username,
            itemTx,
            blockTx,
            location,
        };
    });

    return logs2;
}

export interface FilterOptions {
    ignoreRolledBack?: boolean;
    boundingBox?: BoundingBox;
    needsSorting?: boolean;
    whitelistUsernames?: string[];
    blacklistUsernames?: string[];
}

export interface BoundingBox {
    x: [number, number];
    y: [number, number];
    z: [number, number];
    invert?: boolean;
}

export interface ItemDelta {
    [username: string]: { [name: string]: number };
}

export interface BlockTransaction {
    direction: "+" | "-" | undefined;
    subject: string;
}

export interface ItemTransaction {
    direction: string;
    net: number;
    subject: string;
    qty: number;
}

export interface LogEntry {
    timestamp: Date;
    isRolledBack: boolean;
    action: string;
    username: string;
    itemTx: ItemTransaction | undefined;
    blockTx: BlockTransaction | undefined;
    location: Location | undefined;
}

export interface ProcessedLogs {
    delta: ItemDelta;
    logs: LogEntry[];
}

export interface Location {
    x: number;
    y: number;
    z: number;
    dim: string;
}

export function processLogs(data: string, options: FilterOptions = {}): ProcessedLogs {
    let logs = parseData(data);
    if (options.ignoreRolledBack) logs = logs.filter((log) => !log.isRolledBack);
    if (options.boundingBox != null) {
        logs = filterBoundingBox(logs, options.boundingBox);
    }

    if (options.needsSorting) logs.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    if (options.whitelistUsernames != null) {
        const whitelist = options.whitelistUsernames;
        logs = logs.filter((entry) => whitelist.includes(entry.username));
    }

    if (options.blacklistUsernames != null) {
        const blacklist = options.blacklistUsernames;
        logs = logs.filter((entry) => !blacklist.includes(entry.username));
    }

    const delta: ItemDelta = {};
    for (const entry of logs) {
        if ((entry.action === "added" || entry.action === "removed") && entry.itemTx != null) {
            if (delta[entry.username] == null) delta[entry.username] = {};
            const itemQtys = delta[entry.username];

            if (itemQtys[entry.itemTx.subject] == null) itemQtys[entry.itemTx.subject] = 0;
            itemQtys[entry.itemTx.subject] += entry.itemTx.net;
        }
    }

    return {
        delta,
        logs,
    };
}

function filterBoundingBox(logs: any, boundingBox: BoundingBox) {
    normalizeBoundingBox(boundingBox);

    const invert = boundingBox.invert === true;

    return logs.filter((entry: any) => {
        if (entry.location == null) return false;

        if (
            boundingBox.x[0] <= entry.location.x &&
            boundingBox.x[1] >= entry.location.x &&
            boundingBox.y[0] <= entry.location.y &&
            boundingBox.y[1] >= entry.location.y &&
            boundingBox.z[0] <= entry.location.z &&
            boundingBox.z[1] >= entry.location.z
        ) {
            return !invert;
        } else {
            return invert;
        }
    });
}

function normalizeBoundingBox(boundingBox: BoundingBox) {
    boundingBox.x.sort((a, b) => a - b);
    boundingBox.y.sort((a, b) => a - b);
    boundingBox.z.sort((a, b) => a - b);
}
