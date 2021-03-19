import { Model, ModelOptions, Pojo, ColumnNameMappers } from "objection";

type Constructor<A = any> = new (...input: any[]) => A;

export function hasDate(fieldName: string, msMultiplier = 1000) {
    return function <M extends Constructor<Model>>(ModelClass: M): M {
        return class extends ModelClass {
            $parseDatabaseJson(it: any) {
                it = super.$parseDatabaseJson(it);
                if (typeof it[fieldName] === "number") it[fieldName] = new Date(msMultiplier * it[fieldName]);
                return it;
            }
            $formatDatabaseJson(it: any) {
                it = super.$formatDatabaseJson(it);
                if (it[fieldName]) it[fieldName] = new Date(it[fieldName]).getTime() / msMultiplier;
                return it;
            }
            $parseJson(it: any, opt: ModelOptions) {
                it = super.$parseJson(it, opt);
                // prevent the date from getting butchered into a string
                if (it[fieldName]) it[fieldName] = new Date(it[fieldName]);
                return it;
            }
        };
    };
}

function keyMapper(mapper: (orig: string) => string) {
    return (obj: Pojo) => {
        if (obj == null || Array.isArray(obj)) {
            return obj;
        }

        const keys = Object.keys(obj);
        const out: Pojo = {};

        for (let i = 0, l = keys.length; i < l; ++i) {
            const key = keys[i];
            out[mapper(key)] = obj[key];
        }

        return out;
    };
}

export function simpleColumnMapper(mappings: { [key: string]: string }): ColumnNameMappers {
    const inverseMappings: typeof mappings = {};
    Object.entries(mappings).forEach(([from, to]) => (inverseMappings[to] = from));

    return {
        parse: keyMapper((str) => inverseMappings[str] || str),
        format: keyMapper((str) => mappings[str] || str),
    };
}
