"use strict";
/**
 * Types and utilities for diagnostic parsing and handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@cmt/util");
const vscode = require("vscode");
var FeedLineResult;
(function (FeedLineResult) {
    FeedLineResult[FeedLineResult["Ok"] = 0] = "Ok";
    FeedLineResult[FeedLineResult["NotMine"] = 1] = "NotMine";
})(FeedLineResult = exports.FeedLineResult || (exports.FeedLineResult = {}));
/**
 * Get one less than the given number of number-string.
 *
 * If the number is greater than zero, returns that number minus one. If
 * the number is less than one, returns zero.
 * @param num A number or string representing a number
 */
function oneLess(num) {
    if (typeof num === 'string') {
        return oneLess(parseInt(num));
    }
    else {
        return Math.max(0, num - 1);
    }
}
exports.oneLess = oneLess;
/**
 * Inserts a list of `FileDiagnostic` instances into a diagnostic collection.
 * @param coll The `vscode.DiagnosticCollecion` to populate.
 * @param fdiags The `FileDiagnostic` objects to insert into the collection
 *
 * @note The `coll` collection will be cleared of all previous contents
 */
function populateCollection(coll, fdiags) {
    // Clear the collection
    coll.clear();
    // Collect the diagnostics and associate them with their respective files
    const diags_by_file = util_1.reduce(fdiags, new Map(), (by_file, fdiag) => {
        if (!by_file.has(fdiag.filepath)) {
            by_file.set(fdiag.filepath, []);
        }
        by_file.get(fdiag.filepath).push(fdiag.diag);
        return by_file;
    });
    // Insert the diags into the collection
    diags_by_file.forEach((diags, filepath) => { coll.set(vscode.Uri.file(filepath), diags); });
}
exports.populateCollection = populateCollection;
/**
 * Base class for parsing raw diagnostic information on a line-by-line basis
 */
class RawDiagnosticParser {
    constructor() {
        this._diagnostics = [];
    }
    /**
     * Get the diagnostics which have been parsed by this object
     */
    get diagnostics() { return this._diagnostics; }
    /**
     * Push another line into the parser
     * @param line Another line to parse
     */
    handleLine(line) {
        const result = this.doHandleLine(line);
        if (result === FeedLineResult.Ok) {
            return true;
        }
        else if (result === FeedLineResult.NotMine) {
            return false;
        }
        else {
            this._diagnostics.push(result);
            return true;
        }
    }
}
exports.RawDiagnosticParser = RawDiagnosticParser;
//# sourceMappingURL=util.js.map