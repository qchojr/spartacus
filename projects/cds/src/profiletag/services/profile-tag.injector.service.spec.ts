import { TestBed } from '@angular/core/testing';
import { Cart, OrderEntry } from '@spartacus/core';
import { BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import { CdsBackendConnector } from '../connectors/cds-backend-connector';
import { ProfileTagLifecycle } from '../model/profile-tag-lifecycle';
import {
  CartChangedPushEvent,
  ConsentChangedPushEvent,
  NavigatedPushEvent,
  ProfileTagEvent,
} from '../model/profile-tag.model';
import { ProfileTagLifecycleService } from './profile-tag-lifecycle.service';
import { ProfileTagPushEventsService } from './profile-tag-push-events.service';
import { ProfileTagInjectorService } from './profile-tag.injector.service';
import { ProfileTagEventService } from './profiletag-event.service';

describe('ProfileTagInjector', () => {
  let postBehaviour: Subject<boolean>;
  let profileTagInjector: ProfileTagInjectorService;
  let addTrackerBehavior: Subject<Event>;
  let profileTagEventTrackerMock: ProfileTagEventService;
  let cartBehavior: Subject<{ cart: Cart }>;
  let consentBehavior: Subject<ConsentChangedPushEvent>;
  let navigatedBehavior: Subject<boolean>;
  let profileTagPushEventsServiceMock: ProfileTagPushEventsService;
  let profileTagLifecycleServiceMock: ProfileTagLifecycleService;
  let cdsBackendConnectorMock: CdsBackendConnector;
  let pushEvents: Subject<ProfileTagEvent>;
  function setVariables() {
    cartBehavior = new ReplaySubject<{ cart: Cart }>();
    consentBehavior = new ReplaySubject<ConsentChangedPushEvent>();
    navigatedBehavior = new ReplaySubject<boolean>();
    addTrackerBehavior = new ReplaySubject<Event>();
    postBehaviour = new ReplaySubject<boolean>();
    pushEvents = new ReplaySubject<ProfileTagEvent>();
    cdsBackendConnectorMock = <CdsBackendConnector>(<any>{
      notifySuccessfulLogin: jasmine
        .createSpy('cdsBackendConnectorMock')
        .and.returnValue(new BehaviorSubject(true)),
    });
    profileTagLifecycleServiceMock = <ProfileTagLifecycleService>(<unknown>{
      consentGranted: jasmine
        .createSpy('consentGranted')
        .and.callFake(() => consentBehavior),
      navigated: jasmine
        .createSpy('navigated')
        .and.callFake(() => navigatedBehavior),
      loginSuccessful: jasmine
        .createSpy('loginSuccessful')
        .and.callFake((_) => postBehaviour),
    });
    profileTagPushEventsServiceMock = <ProfileTagPushEventsService>(<unknown>{
      cartChanged: jasmine
        .createSpy('cartChanged')
        .and.callFake((_) => cartBehavior),
      getPushEvents: jasmine
        .createSpy('getPushEvents')
        .and.callFake((_) => pushEvents),
    });
    profileTagEventTrackerMock = <ProfileTagEventService>(<unknown>{
      addTracker: jasmine
        .createSpy('addTracker')
        .and.callFake(() => addTrackerBehavior),
      notifyProfileTagOfEventOccurence: jasmine.createSpy(
        'notifyProfileTagOfEventOccurence'
      ),
      getProfileTagEvents: jasmine
        .createSpy('getProfileTagEvents')
        .and.callFake(() => of()),
    });
  }
  beforeEach(() => {
    setVariables();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProfileTagEventService,
          useValue: profileTagEventTrackerMock,
        },
        {
          provide: ProfileTagPushEventsService,
          useValue: profileTagPushEventsServiceMock,
        },
        {
          provide: CdsBackendConnector,
          useValue: cdsBackendConnectorMock,
        },
        {
          provide: ProfileTagLifecycle,
          useValue: profileTagLifecycleServiceMock,
        },
      ],
    });
    profileTagInjector = TestBed.inject(ProfileTagInjectorService);
  });

  it('Should be created', () => {
    expect(profileTagInjector).toBeTruthy();
    expect(profileTagPushEventsServiceMock).toBeTruthy();
  });

  it('Should notify profile tag of consent granted', () => {
    const subscription = profileTagInjector.track().subscribe();
    addTrackerBehavior.next(new CustomEvent('test'));
    consentBehavior.next(new ConsentChangedPushEvent(true));

    subscription.unsubscribe();
    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalledTimes(1);

    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalledWith(new ConsentChangedPushEvent(true));
  });

  it('Should notify profile tag of when push events happen', () => {
    const subscription = profileTagInjector.track().subscribe();
    const cartEntry: OrderEntry[] = [{ entryNumber: 7 }];
    const testCart = <Cart>{ testCart: { id: 123, entries: cartEntry } };
    addTrackerBehavior.next(new CustomEvent('test'));
    pushEvents.next(new CartChangedPushEvent({ cart: testCart }));
    subscription.unsubscribe();
    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalled();
    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalledWith(new CartChangedPushEvent({ cart: testCart }));
  });

  it('Should notify profile tag of page loaded', () => {
    const subscription = profileTagInjector.track().subscribe();
    addTrackerBehavior.next(new CustomEvent('test'));
    navigatedBehavior.next(true);
    subscription.unsubscribe();
    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalled();
    expect(
      profileTagEventTrackerMock.notifyProfileTagOfEventOccurence
    ).toHaveBeenCalledWith(new NavigatedPushEvent());
  });

  it('Should notify profile tag of successful login', () => {
    const subscription = profileTagInjector.track().subscribe();
    addTrackerBehavior.next(new CustomEvent('test'));
    postBehaviour.next(true);
    subscription.unsubscribe();
    expect(cdsBackendConnectorMock.notifySuccessfulLogin).toHaveBeenCalled();
  });
});
