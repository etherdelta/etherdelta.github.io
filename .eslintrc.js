module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
    rules: {
        "no-param-reassign": ["error", { "props": true, "ignorePropertyModificationsFor": ["req"] }],
        "no-unused-vars": ["error", {"argsIgnorePattern": "next"}],
    }
};
