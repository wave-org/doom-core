// // import {
// //   CryptoHDKey,
// //   CryptoKeypath,
// //   CryptoCoinInfo,
// //   PathComponent,
// //   ScriptExpressions,
// //   MultiKey,
// // } from '@keystonehq/bc-ur-registry';

// const {CryptoHDKey, PathComponent, CryptoKeypath} = require('@keystonehq/bc-ur-registry')
// // const Wallet = require('ethereumjs-wallet').default
// // const HDWallet = require('ethereumjs-wallet').hdkey
// const HDNodeWallet = require('ethers').HDNodeWallet
// const {SigningKey, defaultPath} = require('ethers')
// const QRCode = require('qrcode')
// const {URRegistryDecoder} = require('@keystonehq/ur-decoder')
// // const CryptoKeypath
// // const {PathComponent} = require()

// const {EthSignRequest, ETHSignature, DataType} = require('@keystonehq/bc-ur-registry-eth')
// const { RLP } = require('@ethereumjs/rlp')
// const {Transaction, Capability, FeeMarketEIP1559Transaction} = require("@ethereumjs/tx")
// const {Common, Hardfork, Chain} = require("@ethereumjs/common")
// const {
//     concatSig,
//     decrypt,
//     getEncryptionPublicKey,
//     normalize,
//     personalSign,
//     signTypedData,
//     SignTypedDataVersion,
//   } = require('@metamask/eth-sig-util');


// const {
//     MAX_INTEGER,
//     bigIntToHex,
//     bigIntToUnpaddedBytes,
//     bigIntToUnpaddedBuffer,
//     bytesToBigInt,
//     arrToBufArr,
//     ecrecover,
//     toBytes,
//     unpadBytes,
//     bufferToInt,
//     bufferToHex,
//     validateNoLeadingZeroes,
//     bufferToBigInt,
//   } = require('@ethereumjs/util')

// function main() {
//     console.log("hello world")
//     // TODO change to 89/6/4 
//     // 8/9/6/4/*
//     const defaultChildPath = [
//         new PathComponent({index: 8,hardened: false}),
//         new PathComponent({index: 9,hardened: false}),
//         new PathComponent({index: 6,hardened: false}),
//         new PathComponent({index: 4,hardened: false}),
//         new PathComponent({hardened: false})
//     ]

//     //private key: 0x839300d27b176ed0baa2f56b53eb2f83dcbb1c97a044eb828f518524f8328e07
//     // address:  0x40fDF02dF1BD7104441b17B2c629c2D339daB655
//     let root = HDNodeWallet.fromExtendedKey('xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf')

//     // console.log(root.parentFingerprint)
//     // console.log(root)
//     // console.log('private key: ', root.privateKey)
//     // console.log('extended key: ', root.extendedKey)

//     // return
//     // 0xFA6f0AC80E18F3acE99a47dF68cbE0585EDF1962
//     // let key = root.deriveChild(1)
//     // console.log(key)
//     // return
//     // 0xC8E2E6A1Aef6092d37330192621Ec59c0648db6E
//     let key = root
//     // let key = root.derivePath('m')
//     let bufferKey = Buffer.from(key.publicKey.substring(2), "hex")
//     let chainCodeBuffer =  Buffer.from(key.chainCode.substring(2), "hex")
//     console.log(key)

//     // TODO because extended key without path, we just use default path.
//     // let components = handlePath(key.path)
//     // let components = handlePath(defaultPath)
//     // todo sourceFingerprint ? parent or self.
//     // let cryptoPath = new CryptoKeypath(components, Buffer.from(key.fingerprint.substring(2), "hex"), key.depth)

//     // let cryptoHD = new CryptoHDKey({
//     //     isMaster: false,
//     //     isPrivateKey: false,
//     //     key: bufferKey,
//     //     chainCode: chainCodeBuffer,
//     //     // useInfo?: CryptoCoinInfo;
//     //     origin: cryptoPath,
//     //     // children?: CryptoKeypath;
//     //     parentFingerprint: Buffer.from(key.parentFingerprint.substring(2), "hex"),
//     //     name: "testKey",
//     //     note: "testtest"
//     // })
//     // try public key
//     let components = handlePath(defaultPath)
//     let cryptoPath = new CryptoKeypath(components, Buffer.from(key.parentFingerprint.substring(2), "hex"), key.depth)
//     let childrenCryptoPath = new CryptoKeypath(defaultChildPath)
//     let cryptoHD = new CryptoHDKey({
//         isMaster: false,
//         isPrivateKey: false,
//         key: Buffer.from(key.publicKey.substring(2), "hex"),
//         chainCode: Buffer.from(key.chainCode.substring(2), "hex"),
//         // useInfo?: CryptoCoinInfo;
//         origin: cryptoPath,
//         children: childrenCryptoPath,
//         parentFingerprint: Buffer.from(key.parentFingerprint.substring(2), "hex"),
//         name: "testKey",
//         note: "testtest"
//     })


//     console.log(cryptoHD.getOutputDescriptorContent())

//     let cbor = cryptoHD.toCBOR()
//     console.log(cbor)

//     const ur = cryptoHD.toUREncoder(1000).nextPart();
//     console.log(ur);
//     QRCode.toString(ur,{type:'terminal'}, function (err, url) {
//         console.log(url)
//     })


//     // test, get child address.
//     for (let index = 0; index < 10; index++) {
//         const path = `m/8/9/6/4/${index}`
//         let child = key.derivePath(path)
//         console.log(child.address)
//     }
// }

// // function fromPrivateKey(key) {
// //     const signingKey = new SigningKey(key);
// //     const chaincode = "0x95a12bab6941abf2ec84c3673201fd690d28dc2bb22a0e378147b3d4d4518adc"
// //     return new HDNodeWallet({}, signingKey, "0x00000000", chaincode,
// //         "m", 0, 0, null, null);
// // }

// function handlePath(path) {
//     let items = path.split('/')
//     // ignore first.
//     return items.slice(1).map(item => {
//         let lastCharacter = item.charAt(item.length - 1)
//         if (lastCharacter == "'") {
//             let index = parseInt(item)
//             return new PathComponent({
//                 index: index,
//                 hardened: true
//             })
//         } else {
//             let index = parseInt(item)
//             return new PathComponent({
//                 index: index,
//                 hardened: false
//             })
//         }
//     })
// }

// // function toDataItem() {
// //     const map: DataItemMap = {};
// //     const components: (number | boolean | any[])[] = [];
// //     this.components &&
// //       this.components.forEach((component) => {
// //         if (component.isWildcard()) {
// //           components.push([]);
// //         } else {
// //           components.push(component.getIndex() as number);
// //         }
// //         components.push(component.isHardened());
// //       });
// //     map[Keys.components] = components;
// //     if (this.sourceFingerprint) {
// //       map[Keys.source_fingerprint] = this.sourceFingerprint.readUInt32BE(0);
// //     }
// //     if (this.depth !== undefined) {
// //       map[Keys.depth] = this.depth;
// //     }
// //     return new DataItem(map);
// //   };

// // "m/44'/60'/0'/0/0"
// // public getPath = () => {
// //     if (this.components.length === 0) {
// //       return undefined;
// //     }

// //     const components = this.components.map((component) => {
// //       return `${component.isWildcard() ? '*' : component.getIndex()}${
// //         component.isHardened() ? "'" : ''
// //       }`;
// //     });
// //     return components.join('/');
// //   };


// // sign Transaction.
// // get private key . 


// function signTransaction() {
//     console.log("hello world")
//     // TODO change to 89/6/4 
//     // 8/9/6/4/*
//     const defaultChildPath = [
//         new PathComponent({index: 8,hardened: false}),
//         new PathComponent({index: 9,hardened: false}),
//         new PathComponent({index: 6,hardened: false}),
//         new PathComponent({index: 4,hardened: false}),
//         new PathComponent({hardened: false})
//     ]

//     //private key: 0x839300d27b176ed0baa2f56b53eb2f83dcbb1c97a044eb828f518524f8328e07
//     // address:  0x40fDF02dF1BD7104441b17B2c629c2D339daB655
//     let root = HDNodeWallet.fromExtendedKey('xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf')
    
//     // // test, get child address.
//     // for (let index = 0; index < 10; index++) {
//     //     const path = `m/8/9/6/4/${index}`
//     //     let child = key.derivePath(path)
//     //     console.log(child.address)
//     // }
//     let key = root.derivePath(`m/8/9/6/4/0`)
//     console.log(key.address)

//     // const signRequestQRString = ""
//     // const expectedUR = ""
    

    

//     //test case, bsc, 1. normal transaction
//     // https://bscscan.com/tx/0xfcb53a7829dbde7398447b3361c40680dfd4614074d31548165314a1c8b87ae6
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/OLADTPDAGDLGHKGRSSKGRPGLKBLEMDMNPEWTZSKILRAOHDDKVLAOLRPRTIHYAELFGMAYMWDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSLALAETLALAAXADAACSETAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSLAKTSEBW"
//     // const expectedUR = "ur:eth-signature/oeadtpdagdlghkgrsskgrpglkblemdmnpewtzskilraohdfpnnineshhesbkenhlpfzcloftynmyeedkamnswniyoeaopyuytpnstbflzclggynsfefzktemdyuotpbgntesyadidpmklucmlfpsgyiarhamuegeiniendkpioianlwkmwgyeosbee"
    

//     // test case, bsc, 2. contract transaction
//     // data: 0x095ea7b300000000000000000000000068365496f9e655c772bc45f600229683102f369b0000000000000000000000000000000000000000000000000de0b6b3a7640000
//     // https://bscscan.com/tx/0xdd5599659a7cb3e2bba7700a1c2b9a797973f08310d900dd47764555bbe45463
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/OLADTPDAGDLEBWFXHFJSGHGAGAOESOFPKNDTMHCARDAOHDIMYAISAXLRPRTIHYAELFPSEYMWWLVDTOOTUEUOONMKFLLARDZTHKNDTBNYUTAYKIHFLAROFYASHYOSQDAEAEAEAEAEAEAEAEAEAEAEAEISENGHMTYTVAGOSTJPRFFEYNAECPMTLSBEDLENNDAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEBTVTRPQDOSIEAEAEETLALAAXADAACSETAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSBBKNSEVE"
        
//     // const expectedUR = "ur:eth-signature/oeadtpdagdlebwfxhfjsghgagaoesofpkndtmhcardaohdfpgurlpkbsahztihjsvdcywnmhpyvtjkatuerfcpmopanstihdlezelohysegucpskcponlkytlskpfpptcfhgdelrjownuyfgctjochssvllsveidgycfhytdfzsrolhgmweybtosyl"
    

//     // test case, bsc,  3. personal sign message
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/ONADTPDAGDRDGRGABWBBYLFDFDPMMWTBBTPMLPMKJKAOHDCTFEKSHSJNJOJZIHCXHNJOIHJPJKJLJTHSJZHEJKINIOJTHNCXJNIHJKJKHSIOIHAXAXAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSDMCKLABN"
    
//     // const expectedUR = "ur:eth-signature/oeadtpdagdrdgrgabwbbylfdfdpmmwtbbtpmlpmkjkaohdfpeoathpjlzcfwplbbvlzmolkppmrhsefyolpmclhkmoyttsbzemnnhtcsdmttkbkehfamcydnlbfxbtjynnwtolmuskcypdgwaobefmrlhlmyltwdkichbwwkieetvlfycwfldnguwn"


//     // test case, bsc, 4, typed data.
//     // const signRequestQRString = "ur:eth-sign-request/onadtpdagdstiojlkosnbzgwpmoertvsvtgtwkrhjyaohkaxnykgcpiejljnhsinjtcpftkgcpiaishsinjtgaiecpftcpecencpdwcpjthsjnihcpftcpfejyisihjpcxgthsinjzcpdwcpkoihjpiniykkinjtiofxjljtjyjphsiajycpftcpdyksfxiafxfxiaiaiaiafxfxfxfxiafxfxfxfxfxfxiafxiafxiaiafxiafxfxfxiafxiaiaiaiaiaiaiafxcpdwcpkoihjpjkinjljtcpftcpehcpkidwcpjnihjkjkhsioihcpftkgcpiajljtjyihjtjyjkcpftcpfdihjzjzjldwcxfwjlidclcpdwcpiyjpjljncpftkgcpjthsjnihcpftcpfxjlktcpdwcpkthsjzjzihjyjkcpfthpcpdyksfxfyeyhseoieesfgeseoetfeeheofxfyeseeemfeiadyecfpidfxemfgfeemeoeefyiyetfyfyeteyencpdwcpdyksfyihhsfyidihihiyiefefpieidihihiyiefehsieidfefefgieihhsieidihfefgiefehsfyidihihfgcphlkidwcpjyjlcpfthpkgcpjthsjnihcpftcpfwjlidcpdwcpkthsjzjzihjyjkcpfthpcpdyksidfwidfwfwfwfwididfwfwfwidididfwididfwididididfwfwidfwididididfwidfwididfwfwidfwcpdwcpdyksfwdyfwiehsfwihhsecemfwdyfwfyfpfwihfpecemiddyidiefpfwfefpecemiddyfwfyhsidfehsecemcpdwcpdyksfwdyfwdyiddyiddyiddyiddyfwdydydydydydydydydydydydydydydydydydydydydydydydydydydycphlkihlkidwcpjojpinjnhsjpkkghkkjoihcpftcpgthsinjzcpdwcpjykkjoihjkcpftkgcpfegagdemeheyfyjljnhsinjtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkoihjpjkinjljtcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpiaishsinjtgaiecpdwcpjykkjoihcpftcpkpinjtjyeyecencpkidwkgcpjthsjnihcpftcpkoihjpiniykkinjtiofxjljtjyjphsiajycpdwcpjykkjoihcpftcphsieiejpihjkjkcpkihldwcpfljpjlkpjocpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpjnihjnidihjpjkcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkihldwcpgthsinjzcpfthpkgcpjthsjnihcpftcpiyjpjljncpdwcpjykkjoihcpftcpgdihjpjkjljtcpkidwkgcpjthsjnihcpftcpjyjlcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkidwkgcpjthsjnihcpftcpiajljtjyihjtjyjkcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkihldwcpgdihjpjkjljtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkthsjzjzihjyjkcpdwcpjykkjoihcpftcphsieiejpihjkjkhphlcpkihlkikiaxaoahtaaddyoeadmwcsdwykcsfnykaeykaewkaewkaywkaswkamwkaawkaewkaocycpflgooxamghdrswprgojsbwtalohlhlgulgpaiehdmhnehfoygsrdgtoszc"
    
//     // const expectedUR = "ur:eth-signature/oeadtpdagdstiojlkosnbzgwpmoertvsvtgtwkrhjyaohdfpcpfmfrolieotgwhywmaeethgprprlgbbbtvobetkmocxlfbgckuyrlrockhefmrdgubzonlnytzcbgvedmuebbwzrobwgridmkrdjkeyolrfsebkplmkzofnasehctsecendcndkhe"




//     // ETH:

//     // 1. normal eth transfer
//     // https://etherscan.io/tx/0x5320801effbecd5d48464f0b64ca782849feab66101e606f7e9031e795b17397
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/OLADTPDAGDTNRORYYLWSFNFWUELSMUZSCADEGRFWECAOHDDRAOVSADLALRAHNYGULALPAXKBBYTBAELFGMAYMWISENGHMTYTVAGOSTJPRFFEYNAECPMTLSBEDLENNDLALARTAXAAAAADAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSJTOXPTSR"
//     // const expectedUR = "ur:eth-signature/oeadtpdagdtnroryylwsfnfwuelsmuzscadegrfwecaohdfpzcrlbdtkcfrfasvauocniytowkfgtbselgkemolpgwnsnejytamhihdsimpkfwtoetuecnktspqztnolntvddehylpclheynksgagoaxgufdcskbtprkrhjthndebypfadptaeckcl"


//     // 2. normal contract transaction
//     // https://etherscan.io/tx/0x8f7aa0755b0451eaf6befc022ac8eb68bba4fe564868a234648022246bede9d3
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/OLADTPDAGDKBKIJOBBWZNBFXPYQDBWCAECJEAAGUVAAOHDJOAOYAJNADADLRAHYKVYAELPAXYKFLIMAELFRYNLMWTNSELBMDLGDMVWCNOECXIDAMNLFEMSSEFSLSCKSTLAROFYASHYOSQDAEAEAEAEAEAEAEAEAEAEAEAEMKOYHLYKBWUYNDHSSEFWVWNYTIYABTMSSSLUCAFNAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEFSASAEAERTAXAAAAADAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSOTPYFTPL"
//     // const expectedUR = "ur:eth-signature/oeadtpdagdkbkijobbwznbfxpyqdbwcaecjeaaguvaaohdfpbgrhkstkbsgadtwprslnwywnkepdolimvedeztsgvweeyakoprhkyaktwfueidmnbbdrvlpladrpskgdqzlgrecezmltwdmuzopfcwfzidzehtkghngejzhymutaaxftadpamwynqd"

//     // 3. sign message
//     // const signRequestQRString = "UR:ETH-SIGN-REQUEST/ONADTPDAGDCTBEHGKPCSINGRGALDCAIOENESWDIDEHAOHDCTFEKSHSJNJOJZIHCXHNJOIHJPJKJLJTHSJZHEJKINIOJTHNCXJNIHJKJKHSIOIHAXAXAHTAADDYOEADMWCSDWYKCSFNYKAEYKAEWKAEWKAYWKASWKAMWKAAWKAEWKAOCYCPFLGOOXAMGHDRSWPRGOJSBWTALOHLHLGULGPAIEHDMHNEHFOYGSROBGVEIO"
//     // const expectedUR = "ur:eth-signature/oeadtpdagdctbehgkpcsingrgaldcaioeneswdidehaohdfpeoathpjlzcfwplbbvlzmolkppmrhsefyolpmclhkmoyttsbzemnnhtcsdmttkbkehfamcydnlbfxbtjynnwtolmuskcypdgwaobefmrlhlmyltwdkichbwwkieetvlfycwjslawklt"

//     // 4. typed data
//     const signRequestQRString = "ur:eth-sign-request/onadtpdagdmwpypkzcktwygwswluecdlhfloaehphgaohkaxnlkgcpiejljnhsinjtcpftkgcpiaishsinjtgaiecpftcpehcpdwcpjthsjnihcpftcpfejyisihjpcxgthsinjzcpdwcpkoihjpiniykkinjtiofxjljtjyjphsiajycpftcpdyksfxiafxfxiaiaiaiafxfxfxfxiafxfxfxfxfxfxiafxiafxiaiafxiafxfxfxiafxiaiaiaiaiaiaiafxcpdwcpkoihjpjkinjljtcpftcpehcpkidwcpjnihjkjkhsioihcpftkgcpiajljtjyihjtjyjkcpftcpfdihjzjzjldwcxfwjlidclcpdwcpiyjpjljncpftkgcpjthsjnihcpftcpfxjlktcpdwcpkthsjzjzihjyjkcpfthpcpdyksfxfyeyhseoieesfgeseoetfeeheofxfyeseeemfeiadyecfpidfxemfgfeemeoeefyiyetfyfyeteyencpdwcpdyksfyihhsfyidihihiyiefefpieidihihiyiefehsieidfefefgieihhsieidihfefgiefehsfyidihihfgcphlkidwcpjyjlcpfthpkgcpjthsjnihcpftcpfwjlidcpdwcpkthsjzjzihjyjkcpfthpcpdyksidfwidfwfwfwfwididfwfwfwidididfwididfwididididfwfwidfwididididfwidfwididfwfwidfwcpdwcpdyksfwdyfwiehsfwihhsecemfwdyfwfyfpfwihfpecemiddyidiefpfwfefpecemiddyfwfyhsidfehsecemcpdwcpdyksfwdyfwdyiddyiddyiddyiddyfwdydydydydydydydydydydydydydydydydydydydydydydydydydydycphlkihlkidwcpjojpinjnhsjpkkghkkjoihcpftcpgthsinjzcpdwcpjykkjoihjkcpftkgcpfegagdemeheyfyjljnhsinjtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkoihjpjkinjljtcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpiaishsinjtgaiecpdwcpjykkjoihcpftcpkpinjtjyeyecencpkidwkgcpjthsjnihcpftcpkoihjpiniykkinjtiofxjljtjyjphsiajycpdwcpjykkjoihcpftcphsieiejpihjkjkcpkihldwcpfljpjlkpjocpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpjnihjnidihjpjkcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkihldwcpgthsinjzcpfthpkgcpjthsjnihcpftcpiyjpjljncpdwcpjykkjoihcpftcpgdihjpjkjljtcpkidwkgcpjthsjnihcpftcpjyjlcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkidwkgcpjthsjnihcpftcpiajljtjyihjtjyjkcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkihldwcpgdihjpjkjljtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkthsjzjzihjyjkcpdwcpjykkjoihcpftcphsieiejpihjkjkhphlcpkihlkikiaxaoahtaaddyoeadmwcsdwykcsfnykaeykaewkaewkaywkaswkamwkaawkaewkaocycpflgooxamghdrswprgojsbwtalohlhlgulgpaiehdmhnehfoygspsmhuogo"
//     const expectedUR = "ur:eth-signature/oeadtpdagdmwpypkzcktwygwswluecdlhfloaehphgaohdfpkifraaadayyngdtdmwfhcylyuylomnutbeaezslydrfezsstetcwtdztjzzckbmnammuatylcmvslobgiepdtdpfcmmhhndlenztvetanlldvezerhuowerkcwbzvactcweyrkmdeo"

//     // Pollygon


//     const decoder = new URRegistryDecoder();
//     // // const ur = "ur:crypto-hdkey/otaxhdclaxpsfswtmnsknejlceuogoqdaelbmhwnptlrecwpeehhfnpsfzbauecatleotsheptaahdcxvsbbhlrpdivdmelovygscttbstjpnllpasmtcaecmyvswpwftssffxrkcabsmdcxamtaaddyoeadlaaocylpgrstlfiewtseje";
//     decoder.receivePart(signRequestQRString);
//     // const cryptoHDKey = decoder.resultRegistryType() as CryptoHDKey;
//     // console.log(cryptoHDKey.getBip32Key())
//     if (decoder.isSuccess()) {
//         const ur = decoder.resultUR();
//         console.log(ur.type)


//         const signRequest = EthSignRequest.fromCBOR(ur.cbor)
//         // console.log(signRequest)
//         // getRequestId: () => Buffer | undefined;
//         // getSignData: () => Buffer;
//         // getDataType: () => DataType;
//         // getChainId: () => number | undefined;
//         // getDerivationPath: () => string;
//         // getSourceFingerprint: () => Buffer;
//         // getSignRequestAddress: () => Buffer | undefined;
//         // getOrigin: () => string | undefined;
//         // toDataItem: () => DataItem;
//         console.log(signRequest.getSignRequestAddress())
//         if (signRequest.getSignRequestAddress()) {
//             console.log(toHexString(signRequest.getSignRequestAddress()))
//         }
        
//         // console.log(signRequest.getOrigin())
//         console.log(signRequest.getRequestId())

//         // export declare enum DataType {
//     // transaction = 1,
//     // typedData = 2,
//     // personalMessage = 3,
//     // typedTransaction = 4
//         console.log(signRequest.getDataType())

//         // signdatat
//         console.log(toHexString(signRequest.getSignData()))

//         let common
//         // getChainId
//         let chainID = signRequest.getChainId()
//         console.log(`chain id : ${chainID}`)
//         if (chainID == 1) {
//             common = new Common({chain: Chain.Mainnet})
//         } else if (chainID == 56) {
//             // bsc 
//             // the problem maybe: keystone kering try to use EIP155 instead of Non EIP 155 in the metamask.
//             common = Common.custom({
//                 name: "BSC",
//                 chainId: 56,
//                 networkId: 56,
//                 hardfork: Hardfork.London
//             })

//             let supportEIP155 = common.gteHardfork('spuriousDragon')
//             console.log("supportEIP155 : ", supportEIP155)
//         } else if (chainID !== undefined) {
//             console.log("not support chain id :", chainID)
//             common = Common.custom({
//                 name: "Custom Chain",
//                 chainId: chainID,
//                 networkId: chainID,
//                 hardfork: Hardfork.London
//             })
//         } else {
//             // undefined
//             console.log("undefined chain id")
//             // use default eth:
//             common = new Common({chain: Chain.Mainnet})
//         }


//         let rsv
//         if (signRequest.getDataType() == DataType.transaction) {

//             const values = arrToBufArr(RLP.decode(signRequest.getSignData()))

//             if (!Array.isArray(values)) {
//             throw new Error('Invalid serialized tx input. Must be array')
//             }
//             const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = values
//             let txData = {nonce, gasPrice,gasLimit,to, value, data}
//             // TODO test v r s in ETH. but not eth is using EIP1559.
//             // TODO support to import solidity or abi to get the function name and params.
            
//             const parsedTxData = {
//                 nonce: bufferToInt(txData.nonce),
//                 gasPrice: bufferToBigInt(txData.gasPrice), 
//                 gasLimit: bufferToBigInt(txData.gasLimit), 
//                 to: bufferToHex(txData.to),
//                 value: bufferToBigInt(txData.value),
//                 data: bufferToHex(txData.data)
//             }
//             console.log(parsedTxData)
//             const unsignedTx = new Transaction(txData, {common})
//             // let tx = Transaction.fromSerializedTx(signRequest.getSignData(), {common})

//             // console.log(`v: ${tx.v}`)
//             // console.log(`this. signed: ${tx.isSigned()}`)
//             console.log(`this.support EIP155 ${unsignedTx.supports(Capability.EIP155ReplayProtection)}`)
      
//             let signed = unsignedTx.sign(Buffer.from(key.privateKey.substring(2), "hex"))
//             // console.log(signed)
//             // console.log(`signed.support EIP155 ${signed.supports(Capability.EIP155ReplayProtection)}`)

//             // let rsv = r + s + v
//             rsv = Buffer.concat([bigIntToUnpaddedBuffer(signed.r),bigIntToUnpaddedBuffer(signed.s),bigIntToUnpaddedBuffer(signed.v)])

//         } else if (signRequest.getDataType() == DataType.personalMessage) {
//             let hexSig = personalSign({
//                 privateKey: Buffer.from(key.privateKey.substring(2), "hex"),
//                 // data is hex message 
//                 data: signRequest.getSignData()
//             })
//             console.log(`hexSig :  ${hexSig}`)
//             rsv = Buffer.from(hexSig.substring(2), "hex")
//         } else if (signRequest.getDataType() == DataType.typedData) {
//             let data = JSON.parse(signRequest.getSignData().toString())
//             console.log(data)
//             // TODO bug, can't find the version. opts
//             // const versionTODO = SignTypedDataVersion.V4
//             const versionTODO = SignTypedDataVersion.V4
//             const privateKey = Buffer.from(key.privateKey.substring(2), "hex")

//             let hexSig = signTypedData({
//                 privateKey,
//                 data,
//                 version: versionTODO
//             })
//             console.log(`hexSig :  ${hexSig}`)
//             rsv = Buffer.from(hexSig.substring(2), "hex")
//         } else if (signRequest.getDataType() == DataType.typedTransaction) {
//             let unsignedTx = FeeMarketEIP1559Transaction.fromSerializedTx(signRequest.getSignData(), {common})
//             // todo parse data:
//             // {
//             //     chainId: '0x1',
//             //     nonce: '0x0',
//             //     maxPriorityFeePerGas: '0x59a5380',
//             //     maxFeePerGas: '0x37e11d600',
//             //     gasLimit: '0x5208',
//             //     to: '0x68365496f9e655c772bc45f600229683102f369b',
//             //     value: '0x0',
//             //     data: '0x',
//             //     accessList: [],
//             //     v: undefined,
//             //     r: undefined,
//             //     s: undefined
//             //   }
//             console.log(unsignedTx.toJSON())
//             let signed = unsignedTx.sign(Buffer.from(key.privateKey.substring(2), "hex"))
//             rsv = Buffer.concat([bigIntToUnpaddedBuffer(signed.r),bigIntToUnpaddedBuffer(signed.s),bigIntToUnpaddedBuffer(signed.v)])
//         } else {
//             console.log(" TODO not implemented!!!")    
//             return
//         }

//         let signature = new ETHSignature(rsv, signRequest.getRequestId(), signRequest.getOrigin())

//         let cbor = signature.toCBOR()
//         console.log(cbor)

//         const nur = signature.toUREncoder(1000).nextPart();
//         console.log(nur);

//         console.log(`expectedUR == ur : ${expectedUR == nur}`)
//         QRCode.toString(nur,{type:'terminal'}, function (err, url) {
//             console.log(url)
//         })
//     } else {
//         console.log("something wrong")
//     }


// }

// const toHexString = (bytes) => {
//     return "0x" + Array.from(bytes, (byte) => {
//       return ('0' + (byte & 0xff).toString(16)).slice(-2);
//     }).join('');
//   };

// // main()
// signTransaction()