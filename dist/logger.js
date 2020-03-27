"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.log = console.log;
exports.error = (msg) => exports.log(chalk_1.red(msg));
exports.info = (msg) => exports.log(chalk_1.blue(msg));
exports.success = (msg) => exports.log(chalk_1.greenBright(msg));
