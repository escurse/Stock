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
            $tickerContainer.append($ticker);
        }
    };
    xhr.open('GET', 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&resultType=json&numOfRows=1000')
    xhr.send();
    $tickerContainer.innerHTML = '';
};




