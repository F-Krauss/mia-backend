import { Injectable, OnModuleInit } from '@nestjs/common';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!getApps().length) {
      const credsJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!credsJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT env var is required for Firebase auth');
      }
      const credential = cert(JSON.parse(credsJson));
      initializeApp({ credential });
    }
  }

  get auth() {
    return getAuth(getApp());
  }
}
