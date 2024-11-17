
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: null, // Change this to the address of your backend API if different from frontend address
  loginUrl: '/login',
  name: 'Dev',
  bannerclass: 'topbanner_dev1',
  appinsightkey: '',
  base: 'https://api.carpoolindia.com/api',
  base____:'http://localhost:5000/api',
  lang: 'en-us',
  salt: '@exam@',
  con:'',
  authentication: 'security',
  support: 'support',
  front: 'portal',
  // cacheLocation: localStorage,
  zeroid: '0',
  rl_protocol: 'IN_APP',//IN_APP_AD, AZ_AD
  IN_APP: {
    applicationId: '', // Application Id of app registered under app.
    clientSecret: '', // Secret generated for app. Read this environment variable.
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
