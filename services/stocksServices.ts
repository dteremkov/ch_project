import stocksModel from "../models/stocksModel.ts";

class StocksService {
  async prepareDatabase() {
    await stocksModel.createDatabase();
  }

  async importCandles() {
    const tickers = (await stocksModel.getTickersFromUrl()).map((x) => x.secid);

    for (const ticker of tickers) {
      for (let i = 0; i <= 3000; i += 100) {
        await stocksModel.importCandles(ticker, i);
      }
    }

    console.log("Импорт котировок выполнен");
  }

  async getTickers() {
    return await stocksModel.getTickers();
  }

  async getCandles(ticker: string) {
    return await stocksModel.getCandles(ticker);
  }

  async getInfo(ticker: string) {
    const name = await stocksModel.getNames(ticker);

    const { period } = (await stocksModel.getPeriod(ticker))[0];
    const { lastPrice } = (await stocksModel.lastPrice(ticker))[0];
    const { maxPriceDate, maxPrice} = (await stocksModel.maxPrice(ticker))[0];
    const { maxPositiveChangeDate, maxPositiveChange } = (await stocksModel.maxPositiveChange(ticker))[0];
    const { maxVolumeDate, maxVolume } = (await stocksModel.maxVolume(ticker))[0];

    return [
      { label: "Наименование: ", value: name },
      { label: "Период роста в неделях: ", value: period },
      { label: "Последняя цена: ", value: lastPrice },
      { label: "Дата максимальной цены: ", value: maxPriceDate },
      { label: "Максимальная цена: ", value: maxPrice },
      { label: "Дата максимального роста: ", value: maxPositiveChangeDate },
      { label: "Максимальный рост, %: ", value: maxPositiveChange },
      { label: "Дата максимального объема: ", value: maxVolumeDate },
      { label: "Максимальный объем, руб.: ", value: maxVolume },
    ];
  }
}

export default new StocksService();
