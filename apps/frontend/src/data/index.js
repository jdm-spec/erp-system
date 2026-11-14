/**
 * Active Data Adapter Entry Point
 * Selects adapter according to VITE_DATA_ADAPTER env variable:
 * - 'firebase': Firebase Realtime Database
 * - 'rest': Backend REST API endpoints
 * - 'local': In-browser IndexedDB / localStorage
 */

import { localAdapter } from './local-adapter.js';
import { restAdapter } from './rest-adapter.js';
import { firebaseAdapter } from './firebase-adapter.js';

const adapterType = typeof __DATA_ADAPTER__ !== 'undefined' ? __DATA_ADAPTER__ : 'firebase';

let selectedAdapter = localAdapter;
if (adapterType === 'firebase') {
  selectedAdapter = firebaseAdapter;
} else if (adapterType === 'rest') {
  selectedAdapter = restAdapter;
}

export const dataAdapter = selectedAdapter;
export { localAdapter, restAdapter, firebaseAdapter };
export default dataAdapter;
