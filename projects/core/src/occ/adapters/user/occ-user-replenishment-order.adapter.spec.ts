import { HttpRequest } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { REPLENISHMENT_ORDER_NORMALIZER } from '../../../checkout/connectors/replenishment-order/converters';
import { OrderHistoryList, ReplenishmentOrder } from '../../../model/index';
import { ORDER_HISTORY_NORMALIZER } from '../../../user/connectors/order/converters';
import { REPLENISHMENT_ORDER_HISTORY_NORMALIZER } from '../../../user/connectors/replenishment-order/converters';
import { ConverterService } from '../../../util/converter.service';
import { OccConfig } from '../../config/occ-config';
import { OccEndpointsService } from '../../services/occ-endpoints.service';
import {
  MockOccEndpointsService,
  mockOccModuleConfig,
} from '../user/unit-test.helper';
import { OccUserReplenishmentOrderAdapter } from './occ-user-replenishment-order.adapter';

const mockUserId = 'test-user';
const mockReplenishmentOrderCode = 'test-repl-code';

const mockReplenishmentOrder: ReplenishmentOrder = {
  active: true,
  purchaseOrderNumber: 'test-po',
  replenishmentOrderCode: 'test-repl-order',
  entries: [{ entryNumber: 0, product: { name: 'test-product' } }],
};

const mockOrderHistoryList: OrderHistoryList = {
  orders: [
    {
      code: 'test-order-code',
    },
  ],
  pagination: {},
  sorts: [],
};

describe('OccUserReplenishmentOrderAdapter', () => {
  let occAdapter: OccUserReplenishmentOrderAdapter;
  let httpMock: HttpTestingController;
  let converter: ConverterService;
  let occEndpointService: OccEndpointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccUserReplenishmentOrderAdapter,
        { provide: OccConfig, useValue: mockOccModuleConfig },
        { provide: OccEndpointsService, useClass: MockOccEndpointsService },
      ],
    });

    occAdapter = TestBed.inject(OccUserReplenishmentOrderAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    converter = TestBed.inject(ConverterService);
    occEndpointService = TestBed.inject(OccEndpointsService);

    spyOn(converter, 'pipeable').and.callThrough();
    spyOn(occEndpointService, 'getUrl').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('load', () => {
    it('should load replenishment order details', () => {
      occAdapter
        .load(mockUserId, mockReplenishmentOrderCode)
        .subscribe((data) => {
          expect(data).toEqual(mockReplenishmentOrder);
        });

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'GET' && req.url === '/replenishmentOrderDetails';
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'replenishmentOrderDetails',
        {
          userId: mockUserId,
          replenishmentOrderCode: mockReplenishmentOrderCode,
        }
      );

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockReplenishmentOrder);
    });

    it('should use converter', () => {
      occAdapter.load(mockUserId, mockReplenishmentOrderCode).subscribe();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'GET' && req.url === '/replenishmentOrderDetails'
        )
        .flush({});

      expect(converter.pipeable).toHaveBeenCalledWith(
        REPLENISHMENT_ORDER_NORMALIZER
      );
    });
  });

  describe('loadReplenishmentDetailsHistory', () => {
    it('should load replenishment order history for a specific replnishment order details', () => {
      const PAGE_SIZE = 5;
      const CURRENT_PAGE = 1;
      const SORT = 'test-sort';

      occAdapter
        .loadReplenishmentDetailsHistory(
          mockUserId,
          mockReplenishmentOrderCode,
          PAGE_SIZE,
          CURRENT_PAGE,
          SORT
        )
        .subscribe((data) => {
          expect(data).toEqual(mockOrderHistoryList);
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'GET' &&
          req.url === '/replenishmentOrderDetailsHistory'
        );
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'replenishmentOrderDetailsHistory',
        {
          userId: mockUserId,
          replenishmentOrderCode: mockReplenishmentOrderCode,
        },
        {
          pageSize: PAGE_SIZE.toString(),
          currentPage: CURRENT_PAGE.toString(),
          sort: SORT,
        }
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockOrderHistoryList);
    });

    it('should use converter', () => {
      occAdapter
        .loadReplenishmentDetailsHistory(mockUserId, mockReplenishmentOrderCode)
        .subscribe();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'GET' &&
            req.url === '/replenishmentOrderDetailsHistory'
        )
        .flush({});

      expect(converter.pipeable).toHaveBeenCalledWith(ORDER_HISTORY_NORMALIZER);
    });
  });

  describe('cancelReplenishmentOrder', () => {
    it('should cancel replenishment order details', () => {
      occAdapter
        .cancelReplenishmentOrder(mockUserId, mockReplenishmentOrderCode)
        .subscribe((data) => {
          expect(data).toEqual(mockReplenishmentOrder);
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PATCH' && req.url === '/cancelReplenishmentOrder'
        );
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'cancelReplenishmentOrder',
        {
          userId: mockUserId,
          replenishmentOrderCode: mockReplenishmentOrderCode,
        }
      );

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockReplenishmentOrder);
    });

    it('should use converter', () => {
      occAdapter
        .cancelReplenishmentOrder(mockUserId, mockReplenishmentOrderCode)
        .subscribe();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'PATCH' && req.url === '/cancelReplenishmentOrder'
        )
        .flush({});

      expect(converter.pipeable).toHaveBeenCalledWith(
        REPLENISHMENT_ORDER_NORMALIZER
      );
    });
  });

  describe('getUserReplineshmentOrders', () => {
    it('should fetch user Replineshment Orders with default options', async(() => {
      const PAGE_SIZE = 5;
      occAdapter.loadHistory(mockUserId, PAGE_SIZE).subscribe();
      httpMock.expectOne((req: HttpRequest<any>) => {
        return req.method === 'GET';
      }, `GET method and url`);
      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'replenishmentOrderHistory',
        {
          userId: mockUserId,
        },
        { pageSize: PAGE_SIZE.toString() }
      );
    }));

    it('should fetch user Replineshment Orders with defined options', async(() => {
      const PAGE_SIZE = 5;
      const currentPage = 1;
      const sort = 'byDate';

      occAdapter
        .loadHistory(mockUserId, PAGE_SIZE, currentPage, sort)
        .subscribe();
      httpMock.expectOne((req: HttpRequest<any>) => {
        return req.method === 'GET';
      }, `GET method`);
      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'replenishmentOrderHistory',
        {
          userId: mockUserId,
        },
        {
          pageSize: PAGE_SIZE.toString(),
          currentPage: currentPage.toString(),
          sort,
        }
      );
    }));

    it('should use converter', () => {
      occAdapter.loadHistory(mockUserId).subscribe();
      httpMock
        .expectOne((req: HttpRequest<any>) => {
          return req.method === 'GET';
        }, `GET method`)
        .flush({});
      expect(converter.pipeable).toHaveBeenCalledWith(
        REPLENISHMENT_ORDER_HISTORY_NORMALIZER
      );
    });
  });
});
