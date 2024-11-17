import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js';
import { Environmenter } from './environmenter.service';
import swal from 'sweetalert2';
declare var $: any;
@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    private _isProcessing!: boolean;
    public get isProcessing(): boolean {
        return this._isProcessing;
    }
    public set isProcessing(v: boolean) {
        this._isProcessing = v;
    }

    get module_code(): string {
        return this.utilities.storage.get('mi');
    }
    private _page_title!: string;
    private _page_parent!: string;

    get page_title(): string {
        return this._page_title;
    }
    get request_id(): string {
        var rString = this.randomString(32) + "|" + this.randomString(16);
        return rString;
    }
    randomString(length: number) {
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    get page_parent(): string {
        return this._page_parent;
    }
    set page_title(value) {
        this._page_title = value;
    }

    set page_parent(value) {
        this._page_parent = value;
    }
    private _path!: string;
    get path(): string {
        return this._path;
    }
    set path(value) {
        this._path = value;
        let mi: any = {};
        if (value == "home") {
            this.page_title = '';
            this.page_parent = '';

        }
        else {
            for (var i = 0; i < this.menus.length; i++) {
                if (this.menus[i].childs !== undefined) {
                    for (var j = 0; j < this.menus[i].childs.length; j++) {
                        if (this.menus[i].childs[j].navigate_url == value) {
                            if (value == "dashboard") {
                                this.page_parent = this.menus[i].description;
                                this.page_title = '';
                                this.utilities.storage.set('mi', this.menus[i].childs[j].module_code);
                            }
                            else {
                                this.page_parent = this.menus[i].description;
                                this.page_title = this.menus[i].childs[j].description;
                                if (this.page_parent == this.page_title) {
                                    this.page_title = '';
                                }
                                if (this.menus[i].childs.length <= 1) {
                                    this.page_parent = '';
                                    this.page_title = this.menus[i].childs[j].description;
                                }
                                this.utilities.storage.set('mi', this.menus[i].childs[j].module_code);
                            }

                        }
                    }
                }
            }
        }
    }

    get menus(): any {
        return JSON.parse((this.utilities.storage.get('resource') || '[]'));
    }
    get homemenus(): any {
        return JSON.parse((this.utilities.storage.get('homepage') || '[]'));
    }
    _environment: any;
    constructor(private $http: HttpClient, private $toastr: ToastrService,
        private environment: Environmenter) {
        this._environment = environment.getGlobalEnvironment();
    }

    public config = new class {

        constructor(public global: GlobalService) {
        }

    }(this);

    public constants = new class {

        constructor(public global: GlobalService) {

        }
    }(this);



    public utilities = new class {

        constructor(public global: GlobalService) {
        }

        public storage = new class {
            constructor(public global: GlobalService) {
            }

            //The set method is use for encrypt the value.
            set(key: string, value: string) {

                var encrypted = CryptoJS.AES.encrypt(value, this.global._environment.salt);
                // this.global._environment.cacheLocation.setItem(key, encrypted.toString());
                //  localStorage.setItem(key, encrypted.toString());
                sessionStorage.setItem(key, encrypted.toString());
            }

            //The get method is use for decrypt the value.
            get(key: string) {
                //var value = this.global._environment.cacheLocation.getItem(key);
                var value = sessionStorage.getItem(key);
                if (!value)
                    return '';
                var decrypted = CryptoJS.AES.decrypt(value, this.global._environment.salt);
                return decrypted.toString(CryptoJS.enc.Utf8);
            }
            removeItem(key: string)
            {
                sessionStorage.removeItem(key);
            }
           

        }(this.global)

        public notify = new class {
            constructor(public global: GlobalService) {
            }

            success(message: string, title?: string) {
                this.global.$toastr.success(message, title);
            }
            warning(message: string, title?: string) {
                this.global.$toastr.warning(message, title);
            }
            error(message: string, title?: string) {
                this.global.$toastr.error(message, title);
            }
            info(message: string, title?: string) {
                this.global.$toastr.info(message, title);
            }
            ShowAlert(message: string, title?: string) {
                swal.fire({
                    title: message,
                    showConfirmButton: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                //  swal.fire(message);
            }
        }(this.global)

        public communicate = new class {
            constructor(public global: GlobalService) {
            }


            alert(message: string, title?: string) {
                alert(message);
            }
            confirm(message: string, title?: string, button?: string) {
                confirm(message);
            }

        }(this.global)

        ShowLoder() {
            $(".preloader").fadeIn();
        }
        HideLoder() {
            $(".preloader").fadeOut();
        }


        getUserDetail(): any {
            if (this.global.utilities.storage.get(this.global._environment[this.global._environment.rl_protocol].applicationId) != '') {
                return JSON.parse(this.global.utilities.storage.get(this.global._environment[this.global._environment.rl_protocol].applicationId)).user;
            }
        }
        getStudentDetail(): any {
            if (this.global.utilities.storage.get(this.global._environment[this.global._environment.rl_protocol].applicationId) != '') {
                return JSON.parse(this.global.utilities.storage.get(this.global._environment[this.global._environment.rl_protocol].applicationId)).student;
            }
        }
        getLanguage(): any {
            return this.global._environment.lang;
        }

        Decrypt(value: string, KEY: string, IV: string): any {
            // var KEY = "1234567890000000123456789000000A";//32 bit
            //  var IV = "1234567890000000";//16 bits
            var key = CryptoJS.enc.Utf8.parse(KEY);
            var iv = CryptoJS.enc.Utf8.parse(IV);
            var encryptedHexStr = CryptoJS.enc.Hex.parse(value);
            var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            var decrypt = CryptoJS.AES.decrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();


        }

        Encrypt(str: string, KEY: string, IV: string) {

            var key = CryptoJS.enc.Utf8.parse(KEY);
            var iv = CryptoJS.enc.Utf8.parse(IV);
            var encrypted: any;
            var srcs = CryptoJS.enc.Utf8.parse(str);
            encrypted = CryptoJS.AES.encrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.ciphertext.toString();
        }

        isValidEmail(email: string): boolean {
            let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(email);
          }

    }(this);

    public ServiceManager = new class {

        constructor(public global: GlobalService) {

        }
        public request = new class {

            constructor(public global: GlobalService) {

            }

            get(endpoint: string): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-get-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.get(api, httpOptions)
            }


            GetReport(report: string): Observable<any> {
                // return this.http.get(`${ConfigurationConstants.BASEAPIURLForCarrier}api/download/${report}`, { responseType: 'blob',observe: 'response' });

                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-get-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                    }

                    ),

                };

                let api = `${this.global._environment.base}/${report}`;

                return this.global.$http.get(api, { responseType: 'blob', observe: 'response', headers: { con: this.global._environment.con } })

            }

            getwithpayload(endpoint: string, payload: any): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-get-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.get(api, httpOptions)
            }
            post(endpoint: string, payload: any): Observable<any> {
                var request_id = this.global.request_id;
                var payload_new = this.global.utilities.Encrypt(JSON.stringify(payload), request_id.split('|')[0], request_id.split('|')[1])
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-post-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                        // 'request_id': request_id
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.post(api, payload, httpOptions);
            }
            postWithoutEncryption(endpoint: string, payload: any): Observable<any> {
                var request_id = this.global.request_id;

                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-post-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'request_id': request_id,
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.post(api, payload, httpOptions);
            }




            postWithoutEncryptionEmail(endpoint: string, payload: any): Observable<any> {
                var request_id = this.global.request_id;

                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-post-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'request_id': request_id,
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.post(api, payload, httpOptions);
            }
            postbyEndPoint(endpoint: string, payload: any): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-post-request',
                        'Content-Type': 'application/json',
                        'm': 'Question',
                        'con': this.global._environment.con
                    })
                };

                return this.global.$http.post(endpoint, JSON.stringify(payload), httpOptions);
            }


            postwithpromise(endpoint: string, payload: any): Promise<any> {
                this.global.isProcessing = true;
                let promise = new Promise((resolve, reject) => {
                    var httpOptions = {
                        headers: new HttpHeaders({
                            'scope-header': 'x-post-request',
                            'Content-Type': 'application/json',
                            'm': this.global.module_code || '',
                            'con': this.global._environment.con
                        })
                    };
                    let api = `${this.global._environment.base}/${endpoint}`;
                    return this.global.$http.post(api, JSON.stringify(payload), httpOptions).subscribe((res: any) => {
                        this.global.isProcessing = false;
                        resolve(res);
                    }, (resError: any) => {
                        this.global.isProcessing = false;
                        resolve(resError);
                    });
                })
                return promise;
            }
            put(endpoint: string, payload: any): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-put-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.put(api, JSON.stringify(payload), httpOptions)
            }

            delete(endpoint: string): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'scope-header': 'x-delete-request',
                        'Content-Type': 'application/json',
                        'm': this.global.module_code || '',
                        'con': this.global._environment.con
                    })
                };
                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.delete(api, httpOptions)
            }

            upload(endpoint: string, fileToUpload: File, fileName?: string): Observable<any> {
                var httpOptions = {
                    headers: new HttpHeaders({
                        'm': this.global.module_code || '',
                        'fileName': fileName || '',
                        'con': this.global._environment.con,
                        'container': 'kps142024'
                    })
                };
                const formData: FormData = new FormData();
                formData.append('fileKey', fileToUpload, fileToUpload.name);

                let api = `${this.global._environment.base}/${endpoint}`;
                return this.global.$http.post(api, formData, httpOptions)
            }

        }(this.global);

        requestGet(endpoint: string) {
            let httpOptions = {
                headers: new HttpHeaders({
                    'scope-header': 'x-auth-request',
                    'Content-Type': 'application/json',
                    'm': this.global.module_code
                })
            };
            let promise = new Promise((resolve, reject) => {
                let api = `${this.global._environment.base}/${endpoint}`;
                this.global.$http.get(api, httpOptions)
                    .toPromise()
                    .then(
                        res => {
                            resolve(res);
                        },
                        msg => {
                            reject(msg);
                        }
                    );
            });
            return promise;
        }

        requestPost(endpoint: string, payload: any) {
            let httpOptions = {
                headers: new HttpHeaders({
                    'scope-header': 'x-auth-request',
                    'Content-Type': 'application/json',
                    'm': this.global.module_code
                })
            };
            // let promise = new Promise((resolve, reject) => {
            //     let api = `${this.global._environment.base}/${endpoint}`;
            //     this.global.$http.post(api, JSON.stringify(payload), httpOptions)

            //         .then(
            //             res => {
            //                 resolve(res);
            //             },
            //             msg => {
            //                 reject(msg);
            //             }
            //         );
            // })
            // return promise;
            let api = `${this.global._environment.base}/${endpoint}`;
            return this.global.$http.post(api, JSON.stringify(payload), httpOptions).pipe(
                catchError(error => {
                    // console.log(error)
                    return throwError(() => new Error(JSON.stringify(error)));
                    // return  this.handleError(error, () => this.requestPost(endpoint, payload));
                }

                ));
        }

        requestPut(endpoint: string, payload: any) {
            let httpOptions = {
                headers: new HttpHeaders({
                    'scope-header': 'x-auth-request',
                    'Content-Type': 'application/json',
                    'm': this.global.module_code,
                    'con': this.global._environment.con
                })
            };
            let promise = new Promise((resolve, reject) => {
                let api = `${this.global._environment.base}/${endpoint}`;
                this.global.$http.put(api, JSON.stringify(payload), httpOptions)
                    .toPromise()
                    .then(
                        res => {
                            resolve(res);
                        },
                        msg => {
                            reject(msg);
                        }
                    );
            })
            return promise;
        }

        requestDelete(endpoint: string) {
            let httpOptions = {
                headers: new HttpHeaders({
                    'scope-header': 'x-auth-request',
                    'Content-Type': 'application/json',
                    'm': this.global.module_code,
                    'con': this.global._environment.con
                })
            };
            let promise = new Promise((resolve, reject) => {
                let api = `${this.global._environment.base}/${endpoint}`;
                this.global.$http.delete(api, httpOptions)
                    .toPromise()
                    .then(
                        res => {
                            resolve(res);
                        },
                        msg => {
                            reject(msg);
                        }
                    );
            })
            return promise;
        }

        requestUoload(endpoint: string, fileToUpload: File) {
            return this.request.upload(endpoint, fileToUpload);
        }




    }(this);
}