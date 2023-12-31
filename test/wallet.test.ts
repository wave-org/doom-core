import {
  Key,
  WalletExportFormat,
  encryptWEF,
  decryptWEF,
  isWEF,
  encrypt,
  decrypt,
} from "../src/key";

describe("Key", function () {
  // cSpell:disable
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const extendedKey =
    "xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf";
  /* cSpell:enable */

  it("generate a random mnemonic", async function () {
    const result = Key.fromRandomMnemonic(password);
    expect(result.publicKey).not.toBeNull();
    expect(result.privateKey).not.toBeNull();
    expect(result.chainCode).not.toBeNull();
    expect(result.mnemonic).not.toBeNull();
  });

  it("load from given mnemonic", async function () {
    const result = Key.fromMnemonic(mnemonic, password);
    expect(result.publicKey).not.toBeNull();
    expect(result.privateKey).not.toBeNull();
    expect(result.chainCode).not.toBeNull();
    expect(result.mnemonic).not.toBeNull();
  });

  it("load with wrong password", async function () {
    const result = Key.fromMnemonic(mnemonic, password + "1");
    expect(result.mnemonic).toBe(mnemonic);
  });

  it("load from extended key", async function () {
    const result = Key.fromExtendedKey(extendedKey);
    expect(result.publicKey).not.toBeNull();
    expect(result.privateKey).not.toBeNull();
    expect(result.chainCode).not.toBeNull();
    expect(result.mnemonic).toBeNull();
  });

  it("generate a random mnemonic", async function () {
    const result = Key.generateRandomMnemonic();
    expect(result.split(" ")).toHaveLength(24);
    expect(result).not.toBe(
      "stamp evoke width vapor almost vault debate excuse enhance junior violin sign wise blame tornado load clerk orphan learn bullet alter acoustic region mango"
    );
  });

  it("generate a mnemonic by hash string", async function () {
    const result = Key.generateMnemonicByHashString("test");
    expect(result.split(" ")).toHaveLength(24);
    expect(result).toBe(
      "supply poet damage retreat wish debate crunch two silent purpose lobster tortoise favorite mask want prosper clap video scheme label bulk soup comic park"
    );
  });

  it("hash password", async function () {
    const result = Key.hashPassword(password);
    expect(result).toBe(
      "0xa3547f7fa65980d4fe135ab6c017f8285c4f686b0e26f7c18323287ebe96350c"
    );
  });

  it("encrypt and decrypt keystore", async function () {
    const keyStore: WalletExportFormat = {
      mnemonic: mnemonic,
      password: password,
    };
    const keyStorePassword = "123456";
    const encrypted = encryptWEF(keyStore, keyStorePassword);

    expect(isWEF(encrypted)).toBe(true);

    const decrypted = decryptWEF(encrypted, keyStorePassword);
    expect(decrypted.mnemonic).toBe(mnemonic);
    expect(decrypted.password).toBe(password);
  });

  it("encrypt and decrypt mnemonic", async function () {
    const encrypted = encrypt(mnemonic, password);
    const decrypted = decrypt(encrypted, password);
    expect(decrypted).toBe(mnemonic);
  });

  it("validate mnemonic", async function () {
    const result = Key.validateMnemonic(mnemonic);
    expect(result).toBe(true);
    const result2 = Key.validateMnemonic(mnemonic + "1");
    expect(result2).toBe(false);
  });
});
