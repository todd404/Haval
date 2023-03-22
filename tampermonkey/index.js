// ==UserScript==
// @name         haval
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Todd
// @match        https://www.haval.com.cn/dealerpc/
// @icon         https://api.iowen.cn/favicon/get.php?url=haval.com.cn
// @grant        GM_xmlhttpRequest
// ==/UserScript==

let need_paras = ["address", "category", "city", "county", "hotline", "name", "province", "saleCarBrand", "saleShopLevel", "serviceHotline", "state"]

const province_selector = "#scroll-box > div > div.merchant-bosh > div.m-select.query-select.province-select > ul > li"
const city_selector = "#scroll-box > div > div.merchant-bosh > div.m-select.query-select.city-select > ul > li";
let finished_flag = false;

function waitForElementLoaded(seletor, parent_node = document.body){
    option = {
        'childList': true,
        'subtree': true
    };
    return new Promise((resolve, reject)=>{
        let mo = new MutationObserver(()=>{
            if(document.querySelectorAll(seletor).length > 0){
                resolve();
                mo.disconnect();
            }
        });
        mo.observe(parent_node, option);
    })
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function crawlerStart(){
    let provinceEles = document.querySelectorAll(province_selector);
    let i = 0;
    for(let p of provinceEles){
        p.click();
        await waitForElementLoaded(city_selector);
        console.log("city loaded");
        let cityEles = document.querySelectorAll(city_selector);
        for(let c of cityEles){
            while(!finished_flag){
                await sleep(1000);
            }
            finished_flag = false;
            c.click();
        }
    }

    await server_stop();
}

function postData(data){
    return new Promise((resolve, reject)=>{
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://localhost:3001/post",
            headers: {
                    "Content-Type": "text/plain"
            },
            data:JSON.stringify(data),
            onload: function(response){
                let res = JSON.parse(response.response)
                resolve();
            },
            onerror: function(response){
                reject();
            }
        });
    })
}

function server_stop(){
    return new Promise((resolve, reject)=>{
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://localhost:3001/stop",
            onload: function(response){
                let res = JSON.parse(response.response)
                resolve();
            },
            onerror: function(response){
                reject();
            }
        });
    })
}

async function parseRes(res){
    if(res.indexOf("serviceHotline") != -1){
        finished_flag = false;
        let res_json = JSON.parse(res);
        let result_json = {};
        for(let data of res_json.data){
            for(let p of need_paras){
                result_json[p] = data[p];
            }
            console.log(result_json);
            await postData(result_json);
        }
        finished_flag = true;
    }
}

(async function() {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            parseRes(this.responseText);
        });
        origOpen.apply(this, arguments);
    };

    await waitForElementLoaded(province_selector);
    console.log("province loaded");
    crawlerStart();

})();