import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly storage: admin.storage.Storage;
  constructor() {
    const firebase = require('../../bay-new-coffee-firebase.json');
    admin.initializeApp({
      credential: admin.credential.cert(firebase),
      storageBucket: 'bay-new-coffeeshop.appspot.com',
    });
    this.storage = admin.storage();
  }
  getStorgeInstance(): admin.storage.Storage {
    return this.storage;
  }
}
