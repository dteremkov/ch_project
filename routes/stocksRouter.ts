import { Router } from "oak";
import stocksController from "../controllers/stocksController.ts";

const router = new Router();

router.get("/prepare-database", stocksController.prepareDatabase);
router.get("/import-candles", stocksController.importCandles);
router.get("/tickers", stocksController.getTickers);
router.get("/candles/:ticker", stocksController.getCandles);
router.get("/info/:ticker", stocksController.getInfo);
router.get("/:ticker", stocksController.getStockAnalytics);

export default router;
