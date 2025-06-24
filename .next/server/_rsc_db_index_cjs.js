"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_db_index_cjs";
exports.ids = ["_rsc_db_index_cjs"];
exports.modules = {

/***/ "(rsc)/./db/index.cjs":
/*!**********************!*\
  !*** ./db/index.cjs ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n(__webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\").config)();\nconst { Pool } = __webpack_require__(/*! pg */ \"pg\");\nconst pool = new Pool({\n    connectionString: process.env.DATABASE_URL,\n    ssl: {\n        rejectUnauthorized: false\n    }\n});\nmodule.exports = pool;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9kYi9pbmRleC5janMiLCJtYXBwaW5ncyI6IjtBQUFBQSxxRkFBd0I7QUFDeEIsTUFBTSxFQUFFRSxJQUFJLEVBQUUsR0FBR0YsbUJBQU9BLENBQUMsY0FBSTtBQUU3QixNQUFNRyxPQUFPLElBQUlELEtBQUs7SUFDcEJFLGtCQUFrQkMsUUFBUUMsR0FBRyxDQUFDQyxZQUFZO0lBQzFDQyxLQUFLO1FBQ0hDLG9CQUFvQjtJQUN0QjtBQUNGO0FBRUFDLE9BQU9DLE9BQU8sR0FBR1IiLCJzb3VyY2VzIjpbIi9ob21lL3BpeGllL2lkZWEvZGIvaW5kZXguY2pzIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoJ2RvdGVudicpLmNvbmZpZygpO1xuY29uc3QgeyBQb29sIH0gPSByZXF1aXJlKCdwZycpO1xuXG5jb25zdCBwb29sID0gbmV3IFBvb2woe1xuICBjb25uZWN0aW9uU3RyaW5nOiBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsXG4gIHNzbDoge1xuICAgIHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UsXG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb29sOyAiXSwibmFtZXMiOlsicmVxdWlyZSIsImNvbmZpZyIsIlBvb2wiLCJwb29sIiwiY29ubmVjdGlvblN0cmluZyIsInByb2Nlc3MiLCJlbnYiLCJEQVRBQkFTRV9VUkwiLCJzc2wiLCJyZWplY3RVbmF1dGhvcml6ZWQiLCJtb2R1bGUiLCJleHBvcnRzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./db/index.cjs\n");

/***/ })

};
;