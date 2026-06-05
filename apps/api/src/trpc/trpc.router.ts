import { router } from './trpc';
import { kpiRouter } from './routers/kpi.router';
import { purchasingRouter } from './routers/purchasing.router';
import { inventoryRouter } from './routers/inventory.router';
import { warehousingRouter } from './routers/warehousing.router';
import { transportRouter } from './routers/transport.router';
import { customerServiceRouter } from './routers/customer-service.router';
import { internationalTradeRouter } from './routers/international-trade.router';

export const appRouter = router({
  kpi: kpiRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
  warehousing: warehousingRouter,
  transport: transportRouter,
  customerService: customerServiceRouter,
  internationalTrade: internationalTradeRouter,
});

export type AppRouter = typeof appRouter;
