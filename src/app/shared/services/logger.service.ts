import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor() {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    // if (isDevMode()) {
    //   console.log(message, ...optionalParams);
    // }
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    // console.warn(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    //console.error(message, ...optionalParams);
  }
}
