module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            "nativewind/babel",
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./src",
                        "@app": "./src/app",
                        "@components": "./src/components",
                        "@features": "./src/features",
                        "@hooks": "./src/hooks",
                        "@pages": "./src/pages",
                        "@services": "./src/services",
                        "@utils": "./src/utils",
                        "@styles": "./src/app/styles",
                        "@constants": "./src/constants"
                    }
                }
            ]
        ],
    };
};