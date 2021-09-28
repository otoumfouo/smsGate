import {PermissionsAndroid} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import SmsAndroid from 'react-native-get-sms-android';
import NetInfo from '@react-native-community/netinfo';
import SoapRequest from 'react-native-soap-request';
import SendSMS from 'react-native-sms';
import axios from 'axios';
import BackgroundService from 'react-native-background-actions';
import BackgroundJob from 'react-native-background-actions';
const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));
class BService {
  constructor() {
    this.Options = {
      taskName: 'Demo',
      taskTitle: 'Demo Running',
      taskDesc: 'Demo',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      parameters: {
        delay: 500,
      },
      actions: '["Exit"]',
    };
  }
  async VeryIntensiveTask(taskDataArguments) {
    const {delay} = taskDataArguments;
    await new Promise(async resolve => {
      var i = 0;
      for (let i = 0; BackgroundJob.isRunning(); i++) {
        message: 'Success DOOD ' + i;
        this.requestReadSmsPermission();
        // })
        await sleep(delay);
      }
    });
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

  Start() {
    BackgroundService.start(this.VeryIntensiveTask, this.Options);
  }
  Stop() {
    BackgroundService.stop();
  }
}
const postDataUsingSimplePostCall = (number, sms) => {
  axios
    .post('http://172.16.10.200/api/rest/consultations/traitement.php', {
      numero: number,
      message: sms,
    })
    .then(function (response) {
      // handle success
      data = response.data;
      id = data.id;
      bodySMS = null;
      bodySMS = data.message;
      console.log(bodySMS)
      reponse = data.reponse;
      if (reponse === 'OK') {
        SendSMS.send(
          {
            // Message body
            body: bodySMS,
            // Recipients Number
            recipients: [number],
            // An array of types
            // "completed" response when using android
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true,
          },
          (completed, cancelled, error) => {
            if (completed) {
              console.log('SMS Sent Completed');
            } else if (cancelled) {
              console.log('SMS Sent Cancelled');
            } else if (error) {
              console.log('Some error occured');
            }
          },
        );
      }
      alert(JSON.stringify(response.data));
    })
    .catch(function (error) {
      // handle error
      alert(error.message);
    });
};
const BackgroudService = new BService();
export default BackgroudService;
