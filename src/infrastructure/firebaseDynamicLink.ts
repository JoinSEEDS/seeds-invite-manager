import fetch from 'node-fetch';

const walletDomainUriPrefix = 'https://seedswallet.page.link';
const inviteLinkBase = 'https://joinseeds.com/?placeholder=&inviteMnemonic=';
const androidPacakageName = 'com.joinseeds.seedswallet';
const iosBundleId = 'com.joinseeds.seedslight';
const iosAppStoreId = '1507143650';

export async function getFirebaseDynamicLink(secret: string): Promise<any> {
    const response = await fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=' + process.env.FIREBASE_API_KEY, {
        method: 'post',
        body: JSON.stringify({
            "dynamicLinkInfo": {
              "domainUriPrefix": walletDomainUriPrefix,
              "link": inviteLinkBase + secret,
              "androidInfo": {
                "androidPackageName": androidPacakageName
              },
              "iosInfo": {
                "iosBundleId": iosBundleId,
                "iosAppStoreId": iosAppStoreId
              }
            },
            "suffix": {
              "option": "UNGUESSABLE"
            }
          }),
        headers: {'Content-Type': 'application/json'}
    });

    return response.json();
}