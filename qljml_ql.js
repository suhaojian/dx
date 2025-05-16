const originalLog = console.log;
console.log = function (...args) {
    const date = new Date();
    const timestamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-') + ' ' + [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0')
    ].join(':');
    originalLog(`[${timestamp}] ${args.map(String).join(' ')}`);
};
const tool = require('./tools/tool.js')
const getCookie = require('./tools/index.js')
const axios = require('axios').default
const fs = require('fs')
const JSEncrypt = require('node-jsencrypt');
let pubKey = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBkLT15ThVgz6/NOl6s8GNPofdWzWbCkWnkaAm7O2LjkM1H7dMvzkiqdxU02jamGRHLX/ZNMCXHnPcW/sDhiFCBN18qFvy8g6VYb9QtroI09e176s+ZCtiv7hbin2cCTj99iUpnEloZm19lwHyo69u5UMiPMpq0/XKBO8lYhN/gwIDAQAB`
const decrypt = new JSEncrypt(); // 创建加密对象实例
decrypt.setPrivateKey(pubKey)

let userPhone=[]
if (process?.env?.dx) {
    process?.env?.dx.split('\n').map(item => {
        if (item) {
            let phone = item.split('#')[0]
            let password = item.split('#')[1]
            userPhone.push({ phone, password })
        }
    })
} else {
    return console.log('未找到环境变量，请设置环境变量dx')
    return
}

let initialCookie = {}
let jml_tokenFlag = ''
let CacheRunJs = 'Cache.js'
let Cache = {}
let ChacePath = 'Cache.json'
let chinaTelecomAccount = []
let filePath='./tools/rwCookie.js'
let ruishuConetnt
try {
    ruishuConetnt = fs.readFileSync('ruisu.js', 'utf8');
} catch (error) {
    console.error('Error reading the file:', error);
    return
}


// if (process?.env?.dx) {
//     chinaTelecomAccount = process.env.dx.split('\n')
// } else {
//     console.log('请在环境变量中添加----dx')
//     return
// }

async function loginPhone(phone, password) {
    try{
        let timestamp = tool.TIMEstamp()
        let rdmstr = tool.randomString(16)
        // console.log(rdmstr, rdmstr.substring(0, 13));
    
        let encrypttext = decrypt.encrypt(`iPhone 14 15.4.${rdmstr.substring(0, 12)}${phone}${timestamp}${password}0$$$0.`)
        // console.log(encrypttext);
        let strphone = ''
        for (let a of phone) {
            if (a <= 7) {
                strphone += String(Number(a) + 2)
            } else {
                if (a == 8) {
                    strphone += ':'
                } else if (a == 9) {
                    strphone += ';'
                }
            }
        }
        let data = {
            "headerInfos": {
                "code": "userLoginNormal",
                "timestamp": timestamp,
                "broadAccount": "",
                "broadToken": "",
                "clientType": "#9.6.1#channel50#iPhone 14 Pro Max#",
                "shopId": "20002",
                "source": "110003",
                "sourcePassword": "Sid98s",
                "token": "",
                "userLoginName": phone
            },
            "content": {
                "attach": "test",
                "fieldData": {
                    "loginType": "4",
                    "accountType": "",
                    "loginAuthCipherAsymmertric": encrypttext,
                    "deviceUid": rdmstr,
                    "phoneNum": strphone,
                    "isChinatelecom": "0",
                    "systemVersion": "15.4.0",
                    "authentication": password
                }
            }
        }
        // console.log(data);
        if (!Cache[phone]) {
            let options = {
                url: 'https://appgologin.189.cn:9031/login/client/userLoginNormal',
                method: 'POST',
                data: data
            }
            let res = await axios(options)
            // console.log(res.data);
            // console.log(options);
            Cache[phone] = {
                ...res.data.responseData.data.loginSuccessResult
            }
        } else {
        }
    
        // console.log(res.data.responseData);
        // return
        let userInfo = {
            ...Cache[phone]
        }
        fs.writeFileSync('./Cache.json', JSON.stringify(Cache), 'utf8')
        let userToken = Cache[phone].token
        let userId = Cache[phone].userId
        timestamp = tool.TIMEstamp()
        data = `<Request>
                                <HeaderInfos>
                                    <Code>getSingle</Code>
                                    <Timestamp>${timestamp}</Timestamp>
                                    <BroadAccount></BroadAccount>
                                    <BroadToken></BroadToken>
                                    <ClientType>#9.6.1#channel50#iPhone 14 Pro Max#</ClientType>
                                    <ShopId>20002</ShopId>
                                    <Source>110003</Source>
                                    <SourcePassword>Sid98s</SourcePassword>
                                    <Token>${userToken}</Token>
                                    <UserLoginName>${phone}</UserLoginName>
                                </HeaderInfos>
                                <Content>
                                    <Attach>test</Attach>
                                    <FieldData>
                                        <TargetId>${tool.encrypt_req('1234567`90koiuyhgtfrdewsaqaqsqde', '', userId)}</TargetId>
                                        <Url>4a6862274835b451</Url>
                                    </FieldData>
                                </Content>
                    </Request>`
        options = {
            url: `https://appgologin.189.cn:9031/map/clientXML`,
            method: 'post',
            data,
            'headers': {
                'Content-Type': 'application/xml;charset=utf-8'
            }
        }
        let titckRes = await axios(options)
        // console.log(titckRes.data);
        if (String(titckRes.data).includes('过期') || String(titckRes.data).includes('校验错误')) {
            timestamp = tool.TIMEstamp()
            rdmstr = tool.randomString(16)
            // console.log(rdmstr, rdmstr.substring(0, 13));
    
            encrypttext = decrypt.encrypt(`iPhone 14 15.4.${rdmstr.substring(0, 12)}${phone}${timestamp}${password}0$$$0.`)
            // console.log(encrypttext);
            strphone = ''
            for (let a of phone) {
                if (a <= 7) {
                    strphone += String(Number(a) + 2)
                } else {
                    if (a == 8) {
                        strphone += ':'
                    } else if (a == 9) {
                        strphone += ';'
                    }
                }
            }
            data = {
                "headerInfos": {
                    "code": "userLoginNormal",
                    "timestamp": timestamp,
                    "broadAccount": "",
                    "broadToken": "",
                    "clientType": "#9.6.1#channel50#iPhone 14 Pro Max#",
                    "shopId": "20002",
                    "source": "110003",
                    "sourcePassword": "Sid98s",
                    "token": "",
                    "userLoginName": phone
                },
                "content": {
                    "attach": "test",
                    "fieldData": {
                        "loginType": "4",
                        "accountType": "",
                        "loginAuthCipherAsymmertric": encrypttext,
                        "deviceUid": rdmstr,
                        "phoneNum": strphone,
                        "isChinatelecom": "0",
                        "systemVersion": "15.4.0",
                        "authentication": password
                    }
                }
            }
            options = {
                url: 'https://appgologin.189.cn:9031/login/client/userLoginNormal',
                method: 'POST',
                data: data
            }
            res = await axios(options)
            // console.log(res.data);
            Cache[phone] = {
                ...res.data.responseData.data.loginSuccessResult
            }
            fs.writeFileSync('./Cache.json', JSON.stringify(Cache), 'utf8')
            return await loginPhone(phone, password)
        }
        let tickettext = titckRes.data.split('<Ticket>')[1].split('</Ticket>')[0]
        let uid = tool.decrypt_req('1234567`90koiuyhgtfrdewsaqaqsqde', '', tickettext)
        // console.log(uid,'uid');
        userInfo.uid = uid
        userInfo.password = password
        userInfo.phoneNbr = phone
        return userInfo
    }catch(e){
        return false
    }
}
function initCookie(url = 'https://wapact.189.cn:9001/gateway/standExchange/detailNew/exchange') {
    return new Promise((resolve, reject) => {
        axios.post(url).then(res => {
        }).catch(async (err) => {
            try {
                let htmls = String(err.response.data)
                let cookie = err.response.headers['set-cookie'][0].split(';')[0] + ';'
                let cfarr = htmls.split(' content="')[2].split('" r=')
                let content = 'content="' + cfarr[0] + '"'
                let newContent = ruishuConetnt.replace('content="content_code"', content)
                let code1 = htmls.split('$_ts=window')[1].split('</script><script type="text/javascript"')[0]
                let code1Content = '$_ts=window' + code1
                let Url = htmls.split('$_ts.lcd();</script><script type="text/javascript" charset="utf-8" src="')[1].split('" r=')[0]
                const parsedUrl = new URL(url);
                let downloadUrl = parsedUrl.origin + Url
                // let fileData=(await axios.get(downloadUrl)).data
                fs.access(CacheRunJs, fs.constants.F_OK, async (err) => {
                    let CacheRunData = ''
                    if (err) {
                        // 文件不存在，从远程下载
                        console.log('文件不存在，从远程下载');

                        CacheRunData = await downloadFile(downloadUrl, CacheRunJs);
                    } else {
                        // 文件存在，读取文件内容
                        CacheRunData = fs.readFileSync(CacheRunJs, 'utf8');

                    }
                    newContent = newContent + code1Content + CacheRunData + " return document.cookie.split(';')[0]"
                    const RefreshCookie = new Function(newContent);
                    // console.log(cookie, RefreshCookie);
                    resolve({
                        cookie,
                        RefreshCookie
                    })
                });
            } catch (err) {
                initCookie()
            }
        })
    })
}

function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        // 下载文件并写入到本地
        axios({
            method: 'GET',
            url,
        }).then(response => {
            // console.log(response.data);
            try {
                // 写入文件
                fs.writeFileSync(filePath, response.data, 'utf8');

            } catch (error) {
                console.error('写入文件时出错：', error);
            }
            resolve(response.data)
        }).catch(error => {
            console.error('下载文件时出错：', error);
        });
    })
}


//每月见面礼
async function month_jml_preCost(userinfo) {
    try {

        let options = {
            url: 'https://wappark.189.cn/jt-sign/ssoHomLoginCommon?ticket=' + userinfo.uid,
            method: 'get',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "User-Agent": "CtClient;11.3.0;Android;14;2106118C;MDIwMjM5!#!MTgyMjg",
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(filePath),
            },
        };
        let res = await axios(options);
       
            
            await month_jml_getInfo();
            await month_jml_check(res.data);
            await month_jml_receiveInfo(res.data);
            await month_jml_lottery_receiveInfo(res.data)
            await month_jml_receive(res.data);
            // await month_jml_addVideoCount(res.data);
            await month_jml_getCount(res.data);
            await month_jml_refresh(res.data);
        // }
    } catch (e) {
        console.log(e.message);
    }
}

async function month_jml_check(userinfo) {
    try {
        let data={
            "phone": userinfo.accId,
        }
        let options = {
            url: 'https://wappark.189.cn/jt-sign/welfare/check',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(res.data);
        jml_tokenFlag=res.data.data.flag
    } catch (e) {
        console.log(e.message);
    }
}

async function month_jml_getInfo() {
    try {
        let data={
            "configCode": "nxflb",
        }
        let options = {
            url: 'https://wappark.189.cn/jt-sign/welfare/getInfo',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log('month_jml_getInfo:',JSON.stringify(res.data));
        if (res.data.resoultCode == '0') {
            console.log(`见面礼${res.data.resoultMsg}: [${res.data.data.map(item => item.title)}]`)
        }
    } catch (e) {
        console.log('month_jml_getInfo:',e.message);
    }
}

async function month_jml_receiveInfo(userinfo) {
    try {
        let data={
            "phone": userinfo.accId,
        }
        let options = {
            url: 'https://wappark.189.cn/jt-sign/welfare/receiveInfo',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(res.data);
        if (res.data.resoultCode == '0') {
            console.log(`见面礼${res.data.resoultMsg}: [${res.data.data.map(item => item.prizeName)}]`)
        }
    } catch (e) {
        console.log(e.message);
    }
}

async function month_jml_lottery_receiveInfo(userinfo) {
    try {
        let data = {
            "phone": userinfo.accId
        };
        let options = {
            url: 'https://wappark.189.cn/jt-sign/lottery/receiveInfo',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "User-Agent": "CtClient;11.3.0;Android;14;2106118C;MDIwMjM5!#!MTgyMjg",
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(JSON.stringify(res.data));
        if (res.data.code == '0') {
            console.log('查询活动规则成功')
        } else {
            console.log(`查询活动规则失败: ${res.data.msg}`)
        }
    } catch (e) {
        console.log('month_jml_lottery_receiveInfo',e.message);
    }
}

async function month_jml_receive(userinfo) {
    try {
        let data = {
            "phone": userinfo.accId,
            "flag": jml_tokenFlag
        };
        let options = {
            // url: 'https://wappark.189.cn/jt-sign/welfare/receive',
            url: 'https://wappark.189.cn/jt-sign/lottery/receive',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "User-Agent": "CtClient;11.3.0;Android;14;2106118C;MDIwMjM5!#!MTgyMjg",
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(JSON.stringify(res.data));
        if (res.data.code == '0') {
            console.log('领取APP抽奖次数成功')
        } else {
            console.log(`领取APP抽奖次数失败: ${res.data.msg}`)
        }
    } catch (e) {
        console.log(e.message);
    }
}
async function month_jml_getCount(userinfo) {
    let yearMonths = [202201, 202202, 202203]
    try {
        let data = {
            "phone": userinfo.accId,
            flag: jml_tokenFlag,
        };
        let options = {
            url: 'https://wappark.189.cn/jt-sign/lottery/getCount',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(res.data);
        // console.log(JSON.stringify(res.data, null, 2));
        if (res.data.code == '0') {
            let videoTypes = res.data.video.map(item => item.videoType) || [],
                remainingVideoTypes = yearMonths.filter(num => !videoTypes.includes(num)),
                isFirstRequest = false;
            for (let videoType of remainingVideoTypes) {
                if (isFirstRequest) {
                    let randomWaitTime = Math.floor(Math.random() * 5000) + 5000;
                    await tool.waitt(randomWaitTime);
                }
                await month_jml_addVideoCount(userinfo,videoType)
                isFirstRequest = true;
            }
        } else {
            console.log(`查询看视频得抽奖机会次数失败: ${JSON.stringify(res.data)}`)
        }
    } catch (err) {
        console.log(`month_jml_getCount: ${err}`);
    }
}

async function month_jml_addVideoCount(userinfo,videoType) {
    try {
        let data = {
            "phone": userinfo.accId,
            videoType: videoType,
            flag: jml_tokenFlag,
        };
        let options = {
            url: 'https://wappark.189.cn/jt-sign/lottery/addVideoCount',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        if (res.data.code == '0') {
            console.log(`看视频${videoType}得抽奖机会成功`)
        } else {
            console.log(`看视频${videoType}得抽奖次数失败: ${res.data.msg}`)
        }
    } catch (err) {
        console.log(`month_jml_addVideoCount: ${err}`);
    }
}

async function month_jml_refresh(userinfo) {
    try {
        let data = {
            "phone": userinfo.accId,
            flag: jml_tokenFlag,
        };
        let options = {
            url: 'https://wappark.189.cn/jt-sign/lottery/refresh',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(res.data);
        if (res.data.rNumber) {
            let remainingCount = res.data.rNumber || 0;
            console.log("可以抽奖" + remainingCount + "次");
            let isFirstRequest = false;
            while (remainingCount-- > 0) {
                if (isFirstRequest) {
                    let randomWaitTime = Math.floor(Math.random() * 5000) + 5000;
                    await tool.waitt(randomWaitTime);
                }
                await month_jml_lotteryRevice(userinfo);
                isFirstRequest = true;
            }
        } else {
            console.log(`查询抽奖次数失败`)
        }
    } catch (err) {
        console.log(`month_jml_refresh: ${err}`);
    }
}

async function month_jml_lotteryRevice(userinfo) {
    try {
        let data = {
            "phone": userinfo.accId,
            flag: jml_tokenFlag,
        };
        let options = {
            url: 'https://wappark.189.cn/jt-sign/lottery/lotteryRevice',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Cookie: initialCookie.cookie + await getCookie.RefreshCookie(),
            },
            data: {
                para: tool.encrypt_rsa_hex(data)
            }
        };
        let res = await axios(options);
        // console.log(res.data);
        if (res.data.code == '0') {
            console.log(`每月见面礼抽奖: ${res.data.rname}`)
        } else {
            console.log(`每月见面礼抽奖失败: ${res.data.msg}`)
        }
    } catch (err) {
        console.log(`month_jml_lotteryRevice: ${err}`);
    }
}



let ruishuurl = 'https://wappark.189.cn/gateway/standExchange/detailNew/exchange'

async function main(phone, passwdord) {
    initialCookie = await getCookie.initCookie(ruishuurl,filePath)
    let res = await loginPhone(phone, passwdord)
    if (!res) return
    await month_jml_preCost(res)
    await tool.waitt(2000)
}

async function begin() {
    try {
        Cache = JSON.parse(fs.readFileSync(ChacePath, 'utf8'));
    } catch (error) {
        fs.writeFileSync(ChacePath, JSON.stringify({}), 'utf8');
        Cache = JSON.parse(fs.readFileSync(ChacePath, 'utf8'));
    }

    console.log(`共找到${userPhone.length}个账号,开始执行任务`)
    try {
        for (let index = 0; index < userPhone.length; index++) {
            let user = userPhone[index]
            console.log(`\n====== 账号[${index + 1}] ${tool.maskPhone(user.phone)} ======`)
            // if(user.uid&&user.uid.length>=14){
            //     if(!Msg[user.uid]){
            //         Msg[user.uid]=[]
            //     }
            //     Msg[user.uid].push(`\n====== 账号[${index + 1}] ${tool.maskPhone(user.phone)} ======`)
            // }
            await main(user.phone, user.password);
        }
        process.exit()
    } catch (error) {
        console.log(error);
    } finally {
        process.exit()
        // let inde=0
        // for(let key in Msg){
        //     inde++
        //     setTimeout(()=>{
        //         tool.sendMsg(Msg[key], msgtitle,appToken,key);
        //     },5000 * inde)
        // }
    }

}

begin()