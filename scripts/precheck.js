import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { config } from '../src/core/config.js';
import { StorageService } from '../src/core/storage.js';
import { generateKey } from '../src/shared/encryption.js';

const requiredEnv = ['BOT_TOKEN', 'MASTER_ENCRYPTION_KEY', 'SOL_RPC_URL', 'ADMIN_USER_ID'];

function assertRequiredEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variables .env manquantes: ${missing.join(', ')}`);
  }

  if (!/^[a-fA-F0-9]{64}$/.test(process.env.MASTER_ENCRYPTION_KEY)) {
    throw new Error('MASTER_ENCRYPTION_KEY doit etre une chaine hex de 64 caracteres');
  }
}

async function assertStorage() {
  const dataPath = await fs.mkdtemp(path.join(os.tmpdir(), 'telegram-crypto-bot-precheck-'));
  const storage = new StorageService(dataPath, generateKey());
  const chatId = 999001;

  await storage.init();
  const saved = await storage.addWallet(chatId, {
    chain: 'eth',
    label: 'Precheck',
    address: '0x0000000000000000000000000000000000000001',
    privateKey: '0x'.padEnd(66, '1'),
    mnemonic: 'test test test test test test test test test test test junk',
  });

  const wallet = await storage.getWalletWithKey(chatId, saved.id);
  if (!wallet || wallet.address !== saved.address || !wallet.privateKey) {
    throw new Error('Storage chiffré indisponible ou illisible');
  }
}

async function assertCriticalImports() {
  await Promise.all([
    import('../src/modules/wallet/wallet.service.js'),
    import('../src/bot/handlers/index.js'),
    import('../src/shared/qr.js'),
  ]);
}

async function main() {
  assertRequiredEnv();
  await assertStorage();
  await assertCriticalImports();

  console.log('✅ Precheck OK');
  console.log(`Data path: ${config.dataPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`❌ Precheck failed: ${error.message}`);
    process.exit(1);
  });
