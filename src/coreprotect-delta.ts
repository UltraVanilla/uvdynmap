import { parse } from "date-fns";

function parseData(data: string): LogEntry[] {
    const startPos = data.match(/\[main\/INFO\]: \[CHAT\] ------ Current Lag ------/)?.index || 0;

    data = data.slice(startPos);

    const uncombinedLogs = data.split("\n").filter((str) => {
        return (
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*/) ||
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f        [ ]+   §/) ||
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f----- Container Transactions §f----- §7\((.*)\)/) ||
            str.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f-----$/)
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

    let lastCoords: undefined | string;
    logs = logs.map((line) => {
        const matches = line.match(
            /^\[.*\] \[main\/INFO\]: \[CHAT\] §f----- Container Transactions §f----- §7\((.*)\)/,
        );

        if (line.match(/\n/) != null) {
            lastCoords = undefined;
            return line;
        }
        if (line.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f-----$/)) {
            lastCoords = undefined;
            return "";
        }

        const outputLines = [];
        if (matches != null && matches[1] != null) {
            lastCoords = `[00:00:00] [main/INFO]: [CHAT] §f                 §7^ §7§o(${matches[1]}/unknown)`;
        } else outputLines.push(line);

        if (lastCoords != null) outputLines.push(lastCoords);

        //console.log(line);
        return outputLines.join("\n");
    });

    console.log(logs);

    // in case there is a stray coordinate line, prevent it from choking the parsing
    logs = logs
        .reverse()
        .filter((log) => log.match(/^\[.*\] \[main\/INFO\]: \[CHAT\] §f [ ]+  §/) == null && log !== "");

    let timeTweak = 0;
    const logs2 = logs.map((text) => {
        const timeOfCommand = parse(text.match(/\[([\d:]+)\]/)![1], "HH:mm:ss", new Date());

        const timeAgo = parseFloat(text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7(\d*\.?\d*)/)![1]);
        const timeAgoUnit = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/(.)/)![1];

        // add a millisecond every time we scan the next log, to separate entries that fall within
        // same margin of error
        timeTweak += 1;
        const timeOfCommandMs = timeOfCommand.getTime() + timeTweak;

        let newTime = timeOfCommandMs;

        switch (timeAgoUnit) {
            case "w":
                newTime -= 604800000 * timeAgo;
                break;
            case "d":
                newTime -= 86400000 * timeAgo;
                break;
            case "h":
                newTime -= 3600000 * timeAgo;
                break;
            case "m":
                newTime -= 60000 * timeAgo;
                break;
            case "s":
                newTime -= 1000 * timeAgo;
                break;
        }

        const timestamp = new Date(newTime);

        const isRolledBack = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- §m/) != null;
        const username = text.match(/\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago ?§f ?- (§m)?(.*):? §f/)![2];
        let action: string;
        try {
            action = text.match(
                /\[.*\] \[main\/INFO\]: \[CHAT\] §7\d*\.?\d*\/. ago §f- .* §f(§m)?(added|removed|dropped|picked up|placed|broke|clicked|killed)/,
            )![2];
        } catch (err) {
            // sign has a totally different formatting, too much a pain in the ass to detect
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
            originalText: text,
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
    specialFilters?: ("noDiamondsAdded" | "expensiveTheft")[];
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
    originalText: string;
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

    const firstDelta = itemDelta(logs);

    if (options.specialFilters != null) {
        const flaggedNames: string[] = [];
        let flagFilter = false;

        for (const filterType of options.specialFilters) {
            switch (filterType) {
                case "noDiamondsAdded": {
                    flagFilter = true;
                    for (const [username, delta] of Object.entries(firstDelta)) {
                        const diamondTx = (delta.diamond || 0) + 9 * (delta.diamond_block || 0);
                        if (diamondTx <= 0) {
                            flaggedNames.push(username);
                        }
                    }

                    break;
                }
                case "expensiveTheft": {
                    flagFilter = true;
                    for (const [username, delta] of Object.entries(firstDelta)) {
                        const diamondTx = (delta.diamond || 0) + 9 * (delta.diamond_block || 0);
                        if (diamondTx < -4) {
                            flaggedNames.push(username);
                        }
                        if (diamondTx <= 1)
                            for (const [item, tx] of Object.entries(delta)) {
                                if (
                                    [
                                        "netherite_sword",
                                        "diamond_sword",
                                        "netherite_pickaxe",
                                        "diamond_pickaxe",
                                        "netherite_shovel",
                                        "diamond_shovel",
                                        "netherite_helmet",
                                        "netherite_chestplate",
                                        "netherite_leggings",
                                        "netherite_boots",
                                        "diamond_helmet",
                                        "diamond_chestplate",
                                        "diamond_leggings",
                                        "diamond_boots",
                                        "beacon",
                                        "golden_apple",
                                        "enchanted_golden_apple",
                                        "end_crystal",
                                        "totem_of_undying",
                                        "elytra",
                                    ].includes(item) &&
                                    tx <= -1
                                ) {
                                    flaggedNames.push(username);
                                }
                            }
                    }

                    break;
                }
            }
        }

        if (flagFilter) logs = logs.filter((entry) => flaggedNames.includes(entry.username));
    }
    const delta = itemDelta(logs);

    return {
        delta,
        logs,
    };
}

function itemDelta(logs: LogEntry[]): ItemDelta {
    const delta: ItemDelta = {};
    for (const entry of logs) {
        if ((entry.action === "added" || entry.action === "removed") && entry.itemTx != null) {
            if (delta[entry.username] == null) delta[entry.username] = {};
            const itemQtys = delta[entry.username];

            if (itemQtys[entry.itemTx.subject] == null) itemQtys[entry.itemTx.subject] = 0;
            itemQtys[entry.itemTx.subject] += entry.itemTx.net;
        }
    }
    return delta;
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
