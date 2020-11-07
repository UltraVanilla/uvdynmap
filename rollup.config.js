import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

const production = process.env.NODE_ENV === "production";

const extensions = [".js", ".ts", ".tsx"];
export default [
    {
        input: "src/browser-dynmap.tsx",
        output: {
            file: "assets/dynmap.js",
            format: "iife",
        },
        plugins: [
            resolve({
                extensions,
            }),
            commonjs({
                include: /node_modules/,
            }),
            json(),
            babel({
                extensions,
                exclude: /node_modules/,
                babelrc: false,
                runtimeHelpers: true,
                presets: ["@babel/preset-react", "@babel/preset-typescript"],
                plugins: ["@babel/plugin-proposal-class-properties"],
            }),
            production ? terser() : undefined,
        ],
    },
    {
        input: "src/browser-coreprotect-tools.tsx",
        output: {
            file: "assets/coreprotect-tools.js",
            format: "iife",
        },
        plugins: [
            resolve({
                extensions,
            }),
            commonjs({
                include: /node_modules/,
            }),
            json(),
            babel({
                extensions,
                exclude: /node_modules/,
                babelrc: false,
                runtimeHelpers: true,
                presets: ["@babel/preset-react", "@babel/preset-typescript"],
                plugins: ["@babel/plugin-proposal-class-properties"],
            }),
            production ? terser() : undefined,
        ],
    },
];
