import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly storage: admin.storage.Storage;
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firebase = require('../../test.json');
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
