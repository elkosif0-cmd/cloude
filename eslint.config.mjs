// Lint for the UI modules (plain browser scripts bundled by build.py). Catches the bugs a build cannot: names used out of
// their scope, duplicate keys, unreachable code, assignments to constants. CI runs it; `npx eslint` runs it locally.
import globals from "globals";
const appGlobals = Object.fromEntries(["SK", "SKEngines", "SKosifCore", "SKosifShell", "SKCharts", "SKXlsx", "SKosifAI", "SKosifLedger", "SKosifCompanyPlatform", "SKosifTBReview",
  "SKosifCouncilUI", "SKosifAuditBridge", "SKosifCodex", "SKosifReportDocs", "SKosifIntegrated", "SKosifTasks", "SKosifCommand", "SKServices", "SKosifTopbar", "SKosifNotify",
  "SKosifReportPack", "SKosifMetrics", "SKosifTable", "SKosifKeys", "SKosifAssistant", "SKosifSalesLab", "SKosifSalesIntel", "SKosifSpace", "SKosifClose", "SKosifAuditBench", "SKosifAuditPractice", "SKosifAccountingGuidance", "SKosifFieldwork", "SKosifAdvances"].map((k) => [k, "readonly"]));
export default [
  { ignores: ["app/**", "dist/**", "ui/audit/**", "ui/legacy/**", "ui/core/engines.js", "capabilities-v2/**", "node_modules/**", "**/*.mjs"] },
  {
    files: ["ui/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "script", globals: { ...globals.browser, ...appGlobals } },
    rules: {
      "no-undef": "error", "no-dupe-keys": "error", "no-unreachable": "error", "no-self-assign": "error", "no-dupe-else-if": "error",
      "no-cond-assign": ["error", "except-parens"], "no-const-assign": "error", "no-redeclare": "error", "use-isnan": "error", "valid-typeof": "error",
      "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }], "no-fallthrough": "warn", "no-constant-condition": ["warn", { checkLoops: false }], "no-empty": "off",
    },
  },
];
