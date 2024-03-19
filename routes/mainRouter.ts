import { Router } from "oak";
import stocksRouter from "./stocksRouter.ts";

const mainRouter = new Router();

mainRouter.get("/", (ctx) => {
  ctx.response.type = "html";

  const fetchCreateDatabase = async function fetchCreateDatabase() {
    await fetch("/stocks/test/");
  };

  const fetchImportCandles = async function fetchImportCandles() {
    await fetch("/stocks/test/");
  };

  const fillSelect = async function fillSelect() {
    const parent = document.body;

    const response = await fetch(`/stocks/tickers/`);
    const data = await response.json();

    const selectList = document.getElementById("tickerSelect");

    selectList!.id = "tickerSelect";
    parent.appendChild(selectList!);

    data.forEach((value: string) => {
      const option = document.createElement("option");
      option.text = value;
      option.value = value;
      selectList!.appendChild(option);
    });

    await addEventListenerOnChange();
  };

  const addEventListenerOnChange = async function addEventListenerOnChange() {
    const selectList = document.getElementById("tickerSelect");
    selectList!.addEventListener("change", async function () {
      // @ts-ignore
      const selectedValue = this.value;
      console.log(selectedValue);

      window.open(`/stocks/${selectedValue}`);

      // const response = await fetch(`/stocks/${selectedValue}`);
      // const data = await response.text();
      // let newTab = window.open();
      // newTab!.document.write(data);
    });
  };

  ctx.response.body = `
		<script type="text/javascript">
			${fetchCreateDatabase};
			${fetchImportCandles};
			${fillSelect};
			${addEventListenerOnChange};
		</script>
		<button onclick="fetchCreateDatabase()" style="font-size: 18px">Создать базу данных</button>
		<br/>
		<br/>
		<button onclick="fetchImportCandles()" style="font-size: 18px">Импортировать котировки</button>
		<br/>
		<br/>
		<label for="tickerSelect" style="font-size: 22px">Провести анализ тикера:</label>
		<select name="tickers" id="tickerSelect" style="font-size: 16px"></select>
		
		<script type="text/javascript" defer>
			fillSelect()
		</script>
	`;
});

mainRouter.use("/stocks", stocksRouter.routes(), stocksRouter.allowedMethods());

export default mainRouter;
