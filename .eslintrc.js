module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": ["standard", "plugin:prettier/recommended"],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "semi": [2, "always"],
        "indent": [2, 4],
        "no-return-await": 0,
        "space-before-function-paren": [2, {
            "named": "never",
            "anonymous": "never",
            "asyncArrow": "always"
        }],
        "template-curly-spacing": [2, "always"]
    }
};