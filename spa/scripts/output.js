// build the sitemap.xml file
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import { writeFileSync } from "node:fs";
import { SitemapStream, streamToPromise } from "sitemap";
var statusEnum;
(function(statusEnum) {
    statusEnum[statusEnum["ongoing"] = 1] = "ongoing";
    statusEnum[statusEnum["inprogress"] = 2] = "inprogress";
})(statusEnum || (statusEnum = {}));
var genres;
(function(genres) {
    genres["action"] = "action";
    genres["adventure"] = "adventure";
    genres["battleroyale"] = "battle royale";
    genres["comedy"] = "c0m1dy";
    genres["cyberpunk"] = "cyberpunk";
    genres["drama"] = "drama";
    genres["ecchi"] = "ecchi";
    genres["fantasy"] = "fantasy";
    genres["hentai"] = "hentai";
    genres["horror"] = "horror";
    genres["isekai"] = "isekai";
    genres["mafia"] = "mafia";
    genres["magic"] = "magic";
    genres["mahoushoujo"] = "mahou shoujo";
    genres["mecha"] = "mecha";
    genres["military"] = "military";
    genres["music"] = "music";
    genres["mystery"] = "mystery";
    genres["psychological"] = "psychological";
    genres["romance"] = "romance";
    genres["scifi"] = "sci-fi";
    genres["shoujo"] = "shoujo";
    genres["shounen"] = "shounen";
    genres["sliceoflife"] = "slice of life";
    genres["sport"] = "sports";
    genres["supernatural"] = "supernatural";
    genres["thriller"] = "thriller";
    genres["yuri"] = "yuri";
})(genres || (genres = {}));
function animes() {
    return _animes.apply(this, arguments);
}
function _animes() {
    _animes = _async_to_generator(function() {
        var res, json;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        fetch("https://api.gazes.fr/anime/animes")
                    ];
                case 1:
                    res = _state.sent();
                    return [
                        4,
                        res.json()
                    ];
                case 2:
                    json = _state.sent();
                    console.log(json.success);
                    return [
                        2,
                        json.data
                    ];
            }
        });
    });
    return _animes.apply(this, arguments);
}
_async_to_generator(function() {
    var animeList, siteMap, sitemap;
    return _ts_generator(this, function(_state) {
        switch(_state.label){
            case 0:
                return [
                    4,
                    animes()
                ];
            case 1:
                animeList = _state.sent();
                siteMap = new SitemapStream({
                    hostname: "https://gazes.fr"
                });
                siteMap.write({
                    url: "/",
                    changefreq: "monthly",
                    priority: 1
                });
                siteMap.write({
                    url: "/latest",
                    changefreq: "monthly",
                    priority: 1
                });
                siteMap.write({
                    url: "/search",
                    changefreq: "monthly",
                    priority: 1
                });
                if (animeList.length > 0) {
                    animeList.forEach(function(anime) {
                        siteMap.write({
                            url: "/anime/".concat(anime.id),
                            changefreq: "weekly",
                            priority: 0.8
                        });
                    });
                }
                siteMap.end();
                return [
                    4,
                    streamToPromise(siteMap).then(function(sm) {
                        return sm.toString();
                    })
                ];
            case 2:
                sitemap = _state.sent();
                writeFileSync("./public/sitemap.xml", sitemap, {
                    encoding: "utf-8",
                    flag: "w+"
                });
                console.log("sitemap.xml generated");
                return [
                    2
                ];
        }
    });
})();

