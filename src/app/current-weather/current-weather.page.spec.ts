import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IonicModule, LoadingController } from '@ionic/angular';
import { of } from 'rxjs';

import { CurrentWeatherPage } from './current-weather.page';
import { WeatherService, UserPreferencesService } from '@app/core';
import {
  createUserPreferencesServiceMock,
  createWeatherServiceMock,
} from '@app/core/testing';
import {
  createOverlayElementMock,
  createOverlayControllerMock,
} from '@test/mocks';

describe('CurrentWeatherPage', () => {
  let component: CurrentWeatherPage;
  let fixture: ComponentFixture<CurrentWeatherPage>;
  let loading;

  beforeEach(async(() => {
    loading = createOverlayElementMock('Loading');
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      imports: [IonicModule],
      providers: [
        {
          provide: LoadingController,
          useFactory: () =>
            createOverlayControllerMock('LoadingController', loading),
        },
        {
          provide: UserPreferencesService,
          useFactory: createUserPreferencesServiceMock,
        },
        { provide: WeatherService, useFactory: createWeatherServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentWeatherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('entering the page', () => {
    beforeEach(() => {
      const weather = TestBed.inject(WeatherService);
      (weather.current as any).and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000),
        }),
      );
    });

    ['C', 'F'].forEach(scale => {
      it(`gets the scale: ${scale}`, fakeAsync(() => {
        const userPreferences = TestBed.inject(UserPreferencesService);
        (userPreferences.getScale as any).and.returnValue(
          Promise.resolve(scale),
        );
        component.ionViewDidEnter();
        tick();
        expect(userPreferences.getScale).toHaveBeenCalledTimes(1);
        expect(component.scale).toEqual(scale);
      }));
    });

    it('displays a loading indicator', fakeAsync(() => {
      const loadingController = TestBed.inject(LoadingController);
      component.ionViewDidEnter();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loading.present).toHaveBeenCalledTimes(1);
    }));

    it('gets the current weather', fakeAsync(() => {
      const weather = TestBed.inject(WeatherService);
      component.ionViewDidEnter();
      tick();
      expect(weather.current).toHaveBeenCalledTimes(1);
    }));

    it('displays the current weather', fakeAsync(() => {
      component.ionViewDidEnter();
      tick();
      fixture.detectChanges();
      const t = fixture.debugElement.query(By.css('kws-temperature'));
      expect(t).toBeTruthy();
    }));

    it('dismisses the loading indicator', fakeAsync(() => {
      component.ionViewDidEnter();
      tick();
      expect(loading.dismiss).toHaveBeenCalledTimes(1);
    }));
  });

  describe('toggling the scale', () => {
    it('toggles from "C" to "F"', () => {
      component.scale = 'C';
      component.toggleScale();
      expect(component.scale).toEqual('F');
    });

    it('sets the preference to "F" when toggling from "C" to "F"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'C';
      component.toggleScale();
      expect(userPreferences.setScale).toHaveBeenCalledTimes(1);
      expect(userPreferences.setScale).toHaveBeenCalledWith('F');
    });

    it('toggles from "F" to "C"', () => {
      component.scale = 'F';
      component.toggleScale();
      expect(component.scale).toEqual('C');
    });

    it('sets the preference to "C" when toggling from "F" to "C"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'F';
      component.toggleScale();
      expect(userPreferences.setScale).toHaveBeenCalledTimes(1);
      expect(userPreferences.setScale).toHaveBeenCalledWith('C');
    });
  });
});
