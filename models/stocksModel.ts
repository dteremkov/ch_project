import { chProvider } from "../databases/clickhouse.ts";

class StocksModel {
  async createDatabase() {
    const createSql = `
      CREATE TABLE candles
      ENGINE = MergeTree
      ORDER BY (SECID, TRADEDATE) EMPTY AS
      SELECT *
      FROM url('https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/tqbr/securities/gazp/candles.csv?iss.only=history', CSVWithNames)
      SETTINGS 
        format_csv_delimiter = ';',
        input_format_csv_skip_first_lines = 2,
        input_format_csv_skip_trailing_empty_lines = 1,
        input_format_csv_allow_variable_number_of_columns = 1,
        schema_inference_make_columns_nullable = 0
    `;

    await chProvider.command(createSql);
  }

  async createDictionary() {
    const createSql = `
      CREATE DICTIONARY tickers (
        secid String,
        secname String
      )
      PRIMARY KEY secid
      SOURCE(CLICKHOUSE(
        host 'localhost'
        port 9000
        user 'default'
        password ''
        db 'default'
        query '
          SELECT
            arrayJoin(securities.2).\'SECID\' secid,
            arrayJoin(securities.2).\'SECNAME\' secname
          FROM
            url(\'https://iss.moex.com/iss/engines/stock/markets/shares/boards/tqbr/securities.json?iss.only=securities&iss.json=extended\')
        '
      ))
      LIFETIME(MIN 0 MAX 0)
      LAYOUT(COMPLEX_KEY_HASHED())
    `;

    await chProvider.command(createSql);
  }

  async getTickersFromUrl() {
    const selectSql = `
      SELECT
        arrayJoin(securities.2).'SECID' secid,
        arrayJoin(securities.2).'SECNAME' secname
      FROM
        url('https://iss.moex.com/iss/engines/stock/markets/shares/boards/tqbr/securities.json?iss.only=securities&iss.json=extended')
    `;

    const result = await chProvider.query(selectSql);
    const dataset: any[] = await result.json();

    return dataset;
  }

  async importCandles(ticker: string, i: number) {
    const insertIntoSql = `
      INSERT INTO candles
      SELECT *
      FROM url('https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/tqbr/securities/${ticker}/candles.csv?iss.only=history&start=${i}', CSVWithNames)
      SETTINGS 
        format_csv_delimiter = ';',
        input_format_csv_skip_first_lines = 2,
        input_format_csv_skip_trailing_empty_lines = 1,
        input_format_csv_allow_variable_number_of_columns = 1
    `;

    await chProvider.command(insertIntoSql);
  }

  async getTickers() {
    const selectSql = `
      SELECT
        secid,
        secname
      FROM
        tickers
      ORDER BY
        secid
    `;

    const result = await chProvider.query(selectSql);
    const dataset: any[] = await result.json();

    return dataset;
  }

  async getCandles(ticker: string) {
    const selectSql = `
      SELECT
        TRADEDATE time,
        OPEN "open",
        HIGH high,
        LOW low,
        CLOSE "close"
      FROM
        candles
      WHERE
        SECID = '${ticker}'
    `;

    const result = await chProvider.query(selectSql);
    const dataset: any[] = await result.json();

    return dataset;
  }

  async getNames(ticker: string) {
    const selectSql = `SELECT dictGet('tickers', 'secname', '${ticker}')`;
    const result = await chProvider.get(selectSql);
    const dataset: any = await result.text();

    return dataset;
  }

  async getPeriod(ticker: string) {
    const selectSql = `
      SELECT
        seriesPeriodDetectFFT(groupArray(c)) period
      FROM
        (
          SELECT
            toYear(TRADEDATE) y,
            toISOWeek(TRADEDATE) w,
            countIf(SECID, (((CLOSE - OPEN) / OPEN) * 100) > 0) AS c,
            bar(c, 0, 50, 50)
          FROM
            candles
          WHERE
            SECID = '${ticker}'
          GROUP BY
            y,
            w
          ORDER BY
            y,
            w
        )
    `;
    const result = await chProvider.query(selectSql);
    const dataset: any = await result.json();

    return dataset;
  }

  async lastPrice(ticker: string) {
    const selectSql = `
      SELECT
        maxArgMax(CLOSE, TRADEDATE) lastPrice
      FROM
        candles
      WHERE
        SECID = '${ticker}'
    `;
    const result = await chProvider.query(selectSql);
    const dataset: any = await result.json();

    return dataset;
  }

  async maxPrice(ticker: string) {
    const selectSql = `
      SELECT
        maxArgMax(TRADEDATE, CLOSE) maxPriceDate,
        max(CLOSE) maxPrice
      FROM
        candles
      WHERE
        SECID = '${ticker}'
    `;
    const result = await chProvider.query(selectSql);
    const dataset: any = await result.json();

    return dataset;
  }

  async maxPositiveChange(ticker: string) {
    const selectSql = `
      SELECT
        maxArgMax(TRADEDATE, (CLOSE - OPEN) * 100 / OPEN ) maxPositiveChangeDate,
        round(max((CLOSE - OPEN) * 100 / OPEN), 2) maxPositiveChange
      FROM
        candles
      WHERE
        SECID = '${ticker}'  
    `;
    const result = await chProvider.query(selectSql);
    const dataset: any = await result.json();

    return dataset;
  }

  async maxVolume(ticker: string) {
    const selectSql = `
      SELECT
        maxArgMax(TRADEDATE, VOLUME) maxVolumeDate,
        round(max(VALUE)) maxVolume
      FROM
        candles
      WHERE
        SECID = '${ticker}'  
    `;
    const result = await chProvider.query(selectSql);
    const dataset: any = await result.json();

    return dataset;
  }
}

export default new StocksModel();
