import React from 'react';
import {Text, View} from 'react-native';
import {authStyles} from "@/styles/authStyles";


export const DividingLine = ({text}: { text: string }) => (
    <View style={authStyles.dividerWrapper}>
        <View style={authStyles.dividerLine}/>
        <Text style={authStyles.dividerText}>{text}</Text>
        <View style={authStyles.dividerLine}/>
    </View>
);