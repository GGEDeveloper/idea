/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/users/me/route";
exports.ids = ["app/api/users/me/route"];
exports.modules = {

/***/ "(rsc)/./app/api/users/me/route.ts":
/*!***********************************!*\
  !*** ./app/api/users/me/route.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _src_utils_jwtUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../src/utils/jwtUtils */ \"(rsc)/./src/utils/jwtUtils.ts\");\n\n\nconst TOKEN_COOKIE_NAME = 'idea_session_token';\nasync function GET(request) {\n    try {\n        // Get token from cookies\n        const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;\n        if (!token) {\n            console.log('[API /users/me] No token found in cookies');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Not authenticated'\n            }, {\n                status: 401\n            });\n        }\n        // Verify and decode token\n        let decodedToken;\n        try {\n            decodedToken = (0,_src_utils_jwtUtils__WEBPACK_IMPORTED_MODULE_1__.verifyToken)(token);\n            if (!decodedToken) {\n                console.log('[API /users/me] Token verification returned null');\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    error: 'Invalid token'\n                }, {\n                    status: 401\n                });\n            }\n            console.log('[API /users/me] Token verified for user:', decodedToken.email);\n        } catch (error) {\n            console.log('[API /users/me] Invalid token:', error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Invalid token'\n            }, {\n                status: 401\n            });\n        }\n        // Import database dependencies\n        const { findUserByIdWithPermissions } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/dotenv\"), __webpack_require__.e(\"_rsc_src_db_userQueries_ts\")]).then(__webpack_require__.bind(__webpack_require__, /*! ../../../../src/db/userQueries */ \"(rsc)/./src/db/userQueries.ts\"));\n        // Get user from database with permissions\n        const user = await findUserByIdWithPermissions(decodedToken.userId);\n        if (!user) {\n            console.log('[API /users/me] User not found for ID:', decodedToken.userId);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'User not found'\n            }, {\n                status: 404\n            });\n        }\n        // Build user profile response\n        const userProfile = {\n            user_id: user.user_id,\n            email: user.email,\n            first_name: user.first_name,\n            last_name: user.last_name,\n            company_name: user.company_name,\n            role_name: user.role_name,\n            permissions: user.permissions || []\n        };\n        console.log('[API /users/me] Returning user profile for:', user.email);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(userProfile);\n    } catch (error) {\n        console.error('[API /users/me] Error fetching user profile:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Internal server error while fetching user profile'\n        }, {\n            status: 500\n        });\n    }\n}\n// Handle unsupported methods\nasync function POST() {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: 'Method not allowed'\n    }, {\n        status: 405\n    });\n}\nasync function PUT() {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: 'Method not allowed'\n    }, {\n        status: 405\n    });\n}\nasync function DELETE() {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: 'Method not allowed'\n    }, {\n        status: 405\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3VzZXJzL21lL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF3RDtBQUNLO0FBRTdELE1BQU1FLG9CQUFvQjtBQVluQixlQUFlQyxJQUFJQyxPQUFvQjtJQUM1QyxJQUFJO1FBQ0YseUJBQXlCO1FBQ3pCLE1BQU1DLFFBQVFELFFBQVFFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDTCxvQkFBb0JNO1FBRXRELElBQUksQ0FBQ0gsT0FBTztZQUNWSSxRQUFRQyxHQUFHLENBQUM7WUFDWixPQUFPVixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFvQixHQUM3QjtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsMEJBQTBCO1FBQzFCLElBQUlDO1FBQ0osSUFBSTtZQUNGQSxlQUFlYixnRUFBV0EsQ0FBQ0k7WUFFM0IsSUFBSSxDQUFDUyxjQUFjO2dCQUNqQkwsUUFBUUMsR0FBRyxDQUFDO2dCQUNaLE9BQU9WLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO29CQUFFQyxPQUFPO2dCQUFnQixHQUN6QjtvQkFBRUMsUUFBUTtnQkFBSTtZQUVsQjtZQUVBSixRQUFRQyxHQUFHLENBQUMsNENBQTRDSSxhQUFhQyxLQUFLO1FBQzVFLEVBQUUsT0FBT0gsT0FBTztZQUNkSCxRQUFRQyxHQUFHLENBQUMsa0NBQWtDRTtZQUM5QyxPQUFPWixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFnQixHQUN6QjtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsK0JBQStCO1FBQy9CLE1BQU0sRUFBRUcsMkJBQTJCLEVBQUUsR0FBRyxNQUFNLDJQQUF3QztRQUV0RiwwQ0FBMEM7UUFDMUMsTUFBTUMsT0FBTyxNQUFNRCw0QkFBNEJGLGFBQWFJLE1BQU07UUFFbEUsSUFBSSxDQUFDRCxNQUFNO1lBQ1RSLFFBQVFDLEdBQUcsQ0FBQywwQ0FBMENJLGFBQWFJLE1BQU07WUFDekUsT0FBT2xCLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQWlCLEdBQzFCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSw4QkFBOEI7UUFDOUIsTUFBTU0sY0FBMkI7WUFDL0JDLFNBQVNILEtBQUtHLE9BQU87WUFDckJMLE9BQU9FLEtBQUtGLEtBQUs7WUFDakJNLFlBQVlKLEtBQUtJLFVBQVU7WUFDM0JDLFdBQVdMLEtBQUtLLFNBQVM7WUFDekJDLGNBQWNOLEtBQUtNLFlBQVk7WUFDL0JDLFdBQVdQLEtBQUtPLFNBQVM7WUFDekJDLGFBQWFSLEtBQUtRLFdBQVcsSUFBSSxFQUFFO1FBQ3JDO1FBRUFoQixRQUFRQyxHQUFHLENBQUMsK0NBQStDTyxLQUFLRixLQUFLO1FBQ3JFLE9BQU9mLHFEQUFZQSxDQUFDVyxJQUFJLENBQUNRO0lBRTNCLEVBQUUsT0FBT1AsT0FBTztRQUNkSCxRQUFRRyxLQUFLLENBQUMsZ0RBQWdEQTtRQUM5RCxPQUFPWixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtZQUFFQyxPQUFPO1FBQW9ELEdBQzdEO1lBQUVDLFFBQVE7UUFBSTtJQUVsQjtBQUNGO0FBRUEsNkJBQTZCO0FBQ3RCLGVBQWVhO0lBQ3BCLE9BQU8xQixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtRQUFFQyxPQUFPO0lBQXFCLEdBQzlCO1FBQUVDLFFBQVE7SUFBSTtBQUVsQjtBQUVPLGVBQWVjO0lBQ3BCLE9BQU8zQixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtRQUFFQyxPQUFPO0lBQXFCLEdBQzlCO1FBQUVDLFFBQVE7SUFBSTtBQUVsQjtBQUVPLGVBQWVlO0lBQ3BCLE9BQU81QixxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtRQUFFQyxPQUFPO0lBQXFCLEdBQzlCO1FBQUVDLFFBQVE7SUFBSTtBQUVsQiIsInNvdXJjZXMiOlsiL2hvbWUvcGl4aWUvaWRlYS9hcHAvYXBpL3VzZXJzL21lL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyB2ZXJpZnlUb2tlbiB9IGZyb20gJy4uLy4uLy4uLy4uL3NyYy91dGlscy9qd3RVdGlscyc7XG5cbmNvbnN0IFRPS0VOX0NPT0tJRV9OQU1FID0gJ2lkZWFfc2Vzc2lvbl90b2tlbic7XG5cbmludGVyZmFjZSBVc2VyUHJvZmlsZSB7XG4gIHVzZXJfaWQ6IHN0cmluZztcbiAgZW1haWw6IHN0cmluZztcbiAgZmlyc3RfbmFtZT86IHN0cmluZztcbiAgbGFzdF9uYW1lPzogc3RyaW5nO1xuICBjb21wYW55X25hbWU/OiBzdHJpbmc7XG4gIHJvbGVfbmFtZTogc3RyaW5nO1xuICBwZXJtaXNzaW9uczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgdG9rZW4gZnJvbSBjb29raWVzXG4gICAgY29uc3QgdG9rZW4gPSByZXF1ZXN0LmNvb2tpZXMuZ2V0KFRPS0VOX0NPT0tJRV9OQU1FKT8udmFsdWU7XG4gICAgXG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgY29uc29sZS5sb2coJ1tBUEkgL3VzZXJzL21lXSBObyB0b2tlbiBmb3VuZCBpbiBjb29raWVzJyk7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdOb3QgYXV0aGVudGljYXRlZCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSBhbmQgZGVjb2RlIHRva2VuXG4gICAgbGV0IGRlY29kZWRUb2tlbjtcbiAgICB0cnkge1xuICAgICAgZGVjb2RlZFRva2VuID0gdmVyaWZ5VG9rZW4odG9rZW4pO1xuICAgICAgXG4gICAgICBpZiAoIWRlY29kZWRUb2tlbikge1xuICAgICAgICBjb25zb2xlLmxvZygnW0FQSSAvdXNlcnMvbWVdIFRva2VuIHZlcmlmaWNhdGlvbiByZXR1cm5lZCBudWxsJyk7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICB7IGVycm9yOiAnSW52YWxpZCB0b2tlbicgfSxcbiAgICAgICAgICB7IHN0YXR1czogNDAxIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ1tBUEkgL3VzZXJzL21lXSBUb2tlbiB2ZXJpZmllZCBmb3IgdXNlcjonLCBkZWNvZGVkVG9rZW4uZW1haWwpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZygnW0FQSSAvdXNlcnMvbWVdIEludmFsaWQgdG9rZW46JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnSW52YWxpZCB0b2tlbicgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEltcG9ydCBkYXRhYmFzZSBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCB7IGZpbmRVc2VyQnlJZFdpdGhQZXJtaXNzaW9ucyB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi8uLi8uLi9zcmMvZGIvdXNlclF1ZXJpZXMnKTtcblxuICAgIC8vIEdldCB1c2VyIGZyb20gZGF0YWJhc2Ugd2l0aCBwZXJtaXNzaW9uc1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBmaW5kVXNlckJ5SWRXaXRoUGVybWlzc2lvbnMoZGVjb2RlZFRva2VuLnVzZXJJZCk7XG5cbiAgICBpZiAoIXVzZXIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbQVBJIC91c2Vycy9tZV0gVXNlciBub3QgZm91bmQgZm9yIElEOicsIGRlY29kZWRUb2tlbi51c2VySWQpO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDQgfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB1c2VyIHByb2ZpbGUgcmVzcG9uc2VcbiAgICBjb25zdCB1c2VyUHJvZmlsZTogVXNlclByb2ZpbGUgPSB7XG4gICAgICB1c2VyX2lkOiB1c2VyLnVzZXJfaWQsXG4gICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgIGZpcnN0X25hbWU6IHVzZXIuZmlyc3RfbmFtZSxcbiAgICAgIGxhc3RfbmFtZTogdXNlci5sYXN0X25hbWUsXG4gICAgICBjb21wYW55X25hbWU6IHVzZXIuY29tcGFueV9uYW1lLFxuICAgICAgcm9sZV9uYW1lOiB1c2VyLnJvbGVfbmFtZSxcbiAgICAgIHBlcm1pc3Npb25zOiB1c2VyLnBlcm1pc3Npb25zIHx8IFtdXG4gICAgfTtcblxuICAgIGNvbnNvbGUubG9nKCdbQVBJIC91c2Vycy9tZV0gUmV0dXJuaW5nIHVzZXIgcHJvZmlsZSBmb3I6JywgdXNlci5lbWFpbCk7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHVzZXJQcm9maWxlKTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tBUEkgL3VzZXJzL21lXSBFcnJvciBmZXRjaGluZyB1c2VyIHByb2ZpbGU6JywgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3Igd2hpbGUgZmV0Y2hpbmcgdXNlciBwcm9maWxlJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuXG4vLyBIYW5kbGUgdW5zdXBwb3J0ZWQgbWV0aG9kc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QoKSB7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICB7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9LFxuICAgIHsgc3RhdHVzOiA0MDUgfVxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUFVUKCkge1xuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSxcbiAgICB7IHN0YXR1czogNDA1IH1cbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIERFTEVURSgpIHtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgIHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0sXG4gICAgeyBzdGF0dXM6IDQwNSB9XG4gICk7XG59ICJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJ2ZXJpZnlUb2tlbiIsIlRPS0VOX0NPT0tJRV9OQU1FIiwiR0VUIiwicmVxdWVzdCIsInRva2VuIiwiY29va2llcyIsImdldCIsInZhbHVlIiwiY29uc29sZSIsImxvZyIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImRlY29kZWRUb2tlbiIsImVtYWlsIiwiZmluZFVzZXJCeUlkV2l0aFBlcm1pc3Npb25zIiwidXNlciIsInVzZXJJZCIsInVzZXJQcm9maWxlIiwidXNlcl9pZCIsImZpcnN0X25hbWUiLCJsYXN0X25hbWUiLCJjb21wYW55X25hbWUiLCJyb2xlX25hbWUiLCJwZXJtaXNzaW9ucyIsIlBPU1QiLCJQVVQiLCJERUxFVEUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/users/me/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2Fhome%2Fpixie%2Fidea%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fpixie%2Fidea&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2Fhome%2Fpixie%2Fidea%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fpixie%2Fidea&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_pixie_idea_app_api_users_me_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/users/me/route.ts */ \"(rsc)/./app/api/users/me/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/users/me/route\",\n        pathname: \"/api/users/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/users/me/route\"\n    },\n    resolvedPagePath: \"/home/pixie/idea/app/api/users/me/route.ts\",\n    nextConfigOutput,\n    userland: _home_pixie_idea_app_api_users_me_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ1c2VycyUyRm1lJTJGcm91dGUmcGFnZT0lMkZhcGklMkZ1c2VycyUyRm1lJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdXNlcnMlMkZtZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGcGl4aWUlMkZpZGVhJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZob21lJTJGcGl4aWUlMkZpZGVhJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PXN0YW5kYWxvbmUmcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDTjtBQUN2RTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL2hvbWUvcGl4aWUvaWRlYS9hcHAvYXBpL3VzZXJzL21lL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcInN0YW5kYWxvbmVcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdXNlcnMvbWUvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS91c2Vycy9tZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXNlcnMvbWUvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9waXhpZS9pZGVhL2FwcC9hcGkvdXNlcnMvbWUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2Fhome%2Fpixie%2Fidea%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fpixie%2Fidea&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./src/utils/jwtUtils.ts":
/*!*******************************!*\
  !*** ./src/utils/jwtUtils.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   JWT_EXPIRES_IN: () => (/* binding */ JWT_EXPIRES_IN),\n/* harmony export */   generateToken: () => (/* binding */ generateToken),\n/* harmony export */   getExpirationMs: () => (/* binding */ getExpirationMs),\n/* harmony export */   verifyToken: () => (/* binding */ verifyToken)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n\nconst JWT_SECRET = process.env.JWT_SECRET;\nconst JWT_EXPIRES_IN = '1d'; // Token expires in 1 day\nif (!JWT_SECRET) {\n    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');\n}\n/**\n * Generates a JSON Web Token.\n * @param payload - The payload to be included in the token\n * @returns The generated JWT token\n */ const generateToken = (payload)=>{\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().sign(payload, JWT_SECRET, {\n        expiresIn: JWT_EXPIRES_IN\n    });\n};\n/**\n * Verifies a JSON Web Token.\n * @param token - The JWT token to be verified\n * @returns The decoded payload if the token is valid, null otherwise\n */ const verifyToken = (token)=>{\n    try {\n        const decoded = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, JWT_SECRET);\n        return decoded;\n    } catch (error) {\n        console.error('[jwtUtils] Invalid or expired token:', error instanceof Error ? error.message : 'Unknown error');\n        return null;\n    }\n};\n/**\n * Gets the expiration time in milliseconds for cookie configuration\n * @returns Expiration time in milliseconds\n */ const getExpirationMs = ()=>{\n    if (JWT_EXPIRES_IN.endsWith('d')) {\n        return parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000;\n    } else if (JWT_EXPIRES_IN.endsWith('h')) {\n        return parseInt(JWT_EXPIRES_IN) * 60 * 60 * 1000;\n    } else {\n        return 24 * 60 * 60 * 1000; // Default to 1 day if format is not recognized\n    }\n};\n// Export constants\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvdXRpbHMvand0VXRpbHMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQStCO0FBRS9CLE1BQU1DLGFBQWFDLFFBQVFDLEdBQUcsQ0FBQ0YsVUFBVTtBQUN6QyxNQUFNRyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFFdEQsSUFBSSxDQUFDSCxZQUFZO0lBQ2YsTUFBTSxJQUFJSSxNQUFNO0FBQ2xCO0FBVUE7Ozs7Q0FJQyxHQUNNLE1BQU1DLGdCQUFnQixDQUFDQztJQUM1QixPQUFPUCx3REFBUSxDQUFDTyxTQUFTTixZQUFhO1FBQUVRLFdBQVdMO0lBQWU7QUFDcEUsRUFBRTtBQUVGOzs7O0NBSUMsR0FDTSxNQUFNTSxjQUFjLENBQUNDO0lBQzFCLElBQUk7UUFDRixNQUFNQyxVQUFVWiwwREFBVSxDQUFDVyxPQUFPVjtRQUNsQyxPQUFPVztJQUNULEVBQUUsT0FBT0UsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsd0NBQXdDQSxpQkFBaUJULFFBQVFTLE1BQU1FLE9BQU8sR0FBRztRQUMvRixPQUFPO0lBQ1Q7QUFDRixFQUFFO0FBRUY7OztDQUdDLEdBQ00sTUFBTUMsa0JBQWtCO0lBQzdCLElBQUliLGVBQWVjLFFBQVEsQ0FBQyxNQUFNO1FBQ2hDLE9BQU9DLFNBQVNmLGtCQUFrQixLQUFLLEtBQUssS0FBSztJQUNuRCxPQUFPLElBQUlBLGVBQWVjLFFBQVEsQ0FBQyxNQUFNO1FBQ3ZDLE9BQU9DLFNBQVNmLGtCQUFrQixLQUFLLEtBQUs7SUFDOUMsT0FBTztRQUNMLE9BQU8sS0FBSyxLQUFLLEtBQUssTUFBTSwrQ0FBK0M7SUFDN0U7QUFDRixFQUFFO0FBRUYsbUJBQW1CO0FBQ08iLCJzb3VyY2VzIjpbIi9ob21lL3BpeGllL2lkZWEvc3JjL3V0aWxzL2p3dFV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcblxuY29uc3QgSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQ7XG5jb25zdCBKV1RfRVhQSVJFU19JTiA9ICcxZCc7IC8vIFRva2VuIGV4cGlyZXMgaW4gMSBkYXlcblxuaWYgKCFKV1RfU0VDUkVUKSB7XG4gIHRocm93IG5ldyBFcnJvcignRkFUQUwgRVJST1I6IEpXVF9TRUNSRVQgaXMgbm90IGRlZmluZWQgaW4gZW52aXJvbm1lbnQgdmFyaWFibGVzLicpO1xufVxuXG4vLyBUeXBlIGRlZmluaXRpb25zXG5leHBvcnQgaW50ZXJmYWNlIEpXVFBheWxvYWQge1xuICB1c2VySWQ6IHN0cmluZztcbiAgZW1haWw6IHN0cmluZztcbiAgcm9sZTogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgSlNPTiBXZWIgVG9rZW4uXG4gKiBAcGFyYW0gcGF5bG9hZCAtIFRoZSBwYXlsb2FkIHRvIGJlIGluY2x1ZGVkIGluIHRoZSB0b2tlblxuICogQHJldHVybnMgVGhlIGdlbmVyYXRlZCBKV1QgdG9rZW5cbiAqL1xuZXhwb3J0IGNvbnN0IGdlbmVyYXRlVG9rZW4gPSAocGF5bG9hZDogSldUUGF5bG9hZCk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBqd3Quc2lnbihwYXlsb2FkLCBKV1RfU0VDUkVUISwgeyBleHBpcmVzSW46IEpXVF9FWFBJUkVTX0lOIH0pO1xufTtcblxuLyoqXG4gKiBWZXJpZmllcyBhIEpTT04gV2ViIFRva2VuLlxuICogQHBhcmFtIHRva2VuIC0gVGhlIEpXVCB0b2tlbiB0byBiZSB2ZXJpZmllZFxuICogQHJldHVybnMgVGhlIGRlY29kZWQgcGF5bG9hZCBpZiB0aGUgdG9rZW4gaXMgdmFsaWQsIG51bGwgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBjb25zdCB2ZXJpZnlUb2tlbiA9ICh0b2tlbjogc3RyaW5nKTogSldUUGF5bG9hZCB8IG51bGwgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBqd3QudmVyaWZ5KHRva2VuLCBKV1RfU0VDUkVUISkgYXMgSldUUGF5bG9hZDtcbiAgICByZXR1cm4gZGVjb2RlZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdband0VXRpbHNdIEludmFsaWQgb3IgZXhwaXJlZCB0b2tlbjonLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgZXhwaXJhdGlvbiB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgY29va2llIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm5zIEV4cGlyYXRpb24gdGltZSBpbiBtaWxsaXNlY29uZHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4cGlyYXRpb25NcyA9ICgpOiBudW1iZXIgPT4ge1xuICBpZiAoSldUX0VYUElSRVNfSU4uZW5kc1dpdGgoJ2QnKSkge1xuICAgIHJldHVybiBwYXJzZUludChKV1RfRVhQSVJFU19JTikgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xuICB9IGVsc2UgaWYgKEpXVF9FWFBJUkVTX0lOLmVuZHNXaXRoKCdoJykpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoSldUX0VYUElSRVNfSU4pICogNjAgKiA2MCAqIDEwMDA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIERlZmF1bHQgdG8gMSBkYXkgaWYgZm9ybWF0IGlzIG5vdCByZWNvZ25pemVkXG4gIH1cbn07XG5cbi8vIEV4cG9ydCBjb25zdGFudHNcbmV4cG9ydCB7IEpXVF9FWFBJUkVTX0lOIH07ICJdLCJuYW1lcyI6WyJqd3QiLCJKV1RfU0VDUkVUIiwicHJvY2VzcyIsImVudiIsIkpXVF9FWFBJUkVTX0lOIiwiRXJyb3IiLCJnZW5lcmF0ZVRva2VuIiwicGF5bG9hZCIsInNpZ24iLCJleHBpcmVzSW4iLCJ2ZXJpZnlUb2tlbiIsInRva2VuIiwiZGVjb2RlZCIsInZlcmlmeSIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJnZXRFeHBpcmF0aW9uTXMiLCJlbmRzV2l0aCIsInBhcnNlSW50Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/utils/jwtUtils.ts\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("pg");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2Fhome%2Fpixie%2Fidea%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fpixie%2Fidea&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();