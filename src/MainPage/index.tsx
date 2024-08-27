import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, View, Alert, PermissionsAndroid, Platform, NativeEventEmitter, NativeModules, Modal, TouchableOpacity, FlatList, ScrollView } from "react-native";
import BleManager from 'react-native-ble-manager';
import Toast from "react-native-toast-message";

const ConnectDevice = () => {

  const [isScanning,setScanning] = useState(false)
  const [bleDevices,setDevices] = useState([])

  useEffect(()=> {
    BleManager.start({showAlert: false}).then(() => {
      //성공 시 
      Toast.show({
        type : 'success',
        text1 : 'BLE Manager이 성공적으로 시작되었습니다.'
      })
    });
  })

  useEffect(()=> {
    BleManager.enableBluetooth()
    .then(()=> {
      //성공 시
      Toast.show({
        type : 'success',
        text1 : 
      })
    })
  })

  return (
    <View>
      <Text>ConnectDevice</Text>
    </View>
  )
}

export default ConnectDevice

const styles = StyleSheet.create(
  {

  }
)