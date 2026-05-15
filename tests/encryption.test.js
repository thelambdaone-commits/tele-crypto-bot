import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { encrypt, decrypt, generateKey, deriveKey, hashPassphrase, verifyPassphrase } from '../src/shared/encryption.js';
import { logger, LogLevel } from '../src/shared/logger.js';

const masterKey = crypto.randomBytes(32).toString('hex');

test('encrypt/decrypt round-trip with valid key', () => {
  const plaintext = 'Hello, crypto bot!';
  const encrypted = encrypt(plaintext, masterKey);
  const decrypted = decrypt(encrypted, masterKey);
  assert.equal(decrypted, plaintext);
});

test('encrypt produces different ciphertext each time (IV randomization)', () => {
  const plaintext = 'same text';
  const encrypted1 = encrypt(plaintext, masterKey);
  const encrypted2 = encrypt(plaintext, masterKey);
  assert.notEqual(encrypted1, encrypted2);
});

test('decrypt with wrong key throws error', () => {
  const plaintext = 'secret data';
  const encrypted = encrypt(plaintext, masterKey);
  const wrongKey = crypto.randomBytes(32).toString('hex');
  assert.throws(() => decrypt(encrypted, wrongKey), Error);
});

test('decrypt with tampered ciphertext throws error', () => {
  const plaintext = 'secret data';
  const encrypted = encrypt(plaintext, masterKey);
  const tampered = encrypted.slice(0, 10) + 'A' + encrypted.slice(11);
  assert.throws(() => decrypt(tampered, masterKey));
});

test('generateKey produces 64-char hex string', () => {
  const key = generateKey();
  assert.equal(key.length, 64);
  assert.ok(/^[0-9a-f]{64}$/.test(key));
});

test('large data encrypt/decrypt round-trip', () => {
  const large = 'x'.repeat(100000);
  const encrypted = encrypt(large, masterKey);
  const decrypted = decrypt(encrypted, masterKey);
  assert.equal(decrypted, large);
});

test('encrypt handles special characters', () => {
  const special = 'héllo wörld • 中文 español 👋 € ¥  \n\t\r\0';
  const encrypted = encrypt(special, masterKey);
  const decrypted = decrypt(encrypted, masterKey);
  assert.equal(decrypted, special);
});

test('hashPassphrase and verifyPassphrase work correctly', () => {
  const passphrase = 'my-strong-passphrase-123';
  const hash = hashPassphrase(passphrase);
  assert.ok(verifyPassphrase(passphrase, hash));
  assert.ok(!verifyPassphrase('wrong-passphrase', hash));
});

test('deriveKey produces deterministic output with same salt', () => {
  const salt = crypto.randomBytes(16);
  const key1 = deriveKey('passphrase', salt);
  const key2 = deriveKey('passphrase', salt);
  assert.deepEqual(key1, key2);
});

test('deriveKey produces different output with different passphrase', () => {
  const salt = crypto.randomBytes(16);
  const key1 = deriveKey('passphrase-1', salt);
  const key2 = deriveKey('passphrase-2', salt);
  assert.notDeepEqual(key1, key2);
});

test('logger redacts sensitive fields', () => {
  const entry = logger.redact({
    chatId: 12345,
    privateKey: '0xabc123secret',
    mnemonic: 'word1 word2 word3',
    nested: {
      seedPhrase: 'secret phrase',
      apiKey: 'sk-12345',
      harmless: 'visible',
    },
  });
  assert.equal(entry.privateKey, '[REDACTED]');
  assert.equal(entry.mnemonic, '[REDACTED]');
  assert.equal(entry.nested.seedPhrase, '[REDACTED]');
  assert.equal(entry.nested.apiKey, '[REDACTED]');
  assert.equal(entry.nested.harmless, 'visible');
  assert.equal(entry.chatId, 12345);
});

test('logger redact returns primitives unchanged', () => {
  assert.equal(logger.redact('hello'), 'hello');
  assert.equal(logger.redact(42), 42);
  assert.equal(logger.redact(null), null);
});
