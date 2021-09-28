import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import SmsAndroid from 'react-native-get-sms-android';
import NetInfo from '@react-native-community/netinfo';
import SoapRequest from 'react-native-soap-request';
import SendSMS from 'react-native-sms';
import {check, request, RESULTS, PERMISSIONS} from 'react-native-permissions';
import axios from 'axios';
//import BackgroundService from 'react-native-background-actions';
import BackgroudService, {BService} from './backroundService';

export default class Sms extends React.Component {
  constructor() {
    super();
    // BackgroudService.Start();
    this.SMSReadSubscription = {};
    let subscribe = null;
    NetInfo.addEventListener(state => {
      this.subscribe = state;
    });
    BackgroudService.Stop();
  }

  async requestReadSmsPermission() {
    try {
      var granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Auto Verification OTP',
          message: 'need access to read sms, to verify OTP',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'Receive SMS',
            message: 'Need access to receive sms, to verify OTP',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          SmsListener.addListener(message => {
            console.log(message.originatingAddress);
            console.log(message.body);
            postDataUsingSimplePostCall(
              message.originatingAddress,
              message.body,
            );
          });
        } else {
          alert('RECEIVE_SMS permissions denied');
          console.log('RECEIVE_SMS permissions denied');
        }
      } else {
        alert('READ_SMS permissions denied');
        console.log('READ_SMS permissions denied');
      }
    } catch (err) {
      alert(err);
    }
  }

  componentDidMount() {
    let subscribe = null;
    NetInfo.addEventListener(state => {
      this.subscribe = state;
    });
    this.requestReadSmsPermission();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
    );
  }
}

const postDataUsingSimplePostCall = (number, message) => {
  axios
    .post('http://172.16.10.200/api/rest/consultations/traitement.php', {
      numero: number,
      message: message,
    })
    .then(function (response) {
      // handle success
      data = response.data;
      console.log(data);
      id = data.id;
      bodySMS = data.message;
      statut = data.reponse;
      console.log(statut);
      if (statut === 'OK') {
        console.log('sending');
        sendSMS(number, bodySMS,id );
        console.log('sended');
      }
      alert(JSON.stringify(response.data));
    })
    .catch(function (error) {
      // handle error
      alert(error.message);
    });
};

const getSMSPermission = async () => {
  try {
    const checkResult = await check(PERMISSIONS.ANDROID.SEND_SMS);
    switch (checkResult) {
      case RESULTS.DENIED:
        const requestResult = await request(PERMISSIONS.ANDROID.SEND_SMS);
        return Promise.resolve(requestResult);
      case RESULTS.GRANTED:
        return Promise.resolve(checkResult);
      default:
        return Promise.reject();
    }
  } catch (err) {
    // console.log(err);
  }
};

const sendSMS = async (phoneNumber, bodySMS, lineNumberid) => {
  try {
    await getSMSPermission();
    console.log(phoneNumber);
    SmsAndroid.autoSend(
      phoneNumber,
      bodySMS,
      fail => {
        axios
          .post('http://172.16.10.200/api/rest/consultations/envoi_sms.php', {
            id: lineNumberid,
            statut: 4, //echec envoie sms
          })
          .then(function (response) {
            // handle success
            console.log('Failed with this error: ' + fail);
          })
          .catch(function (error) {
            // handle error
            alert(error.message);
            console.log('Erreur mis à jours ');
          });
      },
      success => {
        console.log('SMS sent successfully');
        console.log(lineNumberid);
        console.log('send-sms');
        
        axios
          .post('http://172.16.10.200/api/rest/consultations/envoi_sms.php', {
            id: lineNumberid,
            statut: 3, //sms bien envoyé
          })
          .then(function (response) {
            // handle success
            console.log('SMS sent successfully');
          })
          .catch(function (error) {
            // handle error
            alert(error.message);
            console.log('Erreur mis à jours ');
          });
      },
    );
  } catch (err) {
    // console.log(err)
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
