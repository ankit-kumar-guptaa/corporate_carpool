import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENTER } from '../../environments/environmenter.token';

@Injectable({
  providedIn: 'root'
})
export class Environmenter {

  constructor(
    @Inject(ENVIRONMENTER) private environment: any,
  ) {}

  public getGlobalEnvironment() {
    return this.environment;
  }
}