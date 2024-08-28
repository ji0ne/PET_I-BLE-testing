import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from "react-native";
import  ConnectDevice  from "../MainPage";

const MainPage = () => {
  return (
    <SafeAreaView style={styles.container}>
    <ConnectDevice/>
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainPage;
