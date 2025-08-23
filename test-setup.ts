import { webcrypto } from 'node:crypto'

// joseライブラリ用のglobal crypto設定
// Bunはすでにglobal.cryptoを持っているが、joseがwebcryptoを期待している場合のフォールバック
if (!globalThis.crypto?.getRandomValues) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}

// globalThis以外にもcryptoを設定
if (!global.crypto?.getRandomValues) {
  // @ts-ignore
  global.crypto = webcrypto
}
