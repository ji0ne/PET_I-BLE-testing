import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, View, Alert, PermissionsAndroid, Platform, NativeEventEmitter, NativeModules, Modal, TouchableOpacity, FlatList, ScrollView } from "react-native";
import BleManager from 'react-native-ble-manager';
import Toast from "react-native-toast-message";

const ConnectDevice = () => {

  const [isScanning, setScanning] = useState(false);
  const [bleDecices,setDevices] = useState([]);

  useEffect(() => {
    BleManager.start({showAlert:false}).then(() => {
      //성공 시 
      Toast.show({
        type : 'success',
        text1 : '블루투스가 이미 활성화되었거나 사용자가 활성화하였습니다.'
      });
    })
    .catch((error) => {
      Toast.show({
        type : 'error',
        text1 : '사용자가 블루투스 활성화를 거부했습니다.'
      });
    });
  }, []);

  useEffect(() => {
    BleManager.enableBluetooth()
    .then(() => {
      Toast.show({
        type : 'success',
        text1 : '블루투스가 활성화되었습니다 .'
      });
    })
    .catch((error) => {

      Toast.show({
        type : 'error' , 
        text1 : '블루투스를 활성화하지 못했습니다'
      });

    });
  }, []);

  return (
    <View>
      <Text>ConnectedDevice</Text>
    </View>
  )
}

export default ConnectDevice

const styles = StyleSheet.create({})