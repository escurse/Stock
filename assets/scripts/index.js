const $loading = document.body.querySelector(':scope > .loading');

const showLoading = () => $loading.classList.add('--visible');
const hideLoading = () => $loading.classList.remove('--visible');

const loadTickers = () => {
    const $tickerContainer = document.body.querySelector('.ticker-container')
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        hideLoading();
        if (xhr.status < 200 || xhr.status >= 300) {
            // TODO 실패 처리 로직 작성
            return;
        }
        const response = JSON.parse(xhr.responseText);
        if (response['response']['header']['resultCode'] !== '00') {
            // TODO 올바르지 않은 응답 실패 처리 로직 작성
            return;
        }
        for (const tickerObject of response['response']['body']['items']['item']) {
            const $name = document.createElement('span');
            $name.classList.add('name');
            $name.innerText = tickerObject['itmsNm'];
            const $spring = document.createElement('span');
            $spring.classList.add('spring');
            const $market = document.createElement('span');
            $market.classList.add('market');
            $market.innerText = tickerObject['mrktCtg'];
            const $code = document.createElement('span');
            $code.classList.add('code');
            $code.innerText = tickerObject['srtnCd'];
            const $ticker = document.createElement('li');
            $ticker.classList.add('ticker');
            $ticker.append($name, $spring, $market, $code);
            $ticker.dataset.code = tickerObject['srtnCd'];
            $ticker.addEventListener('click', () => {
               loadData($ticker.dataset.code.replace('A',''));
            });
            $tickerContainer.append($ticker);
        }
    };
    xhr.open('GET', 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&resultType=json&numOfRows=1000')
    xhr.send();
    $tickerContainer.innerHTML = '';
    showLoading();
};

const loadData = (code) => {
    const $table = document.body.querySelector(':scope > .table-wrapper > .table')
    const $tbody = $table.querySelector(':scope > tbody')
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        hideLoading();
        if (xhr.status < 200 || xhr.status >=300) {
            return;
        }
        const response = JSON.parse(xhr.responseText);
        if (response['response']['header']['resultCode'] !== '00') {
            return;
        }
        for (const dataObject of response['response']['body']['items']['item']) {
            const $dateTh = document.createElement('th');
            $dateTh.innerText = `${dataObject['basDt'].substring(0, 4)}-${dataObject['basDt'].substring(4, 6)}-${dataObject['basDt'].substring(6, 8)}`;
            const $openTd = document.createElement('td');
            $openTd.innerText = parseInt(dataObject['mkp']).toLocaleString();
            const $highTd = document.createElement('td');
            $highTd.innerText = parseInt(dataObject['hipr']).toLocaleString();
            const $lowTd = document.createElement('td');
            $lowTd.innerText = parseInt(dataObject['lopr']).toLocaleString();
            const $closeTd = document.createElement('td');
            $closeTd.innerText = parseInt(dataObject['clpr']).toLocaleString();
            const change = parseInt(dataObject['vs']);
            const $changeTd = document.createElement('td');
            $changeTd.innerText = (change > 0 ? '+' : '') + change.toLocaleString();
            $changeTd.classList.add('change');
            const changePct = parseFloat(dataObject['fltRt']);
            const $changePctTd = document.createElement('td');
            $changePctTd.innerText = (changePct > 0 ? '+' : '') + changePct + '%';
            $changePctTd.classList.add('change');
            const $volumeTd = document.createElement('td');
            $volumeTd.innerText = parseInt(dataObject['trqu']).toLocaleString();
            const $tradeCapTd = document.createElement('td');
            $tradeCapTd.innerText = parseInt(dataObject['trPrc']).toLocaleString();
            const $tr = document.createElement('tr');
            $tr.append($dateTh, $openTd, $highTd, $lowTd, $closeTd, $changeTd, $changePctTd, $volumeTd, $tradeCapTd);
            if (change > 0) {
                $tr.classList.add('up');
            } else if (change < 0) {
                $tr.classList.add('down');
            }
            $tbody.append($tr);
        }
        const ohlcData = []; // 주가 정보(시, 고, 저, 종가)를 담을 배열
        const volumeData = []; // 거래량을 담을 배열
        response['response']['body']['items']['item'].reverse().forEach((x) => {
            const year = parseInt(x['basDt'].substring(0, 4));
            const month = parseInt(x['basDt'].substring(4, 6)) - 1; // JS의 Date 객체가 가지는 월(月)은 0부터 11까지임으로 1을 빼준다.
            const day = parseInt(x['basDt'].substring(6, 8));
            const timestamp = new Date(year, month, day); // JS의 Date 객체를 인자없이 객체화하면 객체화하는 그 때의 날짜/시간을 가진다.
                                                                // 이것처럼 각 년, 월, 시, 분, 초 값을 임의로 할당하여 원하는 날짜/시간을 가지게 할 수 있다.
            const open = parseInt(x['mkp']);
            const high = parseInt(x['hipr']);
            const low = parseInt(x['lopr']);
            const close = parseInt(x['clpr']);
            const volume = parseInt(x['trqu']);
            ohlcData.push({
                x: timestamp.getTime(),
                y: [open, high, low, close]
            });
            volumeData.push({
                x: timestamp.getTime(),
                y: volume
            });
        });
        const ohlcChartOption = {
            series: [{
                data: ohlcData
            }],
            chart: {
                type: 'candlestick',
                height: '100%',
                id: 'ohlc',
                toolbar: {
                    autoSelected: 'pan',
                    show: true
                },
                zoom: {
                    enabled: false
                },
            },
            xaxis: {
                type: 'datetime'
            },
        };

    };
    xhr.open('GET', `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&resultType=json&numOfRows=1000&likeSrtnCd=${code}`);
    xhr.send();
    $tbody.innerHTML = '';
    showLoading();
};

loadTickers();
