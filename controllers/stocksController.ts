import { Context, type RouterContext } from "oak";
import stocksService from "../services/stocksServices.ts";
import { renderFileToString } from "ejs";

class StocksController {
  async prepareDatabase() {
    await stocksService.prepareDatabase();
  }

  async importCandles(ctx: RouterContext<"/import-candles">) {
    await stocksService.importCandles();
    ctx.response.body = "";
  }

  async getTickers(ctx: RouterContext<"/tickers">) {
    ctx.response.body = (await stocksService.getTickers()).map((x) => x.secid);
  }

  async getCandles(ctx: RouterContext<"/candles/:ticker">) {
    const { ticker } = ctx.params;

    ctx.response.body = await stocksService.getCandles(ticker);
  }

  async getStockAnalytics(ctx: RouterContext<"/:ticker">) {
    const { ticker } = ctx.params;

    ctx.response.body = await renderView("analytics", {
      tickers: [ticker],
    });
  }

  async getInfo(ctx: RouterContext<"/info/:ticker">) {
    const { ticker } = ctx.params;

    ctx.response.body = await stocksService.getInfo(ticker);
  }
}

const renderView = (view: string, params: object = {}) => {
  return renderFileToString(`${Deno.cwd()}/views/${view}.ejs`, params);
};

export default new StocksController();
