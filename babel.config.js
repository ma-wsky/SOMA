module.exports =function(api){
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            //Terminal-Error wollte das raus haben??
            //'expo-router/babel',
            '@babel/plugin-syntax-jsx',
            'react-native-reanimated/plugin',
        ]
    };
}