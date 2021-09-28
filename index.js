/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import Sms from './sreeens/sms';
import SomeTaskName from './SomeTaskName';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Sms);
AppRegistry.registerHeadlessTask('SomeTaskName', () => SomeTaskName);
