/* eslint-disable */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { chunk } = require("lodash");
const axios = require("axios").default;
const spawn = require("child_process").spawn;
const execSync = require("child_process").execSync;
const iconv = require('iconv-lite');

var encoding = 'cp936';
var binaryEncoding = 'binary';

// 在 axios 请求时，选择性忽略 SSL
const agent = new https.Agent({ rejectUnauthorized: false });


function getExhPath(id) {
    return new Promise((resolve, reject) => {
        let child = spawn("wmic", [
            "process",
            "where",
            "processid=" + id,
            "get",
            "executablepath",
        ]);
        let out = "";
        child.stdout.on("data", (data) => {
            out += data.toString();
        });

        child.on("close", (code) => {
            let splits = out.split("\r");
            splits = splits
                .map((item) => {
                    item = item.replace(/\n/g, "");
                    item = item.trim();
                    return item;
                })
                .filter((item) => item);
            resolve(splits[1]);
        });
    });
}

let lolbody = {
    customGameLobby: {
        configuration: {
            gameMode: "PRACTICETOOL",
            gameMutator: "",
            gameServerRegion: "",
            mapId: 11,
            mutators: { id: 4 },
            spectatorPolicy: "AllAllowed",
            teamSize: 5,
        },
        lobbyName: "Name",
        lobbyPassword: "",
    },
    isCustom: true,
};
module.exports = class {
    constructor() {
            this.exePath = null;
            this.prot = null;
            this.token = null;
            this.protocol = null;
            this.baseUrl = null;
            this.userinfo = null;
        }
        /**
         * 获取游戏根目录
         */
    async getExePath() {
            // 获取英雄联盟进程ID
            let process_info;
            try {
                process_info = execSync('tasklist|findstr "LeagueClient.exe"', {encoding: binaryEncoding})
            } catch (err) { throw Error('英雄联盟客户端未启动') }
            process_info = iconv.decode(Buffer.from(process_info.toString(), binaryEncoding), encoding)
            console.log('process_infoprocess_infoprocess_infoprocess_info::', process_info)
            process_info = process_info.toString().split('\r\n')[0]
            console.log(process_info)
            let process_id = process_info.split(' ').filter(item => item)[1]

            // 通过ID 获取游戏路径
            let exePath = await getExhPath(process_id)
            this.exePath = exePath
            console.log('exePathexePath', exePath)
            return exePath
        }
        /**
         * 获取运行变量
         */
    readLockfile(_exePath) {
        if (_exePath) this.exePath = _exePath
        let exePath = this.exePath
            // 读取lockfile文件
        let lockfile = fs.readFileSync(path.join(path.dirname(exePath), "lockfile"));
        // 解析lockfile内容
        let lolinfo = lockfile.toString().split(":");

        // 辅助给对象
        this.prot = lolinfo[2];
        this.token = lolinfo[3];
        this.protocol = lolinfo[4];
        this.baseUrl = `${lolinfo[4]}://riot:${lolinfo[3]}@127.0.0.1:${lolinfo[2]}`;
        // https://riot:3SC52VXremFJrxI8iqdUkA@127.0.0.1:58667
        console.log('this.baseUrl', this.baseUrl)
        return { prot: this.prot }
    }

    /**
     * 初始化
     */
    async init() {
        await this.getExePath();

        // 读取lockfile 文件
        this.readLockfile()

        // 初始化完成

        // // 获取召唤师信息
        // await this.getUserInfo();

        // // 获取好友列表
        // let friends = await this.getFriends();

        // return {
        //   prot: this.prot,
        //   userinfo: this.userinfo,
        //   friends,
        // };
    }
    async getMapInfo(id) {
        // /lol-game-queues/v1/game-type-config/5061/map/11
        // /lol-game-queues/v1/game-type-config/{gameTypeConfigId}
        // let data = await this.getUrl('/lol-game-queues/v1/game-type-config/' + id)
        // let data = await this.getUrl('/lol-lobby/v1/parties/gamemode')
        let data = await this.getUrl("/lol-maps/v2/map/11/PRACTICETOOL");
        return data;
    }
    async getFriends() {
            let friends = await this.getUrl("/lol-chat/v1/friends");
            let friends_list = friends.map((item) => {
                let data = {};
                data.name = item.name;
                data.displayName = item.gameName;
                data.statusMessage = item.statusMessage;
                data.summonerId = item.summonerId;
                data.info = item;

                if (item.availability === "chat") data.availability = 1; // 在线状态
                else if (item.availability === "dnd") data.availability = 2; // 游戏中或其他不能邀请状态
                else if (item.availability === "away") data.availability = 3; // 离开
                else if (item.availability === "mobile") data.availability = 5; // 手机在线
                else data.availability = 4; //离线

                return data;
            });
            friends_list = friends_list.sort((a, b) => {
                if (a.availability == b.availability) {
                    return a.displayName.charCodeAt(0) - b.displayName.charCodeAt(0);
                } else {
                    return a.availability - b.availability;
                }
            });

            return friends_list;
        }
        /**
         * 获取召唤师信息
         */
    async getUserInfo() {
        this.userinfo = await this.getUrl("/lol-summoner/v1/current-summoner");
        return this.userinfo
    }
    async gameStats() {
            let result
            try {
                result = await axios
                    .get('https://127.0.0.1:2999/liveclientdata/gamestats', { httpsAgent: agent })
                    .catch((err) => {
                        throw Error(err.response.data.message);
                    });
                result = result.data;
            } catch (err) {
                result = err
            }
            return result
        }
        /**
         * 创建房间
         * @param {*} name 房间名称
         * @param {*} type 房间模式  1 自选模式  4随机模式  6 BAN模式
         * @returns
         */
    async createRoom(name, type) {
        lolbody.customGameLobby.lobbyName = name;
        lolbody.customGameLobby.configuration.mutators.id = type;
        //  {"queueId": 430}
        let lobbyinfo = await this.postUrl('/lol-lobby/v2/lobby', lolbody).catch(error => {
            console.log('**********', error.response.data)
        })
        return lobbyinfo;
        // /lol-lobby/v2/play-again
    }
    async deleteRoom() {
            let result = await this.delUrl('/lol-lobby/v2/lobby')
            return result;
        }
        /**
         * 删除房间玩家
         * @param {*} summonerInternalName 
         */
    async delRoomUser(summonerID) {
            // ​/lol-lobby​/v1​/lobby​/custom​/bots​/{summonerInternalName}
            // let result = await this.delUrl('/lol-lobby/v1/lobby/custom/bots/' + summonerInternalName)
            // let url = '/lol-lobby/v2​/lobby/members/' + summonerID + '/kick'
            let url = '/lol-lobby/v2/lobby/members/' + summonerID + '/kick'
            console.log(url)
            let result = await this.postUrl(url)
            return result
        }
        /**
         * 
         * @returns 
         */
    async startGame() {
            // await connection.request('POST', '/lol-lobby/v1/lobby/custom/start-champ-select')
            let result = await this.postUrl("/lol-lobby/v1/lobby/custom/start-champ-select");
            return result
        }
        /**
         * 获取好友列表
         */
    async getFriendList() {
        let friends = await this.getUrl("/lol-game-client-chat/v1/buddies");
        let summoners = this.nameTosummoners(friends);
        return summoners;
    }
    async getUserGroups() {
        let friends = await this.getUrl("/lol-chat/v1/friend-groups");
        return friends
    }
    async getRoomInfo() {
        // ​/lol-lobby​/v2​/lobby
        let roomInfo
        try {
            roomInfo = await this.getUrl("/lol-lobby/v2/lobby");
        } catch (err) {
            roomInfo = null
        }
        return roomInfo
    }
    async inviteSummonersName(name) {
            await this.postUrl("/lol-lobby/v2/lobby/invitations", [{
                state: "Requested",
                toSummonerName: name,
            }, ]);
        }
        /**
         * 邀请召唤师进入房间
         * @param {*} summonerId 召唤师ID 可以为数组和字符串
         */
    async inviteSummoners(summonerId) {
        if (typeof summonerId == "number") {
            summonerId = [summonerId];
        }
        let data = summonerId.map((item) => {
            return { toSummonerId: item };
        });
        await this.postUrl("/lol-lobby/v2/lobby/invitations", data);
    }
    async summonerByName(name) {
            // /tft/summoner/v1/summoners/by-name/{summonerName}
            console.log("/lol/summoner/v3/summoners/by-name/" + name)
            let summoner = await this.getUrl("/lol-summoner/v3/summoners/by-name/" + name);
            return summoner
        }
        /**
         * 通过名称获取召唤师信息
         * @param {*} names 名称的数组
         */
    async nameTosummoners(names) {
            let summoners = await new Promise((resolve, reject) => {
                let subNames = chunk(names, 10); // 把名称数组截取成10个每段
                let list = [],
                    index = 0;
                subNames.forEach(async(item) => {
                    let summonerList = await this.postUrl(
                        "/lol-summoner/v2/summoners/names",
                        item
                    );
                    list.push(...summonerList);
                    index += 1;
                    if (index >= subNames.length) resolve(list);
                });
            });
            return summoners;
        }
        /**
         * 请求
         * @param {*} data 
         */
    async api(data) {
            // console.log('aaaaaaaaaaaaaaaaaaaaaaaaa   ', this.baseUrl)
            let result
            if (data.type === 'post') {
                result = await this.postUrl(data.url, data.data)
            } else if (data.type === 'del') {
                result = await axios.delete(this.baseUrl + data.url, { httpsAgent: agent })
                    .catch((err) => {
                        throw Error(err.response.data.message);
                    });
                result = result.data
            } else if (data.type === 'put') {
                result = await axios.put(this.baseUrl + data.url, data.data || {}, { httpsAgent: agent })
                    .catch((err) => {
                        throw Error(err.response.data.message);
                    });
                result = result.data
            } else {
                result = await axios.get(this.baseUrl + data.url, { httpsAgent: agent })
                    .catch((err) => {
                        throw Error(err.response.data.message);
                    });
                result = result.data
            }
            return result
        }
        /**
         * get请求封装
         * @param {*} url 请求地址
         * @returns
         */
    async getUrl(url) {
            let result = await axios
                .get(this.baseUrl + url, { httpsAgent: agent })
                .catch((err) => {
                    throw Error(err.response.data.message);
                });
            return result.data;
        }
        /**
         * del请求封装
         * @param {*} url 请求地址
         * @returns
         */
    async delUrl(url) {
            console.log(this.baseUrl + url)
            let result = await axios.delete(this.baseUrl + url, { httpsAgent: agent })
            return result.data;
        }
        /**
         * post请求封装
         * @param {*} url 请求地址
         * @param {*} data 请求数据
         * @returns
         */
    async postUrl(url, data) {
        let result = await axios
            .post(this.baseUrl + url, data, { httpsAgent: agent })
            .catch((err) => {
                console.log('**********', err.response.data)
                throw Error(err.response.data.message);
            });
        return result.data;
    }
};