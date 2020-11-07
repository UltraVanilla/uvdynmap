import { Model, ModelOptions } from "objection";

type Constructor<A = any> = new (...input: any[]) => A;

export function hasDate(fieldName: string) {
    return function <M extends Constructor<Model>>(ModelClass: M): M {
        return class extends ModelClass {
            $parseDatabaseJson(it: any) {
                it = super.$parseDatabaseJson(it);
                if (typeof it[fieldName] === "number") it[fieldName] = new Date(1000 * it[fieldName]);
                return it;
            }
            $formatDatabaseJson(it: any) {
                it = super.$formatDatabaseJson(it);
                if (it[fieldName]) it[fieldName] = new Date(it[fieldName]).getTime() / 1000;
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
