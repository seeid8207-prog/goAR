import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiagnosticSession } from '../types/diagnostics';

const KEY='goar:diagnostic-sessions:v1';

export async function loadDiagnosticSessions():Promise<DiagnosticSession[]>{
  try{const raw=await AsyncStorage.getItem(KEY);return raw?JSON.parse(raw):[];}catch{return [];}
}

export async function saveDiagnosticSession(session:DiagnosticSession){
  const sessions=await loadDiagnosticSessions();
  const next=[session,...sessions.filter((s)=>s.id!==session.id)].slice(0,20);
  await AsyncStorage.setItem(KEY,JSON.stringify(next));
}

export async function clearDiagnosticSessions(){await AsyncStorage.removeItem(KEY);}
