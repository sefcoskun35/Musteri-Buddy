import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:
    'AIzaSyAN-Bkxe0tqZC3yZpQpIw_Bj0LQ5uQfGwU',
  authDomain:
    'musteri-buddy.firebaseapp.com',
  projectId: 'musteri-buddy',
  storageBucket:
    'musteri-buddy.firebasestorage.app',
  messagingSenderId:
    '395650833082',
  appId:
    '1:395650833082:web:1b92d7d887b7d928db0083',
}

const app = initializeApp(
  firebaseConfig,
)

export const db =
  initializeFirestore(app, {
    localCache:
      persistentLocalCache({
        tabManager:
          persistentMultipleTabManager(),
      }),
  })

export const auth = getAuth(app)