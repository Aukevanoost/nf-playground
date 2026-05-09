import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ENV, type EnvironmentConfig } from '../../env.config';
import { LOADER } from '../../core/remote-loader';
import { HomePage } from './home.page';

const env: EnvironmentConfig = {
  production: false,
  apiUrl: '',
  scope: '',
  cdnUrl: '',
};

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: ENV, useValue: env },
        { provide: LOADER, useValue: () => Promise.resolve() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(HomePage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
