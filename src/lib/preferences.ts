import AsyncStorage from '@react-native-async-storage/async-storage';

export type NavigationPreferences={stepFree:boolean};
const KEY='goar:navigation-preferences:v1';
const DEFAULTS:NavigationPreferences={stepFree:false};

export async function loadNavigationPreferences():Promise<NavigationPreferences>{
  try{const raw=await AsyncStorage.getItem(KEY);return raw?{...DEFAULTS,...JSON.parse(raw)}:DEFAULTS;}catch{return DEFAULTS;}
}
export async function saveNavigationPreferences(value:NavigationPreferences){
  await AsyncStorage.setItem(KEY,JSON.stringify(value));
}
