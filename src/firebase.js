import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyBZd0NI03m9OuvX9XxiTpsR7YtZCtjViSg',
    authDomain: 'herbsmotion-2c3f4.firebaseapp.com',
    projectId: 'herbsmotion-2c3f4',
    storageBucket: 'herbsmotion-2c3f4.firebasestorage.app',
    messagingSenderId: '423185951366',
    appId: '1:423185951366:web:6c937d346736cb09f03f07',
    measurementId: 'G-DRKF78CWZ6',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)