let twemojiLoaded = false;
try {
    const twemojiScript = document.createElement('script');
    twemojiScript.src = "https://unpkg.com/twemoji@latest/dist/twemoji.min.js";
    twemojiScript.crossOrigin = "anonymous";
    document.head.appendChild(twemojiScript);
    twemojiLoaded = true;
} catch (e) {
    console.log('Failed to load twemoji for oshi marks:', e);
}

const customObjects = (() => {
    'use strict';

    /**
     * @type {string[]}
     */
    const hilightWords = [CLIENT.name];
    /**
     * @type {string[]}
     */
    const ignorePingUsers = [];
    /**
     * @type {string[]}
     */
    const ignoreImgUsers = [];

    let vrData = null; // Video Replace data

    if (!this[CHANNEL.name]) {
        this[CHANNEL.name] = {}
    }
    
    ({
        modules: {
            settings: {
                active: 1,
                rank: -1,
                url: "https://om3tcw.touhou.cafe/hollowmatsuridos/settings.js",
                done: true
            },
            playlist: {
                active: 1,
                rank: -1,
                url: "https://om3tcw.touhou.cafe/hollowmatsuridos/playlist.js",
                done: true
            },
            privmsg: {
                active: 1,
                rank: 1,
                url: "https://om3tcw.touhou.cafe/hollowmatsuridos/privmsg.js",
                done: true
            },
            notifier: {
                active: 0,
                rank: -1,
                url: "https://om3tcw.touhou.cafe/hollowmatsuridos/notifier.js",
                done: false
            },
            layout: {
                active: 0,
                rank: -1,
                url: "https://om3tcw.touhou.cafe/hollowmatsuridos/layout.js",
                done: true
            },
        },
    
        options: {
            playlist: {
                collapse: false,
                hidePlaylist: true,
                inlineBlame: true,
                moveReporting: false,
                quickQuality: false,
                recentMedia: false,
                simpleLeader: true,
                syncCheck: true,
                thumbnails: true,
                timeEstimates: true
            },
        },
        initialize: function() {
            if (CLIENT.modules) {
                return
            } else {
                CLIENT.modules = this
            }
            window[CHANNEL.name].modulesOptions = this.options;
            console.info("[XaeModule]", "Begin Loading.");
            this.index = Object.keys(this.modules);
            this.sequencerLoader()
        },
        sequencerLoader: function() {
            if (this.state.prev) {
                setTimeout(this.modules[this.state.prev].done, 0);
                this.state.prev = ""
            }
            if (this.state.pos >= this.index.length) {
                return console.info("[XaeModule]", "Loading Complete.")
            }
            var currKey = this.index[this.state.pos];
            if (this.state.pos < this.index.length) {
                if (this.modules[currKey].active) {
                    if (this.modules[currKey].rank <= CLIENT.rank) {
                        console.info("[XaeModule]", "Loading:", currKey);
                        this.state.prev = currKey;
                        this.state.pos++;
                        $.getScript(this.modules[currKey].url, this.sequencerLoader.bind(this))
                    } else {
                        if (this.modules[currKey].rank === 0 && CLIENT.rank === -1) {
                            (function(module) {
                                socket.once("login", (data => {
                                    if (data.success) {
                                        $.getScript(module.url)
                                    }
                                }))
                            })(this.modules[currKey])
                        }
                        this.state.pos++;
                        this.sequencerLoader()
                    }
                } else {
                    this.state.pos++;
                    this.sequencerLoader()
                }
            }
        },
        state: {
            prev: "",
            pos: 0
        }
    }).initialize();

    // Variables used throughout the script
    let pollAboveTabs = true;
    let calendarLocalTime = false;
    let calendarAgendaView = false;
    let chatClockEnabled = false;
    let inlineImage = true;
    let imagePreviewEnabled = true;
    let ngmi = true;
    let snowEnabled = false;
    let pollAlert = false;
    let noBullshit = false;
    let systemOshiMarks = false;

    let maxPlaylistHistory = 100;
    let filterValue = 1;
    let jltpLevel = 1;
    let noBsWidth = 100;

    let tabContainer = null;
    let tabList = null;
    let tabContent = null;

    let groomersTxt = null;
    let nijiTxt = null;

    const VIDEO_EXISTS = !!document.getElementById('videowrap');

    // Favicon
    const favicon=document.createElement('link');
    favicon.id='favicon';
    favicon.rel='shortcut icon';
    favicon.type='image/png';
    favicon.sizes='64x64';
    favicon.href='https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/Hlg_logo.png';
    document.head.appendChild(favicon);

    // Tabs
    if (VIDEO_EXISTS) {
        tabContainer = $('<div id="MainTabContainer"></div>').appendTo('#videowrap');
        tabList = $('<ul class="nav nav-tabs" role="tablist"></ul>').appendTo(tabContainer);
        tabContent = $('<div class="tab-content"></div>').appendTo(tabContainer);
        
        //Playlist Tab
        $('<div role="tabpanel" class="tab-pane active" id="playlistTab"></div>').appendTo(tabContent).append($('#rightcontrols').detach()).append($('#playlistrow').detach().removeClass('row'));
        const playlistButton = $('<li class="active" role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#playlistTab">Playlist</a></li>').appendTo(tabList);

        //whoever wants their fucking playlist dropdown back, go into your dev console and type `setOpt(CHANNEL.name + "_I_Am_A_Large_Faggot", true)` then refresh
        if(getOrDefault(CHANNEL.name + "_I_Am_A_Large_Faggot", false)) {
            $('body').append('<span id="pnl_options" style="position:absolute;display:none;left:0;top:30px;padding-top:10px;width:100%;background:rgba(0,0,0,0.5);z-index:2;"></span>');
            $('<li><a id="btn_playList" class="pointer">Playlist</a></li>').insertAfter('#settingsMenu')
                .click(function(){
                    if ($('#pnl_options').css('display')=='none'){
                        $('#rightcontrols').detach().appendTo('#pnl_options');
                        $('#playlistrow').detach().appendTo('#pnl_options');
                        $('#pnl_options').slideDown();
                    } else {
                        $('#pnl_options').slideUp();
                    }
                });
            playlistButton.on('mousedown', function(){
                $('#rightcontrols').detach().appendTo('#playlistTab');
                $('#playlistrow').detach().appendTo('#playlistTab');
            });
        }
            
        //Polls Tab
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#pollsTab">Polls <span id="pollsbadge" class="badge" style="background-color:#FFF;color:#000;"></span></a></li>')
            .appendTo(tabList).click(function(){ $('#pollsbadge').text(''); });
        $('<div role="tabpanel" class="tab-pane" id="pollsTab"><div class="col-lg-12 col-md-12" id="pollhistory"></div></div>').appendTo(tabContent).prepend($('#newpollbtn').detach());

        //Slightly edit the poll functions to make the "active poll" element above the tabs
        const base_newPoll = Callbacks.newPoll;
        var redoPollwrap = function(){
            if (pollAboveTabs) 
                $('#pollwrap').detach().insertBefore('#MainTabContainer');
            else
                $('#pollwrap').detach().insertBefore('#pollhistory');

            $('#pollwrap .well span.label.pull-right').detach().insertBefore('#pollwrap .well h3'); 
            $('#pollwrap button.close').off("click").click(function(){ 
                $('#pollwrap').detach().insertBefore('#pollhistory'); 
                if($('#pollsTab').hasClass('active') == false) {
                    var badgeTxt = $('#pollsbadge').text();
                    $('#pollsbadge').text((badgeTxt ? parseInt(badgeTxt) : 0) + 1);
                }
                window.dispatchEvent(new Event('resize'));
            });
            window.dispatchEvent(new Event('resize'));
        };
        
        /**
         * @typedef {Object} poll
         * @prop {string} title
         * @prop {string[]} options
         * 
         * @param {poll} data 
         */
        Callbacks.newPoll = function(data) {
            base_newPoll(data);
            if($('#pollsTab').hasClass('active') == false && $('#MainTabContainer #pollwrap').length === 0){
                var badgeTxt = $('#pollsbadge').text();
                var pollCnt = $('#pollwrap .well.muted').length + (badgeTxt ? parseInt(badgeTxt) : 0);
                $('#pollsbadge').text(pollCnt);
            }
            
            $('#pollwrap .well.muted').detach().prependTo('#pollhistory');
            redoPollwrap();

            const pollOptions = document.getElementById('pollwrap').getElementsByClassName('option');
            Array.from(pollOptions).forEach(opt => {
                const links = opt.getElementsByTagName('a');
                if (!links.length) {
                    return;
                }

                // Set poll text as link text, remove poll text node
                links[0].innerText = opt.childNodes[1].data;
                opt.removeChild(opt.childNodes[1]);
            });
        };
        redoPollwrap();
        
        //Vertical polls
        $('<input class="cs-checkbox" type="checkbox" id="verticalPollsCheckbox" style="float:right;">').prependTo('#pollsTab')
            .click(function(){ setOpt(CHANNEL.name + "_VERTICAL_POLLS", this.checked); });
        $('<label for="verticalPollsCheckbox" style="float:right;padding:1px 8px;">Vertical Polls</label>').prependTo('#pollsTab');
        $('#verticalPollsCheckbox').prop('checked', getOrDefault(CHANNEL.name + "_VERTICAL_POLLS", false));
    }

    // Auto-create poll for streams
    /**
     * @typedef {Object} HolodexChannel
     * @prop {string} id
     * @prop {string} name
     * @prop {string?} english_name
     * @prop {string} org
     *
     * @typedef {Object} HolodexStream
     * @prop {number} duration
     * @prop {string} topic_id
     * @prop {string} status
     * @prop {string} description
     * @prop {string} start_scheduled
     * @prop {string?} start_actual
     * @prop {string?} placeholderType
     * @prop {string?} link
     * @prop {string?} id
     * @prop {HolodexChannel} channel
     * @prop {HolodexChannel[]} mentions
     */

    class StreamData {
        /** @type {string[]} */
        channels = [];
        chanId = "";
        withinHolo = false;
        where = "";
        listed = false;
        optAdded = false;
        start = "";
        startMillis = 0;
        topic = "";
        url = "";
    }

    class ChannelStreams {
        /**
         * @type {?StreamData}
         * Main stream coming up for this channel
         */
        mainStream = null;

        /**
         * @type {StreamData[]}
         * Other streams this channel is a part of
         */
        otherStreams = [];
    }

    class ChannelStreamMap {
        /** @type {Object.<string, ChannelStreams>} */
        map = {};

        /**
         * @param {string} chanId
         * @param {StreamData} newStream
         * @param {boolean} setMain
         * @returns {boolean}
         */
        isListed(chanId, newStream, setMain) {
            let listed = false;
            if (!this.map[chanId])
                return listed;

            const mainStream = this.map[chanId].mainStream;
            listed = this.map[chanId].otherStreams.some(data => {
                if (newStream.topic !== data.topic) {
                    return false;
                }

                let startGap = newStream.startMillis - data.startMillis;
                if (startGap < 0)
                    startGap = data.startMillis - newStream.startMillis;

                if (startGap < (20*60*1000)) {
                    if (setMain && !MAIN_CHAN_IDS.includes(data.chanId) && (!mainStream || mainStream.topic === data.topic)) {
                        data.withinHolo = true
                        this.map[chanId].mainStream = data;
                    }

                    return true;
                }

                return false;
            });

            if (!listed && mainStream && mainStream.topic === newStream.topic) {
                let startGap = newStream.startMillis - mainStream.startMillis;
                if (startGap < 0)
                    startGap = mainStream.startMillis - newStream.startMillis;

                if (startGap < (20*60*1000)) {
                    listed = true;
                }
            }

            return listed;
        };

        /**
         * @param {string} chanId
         * @param {StreamData} streamData
         */
        addStreamData(chanId, streamData) {
            if (!this.map[chanId]) {
                this.map[chanId] = new ChannelStreams();
            }

            if (streamData.chanId != chanId) {
                this.map[chanId].otherStreams.push(streamData);
                return;
            }

            if (!this.map[chanId].mainStream || streamData.startMillis > this.map[chanId].mainStream.startMillis) {
                this.map[chanId].mainStream = streamData;
                return;
            }
        };

        /**
         * @returns {StreamData[]}
         */
        getAllStreams() {
            return Object.values(this.map)
                .map(cs => {
                    if (cs.mainStream)
                        return cs.otherStreams.concat(cs.mainStream);
                    
                    return cs.otherStreams;
                })
                .reduce((arr, streams) => arr.concat(streams), []);
        }
    }

    // Dumb API doesn't have a field for language for chuuba channels, only for clip channels.
    // Guess we have to filter by all the channel IDs manually

    // Inconsistent name positioning FAGGOTS
    // FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    const FNAME_FIRST_IDS = [
        "UC727SQYUvx5pDDGQpTICNWg",
        "UCP0BspO_AMEe3aQqqpo89Dg",
        "UCjLEmnpCNeisMxy134KPwWw",
        "UCZLZ8Jjx_RN2CXloOmgTHVg",
        "UCFTLzh12_nrtzqBPsTCqenA"
    ];
    /** @type {Object.<string, string>} */
    const WATCHABLE_CHANNELS = {
        "UC0TXe_LYZ4scaW2XMyi5_kw": "@AZKi",
        "UC5CwaMl1eIgY8h02uZw7u8A": "@HoshimachiSuisei",
        "UCDqI2jOz0weumE8s7paEk6g": "@Robocosan",
        "UC-hM6YJuNYVAmUWxeIr9FeA": "@SakuraMiko",
        "UCp6993wxpyDPHUpavwDFqgg": "@TokinoSora",
        "UC1CfXB_kRs3C-zaeTG3oGyg": "@AkaiHaato",
        "UCD8HOxPs4Xvsm8H0ZxXGiBw": "@YozoraMel",
        "UCdn5BQ06XqgXoAxIhbqw5Rg": "@ShirakamiFubuki",
        "UCFTLzh12_nrtzqBPsTCqenA": "@AkiRosenthal",
        "UCHj_mh57PVMXhAUDphUQDFA": "@AkaiHaato_Sub",
        "UCLbtM3JZfRTg8v2KGag-RMw": "@user-yp5xk6qh4q",
        "UCQ0UDLQCjY0rmuxCDE38FGg": "@NatsuiroMatsuri",
        "UC1opHUrw8rvnsadT-iGp7Cg": "@MinatoAqua",
        "UC1suqwovbL1kzsoaZgFZLKg": "@YuzukiChoco",
        "UC7fk0CB07ly8oSl0aqKkqFg": "@NakiriAyame",
        "UCp3tgHXw_HI0QMk1K8qh3gQ": "@YuzukiChoco_Sub",
        "UCvzGlP9oQwU--Y0r9id_jnA": "@OozoraSubaru",
        "UCXTpFs_3PqI41qX2d9tL2Rw": "@MurasakiShion",
        "UC1DCedRgGHBdm81E1llLhOQ": "@usadapekora",
        "UCCzUftO8KOVkV4wQG1vkUvg": "@HoushouMarine",
        "UCdyqAaZDKHXg4Ahi7VENThQ": "@ShiroganeNoel",
        "UCvInZx9h3jC2JzsIzoOebWg": "@ShiranuiFlare",
        "UC1uv2Oq6kNxgATlCiez59hw": "@TokoyamiTowa",
        "UCa9Y57gfeY0Zro_noHRVrnw": "@HimemoriLuna",
        "UCqm3BQLlJfvkTsX_hvm0UmA": "@TsunomakiWatame",
        "UCZlDXzGoo7d44bwdNObFacg": "@AmaneKanata",
        "UCAWSyEs_Io8MtpY3m-zqILA": "@MomosuzuNene",
        "UCFKOVgVbGmX65RxO3EtH3iw": "@YukihanaLamy",
        "UCK9V2B22uJYu3N7eR_BT9QA": "@OmaruPolka",
        "UCUKD-uaobj9jiqB-VXt71mA": "@ShishiroBotan",
        "UC6eWCld0KwmyHFbAqK3V-Rw": "@HakuiKoyori",
        "UCENwRMx5Yh42zWpzURebzTw": "@LaplusDarknesss",
        "UCIBY1ollUsauvVi4hW4cumw": "@SakamataChloe",
        "UCs9_O1tRPMQTHQ-N_L6FU2g": "@TakaneLui",
        "UC_vMYWcDjmfdpH6r4TTn1MQ": "@kazamairoha",
        "UChAnqc_AY5_I3Px5dig3X1Q": "@InugamiKorone",
        "UCp-5t9SrOQwXMU7iIjQfARg": "@OokamiMio",
        "UCvaTdHTWBGv3MKj3KVqJVCw": "@NekomataOkayu",
        "UCjLEmnpCNeisMxy134KPwWw": "@KoboKanaeru",
        "UCTvHWSfBZgtxE4sILOaurIQ": "@VestiaZeta",
        "UCZLZ8Jjx_RN2CXloOmgTHVg": "@KaelaKovalskia",
        "UC727SQYUvx5pDDGQpTICNWg": "@AnyaMelfissa",
        "UChgTyjG-pdNvxxhdsXfHQ5Q": "@PavoliaReine",
        "UCYz_5n-uDuChHtLo7My1HnQ": "@KureijiOllie",
        "UCAoy6rzhSf4ydcYjJw3WoVg": "@AiraniIofifteen",
        "UCOyYb1c43VlX9rc_lT6NKQw": "@AyundaRisu",
        "UCP0BspO_AMEe3aQqqpo89Dg": "@MoonaHoshinova",
        "UCWQtYtq9EOB4-I5P-3fh8lA": "@OtonoseKanade",
        "UCMGfV7TVTmHhEErVJg1oHBQ": "@HiodoshiAo",
        "UCtyWhCj3AqKh2dXctLkDtng": "@IchijouRirika",
        "UCdXAk5MpyLD8594lm_OvtGQ": "@JuufuuteiRaden",
        "UC1iA6_NT4mtAcIII6ygrvCw": "@TodorokiHajime",
        "UC9LSiN9hXI55svYEBrrK-tw": "@IsakiRiona",
        "UCuI_opAVX6qbxZY-a-AxFuQ": "@KoganeiNiko",
        "UCjk2nKmHzgH5Xy-C5qYRd5A": "@MizumiyaSu",
        "UCKMWFR6lAstLa7Vbf5dH7ig": "@RindoChihaya",
        "UCGzTVXqMQHa4AgJVJIVvtDQ": "@KikiraraVivi",
    };
    /** @type {Object.<string, string>} */
    const LISTABLE_CHANNELS = {
        "UCL_qhgtOy0dy1Agp8vkySQg": "@MoriCalliope",
        "UCHsx4Hqa-1ORjQTh9TYDhww": "@TakanashiKiara",
        "UCMwGHR0BTZuLsmjY_NT5Pwg": "@NinomaeInanis",
        "UCoSrY_IQQVpmIRZ9Xf-y93g": "@GawrGura",
        "UCyl1z3jo3XHR1riLFKG5UAg": "@WatsonAmelia",
        "UC8rcEBzJSleTkf_-agPM20g": "@IRyS",
        "UCO_aKKYxn4tvrqPjcTzZ6EQ": "@CeresFauna",
        "UCmbs8T6MWqUHP1tIQvSgKrg": "@OuroKronii",
        "UC3n5uGu18FoCy23ggWWp8tA": "@NanashiMumei",
        "UCgmPnx-EEeOrZSg5Tiw7ZRQ": "@HakosBaelz",
        "UC9p_lqQ0FEDz327Vgf5JwqA": "@KosekiBijou",
        "UCgnfPPb9JI3e9A4cXHnWbyg": "@ShioriNovella",
        "UC_sFNM0z0MWm9A6WlKPuMMg": "@NerissaRavencroft",
        "UCt9H_RpQzhxzlyBxFqrdHqA": "@FUWAMOCOch",
        "UCDHABijvPBnJm7F-KlNME3w": "@holoen_gigimurin",
        "UCl69AEx4MdqMZH7Jtsm7Tig": "@holoen_raorapanthera",
        "UCvN5h1ShZtc7nly3pezRayg": "@holoen_ceciliaimmergreen",
        "UCW5uhrG1eCBYditmhL0Ykjw": "@holoen_erbloodflame",
    };
    Object.assign(LISTABLE_CHANNELS, WATCHABLE_CHANNELS);
    const HOLOJP_CHAN_ID = 'UCJFZiqLMntJufDCHc6bQixg';
    const REGLOSS_CHAN_ID = 'UC10wVt6hoQiwySRhz7RdOUA';
    const FLOWGLOW_CHAN_ID = 'UCu2n3qHuOuQIygREMnWeQWg';
    const HOLOID_CHAN_ID = 'UCfrWoRGlawPQDQxxeIDRP0Q';
    const MAIN_CHAN_IDS = [HOLOJP_CHAN_ID, REGLOSS_CHAN_ID, HOLOID_CHAN_ID, FLOWGLOW_CHAN_ID];
    const WATCHABLE_CHANNEL_IDS = Object.keys(WATCHABLE_CHANNELS).concat(MAIN_CHAN_IDS);
    const HOLODEX_REQ_PARAMS =  {
        'status': 'live,upcoming',
        'type': 'stream,placeholder',
        'include': 'mentions,description',
        'org': 'Hololive',
        'max_upcoming_hours': 1
    };
    const BASE_HOLODEX_URL = 'https://holodex.net/api/v2/live?';
    const HOLODEX_URL_PARAMS = (new URLSearchParams(HOLODEX_REQ_PARAMS)).toString();
    const HOLODEX_REQ_URL = BASE_HOLODEX_URL + HOLODEX_URL_PARAMS;
    const TOPIC_BLACKLIST = [
        'membersonly',
        'superchat_reading',
        'music_cover',
        'original_song',
        'freechat'
    ];
    
    const createStreamPoll = async () => {
        const req = fetch(HOLODEX_REQ_URL, {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "X-APIKEY": "04382322-8811-4851-90c0-3c2309207231"
            }
        });

        const pollBtn = document.getElementById('newpollbtn');
        pollBtn.click();
        
        const poll = document.getElementById('pollwrap');
        const baseInputs = poll.querySelectorAll('input');
        const title = baseInputs[0];
        const addOptBtn = poll.querySelector('.btn-sm.btn-default');
        const defOptCnt = poll.getElementsByClassName('poll-menu-option').length;
        
        title.value = 'Loading stream data...';
        // timeout
        baseInputs[1].value = '300';
        // Hide votes
        baseInputs[2].checked = true;
        
        let resp = null;
        try {
            resp = await req;
        } catch (ex) {
            title.value = `Error requesting livestreams from Holodex: ${ex}`;
            return;
        }
        
        if (!resp.ok) {
            const errTxt = await resp.text();
            title.value = `Error requesting livestreams from Holodex: ${errTxt}`;
            return;
        }
        
        const chansToList = new ChannelStreamMap();
        const now = Date.now();
        const showTTSmillis = 10 * 60 * 1000; // 10 minutes
        const showStreamMilis = 40 * 60 * 1000; // 40 minutes
        const startFmtOpts = {
            timeZone: 'Asia/Tokyo',
            hour: '2-digit',
            minute: '2-digit'
        };
        /** @type {HolodexStream[]} */
        const streams = await resp.json();

        /**
         *
         * @param {HolodexChannel} channel
         * @returns First name of channel user if available, else channel name
         */
        const getFirstName = (channel) => {
            // Special case Fuwamoco
            if (channel.id === "UCt9H_RpQzhxzlyBxFqrdHqA") {
                return "FuwaMoco";
            }

            const nameSplit = channel.english_name?.split(' ');
            if (!nameSplit)
                return channel.name;

            if (nameSplit.length == 1)
                return channel.english_name;

            if (FNAME_FIRST_IDS.includes(channel.id))
                return nameSplit[0];

            return nameSplit[1];
        }
        
        // schema can be found at https://docs.holodex.net/#/paths/~1videos/get
        // Figure out which streams to list
        streams.forEach(stream => {
            const streamData = new StreamData();
            if (stream.link) {
                streamData.url = stream.link;
            } else if (stream.id) {
                streamData.url = `https://youtu.be/${stream.id}`
            }

            if (stream.type == "placeholder") {
                if (stream.placeholderType != "external-stream" || !(/twitch\.tv/i).test(stream.link)) {
                    return;
                }

                stream.duration = 0;
                streamData.topic = "purple site stream";
            }

            if (stream.duration) // premiere
                return;
            
            if (!stream.channel) // Unsure how to handle at this time
                return;

            if (stream.topic_id) {
                if (TOPIC_BLACKLIST.includes(stream.topic_id.toLowerCase()))
                    return;

                let topic = stream.topic_id.replaceAll('_', ' ');
                if (streamData.topic) topic = `${topic} ${streamData.topic}`;

                streamData.topic = topic;
            }
            
            const chanId = stream.channel.id;
            streamData.chanId = chanId
            const startDate = new Date(stream.start_scheduled);
            streamData.startMillis = startDate.getTime();

            // check if listed already
            if (chansToList.isListed(chanId, streamData, true))
                return;

            if (stream.status != 'live' || !stream.start_actual) {
                const timeToStart = streamData.startMillis - now;

                if (Math.abs(timeToStart) > showStreamMilis)
                    return;

                if (timeToStart > showTTSmillis) {
                    streamData.start = startDate.toLocaleTimeString("JPN", startFmtOpts);
                } else if (Math.abs(timeToStart) > showTTSmillis) {
                    streamData.start = "late";
                }
            }
            
            if (!WATCHABLE_CHANNEL_IDS.includes(chanId)) {
                // Not a channel we care about. Check if it mentions one we do.
                if (!stream.mentions)
                    return;
                
                streamData.where = stream.channel.english_name;
                if (stream.channel.org == 'Hololive') {
                    if (stream.channel.id == HOLOJP_CHAN_ID) {
                        streamData.where = "Main Hololive Channel";
                    } else if (stream.channel.id == REGLOSS_CHAN_ID) {
                        streamData.where = "DEV_IS REGLOSS Channel";
                    } else if (stream.channel.id == FLOWGLOW_CHAN_ID) {
                        streamData.where = "DEV_IS FLOW GLOW Channel";
                    } else if (stream.channel.id == HOLOID_CHAN_ID) {
                        streamData.where = "Hololive ID Channel";
                    } else {
                        streamData.withinHolo = true;
                        streamData.channels.push(getFirstName(stream.channel));
                    }
                }
                
                stream.mentions.forEach(mention => {
                    if (mention.org == 'Hololive') {
                        if (MAIN_CHAN_IDS.includes(mention.id))
                            return;

                        let descMention = stream.description.includes(mention.id);
                        if (!descMention)
                            descMention = stream.description.includes(mention.name);
                        if (!descMention)
                            descMention = stream.description.includes(LISTABLE_CHANNELS[mention.id]);
                        if (!descMention)
                            return;

                        const mentionName = mention.english_name ? getFirstName(mention) : mention.name;
                        streamData.channels.push(mentionName);
                    }
                    
                    if (!WATCHABLE_CHANNEL_IDS.includes(mention.id))
                        return;
                    
                    if (chansToList.isListed(mention.id, streamData, false))
                        return;

                    chansToList.addStreamData(mention.id, streamData);
                });
                
                return;
            }
            
            // JP or ID holo. Set data
            if (MAIN_CHAN_IDS.includes(stream.channel.id)) {
                if (stream.mentions) {
                    if (stream.channel.id == HOLOJP_CHAN_ID) {
                        streamData.where = "Main Hololive Channel";
                    } else if (stream.channel.id == REGLOSS_CHAN_ID) {
                        streamData.where = "Hololive DEV_IS Channel";
                    } else if (stream.channel.id == HOLOID_CHAN_ID) {
                        streamData.where = "Hololive ID Channel";
                    }
                } else {
                    streamData.withinHolo = true;
                    if (stream.channel.id == HOLOJP_CHAN_ID) {
                        streamData.channels.push("Main Hololive Channel");
                    } else if (stream.channel.id == REGLOSS_CHAN_ID) {
                        streamData.channels.push("Hololive DEV_IS Channel");
                    } else if (stream.channel.id == HOLOID_CHAN_ID) {
                        streamData.channels.push("Hololive ID Channel");
                    }
                }

                chansToList.addStreamData(chanId, streamData);
            } else {
                streamData.withinHolo = true;
                const chanName = stream.channel.english_name ? getFirstName(stream.channel) : stream.channel.name;
                streamData.channels.push(chanName);
                chansToList.addStreamData(chanId, streamData);
            }
            
            // Check if there are mentions of other holos
            if (!stream.mentions)
                return;
            
            stream.mentions.forEach(mention => {
                if (mention.org != 'Hololive')
                    return;

                if (MAIN_CHAN_IDS.includes(mention.id))
                    return;

                let descMention = stream.description.includes(mention.id);
                if (!descMention)
                    descMention = stream.description.includes(mention.name);
                if (!descMention)
                    descMention = stream.description.includes(LISTABLE_CHANNELS[mention.id]);
                if (!descMention)
                    return;
                    
                
                const mentionName = mention.english_name ? getFirstName(mention) : mention.name;
                streamData.channels.push(mentionName);
                chansToList.addStreamData(mention.id, streamData);
                chansToList.isListed(mention.id, streamData, true)
            });
        });
        
        // Add poll option for each stream
        const streamsToList = chansToList.getAllStreams();
        if (streamsToList.length == 0) {
            title.value = 'No streams found within the next hour';
            return;
        }
        
        // Try to minimize or eliminate empty options from collabs
        for (let i = 0, addCnt = 0; addCnt < defOptCnt && i < streamsToList.length; i++) {
            if (streamsToList[i].optAdded)
                continue;
            
            streamsToList[i].optAdded = true;
            addCnt++;
        }
        
        streamsToList.forEach(streamData => {
            if (streamData.optAdded)
                return;
            
            addOptBtn.click();
            streamData.optAdded = true;
            streamData.channels.sort();
        });

        streamsToList.sort((a, b) => a.channels[0].localeCompare(b.channels[0]));
        
        const options = poll.getElementsByClassName('poll-menu-option');
        let optIdx = 0;
        streamsToList.forEach(streamData => {
            if (streamData.listed)
                return;
            
            let optStr = streamData.channels.join('/');
            if (streamData.topic)
                optStr += ` ${streamData.topic}`;
            if (!streamData.withinHolo)
                optStr += ` on ${streamData.where}`;
            if (streamData.start)
                optStr += ` (${streamData.start})`;
            if (streamData.url)
                optStr += ` ${streamData.url}`;
            
            options[optIdx].value = optStr;
            streamData.listed = true;
            optIdx++;
        });
        
        title.value = 'Stream';
    }

    function addOrRemoveStreamPollButton() {
        let streamPollBtn = document.getElementById('streamPoll');
        if (CLIENT.rank >= CHANNEL.perms.pollctl && VIDEO_EXISTS) {
            if (streamPollBtn) {
                return;
            }

            const pollBtn = document.getElementById('newpollbtn');
            streamPollBtn = pollBtn.cloneNode();
        
            streamPollBtn.id = "streamPoll";
            streamPollBtn.innerText = "Streams Poll";
            streamPollBtn.addEventListener('click', createStreamPoll);
            pollBtn.insertAdjacentElement('afterend', streamPollBtn);
        } else if (streamPollBtn) {
            streamPollBtn.remove();
        }
    }

    addOrRemoveStreamPollButton();
    socket.on("setUserRank", data => {
        addOrRemoveStreamPollButton();
    });
    
    //Calendar Tab
    function setCalendar() {
        if (!VIDEO_EXISTS) return;
        
        const calendarArgs = [
            'https://calendar.google.com/calendar/u/0/embed?src=hororaibufes@gmail.com',
            'src=3311cf316f9fa74b8677ece5ec44e6f90dc852354f7ec95357469f0f87eb64a3%40group.calendar.google.com',
        ];
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (calendarAgendaView) calendarArgs.push('mode=AGENDA');
        if (!calendarLocalTime) calendarArgs.push('ctz=Asia/Tokyo');
        else if (localTimeZone) calendarArgs.push(`ctz=${localTimeZone}`);
        $('#watchalongIframe').attr('src', calendarArgs.join('&'));
    }

    if (VIDEO_EXISTS) {
        $('<div role="tabpanel" class="tab-pane" id="calendarTab"><iframe id="watchalongIframe" width="100%" height="600" frameborder="0" scrolling="no"></iframe></div>').appendTo(tabContent);
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#calendarTab">Calendar</a></li>').appendTo(tabList);
        setCalendar();
        $('#leftpane').remove();
    }

    //  ===========================================  HISTORY TAB ========================================== //
    if (VIDEO_EXISTS) {
        const playlistQueue = document.getElementById("queue");
        const historyTab = $(".nav-tabs").children()[1].cloneNode(true);
        historyTab.children[0].innerHTML ="History";
        historyTab.children[0].href="#historyTab";
        const historyPanel = $("<div id='historyTab' class='tab-pane' role='tabpanel'></div>").appendTo($(".tab-content")[0]);
        const historyWrapper = $("<div id='historyWrapper'></div>").appendTo(historyPanel);
        $(".nav-tabs").children()[0].after(historyTab);

        function addHistoryItem() {
            const entry = $("<li class='history_entry'></li>");
            const toptions = {hour: '2-digit', minute: '2-digit', second: '2-digit'};
            const currentTime = new Date();
            const trimCount = historyWrapper.children().length - maxPlaylistHistory + 1;

            for (let i = 0; i < trimCount; i++) {
                historyWrapper.children().last().remove();
            }
            if (maxPlaylistHistory === 0) return;

            let addedBy = $(".queue_active").attr("data-original-title");
            if (!addedBy) addedBy = $(".queue_active").attr("title");
            addedBy = addedBy.replace("Added by: ", "");
            entry.append( $(`<div class='qe_date'>${currentTime.toLocaleString("JPN", toptions)}</div>`));
            entry.append( $(".queue_active .qe_time").clone() );
            entry.append( $(".queue_active .qe_title").clone() );

            if (entry.find(".qe_title").text().toLowerCase() == "probably something to see here") {
                entry.find(".qe_title").href=="https://www.youtube.com/watch?v=-lfiTebewnc";
            }

            if (entry.find(".qe_title").text() == "") {
                entry.find(".qe_title").text("No name");
            }

            entry.append( $(".queue_active .qe_time").clone().attr("class", "qe_blame").text(`${addedBy}`) );

            // Prevent the current playing video from being added multiple times
            // when the queue is modified
            const firstLink = document.querySelector("#historyWrapper a");
            if ( $("#historyWrapper").text() == "" || !firstLink || firstLink.href != entry.find(".qe_title").prop("href") ) {
                historyWrapper.prepend( entry );
            }
        }

        const queueObserver = new MutationObserver((mlist, obs) => {
            for (const mtn of mlist) {
                if (mtn.target.nodeName.toLowerCase() != "li") continue;
                if (mtn.target.classList.contains('queue_active')) {
                    setTimeout(addHistoryItem, 100);
                    break;
                }
            }
        });

        queueObserver.observe(playlistQueue, {subtree: true, attributes: true, attributeFilter: ['class']});
    }

    // MOTD Changes
    $("#togglemotd").html("x").click(() => {$("#motdwrap").hide()});
    const motdCallback = Callbacks.setMotd;
    const motdChatMsg = (motd) => {
        if (motd.trim().length > 0) {
            const motdDiv = document.createElement("div");
            motdDiv.classList.add("chat-msg-motd");
            motdDiv.innerHTML = `MOTD: ${motd}`;
            motdDiv.style.fontSize = "22px";
            motdDiv.style.color = "orange";
            motdDiv.style.fontWeight = "bold";

            document.getElementById("messagebuffer").appendChild(motdDiv);
        }
    }

    Callbacks.setMotd = (motd) => {
        if (CHANNEL.motd === motd) {
            return;
        }

        motdCallback(motd);
        motdChatMsg(motd);
    }
    motdChatMsg(CHANNEL.motd)

    // Extras Tab
    if (VIDEO_EXISTS) {
        const extraTabContent = $('<div role="tabpanel" class="tab-pane" id="extrasTab"></div>').appendTo(tabContent);
        $('<li role="presentation"><a role="tab" data-toggle="tab" aria-expanded="false" href="#extrasTab">Extras</a></li>').appendTo(tabList);

        // MOTD toggle
        const motdBtn = $('<button class="btn btn-default">MOTD</button>').appendTo(extraTabContent).get(0);
        motdBtn.addEventListener('click', () => {
            if($("#motdwrap:visible").length > 0) {
                $("#motdwrap").hide();
            } else {
                $("#motdwrap").show();
                $("#motd").show();
            }
        });
        $('<div class="vertical-spacer"></div>').appendTo(extraTabContent);

        // PM Opener elements
        const pmNameTxtBox = $('<input id="pmname" class="form-control" type="text" placeholder="Username (case sensitive)">').appendTo(extraTabContent).get(0);
        const pmOpenBtn = $('<button class="btn btn-default">Open PMs</button>').appendTo(extraTabContent).get(0);
        pmOpenBtn.addEventListener('click', () => {
            const pmUser = pmNameTxtBox.value.trim();
            if (!pmUser) return;

            initPm(pmUser).find(".panel-heading").click();
        });
        $('<div class="vertical-spacer"></div>').appendTo(extraTabContent);

        // Video Replacer
        const vrTxtBox = $('<input id="vrurl" class="form-control" type="text" placeholder="Video URL">').appendTo(extraTabContent).get(0);
        const vrReplaceBtn = $('<button class="btn btn-default">Replace Video</button>').appendTo(extraTabContent).get(0);
        const vrResetBtn = $('<button class="btn btn-default">Reset Video</button>').appendTo(extraTabContent).get(0);

        vrReplaceBtn.addEventListener('click', () => {
            if (CLIENT.videoRemoved && !vrData) {
                return;
            }

            const url = vrTxtBox.value.trim();
            try {
                vrData = parseMediaLink(url);
            } catch (e) {
                console.log(e);
                vrData = null;
                return;
            }

            vrData.meta = {bitrate: 0};
            vrData.title = "Custom Video";
            vrData.seconds = 0;
            vrData.duration = "00:00";

            const lowerUrl = url.toLowerCase()
            if (lowerUrl.endsWith("mp4") || lowerUrl.endsWith("m4v")) {
                vrData.meta.codec = "mov/h264";
            } else if (lowerUrl.endsWith("webm")) {
                vrData.meta.codec = "matroska/vp9";
            }

            loadMediaPlayer(vrData);
            document.body.classList.add('chatOnly'); // Prevent it from being changed by cytube
            socket.emit("removeVideo");
            CLIENT.videoRemoved = true;
            if (typeof setVoteSkipDisabled !== 'undefined') {
                setVoteSkipDisabled();
            } else {
                $("#voteskip").attr("disabled", true);
            }
        });

        vrResetBtn.addEventListener('click', () => {
            vrData = null;
            const container = document.getElementsByClassName('embed-responsive')[0];
            const isEmpty = container.innerHTML === '';
            if (isEmpty)
                return;

            document.body.classList.remove('chatOnly');
            document.getElementById("mediarefresh").click();
            socket.emit("restoreVideo");
            CLIENT.videoRemoved = false;
            if (typeof setVoteSkipDisabled !== 'undefined') {
                setVoteSkipDisabled();
            } else {
                $("#voteskip").attr("disabled", false);
            }
        });
    }

    // Chat placeholder
    $('#chatline').attr('placeholder', 'Shitpost');

    // Clock above chat
    let clockInterval = 0;
    const chatClock = document.createElement('p');
    chatClock.id = 'chatClock';
    chatClock.style.flexGrow = '2';
    chatClock.style.fontFamily = 'system-ui';
    document.getElementById("usercount").insertAdjacentElement('afterend', chatClock);

    const setChatClock = () => {
        const clockDate = new Date();
        const localTime = clockDate.toLocaleTimeString("JPN");
        const jpTime = clockDate.toLocaleTimeString("JPN", {timeZone: 'Asia/Tokyo'});

        chatClock.innerText = `Local ${localTime} | JP ${jpTime}`;
    }

    const initChatClock = () => {
        setChatClock();
        clockInterval = setInterval(setChatClock, 1000);
    };

    const unloadChatClock = () => {
        clearInterval(clockInterval);
        chatClock.innerText = '';
    }

    // Navbars
    $('#nav-collapsible ul:first-child').append("<li id='etiquette' class='dropdown'><a target='_blank' href='https://docs.google.com/document/d/1ixjWZsxbM_Ix8VV-6Q5sy_cOwzCN1mud085gwwllSG0/edit?usp=sharing'>Cytube Etiquette</a></li>");
    $('#nav-collapsible ul:first-child').append("<li id='tickets' class='dropdown'><a target='_blank' href='https://ko-fi.com/hollowmatsuridos/'>Tickets</a></li>");
    $('#nav-collapsible ul:first-child').append("<li id='pins' class='dropdown'><a target='_blank' href='https://rentry.org/hororaibucytubepins?dl=0'>📌</a></li>");
    // https://files.catbox.moe/om3tcw.webm
    $('.navbar-brand').attr('href','https://om3tcw.touhou.cafe/hollowmatsuridos/om3tcw.webm').attr('target', '_blank').text(' ホロライブ').prepend('<img src="https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/mikoboat.gif" style="display: inline;" height="30"/>');

    // Inline Image Preview
    function showImage(img) {
        if (!img.classList.contains("hiddenImg")) return; 

        img.classList.remove("hiddenImg");
        $(img).stop(true,false).slideDown();
    }

    function msgLeave(event) {
        const ele = event.target;
        ele.querySelectorAll(".imageHoverPreview").forEach(img => {
            if (img.classList.contains("hiddenImg")) return;

            img.classList.add("hiddenImg");
            $(img).stop(true,true).slideUp(200);
        });
        ele.removeEventListener("mouseleave", msgLeave);
    }

    function inlineEnterListener(ev) {
        const a = ev.target;
        const msg = a.parentElement.parentElement;
        let img = msg.querySelector(`img[src="${a.href}"]`);
        a.classList.add("hover");

        if (!img) {
            img = document.createElement("img");
            img.style.display = "none";
            img.classList.add("hiddenImg");
            img.addEventListener("load", e => {
                img.classList.add("imageHoverPreview", "imageLoaded");
                if (a.classList.contains("hover")) {
                    showImage(img);
                }
            });
            img.src = a.href;
            msg.appendChild(img);
        };

        if (img.classList.contains("imageLoaded")) {
            showImage(img);
        }
        msg.addEventListener("mouseleave", msgLeave);
    }

    function inlineLeaveListener(ev) {
        ev.target.classList.remove("hover");
    }

    // Alternative image preview at mouse
    const hoverStyle = document.createElement('style');
    hoverStyle.innerHTML = `#iHover
    {
        pointer-events: none;
        z-index: 69;
        position: fixed;
        max-width: 300px;
        max-height: calc(100% - 60px);
    }`;
    document.head.appendChild(hoverStyle);

    const hoverUI = document.createElement('div');
    hoverUI.id = 'hoverUI';
    const iHover = document.createElement('img');
    iHover.id = 'iHover';
    iHover.addEventListener('load', ev => {
        iHover.style.display = "";
        hoverImgPos();
    })

    hoverUI.appendChild(iHover);
    document.body.appendChild(hoverUI);

    let mouseY = 0;
    let mouseX = 0;
    function hoverImgPos()
    {
        const top = Math.max((mouseY - iHover.height), 60);
        iHover.style.left = `${mouseX + 25}px`;
        iHover.style.top = `${top}px`;
    }

    function updateImgHover(mouseEvent) {
        mouseY = mouseEvent.clientY;
        mouseX = mouseEvent.clientX;
        hoverImgPos();
    }

    function popupEnterListener(a, ev) {
        iHover.style.display = "none";
        iHover.src = a.href;

        updateImgHover(ev);
        a.addEventListener('mousemove', updateImgHover);
    }

    function popupLeaveListener(a) {
        document.getElementById('iHover').removeAttribute('src');
        document.getElementById('iHover').removeAttribute('style');
        a.removeEventListener('mousemove', updateImgHover);
    }

    function ImageHover(a)
    {
        a.addEventListener('mouseenter',function(ev)
        {
            if (!imagePreviewEnabled) return;

            if (inlineImage)
                inlineEnterListener(ev);
            else
                popupEnterListener(a, ev);
        });

        a.addEventListener('mouseleave',function(ev)
        {
            if (!imagePreviewEnabled) return;

            if (inlineImage)
                inlineLeaveListener(ev);
            else
                popupLeaveListener(a);
        });
    }

    // Keybinds
    var keyHeld = false; //control keypress rapidfire
    $(window).bind('keyup', function(){ keyHeld=false; });

    $(window).bind('keydown', function(event) {
        var inputBox = document.getElementById("chatline");
        var inputVal = inputBox.value;

        if (event.ctrlKey && !event.shiftKey){
            switch (String.fromCharCode(event.which).toLowerCase()) {
            case 'a': //Select input box
                // Check if we already have some form of text input focused
                const INPUT_TAGS = ["INPUT", "TEXTAREA"];
                if (INPUT_TAGS.includes(document.activeElement.tagName)) return;

                event.preventDefault();
                if(!keyHeld){
                    keyHeld=true;
                    inputBox.focus();
                    inputBox.setSelectionRange(0,inputVal.length);
                }

                break;
            case 's': //spoiler
                if (!keyHeld) {
                    keyHeld=true;
                    event.preventDefault();
                    var selSt = inputBox.selectionStart;
                    var selEnd = inputBox.selectionEnd;

                    if (inputBox === document.activeElement) {
                        if(inputBox.selectionStart == inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0,selSt) +"[sp]"+ inputVal.substring(selSt,selEnd) +"[/sp]"+inputVal.substring(selEnd,inputVal.length);
                            inputBox.setSelectionRange(selSt +4,selSt +4);
                        } else if (inputBox.selectionStart < inputBox.selectionEnd) {
                            inputBox.value = inputVal.substring(0,selSt) +"[sp]"+ inputVal.substring(selSt,selEnd) +"[/sp]"+inputVal.substring(selEnd,inputVal.length);
                            inputBox.setSelectionRange(selEnd+9,selEnd+9);
                        }
                    }
                }
                
                break;
            }
        }
    });

    // Drinkbar
    var moveDrinkBar = function (){						//put it under the video title if exists
        if ($("#mainpage>div>#drinkbarwrap").length){
            $("#mainpage>div>#drinkbarwrap").insertAfter("#videowrap-header");
            $("#mainpage").unbind("DOMNodeInserted",moveDrinkBar);
            $("#drinkcount").delay(30000).fadeOut("slow");
            return true;
        }
    }
    if (moveDrinkBar() !=true){	$("#mainpage").bind("DOMNodeInserted",moveDrinkBar)	}	//move drinkbar when it exists

    $("#drinkcount").on('DOMSubtreeModified', function(event){							//fading in/out on update
        $("#drinkcount").stop(true,false).fadeIn().delay(30000).fadeOut("slow");
    });

    //TODO restart the drinkbar exists checks when closed

    // Emote Button
    $('#emotelistbtn').detach().insertBefore('#chatwrap>form').wrap('<div id="emotebtndiv"></div>').text('Emotes').attr('title', 'Emote List');
    $('#leftcontrols').remove();
    var randomEmotePool= [
         "https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/AyameFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/CocoFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/HaatoFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/KoroneFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/MarineFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/NoelFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/OkayuFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/RushiaFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/TowaFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/WatameFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/ChocoFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/FubukiFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/ShionFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/PekoraFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/AkiFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/MelFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/MikoFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/KanataFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/AzkiFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/SuiseiFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/MioFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/AquaFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/LunaFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/MatsuriFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/SoraFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/RobocoFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/FlareFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/SubaruFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/NeneFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/BotanFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/LamyFuki.gif"
        ,"https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/PolkaFuki.gif"
        ];

    function drawRandomEmote(){
        return randomEmotePool[Math.floor(Math.random() *randomEmotePool.length)];
    };

    $("#emotelistbtn").click(function(){
        $(this).css("background-image","url("+drawRandomEmote()+")");
    }).html("")

    // Message Tab Stretch
    $("#main").addClass("flex").children().first().children().first().after('<div id="chatdisplayrow" class="row"></div>').next().append($("#userlist,#messagebuffer").removeAttr("style")).after('<div id="chatinputrow" class="row"></div>').next().append($("#emotebtndiv,#chatwrap>form"));

    // Video Wrapper
    $('#videowrap').append("<span id='vidchatcontrols' style='float:right'>");

    // Video link titles
    async function replaceLink(element) {
        let request = "",
            site = "";
        const parent = element.parentElement;
    
        if (element.href.search(/youtube\.com|youtu\.be/i) > -1) {
            request = `https://www.youtube.com/oembed?url=${element.href}&format=json`;
            site = "YouTube";
        }
        if (element.href.search(/streamable\.com/i) > -1) {
            request = `https://api.streamable.com/oembed.json?url=${element.href}`;
            site = "Streamable"
        }
        if (element.href.search(/vimeo\.com/i) > -1) {
            request = `https://vimeo.com/api/oembed.json?url=${element.href}`;
            site = "Vimeo"
        }
    
        if (request) {
            const response = await fetch(request, {headers: {'Content-Type': 'text/json'}});
            if (!response.ok) {
                return;
            }
    
            const json = await response.json();
            // If the message was sent in a filter, the text is modified and the element
            // passed to us is no longer in the DOM. Find it again.
            const a = parent.querySelector(`a[href="${element.href}"]`);
            if (a) {
                a.innerText = `[${site}] ${json.title}`;
            }
        }
    }

    // Link formatting/image hover
    function modifyLinks(a) {
        replaceLink(a);

        const linkUserMatch = a.parentElement.parentElement.className.match(/chat-msg-([^ ]+)/);
        const userName = (linkUserMatch && linkUserMatch.length > 1) ? linkUserMatch[1].toLowerCase() : '';
        if (ignoreImgUsers.includes(userName))
            return;

        ImageHover(a);
    }

    // Instead of modifying formatChatMessage(), which can modify the DOM and
    // detach what we were working with, use a mutation observer
    const msgBuffer = document.getElementById('messagebuffer');
    const bufferObs = new MutationObserver((mutationList, observer) => {
        mutationList.forEach(mtn => {
            mtn.addedNodes.forEach(an => {
                if (an.nodeType != Node.ELEMENT_NODE) return;

                // collapse everything except vote skips
                if (an.querySelector('.server-whisper') && !an.innerHTML.match(/voteskip passed|kicked|banned/i)) { 
                    $(an).delay(30000).slideUp(600);
                } else {
                    an.querySelectorAll("a[href]").forEach(a => {
                        modifyLinks(a);
                    });
                }
            });
        });
    });

    bufferObs.observe(msgBuffer, {childList: true});

    // END FORMERLY INLINE SCRIPT

    // https://files.catbox.moe/mp0beu.mp3
    const mikoCough = new Audio('https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/mikocough.mp3');
    mikoCough.volume = 0.5;

    // Code for groomers shit
    // --- Set Groomers Indicator ---

    /**
     * @typedef {Object} GroomersData
     * @prop {boolean} active
     * @prop {string} msg
     * 
     * @typedef {Object} Groomers
     * @prop {GroomersData} groomers
     * @prop {GroomersData} niji
     */

    const setGroomersTitles = () => {
        const groomLight = document.getElementById('groom');
        if (!groomLight) return;

        const titleTxtParts = [];
        const groomersLink = document.getElementById("groomers-link");
        const nijiLink = document.getElementById("niji-link");

        if (groomersLink.classList.contains("active")) {
            titleTxtParts.push(`${groomersTxt} on groomers`);
            groomersLink.title = `${groomersTxt} on groomers`;
        } else {
            groomersLink.title = "";
        }

        if (nijiLink.classList.contains("active")) {
            titleTxtParts.push(`${nijiTxt} on niji`);
            nijiLink.title = `${nijiTxt} on niji`;
        } else {
            nijiLink.title = "";
        }

        if (groomLight) {
            const titleTxt = titleTxtParts.length ? titleTxtParts.join('\n\n') : "No streams";
            groomLight.title = titleTxt;
        }
    }

     /**
     * @param {string} msg 
     * @param {Element | null} messElem 
     * @returns 
     */
    const setGroomers = (msg, messElem = null) => {
        const groomLight = document.getElementById('groom');
        const groomersLink = document.getElementById("groomers-link");
        if (!groomLight) {
            return;
        }
        
        groomersTxt = msg.replace('/groomers','')
        Object.keys(filters).some(fkey => {
            const filter = filters[fkey];
            return filter.postfixes.some(postfix => {
                if (groomersTxt.endsWith(postfix)) {
                    groomersTxt = groomersTxt.replace(postfix, "");
                    return true;
                }
                return false;
            });
        });
        groomersTxt = groomersTxt.trim();

        // Unescape HTML sequences
        const p = document.createElement("p")
        p.innerHTML = groomersTxt;
        // Put emote names into their element so it gets extracted as text instead of disappearing
        Array.from(p.children).forEach(ele => {
            if (ele.classList.contains('channel-emote')) {
                ele.innerText = ele.title;
            }
        });
        // Set innerHTML to innerText which removes HTML elements but unescapes escaped elements
        p.innerHTML = p.innerText;
        // Retrieve the new innerText which should remove HTML tags from any unescaped elements
        groomersTxt = p.innerText;
        if (!groomersTxt.length) {
            groomersTxt = "Stream Active";
        }

        if (messElem) messElem.classList.add('alwaysHideCSS');
        groomLight.text = '🔴';
        groomersLink.innerHTML = `🔴 ${groomersTxt} on groomers`;
        groomersLink.classList.add("active");
        setGroomersTitles();
    }

    /**
     * 
     * @param {string} msg 
     * @param {Element | null} messElem 
     * @returns 
     */
    const setNiji = (msg, messElem = null) => {
        console.log(msg);
        const groomLight = document.getElementById('groom');
        const nijiLink = document.getElementById("niji-link");
        if (!groomLight) {
            return;
        }
        
        nijiTxt = msg.replace('/niji','')
        Object.keys(filters).some(fkey => {
            const filter = filters[fkey];
            return filter.postfixes.some(postfix => {
                if (nijiTxt.endsWith(postfix)) {
                    nijiTxt = nijiTxt.replace(postfix, "");
                    return true;
                }
                return false;
            });
        });
        nijiTxt = nijiTxt.trim();

        // Unescape HTML sequences
        const p = document.createElement("p")
        p.innerHTML = nijiTxt;
        Array.from(p.children).forEach(ele => {
            if (ele.classList.contains('channel-emote')) {
                ele.innerText = ele.title;
            }
        });
        p.innerHTML = p.innerText;
        nijiTxt = p.innerText;
        if (!nijiTxt.length) {
            nijiTxt = "Stream Active";
        }

        if (messElem) messElem.classList.add('alwaysHideCSS');
        groomLight.text = '🔴';
        nijiLink.innerHTML = `🔴 ${nijiTxt} on niji`;
        nijiLink.classList.add("active");
        setGroomersTitles();
    }

    // --- Create Groomers Elements ---
    const alwaysHideCSS =`.alwaysHideCSS {display:none !important}`;
    const alwaysHideStyle = document.createElement('style');
    if (alwaysHideStyle.styleSheet) alwaysHideStyle.styleSheet.cssText = alwaysHideCSS;
    else alwaysHideStyle.appendChild(document.createTextNode(alwaysHideCSS));
    document.getElementsByTagName('head')[0].appendChild(alwaysHideStyle);
    alwaysHideStyle.disabled = false;

    const groomCSS = `.groomCSS {display:none !important}`;
    const groomStyle = document.createElement('style');
    if (groomStyle.styleSheet) groomStyle.styleSheet.cssText = groomCSS;
    else groomStyle.appendChild(document.createTextNode(groomCSS));
    document.getElementsByTagName('head')[0].appendChild(groomStyle);
    groomStyle.disabled = false;

    const groom = document.getElementById('groom');
    if(!groom)
    {
        const gNavbarElem = Array.from(document.getElementById("nav-collapsible").children)[0];
        const groomBar = document.createElement("li");
        const groomElem = document.createElement("a");
        const groomChannels = document.createElement("ul");
        groomBar.classList.add('dropdown');
        groomBar.id = "groomers-dropdown-toggle";
        groomElem.classList.add('groomCSS', 'dropdown-toggle');
        groomElem.id = "groom";
        groomElem.innerHTML = "⚫";
        groomElem.title = "No streams";
        groomChannels.classList.add("dropdown-menu");
        groomChannels.id = "groomers-channels";

        const chan1 = document.createElement("li");
        const chan2 = document.createElement("li");
        chan1.innerHTML = '<a id="groomers-link" href="/r/groomers" target="_blank">No streams on groomers</a>'
        chan2.innerHTML = '<a id="niji-link" href="/r/nijisanji" target="_blank">No streams on nijisanji</a>'

        gNavbarElem.appendChild(groomBar);
        groomBar.appendChild(groomElem);
        groomBar.appendChild(groomChannels);
        groomChannels.appendChild(chan1);
        groomChannels.appendChild(chan2);

        /**
         * 
         * @param {PointerEvent} ev 
         * @returns 
         */
        const closeGroomersListener = (ev) => {
            /**
             * @type {Element}
             */
            let elem = ev.target;
            if (elem.id == "mentionContainer" ||
                elem.id == "mentions-dropdown" ||
                elem.classList.contains("pin-message") ||
                elem.classList.contains("pin-close")) {
                return;
            }

            for (let iterCount = 0; iterCount < 3 && elem !== null; iterCount++){
                // Do not close the groomers channel list if the element click was within the list
                if (elem.id === "groomers-channels") {
                    return;
                }
                elem = elem.parentElement;
            }
    
            groomChannels.classList.remove("open");
            groomChannels.removeAttribute("style");
            document.removeEventListener('click', closeGroomersListener);
        }

        const openGroomersList = (ev) => {
            ev.preventDefault();
            if (groomChannels.classList.contains('open')) {
                return;
            }

            groomChannels.classList.add('open');
            groomChannels.style.display = "block";
            ev.stopPropagation();
            document.addEventListener("click", closeGroomersListener);
        }

        groomElem.addEventListener("click", openGroomersList);
        groomElem.addEventListener("auxclick", openGroomersList);

        if (CHANNEL.name.toLowerCase() == "hollowmatsuridos") { // Only check in the main channel
            fetch("https://om3tcw.touhou.cafe/groomersv2")
            .then(res => res.json())
            .then(/** @param {Groomers} data */ data => {
                if (data.groomers.active) {
                    setGroomers(data.groomers.msg);
                }
                if (data.niji.active) {
                    setNiji(data.niji.msg);
                }
            });
        }
    }


    // Mentions

    // navbar elem
    const navbarElem = Array.from(document.getElementById("nav-collapsible").children)[0];

    const mentionElem = document.createElement("li");
    mentionElem.classList = "dropdown";
    mentionElem.id = "mention-dropdown-toggle";

    const mentionIcon = document.createElement("a");
    mentionIcon.classList = "dropdown-toggle";
    mentionIcon.href = "#";
    mentionIcon.innerHTML = '✉️';

    const unreadMentionIcon = document.createElement("div");
    unreadMentionIcon.innerHTML = "🔴";
    unreadMentionIcon.style = "position: absolute; right: 10px; top: 13px; z-index: 2; font-size: 8pt; visibility: hidden; cursor: pointer;";

    const closeMentions = () => {
        const ddm = document.getElementById("mentions-dropdown");
        ddm.classList.remove("open");
        ddm.removeAttribute("style");
    }

    const closeMentionListener = (ev) => {
        const elem = ev.target;
        if (elem.id == "mentionContainer" ||
            elem.id == "mentions-dropdown" ||
            elem.classList.contains("pin-message") ||
            elem.classList.contains("pin-close")) {
            return;
        }

        closeMentions();
        document.removeEventListener('click', closeMentionListener);
    }

    const mentionIconClick = (ev) => {
        unreadMentionIcon.style.visibility = "hidden";
        const ddm = document.getElementById("mentions-dropdown");
        if (ddm.classList.contains("open")) return;

        const mc = document.getElementById("mentionContainer");
        if (mc.childElementCount == 0) return;

        ddm.classList.add("open");
        ddm.style.display = "block";

        ev.stopPropagation();
        document.addEventListener('click', closeMentionListener);
    };

    mentionIcon.addEventListener("click", mentionIconClick);
    unreadMentionIcon.addEventListener("click", mentionIconClick);

    const ddMenuElem = document.createElement("ul");
    ddMenuElem.classList = "dropdown-menu";
    ddMenuElem.id = "mentions-dropdown";

    const rmAllBtn = document.createElement("button");
    rmAllBtn.id = "rmAllMentions";
    rmAllBtn.innerText = "Remove All";

    const mentionContainer = document.createElement("div");
    mentionContainer.id = "mentionContainer";
    
    ddMenuElem.appendChild(rmAllBtn);
    ddMenuElem.appendChild(mentionContainer);

    const addMention = (user, message, meta, time) => {
        unreadMentionIcon.style.visibility = "visible";
        let userStr = `${user}`;
        const dateStr = new Date(time).toLocaleString("JPN");
        const mentionLiElem = document.createElement("li");
        
        mentionLiElem.innerHTML = `<div class="pin-message">${dateStr} ${userStr}<br>${message}</div><button class="pin-close">X</button>`;
        mentionLiElem.lastChild.onclick = () => { 
            mentionLiElem.remove();
            const mc = document.getElementById("mentionContainer");
            if (mc.childElementCount == 0) closeMentions();
        }
        mentionContainer.appendChild(mentionLiElem);
    }

    rmAllBtn.onclick = () => {
        const mc = document.getElementById("mentionContainer");
        while(mc.childElementCount > 0) {
            mc.childNodes[0].remove();
        }
    }

    navbarElem.appendChild(mentionElem);
    mentionElem.appendChild(unreadMentionIcon);
    mentionElem.appendChild(mentionIcon);
    mentionElem.appendChild(ddMenuElem);


    // channels


    // Filter style 1
    const filter1css = `.filter1css {display:none !important}`;
    const filter1style = document.createElement('style');
    if (filter1style.styleSheet) filter1style.styleSheet.cssText = filter1css;
    else filter1style.appendChild(document.createTextNode(filter1css));
    document.getElementsByTagName('head')[0].appendChild(filter1style);
    filter1style.disabled = true;
    // Filter style 2
    const filter2css = `.filter2css {display:none !important}`;
    const filter2style = document.createElement('style');
    if (filter2style.styleSheet) filter2style.styleSheet.cssText = filter2css;
    else filter2style.appendChild(document.createTextNode(filter2css));
    document.getElementsByTagName('head')[0].appendChild(filter2style);
    filter2style.disabled = true;
    // Filter style 3
    const filter3css = `.filter3css {display:none !important}`;
    const filter3style = document.createElement('style');
    if (filter3style.styleSheet) filter3style.styleSheet.cssText = filter3css;
    else filter3style.appendChild(document.createTextNode(filter3css));
    document.getElementsByTagName('head')[0].appendChild(filter3style);
    filter3style.disabled = true;
    // Filter style 4
    const filter4css = `.filter4css {display:none !important}`;
    const filter4style = document.createElement('style');
    if (filter4style.styleSheet) filter4style.styleSheet.cssText = filter4css;
    else filter4style.appendChild(document.createTextNode(filter4css));
    document.getElementsByTagName('head')[0].appendChild(filter4style);
    filter4style.disabled = true;

    /**
     * @typedef {Object} Filter
     * @prop {string} color
     * @prop {string} style
     * @prop {string[]} prefixes
     * @prop {string[]} postfixes
     * @prop {HTMLStyleElement} hiddenEle
     */

    /**
     * @type {Object.<number, Filter>}
     */
    const filters = {
        1: {
            color: '',
            style: 'none',
            prefixes: ["/def", "/1"],
            postfixes: ["--filter1", "-f1"],
            hiddenEle: filter1style
        },
        2: {
            color: '#f44',
            style: 'inset 0 0 0 2px #f44',
            prefixes: ["/game", "/2"],
            postfixes: ["--filter2", "-f2"],
            hiddenEle: filter2style
        },
        3: {
            color: '#8f8',
            style: 'inset 0 0 0 2px #8f8',
            prefixes: ["/blog", "/3"],
            postfixes: ["--filter3", "-f3"],
            hiddenEle: filter3style
        },
        4: {
            color: '#fff',
            style: 'inset 0 0 0 2px #fff',
            prefixes: ["/en", "/4"],
            postfixes: ["--filter4", "-f4"],
            hiddenEle: filter4style
        }
    }

    // --- Flarepeek mark ---
    /*
    console.image = function(url, size = 100) {
        var image = new Image();
        image.onload = function() {
            var style = [
                'font-size: 1px;',
                'padding: ' + this.height/100*size + 'px ' + this.width/100*size + 'px;',
                'background: url('+ url +') no-repeat;',
                'background-size: contain;'
            ].join(' ');
            console.log('%c ', style);
        }
        image.src = url;
    }
    console.image('https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/flarepeek.png', 56);
    */

    // --- Oshi mark data ---
    const holodata = {
        Sora: '🐻💿', AZKi: '⚒️', Roboco: '🤖', Miko: '🌸', Suisei: '☄️',
        Matsuri: '🏮', Mel: '🌟', Haato: '❤️‍🔥', Aki: '🍎', Chris: '🌰',
        Aqua: '⚓️', Choco: '💋', Ayame: '👿', Shion: '🌙', Subaru: '🚑',
        Fubuki: '🌽', Mio: '🌲', Okayu: '🍙', Korone: '🥐',
        Flare: '🔥', Noel: '⚔️', Marine: '🏴‍☠️', Pekora: '👯‍♀️', Rushia: '🦋',
        Kanata: '💫', Coco: '🐉', Watame: '🐏', Towa: '👾', Luna: '🍬',
        Lamy: '☃️', Nene: '🍑🥟', Botan: '♌', Polka: '🎪',
        Laplus: '🛸💜', Lui: '🥀', Koyori: '🧪', Chloe: '🎣', Iroha: '🍃',
        Ao: '🖋️', Kanade: '🎹✨', Ririka: '🌃', Raden: '🐚', Hajime: '🐧⚡',
        Riona: '🎤👑', Niko: '☺️🐅', Su: '💬🔁💙', Chihaya: '🎧🔧', Vivi: '💅✨',
        Risu: '🐿️', Moona: '🔮', Iofi: '🎨', Ollie: '🧟‍♀️', Anya: '🍂', Reine: '🦚',
        Zeta: '📜', Kaela: '🔨', Kobo: '☔',
        Yogiri: '🍼', Miyabi: '🌺', Izuru: '🎸', Aruran: '🍕', Rikka: '⚙️',
        Kira: '💙', Suzaku: '💊', Astel: '🎭', Temma: '🦔💨', Roberu: '🍷',
        Shien: '🟣', Oga: '🐃', Kaoru: '💅',
        DD: 'ඞ', Eugene: '👓', ABE: '🔞', Cunny: '😭',
        Ran: '🐻🍄', Chima: '🐹', Pmaru: '🐣🍳', Nazuna: '🍭', THEKanata: '🤠',
        774: '🍩', Tsukasa: '🎖️', Kokage: '📘💧', Sakuna: '🎀🐾'
    }


    // --- kororeps ---
    const kanjiData = {
        n5: [{jp:"日",on:"ニチ, ジツ",kun:"ひ, -び, -か",en:"day, sun"},{jp:"一",on:"イチ",kun:"ひと(つ)",en:"one"},{jp:"国",on:"コク",kun:"くに",en:"country"},{jp:"人",on:"ジン、 ニン",kun:"ひと",en:"person"},{jp:"年",on:"ネン",kun:"とし",en:"year"},{jp:"大",on:"ダイ、 タイ",kun:"おお(きい)",en:"large, big"},{jp:"十",on:"ジュウ",kun:"とお、 と",en:"ten"},{jp:"二",on:"ニ、 ジ",kun:"ふた(つ)、 ふたたび ",en:"two"},{jp:"本",on:"ホン",kun:"もと",en:"book, present, true"},{jp:"中",on:"チュウ",kun:"なか、 うち、 あた(る)",en:"in, inside, middle, mean, center"},{jp:"長",on:"チョウ",kun:"なが(い)、 おさ ",en:"long, leader, superior, senior"},{jp:"出",on:"シュツ、 スイ",kun:"で(る)、 だ(す)、 い(でる)",en:"exit, leave, go out"},{jp:"三",on:"サン",kun:"み(つ)",en:"three"},{jp:"時",on:"ジ",kun:"とき、 -どき",en:"time, hour"},{jp:"行",on:"コウ、 ギョウ、 アン",kun:"い(く)、 ゆ(く)、 おこな(う)",en:"going, journey, carry out, line, row"},{jp:"見",on:"ケン",kun:"み(る)、 み(せる)",en:"see, hopes, chances, idea, opinion, look at, visible"},{jp:"月",on:"ゲツ、 ガツ",kun:"つき",en:"month, moon"},{jp:"分",on:"ブン、 フン、 ブ",kun:"わ(ける)",en:"part, minute of time, understand"},{jp:"後",on:"ゴ、 コウ",kun:"のち、 うし(ろ)、 あと",en:"behind, back, later"},{jp:"前",on:"ゼン",kun:"まえ",en:"in front, before"},{jp:"生",on:"セイ、 ショウ",kun:"い(きる)、 う(む)、 お(う)、 は(える)、 なま",en:"life, genuine, birth"},{jp:"五",on:"ゴ",kun:"いつ(つ)",en:"five"},{jp:"間",on:"カン、 ケン",kun:"あいだ、 ま、 あい ",en:"interval, space"},{jp:"上",on:"ジョウ、 ショウ、 シャン",kun:"うえ、 うわ-、 かみ、 あ(げる)、 のぼ(る)、 たてまつ(る)",en:"above, up"},{jp:"東",on:"トウ",kun:"ひがし",en:"east"},{jp:"四",on:"シ",kun:"よ(つ)、 よん",en:"four"},{jp:"今",on:"コン、 キン",kun:"いま",en:"now; the present"},{jp:"金",on:"キン、 コン、 ゴン",kun:"かね、 かな-、 -がね",en:"gold"},{jp:"九",on:"キュウ、 ク",kun:"ここの(つ)",en:"nine"},{jp:"入",on:"ニュウ",kun:"い(る)、はい(る)",en:"enter, insert"},{jp:"学",on:"ガク",kun:"まな(ぶ)",en:"study, learning, science"},{jp:"高",on:"コウ",kun:"たか(い)",en:"tall, high, expensive"},{jp:"円",on:"エン",kun:"まる(い)",en:"circle, yen, round"},{jp:"子",on:"シ、 ス、 ツ",kun:"こ、 ね",en:"child"},{jp:"外",on:"ガイ、 ゲ",kun:"そと、 ほか、 はず(す)、 と-",en:"outside"},{jp:"八",on:"ハチ",kun:"や(つ)、 よう",en:"eight"},{jp:"六",on:"ロク",kun:"む(つ)、 むい",en:"six"},{jp:"下",on:"カ、 ゲ",kun:"した、 しも、 もと、 さ(げる)、 くだ(る)、 お(ろす)",en:"below, down, descend, give, low, inferior"},{jp:"来",on:"ライ、 タイ",kun:"く.る、 きた.る、 き、 こ ",en:"come, due, next, cause, become"},{jp:"気",on:"キ、 ケ",kun:"いき",en:"spirit, mind, air, atmosphere, mood"},{jp:"小",on:"ショウ",kun:" ちい(さい)、 こ-、 お-、 さ-",en:"little, small"},{jp:"七",on:"シチ",kun:"なな(つ)、 なの",en:"seven"},{jp:"山",on:"サン、 セン",kun:"やま",en:"mountain"},{jp:"話",on:"ワ",kun:"はな(す)、 はなし ",en:"tale, talk"},{jp:"女",on:"ジョ",kun:"おんな、 め",en:"woman, female"},{jp:"北",on:"ホク",kun:"きた",en:"north"},{jp:"午",on:"ゴ",kun:"うま",en:"noon"},{jp:"百",on:"ヒャク、 ビャク",kun:"もも",en:"hundred"},{jp:"書",on:"ショ",kun:"か(く)",en:"write"},{jp:"先",on:"セン",kun:"さき、 ま(ず)",en:"before, ahead, previous, future"},{jp:"名",on:"メイ、 ミョウ",kun:"な",en:"name, noted, distinguished, reputation"},{jp:"川",on:"セン",kun:"かわ",en:"river, stream"},{jp:"千",on:"セン",kun:"ち",en:"thousand"},{jp:"水",on:"スイ",kun:"みず",en:"water"},{jp:"半",on:"ハン",kun:"なか(ば)",en:"half, middle, odd number, semi-"},{jp:"男",on:"ダン、 ナン",kun:"おとこ、 お",en:"male; man"},{jp:"西",on:"セイ、 サイ",kun:"にし",en:"west"},{jp:"電",on:"デン",kun:"",en:"electricity"},{jp:"校",on:"コウ",kun:"",en:"school, exam"},{jp:"語",on:"ゴ",kun:"かた(る)",en:"word, speech, language"},{jp:"土",on:"ド、 ト",kun:"つち",en:"soil, earth, ground"},{jp:"木",on:"ボク、 モク",kun:"き、 こ-",en:"tree, wood"},{jp:"聞",on:"ブン、 モン",kun:"き(く)",en:"to hear; to listen; to ask"},{jp:"食",on:"ショク、 ジキ",kun:" く(う)、 た(べる)、 は(む)",en:"eat, food"},{jp:"車",on:"シャ",kun:"くるま",en:"car, wheel"},{jp:"何",on:"カ",kun:"なに、 なん",en:"what"},{jp:"南",on:"ナン、 ナ",kun:"みなみ",en:"south"},{jp:"万",on:"マン、 バン",kun:"",en:"ten thousand"},{jp:"毎",on:"マイ",kun:"ごと(に)",en:"every"},{jp:"白",on:"ハク、 ビャク",kun:"しろ(い)",en:"white"},{jp:"天",on:"テン",kun:"あまつ",en:"heavens, sky, imperial"},{jp:"母",on:"ボ",kun:"はは、 かあ",en:"mother"},{jp:"火",on:"カ",kun:"ひ、 -び、 ほ-",en:"fire"},{jp:"右",on:"ウ、 ユウ",kun:"みぎ",en:"right"},{jp:"読",on:"ドク、 トク、 トウ",kun:"よ(む)",en:"to read"},{jp:"友",on:"ユウ",kun:"とも",en:"friend"},{jp:"左",on:"サ、 シャ",kun:"ひだり",en:"left"},{jp:"休",on:"キュウ",kun:"やす(む)",en:"rest, day off, retire, sleep"},{jp:"父",on:"フ",kun:"ちち、 とう",en:"father"},{jp:"雨",on:"ウ",kun:"あめ、 あま",en:"rain"}],
        n4: [{ jp: "会", en: "meeting; meet" }, { jp: "同", en: "same, agree, equal" }, { jp: "事", en: "matter, thing, fact, business, reason, possibly" }, { jp: "自", en: "oneself" }, { jp: "社", en: "company, firm, office, association, shrine" }, { jp: "発", en: "departure, discharge, emit, start from" }, { jp: "者", en: "someone, person" }, { jp: "地", en: "ground, earth" }, { jp: "業", en: "business, vocation, arts, performance" }, { jp: "方", en: "direction, person, alternative" }, { jp: "新", en: "new" }, { jp: "場", en: "location, place" }, { jp: "員", en: "employee, member, number, the one in charge" }, { jp: "立", en: "stand up, rise" }, { jp: "開", en: "open, unfold, unseal" }, { jp: "手", en: "hand" }, { jp: "力", en: "power, strength, strong, strain, bear up, exert" }, { jp: "問", en: "question, ask, problem" }, { jp: "代", en: "substitute, change, convert, replace, period" }, { jp: "明", en: "bright, light" }, { jp: "動", en: "move, motion, change" }, { jp: "京", en: "capital" }, { jp: "目", en: "eye, class, look, insight, experience" }, { jp: "通", en: "traffic, pass through, avenue, commute" }, { jp: "言", en: "say, word" }, { jp: "理", en: "logic, arrangement, reason, justice, truth" }, { jp: "体", en: "body, substance, object, reality" }, { jp: "田", en: "rice field, rice paddy" }, { jp: "主", en: "lord, chief, master, main thing, principal" }, { jp: "題", en: "topic, subject" }, { jp: "意", en: "idea, mind, heart, taste, thought" }, { jp: "不", en: "negative, non-, bad" }, { jp: "作", en: "make, production, prepare, build" }, { jp: "用", en: "utilize, business, service, use, employ" }, { jp: "度", en: "degrees, occurrence, time, counter for occurrences" }, { jp: "強", en: "strong" }, { jp: "公", en: "public, prince, official, governmental" }, { jp: "持", en: "hold, have" }, { jp: "野", en: "plains, field, rustic, civilian life" }, { jp: "以", en: "by means of, because, in view of, compared with" }, { jp: "思", en: "think" }, { jp: "家", en: "house, home, family, professional, expert" }, { jp: "世", en: "generation, world, society, public" }, { jp: "多", en: "many, frequent, much" }, { jp: "正", en: "correct, justice, righteous" }, { jp: "安", en: "safe, peaceful, cheap" }, { jp: "院", en: "institution, temple, mansion, school" }, { jp: "心", en: "heart, mind, spirit" }, { jp: "界", en: "world, boundary" }, { jp: "教", en: "teach, faith, doctrine" }, { jp: "文", en: "sentence, literature, style, art" }, { jp: "元", en: "beginning, former time, origin" }, { jp: "重", en: "heavy, important, esteem, respect" }, { jp: "近", en: "near, early, akin, tantamount" }, { jp: "考", en: "consider, think over" }, { jp: "画", en: "brush-stroke, picture" }, { jp: "海", en: "sea, ocean" }, { jp: "売", en: "sell" }, { jp: "知", en: "know, wisdom" }, { jp: "道", en: "road-way, street, district, journey, course" }, { jp: "集", en: "gather, meet" }, { jp: "別", en: "separate, branch off, diverge" }, { jp: "物", en: "thing, object, matter" }, { jp: "使", en: "use, order, messenger, ambassador" }, { jp: "品", en: "goods, refinement, dignity, article" }, { jp: "計", en: "plot, plan, scheme, measure" }, { jp: "死", en: "death, die" }, { jp: "特", en: "special" }, { jp: "私", en: "private, I, me" }, { jp: "始", en: "commence, begin" }, { jp: "朝", en: "morning" }, { jp: "運", en: "carry, luck, destiny, fate, transport" }, { jp: "終", en: "end, finish" }, { jp: "台", en: "pedestal, a stand, counter for machines and vehicles" }, { jp: "広", en: "wide, broad, spacious" }, { jp: "住", en: "dwell, reside, live, inhabit" }, { jp: "無", en: "nothingness, none, nothing, nil, not" }, { jp: "真", en: "true, reality, Buddhist sect" }, { jp: "有", en: "possess, have, exist, happen" }, { jp: "口", en: "mouth" }, { jp: "少", en: "few, little" }, { jp: "町", en: "town, village, block, street" }, { jp: "料", en: "fee, materials" }, { jp: "工", en: "craft, construction" }, { jp: "建", en: "build" }, { jp: "空", en: "empty, sky, void, vacant, vacuum" }, { jp: "急", en: "hurry, emergency, sudden, steep" }, { jp: "止", en: "stop, halt" }, { jp: "送", en: "escort, send" }, { jp: "切", en: "cut, cutoff, be sharp" }, { jp: "転", en: "revolve, turn around, change" }, { jp: "研", en: "polish, study of, sharpen" }, { jp: "足", en: "leg, foot, be sufficient" }, { jp: "究", en: "research, study" }, { jp: "楽", en: "music, comfort, ease" }, { jp: "起", en: "wake up, get up; rouse" }, { jp: "着", en: "arrive, wear, counter for suits of clothing" }, { jp: "店", en: "store, shop" }, { jp: "病", en: "ill, sick" }, { jp: "質", en: "substance, quality, matter, temperament" }, { jp: "待", en: "wait, depend on" }, { jp: "試", en: "test, try, attempt, experiment" }, { jp: "族", en: "tribe, family" }, { jp: "銀", en: "silver" }, { jp: "早", en: "early, fast" }, { jp: "映", en: "reflect, reflection, projection" }, { jp: "親", en: "parent, intimacy, relative, familiarity" }, { jp: "験", en: "verification, effect, testing" }, { jp: "英", en: "England, English, hero, outstanding" }, { jp: "医", en: "doctor, medicine" }, { jp: "仕", en: "attend, doing, official, serve" }, { jp: "去", en: "gone, past, quit, leave, elapse, eliminate" }, { jp: "味", en: "flavor, taste" }, { jp: "写", en: "copy, be photographed, describe" }, { jp: "字", en: "character, letter, word" }, { jp: "答", en: "solution, answer" }, { jp: "夜", en: "night, evening" }, { jp: "音", en: "sound, noise" }, { jp: "注", en: "pour, irrigate, shed (tears), flow into, concentrate on" }, { jp: "帰", en: "homecoming, arrive at, lead to, result in" }, { jp: "古", en: "old" }, { jp: "歌", en: "song, sing" }, { jp: "買", en: "buy" }, { jp: "悪", en: "bad, evil, wrong" }, { jp: "図", en: "map, drawing, plan, extraordinary" }, { jp: "週", en: "week" }, { jp: "室", en: "room, apartment, chamber, greenhouse, cellar" }, { jp: "歩", en: "walk, counter for steps" }, { jp: "風", en: "wind, air, style, manner" }, { jp: "紙", en: "paper" }, { jp: "黒", en: "black" }, { jp: "花", en: "flower" }, { jp: "春", en: "spring" }, { jp: "赤", en: "red" }, { jp: "青", en: "blue" }, { jp: "館", en: "building, mansion, large building, palace" }, { jp: "屋", en: "roof, house, shop, dealer, seller" }, { jp: "色", en: "color" }, { jp: "走", en: "run" }, { jp: "秋", en: "autumn, fall" }, { jp: "夏", en: "summer" }, { jp: "習", en: "learn" }, { jp: "駅", en: "station" }, { jp: "洋", en: "ocean, sea, foreign, Western style" }, { jp: "旅", en: "trip, travel" }, { jp: "服", en: "clothing, admit, obey" }, { jp: "夕", en: "evening" }, { jp: "借", en: "borrow, rent" }, { jp: "曜", en: "weekday" }, { jp: "飲", en: "drink" }, { jp: "肉", en: "meat" }, { jp: "貸", en: "lend" }, { jp: "堂", en: "public chamber, hall" }, { jp: "鳥", en: "bird, chicken" }, { jp: "飯", en: "meal, rice" }, { jp: "勉", en: "exertion, endeavor, effort" }, { jp: "冬", en: "winter" }, { jp: "昼", en: "daytime, noon" }, { jp: "茶", en: "tea" }, { jp: "弟", en: "younger brother" }, { jp: "牛", en: "cow" }, { jp: "魚", en: "fish" }, { jp: "兄", en: "elder brother" }, { jp: "犬", en: "dog" }, { jp: "妹", en: "younger sister" }, { jp: "姉", en: "elder sister" }, { jp: "漢", en: "China" }], n3: [{ jp: "政", en: "politics, government" }, { jp: "議", en: "deliberation, consultation, debate" }, { jp: "民", en: "people, nation, subjects" }, { jp: "連", en: "take along, lead, join, connect" }, { jp: "対", en: "opposite, even, equal, versus, anti-, compare" }, { jp: "部", en: "section, bureau, dept, class, copy, part, portion" }, { jp: "合", en: "fit, suit, join, 0.1" }, { jp: "市", en: "market, city, town" }, { jp: "内", en: "inside, within, between, among, house, home" }, { jp: "相", en: "inter-, mutual, together, each other, minister of state" }, { jp: "定", en: "determine, fix, establish, decide" }, { jp: "回", en: "-times, round, revolve, counter" }, { jp: "選", en: "elect, select, choose, prefer" }, { jp: "米", en: "rice, USA, meter" }, { jp: "実", en: "reality, truth" }, { jp: "関", en: "connection, barrier, gateway, involve, concerning" }, { jp: "決", en: "decide, fix, agree upon, appoint" }, { jp: "全", en: "whole, entire, all, complete, fulfill" }, { jp: "表", en: "surface, table, chart, diagram" }, { jp: "戦", en: "war, battle, match" }, { jp: "経", en: "longitude, pass thru, expire, warp" }, { jp: "最", en: "utmost, most, extreme" }, { jp: "現", en: "present, existing, actual" }, { jp: "調", en: "tune, tone, meter, prepare, investigate" },
        { jp: "化", en: "change, take the form of, influence, enchant, delude, -ization" }, { jp: "当", en: "hit, right, appropriate" }, { jp: "約", en: "promise, approximately, shrink" }, { jp: "首", en: "neck" }, { jp: "法", en: "method, law, rule, principle, model, system" }, { jp: "性", en: "sex, gender, nature" }, { jp: "的", en: "mark, target, object, adjective ending" }, { jp: "要", en: "need, main point, essence, pivot" }, { jp: "制", en: "system, law, rule" }, { jp: "治", en: "reign, cure, heal" }, { jp: "務", en: "task, duties" }, { jp: "成", en: "turn into, become, get, grow, elapse" }, { jp: "期", en: "period, time, date, term" }, { jp: "取", en: "take, fetch" }, { jp: "都", en: "metropolis, capital" }, { jp: "和", en: "harmony, Japanese style, peace" }, { jp: "機", en: "machine, airplane, opportunity" }, { jp: "平", en: "even, flat, peace" }, { jp: "加", en: "add, addition, increase, join" }, { jp: "受", en: "accept, undergo, answer (phone), take" }, { jp: "続", en: "continue, series, sequel" }, { jp: "進", en: "advance, proceed" }, { jp: "数", en: "number, strength, fate, law, figures" }, { jp: "記", en: "scribe, account, narrative" }, { jp: "初", en: "first time, beginning" }, { jp: "指", en: "finger, point to, indicate" }, { jp: "権", en: "authority, power, rights" }, { jp: "支", en: "branch, support, sustain" }, { jp: "産", en: "products, bear, give birth" }, { jp: "点", en: "spot, point, mark" }, { jp: "報", en: "report, news, reward" }, { jp: "済", en: "settle, relieve, finish" }, { jp: "活", en: "living" }, { jp: "原", en: "original, primitive, field" }, { jp: "共", en: "together, both, neither" }, { jp: "得", en: "gain, get, find, earn, acquire, can, may, able to, profit" }, { jp: "解", en: "unravel, explanation" }, { jp: "交", en: "mingle, mixing, association, coming &amp; going" }, { jp: "資", en: "assets, resources, capital, funds, data, be conducive to" }, { jp: "予", en: "beforehand, previous, myself, I" }, { jp: "向", en: "facing, beyond" }, { jp: "際", en: "occasion, time" }, { jp: "勝", en: "victory, win" }, { jp: "面", en: "mask, face, features, surface" }, { jp: "告", en: "revelation, inform" }, { jp: "反", en: "anti-" }, { jp: "判", en: "judgement, signature" }, { jp: "認", en: "acknowledge, witness, recognize" }, { jp: "参", en: "going, coming, participate" }, { jp: "利", en: "profit, advantage, benefit" }, { jp: "組", en: "association, assemble, unite" }, { jp: "信", en: "faith, truth, trust" }, { jp: "在", en: "exist, outskirts" }, { jp: "件", en: "affair, case, matter" }, { jp: "側", en: "side, lean, oppose" }, { jp: "任", en: "responsibility, duty" }, { jp: "引", en: "pull, tug, jerk" }, { jp: "求", en: "request, want, demand" }, { jp: "所", en: "place, extent" }, { jp: "次", en: "next, order" }, { jp: "昨", en: "yesterday, previous" }, { jp: "論", en: "argument, discourse" }, { jp: "官", en: "bureaucrat, the government, organ" }, { jp: "増", en: "increase, add" }, { jp: "係", en: "person in charge, connection" }, { jp: "感", en: "emotion, feeling, sensation" }, { jp: "情", en: "feelings, emotion, passion" }, { jp: "投", en: "throw, discard" }, { jp: "示", en: "show, indicate, display" }, { jp: "変", en: "unusual, change, strange" }, { jp: "打", en: "strike, hit, knock" }, { jp: "直", en: "straightaway, honesty, frankness, fix, repair" }, { jp: "両", en: "both" }, { jp: "式", en: "style, ceremony" }, { jp: "確", en: "assurance, firm, confirm" }, { jp: "果", en: "fruit, reward, carry out, achieve, complete" }, { jp: "容", en: "contain, form" }, { jp: "必", en: "invariably, certain, inevitable" }, { jp: "演", en: "performance, act, play, render, stage" }, { jp: "歳", en: "age, year-end" }, { jp: "争", en: "contend, dispute, argue" }, { jp: "談", en: "discuss, talk" }, { jp: "能", en: "ability, talent, skill, capacity" }, { jp: "位", en: "rank, grade, about" }, { jp: "置", en: "placement, put, set, deposit, leave behind" }, { jp: "流", en: "current, flow" }, { jp: "格", en: "status, rank, capacity" }, { jp: "疑", en: "doubt, distrust" }, { jp: "過", en: "overdo, exceed, go beyond" }, { jp: "局", en: "bureau, board, office" }, { jp: "放", en: "set free, release" }, { jp: "常", en: "usual, ordinary, normal" }, { jp: "状", en: "conditions, form, appearance" }, { jp: "球", en: "ball, sphere" }, { jp: "職", en: "post, employment, work" }, { jp: "与", en: "give, award" }, { jp: "供", en: "submit, offer, present, accompany" }, { jp: "役", en: "duty, service, role" }, { jp: "構", en: "posture, build, pretend" }, { jp: "割", en: "proportion, divide, cut, separate" }, { jp: "身", en: "somebody, person" }, { jp: "費", en: "expense, consume" }, { jp: "付", en: "adhere, attach, refer to, append" }, { jp: "由", en: "wherefore, a reason" }, { jp: "説", en: "opinion, theory, explanation" }, { jp: "難", en: "difficult, trouble, accident" }, { jp: "優", en: "tenderness, kind, actor" }, { jp: "夫", en: "husband, man" }, { jp: "収", en: "income, obtain, reap, pay, supply, store" }, { jp: "断", en: "severance, decline, refuse, apologize" }, { jp: "石", en: "stone" }, { jp: "違", en: "difference, differ" }, { jp: "消", en: "extinguish, turn off" }, { jp: "神", en: "gods, mind, soul" }, { jp: "番", en: "turn, number in a series" }, { jp: "規", en: "standard, measure" }, { jp: "術", en: "art, technique, skill, means, trick" }, { jp: "備", en: "equip, provision, preparation" }, { jp: "宅", en: "home, house, residence" }, { jp: "害", en: "harm, injury" }, { jp: "配", en: "distribute, spouse" }, { jp: "警", en: "admonish, commandment" }, { jp: "育", en: "bring up, grow up, raise" }, { jp: "席", en: "seat" }, { jp: "訪", en: "call on, visit" }, { jp: "乗", en: "ride" }, { jp: "残", en: "remainder, balance" }, { jp: "想", en: "concept, think, idea" }, { jp: "声", en: "voice" }, { jp: "助", en: "help, rescue, assist" }, { jp: "労", en: "labor, thank for" }, { jp: "例", en: "example" }, { jp: "然", en: "sort of thing, if so" }, { jp: "限", en: "limit, restrict" }, { jp: "追", en: "chase, drive away" }, { jp: "商", en: "deal; selling; merchant" }, { jp: "葉", en: "leaf, plane, needle, blade, counter for flat things" }, { jp: "伝", en: "transmit, go along, walk along, follow, report, communicate, legend, tradition" }, { jp: "働", en: "work" }, { jp: "形", en: "shape, form, style" }, { jp: "景", en: "scenery, view" }, { jp: "落", en: "fall, drop" }, { jp: "好", en: "fond, pleasing, like something" }, { jp: "退", en: "retreat, withdraw, retire, resign, repel, expel, reject" }, { jp: "頭", en: "head" }, { jp: "負", en: "defeat, negative, minus, assume a responsibility" }, { jp: "渡", en: "transit, ferry, cross" }, { jp: "失", en: "lose, error, fault, disadvantage, loss" }, { jp: "差", en: "distinction, difference, variation" }, { jp: "末", en: "end, close, tip" }, { jp: "守", en: "guard, protect, obey" }, { jp: "若", en: "young" }, { jp: "種", en: "species, kind, class, seed" }, { jp: "美", en: "beauty, beautiful" }, { jp: "命", en: "fate, command" }, { jp: "福", en: "blessing, fortune, luck, wealth" }, { jp: "望", en: "ambition, full moon, hope, desire, aspire to, expect" }, { jp: "非", en: "un-, mistake, negative" }, { jp: "観", en: "outlook, appearance, condition" }, { jp: "察", en: "guess, presume, judge" }, { jp: "段", en: "grade, steps, stairs" }, { jp: "横", en: "sideways, side" }, { jp: "深", en: "deep, heighten" }, { jp: "申", en: "have the honor to" }, { jp: "様", en: "manner, situation, polite suffix" }, { jp: "財", en: "property, money, wealth, assets" }, { jp: "港", en: "harbor, port" }, { jp: "識", en: "know" }, { jp: "呼", en: "call, invite" }, { jp: "達", en: "accomplished, reach, arrive, attain" }, { jp: "良", en: "good" }, { jp: "阪", en: "heights, slope" }, { jp: "候", en: "climate, season, weather" }, { jp: "程", en: "extent, degree" }, { jp: "満", en: "full, fullness, enough, satisfy" }, { jp: "敗", en: "failure, defeat" }, { jp: "値", en: "price, cost, value" }, { jp: "突", en: "stab, protruding, thrust" }, { jp: "光", en: "ray, light" }, { jp: "路", en: "path, route, road" }, { jp: "科", en: "department, course, section" }, { jp: "積", en: "volume, contents, pile up, stack" }, { jp: "他", en: "other, another" }, { jp: "処", en: "dispose, manage, deal with" }, { jp: "太", en: "plump, thick, big around" }, { jp: "客", en: "guest, visitor, customer" }, { jp: "否", en: "negate, no, decline" }, { jp: "師", en: "expert, teacher, master" }, { jp: "登", en: "ascend, climb up" }, { jp: "易", en: "easy, ready to, simple" }, { jp: "速", en: "quick, fast" }, { jp: "存", en: "exist, be aware of" }, { jp: " 飛", en: "fly" }, { jp: "殺", en: "kill, murder" }, { jp: "号", en: "number, item" }, { jp: "単", en: "simple, single" }, { jp: "座", en: "squat, seat, sit" }, { jp: "破", en: "rip, tear, break" }, { jp: "除", en: "exclude, remove" }, { jp: "完", en: "perfect, completion" }, { jp: "降", en: "descend, precipitate, fall, surrender" }, { jp: "責", en: "blame, condemn" }, { jp: "捕", en: "catch, capture" }, { jp: "危", en: "dangerous, fear, uneasy" }, { jp: "給", en: "salary, wage, gift" }, { jp: "苦", en: "suffering, bitter" }, { jp: "迎", en: "welcome, meet, greet" }, { jp: "園", en: "park, garden, yard" }, { jp: "具", en: "tool, utensil" }, { jp: "辞", en: "resign, word, term" }, { jp: "因", en: "cause, factor, depend on" }, { jp: "馬", en: "horse" }, { jp: "愛", en: "love, affection" }, { jp: "富", en: "wealth, enrich, abundant" }, { jp: "彼", en: "he, him" }, { jp: "未", en: "un-, not yet" }, { jp: "舞", en: "dance, circle" }, { jp: "亡", en: "deceased, dying" }, { jp: "冷", en: "cool, cold, chill" }, { jp: "適", en: "suitable, occasional, rare" }, { jp: "婦", en: "lady, woman, wife" }, { jp: "寄", en: "draw near, gather" }, { jp: "込", en: "crowded, mixture" }, { jp: "顔", en: "face, expression" }, { jp: "類", en: "sort, kind, variety, class, genus" }, { jp: "余", en: "too much, surplus" }, { jp: "王", en: "king, rule" }, { jp: "返", en: "return, answer" }, { jp: "妻", en: "wife, spouse" }, { jp: "背", en: "stature, height, back" }, { jp: "熱", en: "heat, fever, passion" }, { jp: "宿", en: "inn, lodging" }, { jp: "薬", en: "medicine, chemical" }, { jp: "険", en: "precipitous, inaccessible place" }, { jp: "頼", en: "trust, request" }, { jp: "覚", en: "memorize, learn, remember, awake" }, { jp: "船", en: "ship, boat" }, { jp: "途", en: "route, way, road" }, { jp: "許", en: "permit, approve" }, { jp: "抜", en: "slip out, extract, pull out, remove" }, { jp: "便", en: "convenience, facility" }, { jp: "留", en: "detain, fasten, halt, stop" }, { jp: "罪", en: "guilt, sin, crime" }, { jp: "努", en: "toil, diligent, as much as possible" }, { jp: "精", en: "refined, ghost, fairy, energy" }, { jp: "散", en: "scatter, disperse" }, { jp: "静", en: "quiet" }, { jp: "婚", en: "marriage" }, { jp: "喜", en: "rejoice, take pleasure in" }, { jp: "浮", en: "float, rise to surface" }, { jp: "絶", en: "discontinue, unparalleled" }, { jp: "幸", en: "happiness, blessing, fortune" }, { jp: "押", en: "push" }, { jp: "倒", en: "overthrow, fall, collapse" }, { jp: "等", en: "etc., and so forth" }, { jp: "老", en: "old" }, { jp: "曲", en: "bend, music, melody" }, { jp: "払", en: "pay" }, { jp: "庭", en: "courtyard, garden, yard" }, { jp: " 徒", en: "on foot, junior" }, { jp: "勤", en: "diligence, employed, serve" }, { jp: "遅", en: "slow, late, back, later" }, { jp: "居", en: "reside, to be, exist" }, { jp: "雑", en: "miscellaneous" }, { jp: "招", en: "invite, summon, engage" }, { jp: "困", en: "quandary, become distressed" }, { jp: "欠", en: "lack, gap" }, { jp: "更", en: "renew, renovate, again" }, { jp: "刻", en: "engrave, cut fine, chop" }, { jp: "賛", en: "approve, praise" }, { jp: "抱", en: "embrace, hug" }, { jp: "犯", en: "crime, sin, offense" }, { jp: "恐", en: "fear, dread" }, { jp: "息", en: "breath, son, interest (on money)" }, { jp: "遠", en: "distant, far" },
        { jp: "戻", en: "re-, return, revert" }, { jp: "願", en: "petition, request, wish" }, { jp: "絵", en: "picture, drawing" }, { jp: "越", en: "surpass, cross over, move to, exceed" }, { jp: "欲", en: "longing, greed, passion" }, { jp: "痛", en: "pain, hurt, damage, bruise" }, { jp: "笑", en: "laugh" }, { jp: "互", en: "mutually, reciprocally, together" }, { jp: "束", en: "bundle, manage" }, { jp: "似", en: "becoming, resemble, imitate" }, { jp: "列", en: "file, row, column" }, { jp: "探", en: "search, look for" }, { jp: "逃", en: "escape, flee" }, { jp: "遊", en: "play" }, { jp: "迷", en: "astray, be perplexed, in doubt, lost" }, { jp: "夢", en: "dream, vision" }, { jp: "君", en: "you, male name suffix" }, { jp: "閉", en: "closed, shut" }, { jp: "緒", en: "beginning, end, cord, strap" }, { jp: "折", en: "fold, break, fracture" }, { jp: "草", en: "grass, weeds, herbs" }, { jp: "暮", en: "evening, livelihood" }, { jp: "酒", en: "sake, alcohol" }, { jp: "悲", en: "grieve, sad" }, { jp: "晴", en: "clear up" }, { jp: "掛", en: "hang, suspend" }, { jp: "到", en: "arrival, proceed, reach" }, { jp: "寝", en: "lie down, sleep, rest" }, { jp: "暗", en: "darkness, disappear, shade, informal" }, { jp: "盗", en: "steal, rob" }, { jp: "吸", en: "suck, inhale" }, { jp: "陽", en: "sunshine, positive" }, { jp: "御", en: "honorable" }, { jp: "歯", en: "tooth, cog" }, { jp: "忘", en: "forget" }, { jp: "雪", en: "snow" }, { jp: "吹", en: "blow, breathe, puff" }, { jp: "娘", en: "daughter, girl" }, { jp: "誤", en: "mistake" }, { jp: "洗", en: "wash" }, { jp: "慣", en: "accustomed, get used to" }, { jp: "礼", en: "salute, bow, ceremony, thanks" }, { jp: "窓", en: "window, pane" }, { jp: "昔", en: "once upon a time, old times" }, { jp: "貧", en: "poverty, poor" }, { jp: "怒", en: "angry, be offended" }, { jp: "泳", en: "swim" }, { jp: "祖", en: "ancestor, pioneer, founder" }, { jp: "杯", en: "glass, cup" }, { jp: "疲", en: "exhausted, tire" }, { jp: "皆", en: "all, everyone, everybody" }, { jp: "鳴", en: "chirp, cry, bark" }, { jp: "腹", en: "abdomen, belly, stomach" }, { jp: "煙", en: "smoke" }, { jp: "眠", en: "sleep" }, { jp: "怖", en: "dreadful, fearful" }, { jp: "耳", en: "ear" }, { jp: "頂", en: "receive, top, summit, peak" }, { jp: "箱", en: "box, chest" }, { jp: "晩", en: "nightfall, night" }, { jp: "寒", en: "cold" }, { jp: "髪", en: "hair (on the head)" }, { jp: "忙", en: "busy, occupied" }, { jp: "才", en: "genius, years old" }, { jp: "靴", en: "shoes" }, { jp: "恥", en: "shame, dishonor" }, { jp: "偶", en: "accidentally, even number" }, { jp: "偉", en: "admirable, greatness" }, { jp: "猫", en: "cat" }, { jp: "幾", en: "how many, how much, some" }, { jp: "誰", en: "who, someone, somebody" }], n2: [{ jp: "党", en: "party, faction, clique" }, { jp: "協", en: "co-, cooperation" }, { jp: "総", en: "general, whole, all" }, { jp: "区", en: "ward, district" }, { jp: "領", en: "jurisdiction, dominion" }, { jp: "県", en: "prefecture" }, { jp: "設", en: "establishment, provision" }, { jp: "保", en: "protect, guarantee, keep" }, { jp: "改", en: "reformation, change, modify" }, { jp: "第", en: "No., number" }, { jp: "結", en: "tie, bind, contract" }, { jp: "派", en: "faction, group, party" }, { jp: "府", en: "borough, urban prefecture, govt office" }, { jp: "査", en: "investigate" }, { jp: "委", en: "committee, entrust to" }, { jp: "軍", en: "army, force, troops" }, { jp: "案", en: "plan, suggestion, draft" }, { jp: "策", en: "scheme, plan, policy" }, { jp: "団", en: "group, association" }, { jp: "各", en: "each; every; either" }, { jp: "島", en: "island" }, { jp: "革", en: "leather; skin; reform; become serious" }, { jp: "村", en: "village; town" }, { jp: "勢", en: "forces; energy; military strength" }, { jp: "減", en: "dwindle; decrease; reduce" }, { jp: "再", en: "again, twice, second time" }, { jp: "税", en: "tax; duty" }, { jp: "営", en: "occupation; camp; perform; build; conduct (business)" }, { jp: "比", en: "compare; race; ratio" }, { jp: "防", en: "ward off; defend; protect; resist" }, { jp: "補", en: "supplement; supply; offset; compensate" }, { jp: "境", en: "boundary, border, region" }, { jp: "導", en: "guidance; leading; conduct; usher" }, { jp: "副", en: "vice-; assistant; aide; duplicate; copy" }, { jp: "算", en: "calculate; divining; number; probability" }, { jp: "輸", en: "transport, send, be inferior" }, { jp: "述", en: "mention; state; speak" }, { jp: "線", en: "line; track" }, { jp: "農", en: "agriculture; farmers" }, { jp: "州", en: "state; province" }, { jp: "武", en: "warrior; military; chivalry; arms" }, { jp: "象", en: "elephant; pattern after; image; shape" }, { jp: "域", en: "range; region; limits; stage; level" }, { jp: "額", en: "forehead; tablet; framed picture; sum; amount; volume" }, { jp: "欧", en: "Europe" }, { jp: "担", en: "shouldering; carry; raise; bear" }, { jp: "準", en: "semi-; correspond to; imitate" }, { jp: "賞", en: "prize; reward; praise" }, { jp: "辺", en: "environs; boundary; border; vicinity" }, { jp: "造", en: "create; make; structure; physique" }, { jp: "被", en: "incur; cover; shelter; wear; put on" }, { jp: "技", en: "skill; art; craft; ability; vocation; arts" }, { jp: "低", en: "lower; short; humble" }, { jp: "復", en: "restore, return to, revert" }, { jp: "移", en: "shift, move, change" }, { jp: "個", en: "individual; counter for articles" }, { jp: "門", en: "gate" }, { jp: "課", en: "chapter, lesson, section, department" }, { jp: "脳", en: "brain; memory" }, { jp: "極", en: "poles; settlement; conclusion; end" }, { jp: "含", en: "contain; include" }, { jp: "蔵", en: "storehouse; hide; own; have; possess" }, { jp: "量", en: "quantity; measure; weight; amount" }, { jp: "型", en: "type; model" }, { jp: "況", en: "condition; situation" }, { jp: "針", en: "needle; pin; staple; stinger" }, { jp: "専", en: "specialty; exclusive; mainly; solely" }, { jp: "谷", en: "valley" }, { jp: "史", en: "history; chronicle" }, { jp: "階", en: "stair; counter for building story" }, { jp: "管", en: "pipe; tube; wind instrument; control; jurisdiction" }, { jp: "兵", en: "soldier; private; troops; army" }, { jp: "接", en: "touch; contact; adjoin; piece together" }, { jp: "細", en: "slender; narrow; detailed; precise" }, { jp: "効", en: "merit; efficacy; efficiency; benefit" }, { jp: "丸", en: "round; full (month); perfection" }, { jp: "湾", en: "gulf; bay; inlet" }, { jp: "録", en: "record" }, { jp: "省", en: "focus; government ministry; conserve" }, { jp: "旧", en: "old times; old things; former; ex-" }, { jp: "橋", en: "bridge" }, { jp: "岸", en: "beach" }, { jp: "周", en: "circumference; circuit; lap" }, { jp: "材", en: "lumber, log, timber, wood" }, { jp: "戸", en: "door; counter for houses" }, { jp: "央", en: "center; middle" }, { jp: "券", en: "ticket" }, { jp: "編", en: "compilation; knit; braid; twist; editing" }, { jp: "捜", en: "search; look for; locate" }, { jp: "竹", en: "bamboo" }, { jp: "超", en: "transcend; super-; ultra-" }, { jp: "並", en: "row, and, besides" }, { jp: "療", en: "heal; cure" }, { jp: "採", en: "pick; take; fetch; take up" }, { jp: "森", en: "forest, woods" }, { jp: "競", en: "compete with; bid; contest; race" }, { jp: "介", en: "jammed in; shellfish; mediate" }, { jp: "根", en: "root; radical" }, { jp: "販", en: "marketing, sell, trade" }, { jp: "歴", en: "curriculum; continuation; passage of time" }, { jp: "将", en: "leader; commander; general; admiral" }, { jp: "幅", en: "hanging scroll; width" }, { jp: "般", en: "carrier; carry; all; general; sort; kind" }, { jp: "貿", en: "trade; exchange" }, { jp: "講", en: "lecture; club; association" }, { jp: "林", en: "grove; forest" }, { jp: "装", en: "attire; dress; pretend; disguise" }, { jp: "諸", en: "various; many; several; together" }, { jp: "劇", en: "drama; play" }, { jp: "河", en: "river" }, { jp: "航", en: "navigate; sail; cruise; fly" }, { jp: "鉄", en: "iron" }, { jp: "児", en: "newborn babe; child" }, { jp: "禁", en: "prohibition; ban; forbid" }, { jp: "印", en: "stamp; seal; mark; symbol; trademark" }, { jp: "逆", en: "inverted; reverse; opposite" }, { jp: "換", en: "interchange; period; change; convert; replace; renew" }, { jp: "久", en: "long time; old story" }, { jp: "短", en: "short; fault; defect; weak point" }, { jp: "油", en: "oil; fat" }, { jp: "暴", en: "outburst; force; violence" }, { jp: "輪", en: "wheel; ring; circle; link; loop; counter for wheels and flowers" }, { jp: "占", en: "fortune-telling; divining; forecasting" }, { jp: "植", en: "plant" }, { jp: "清", en: "pure; purify; cleanse" }, { jp: "倍", en: "double; twice; times; fold" }, { jp: "均", en: "level; average" }, { jp: "億", en: "hundred million; 10**8" }, { jp: "圧", en: "pressure; push; overwhelm; oppress" }, { jp: "芸", en: "technique; art; craft; performance; acting" }, { jp: "署", en: "signature; govt office; police station" }, { jp: "伸", en: "expand; stretch; extend" }, { jp: "停", en: "halt; stopping" }, { jp: "爆", en: "bomb; burst open" }, { jp: "陸", en: "land; six" }, { jp: "玉", en: "jewel; ball" }, { jp: "波", en: "waves; billows" }, { jp: "帯", en: "sash; belt; obi; zone; region" }, { jp: "延", en: "prolong; stretching" }, { jp: "羽", en: "feathers; counter for birds, rabbits" }, { jp: "固", en: "harden; set; clot; curdle" }, { jp: "則", en: "rule; follow; based on" }, { jp: "乱", en: "riot; war; disorder; disturb" }, { jp: "普", en: "universal; generally" }, { jp: "測", en: "fathom; plan; scheme; measure" }, { jp: "豊", en: "bountiful; excellent; rich" }, { jp: "厚", en: "thick; heavy; rich" }, { jp: "齢", en: "age" }, { jp: "囲", en: "surround; enclosure; preserve; keep" }, { jp: "卒", en: "graduate; soldier; private; die" }, { jp: "略", en: "abbreviation; omission; outline; shorten" }, { jp: "承", en: "hear; listen to; be informed; receive" }, { jp: "順", en: "obey; order; turn; occasion" }, { jp: "岩", en: "boulder; rock; cliff" }, { jp: "練", en: "practice, gloss, train, drill, polish, refine" }, { jp: "軽", en: "lightly; trifling; unimportant" }, { jp: "了", en: "complete; finish" }, { jp: "庁", en: "government office" }, { jp: "城", en: "castle" }, { jp: "患", en: "afflicted; disease; suffer from; be ill" }, { jp: "層", en: "stratum; social class; layer; story; floor" }, { jp: "版", en: "printing block; edition; impression; label" }, { jp: "令", en: "orders; command; decree" }, { jp: "角", en: "angle; corner; square" }, { jp: "絡", en: "entwine; coil around; get caught in" }, { jp: "損", en: "damage; loss; disadvantage; hurt; injure" }, { jp: "募", en: "recruit; campaign" }, { jp: "裏", en: "back; reverse; inside; rear" }, { jp: "仏", en: "Buddha; the dead" }, { jp: "績", en: "exploits; achievements" }, { jp: "築", en: "fabricate; build; construct" }, { jp: "貨", en: "freight; goods; property" }, { jp: "混", en: "mix; blend; confuse" }, { jp: "昇", en: "rise up" }, { jp: "池", en: "pond; pool; reservoir" }, { jp: "血", en: "blood" }, { jp: "温", en: "warm" }, { jp: "季", en: "seasons" }, { jp: "星", en: "star" }, { jp: "永", en: "eternity; long; lengthy" }, { jp: "著", en: "renowned; publish; write" }, { jp: "誌", en: "document; records" }, { jp: "庫", en: "warehouse; storehouse" }, { jp: "刊", en: "publish; carve; engrave" }, { jp: "像", en: "statue; picture; image; figure" }, { jp: "香", en: "incense; smell; perfume" }, { jp: "坂", en: "slope; incline; hill" }, { jp: "底", en: "bottom; sole; depth; bottom price" }, { jp: "布", en: "linen; cloth; spread; distribute" }, { jp: "寺", en: "Buddhist temple" }, { jp: "宇", en: "eaves; roof; house; heaven" }, { jp: "巨", en: "gigantic; big; large; great" }, { jp: "震", en: "quake; shake; tremble; quiver" }, { jp: "希", en: "hope; beg; request; pray" }, { jp: "触", en: "contact; touch; feel; hit; proclaim; announce" }, { jp: "依", en: "reliant; depend on; consequently; therefore; due to" },
        { jp: "籍", en: "enroll; register; membership" }, { jp: "汚", en: "dirty; pollute; disgrace; defile" }, { jp: "枚", en: "sheet of...; counter for flat thin objects" }, { jp: "複", en: "duplicate; double; compound; multiple" }, { jp: "郵", en: "mail; stagecoach stop" }, { jp: "仲", en: "go-between; relationship" }, { jp: "栄", en: "flourish; prosperity; honor" }, { jp: "札", en: "ticket; paper money; banknote; note" }, { jp: "板", en: "plank; board; plate; stage" }, { jp: "骨", en: "skeleton; bone; remains; frame" }, { jp: "傾", en: "lean; incline; tilt; trend; bias" }, { jp: "届", en: "deliver; reach; arrive; report" }, { jp: "巻", en: "scroll; volume; book; part; roll up; wind up; coil; counter for texts (or book scrolls)" }, { jp: "燃", en: "burn; blaze; glow" }, { jp: "跡", en: "tracks; mark; print; impression" }, { jp: "包", en: "wrap; pack up; cover; conceal" }, { jp: "駐", en: "stop-over; reside in; resident" }, { jp: "弱", en: "weak; frail" }, { jp: "紹", en: "introduce; inherit; help" }, { jp: "雇", en: "employ; hire" }, { jp: "替", en: "exchange, spare, substitute" }, { jp: "預", en: "deposit; custody; leave with; entrust to" }, { jp: "焼", en: "bake; burning" }, { jp: "簡", en: "simplicity; brevity" }, { jp: "章", en: "badge; chapter; composition; poem" }, { jp: "臓", en: "entrails; viscera; bowels" }, { jp: "律", en: "rhythm; law; regulation; control" }, { jp: "贈", en: "presents; send; give to; award to" }, { jp: "照", en: "illuminate; shine; compare" }, { jp: "薄", en: "dilute; thin; weak (tea)" }, { jp: "群", en: "flock; group; crowd; herd" }, { jp: "秒", en: "second" }, { jp: "奥", en: "heart; interior" }, { jp: "詰", en: "packed; close; rebuke; blame" }, { jp: "双", en: "pair; set; comparison; counter for pairs" }, { jp: "刺", en: "thorn, pierce, stab, prick, sting" }, { jp: "純", en: "genuine; purity; innocence" }, { jp: "翌", en: "the following; next" }, { jp: "快", en: "cheerful; pleasant; agreeable; comfortable" }, { jp: "片", en: "one-sided; piece" }, { jp: "敬", en: "awe; respect; honor; revere" }, { jp: "悩", en: "trouble; worry; in pain; distress; illness" }, { jp: "泉", en: "spring; fountain" }, { jp: "皮", en: "skin; hide; leather" }, { jp: "漁", en: "fishing; fishery" }, { jp: "荒", en: "rough; wild" }, { jp: "貯", en: "savings; store" }, { jp: "硬", en: "stiff; hard" }, { jp: "埋", en: "bury; be filled up; embedded" }, { jp: "柱", en: "pillar; post; cylinder; support" }, { jp: "祭", en: "ritual; offer prayers; celebrate" }, { jp: "袋", en: "sack; bag; pouch" }, { jp: "筆", en: "writing brush; writing; painting brush; handwriting" }, { jp: "訓", en: "instruction, explanation, read" }, { jp: "浴", en: "bathe; be favored with; bask in" }, { jp: "童", en: "juvenile; child" }, { jp: "宝", en: "treasure; wealth; valuables" }, { jp: "封", en: "seal; closing" }, { jp: "胸", en: "bosom; breast; chest; heart; feelings" }, { jp: "砂", en: "sand" }, { jp: "塩", en: "salt" }, { jp: "賢", en: "intelligent; wise; wisdom; cleverness" }, { jp: "腕", en: "arm; ability; talent" }, { jp: "兆", en: "trillion; sign; omen; symptoms" }, { jp: "床", en: "bed; counter for beds; floor; padding; tatami" }, { jp: "毛", en: "fur; hair; feather" }, { jp: "緑", en: "green" }, { jp: "尊", en: "revered; valuable; precious; noble" }, { jp: "祝", en: "celebrate; congratulate" }, { jp: "柔", en: "tender; weakness; gentleness; softness" }, { jp: "殿", en: "Mr.; hall; mansion; palace; temple; lord" }, { jp: "濃", en: "concentrated; thick; dark; undiluted" }, { jp: "液", en: "fluid; liquid; juice; sap; secretion" }, { jp: "衣", en: "garment; clothes; dressing" }, { jp: "肩", en: "shoulder" }, { jp: "零", en: "zero; spill; overflow; nothing" }, { jp: "幼", en: "infancy; childhood" }, { jp: "荷", en: "baggage; load; cargo; freight" }, { jp: "泊", en: "overnight stay" }, { jp: "黄", en: "yellow" }, { jp: "甘", en: "sweet; coax; pamper; sugary" }, { jp: "臣", en: "retainer; subject" }, { jp: "浅", en: "shallow; superficial; frivolous" }, { jp: "掃", en: "sweep; brush" }, { jp: "雲", en: "cloud" }, { jp: "掘", en: "dig; delve; excavate" }, { jp: "捨", en: "discard; throw away; abandon" }, { jp: "軟", en: "soft" }, { jp: "沈", en: "sink; be submerged; subside; be depressed" }, { jp: "凍", en: "frozen; refrigerate" }, { jp: "乳", en: "milk, breasts" }, { jp: "恋", en: "romance; in love; yearn for; miss" }, { jp: "紅", en: "crimson; deep red" }, { jp: "郊", en: "outskirts, suburbs, rural area" }, { jp: "腰", en: "loins; hips; waist" }, { jp: "炭", en: "charcoal; coal" }, { jp: "踊", en: "jump; dance; leap; skip" }, { jp: "冊", en: "counter for books; volume" }, { jp: "勇", en: "courage; cheer up; bravery; heroism" }, { jp: "械", en: "contraption; machine; instrument" }, { jp: "菜", en: "vegetable; side dish; greens" }, { jp: "珍", en: "rare; curious; strange" }, { jp: "卵", en: "egg" }, { jp: "湖", en: "lake" }, { jp: "喫", en: "consume, eat, drink, smoke, receive" }, { jp: "干", en: "dry; parch" }, { jp: "虫", en: "insect; bug" }, { jp: "刷", en: "printing; print; brush" }, { jp: "湯", en: "hot water; bath; hot spring" }, { jp: "溶", en: "melt; dissolve; thaw" }, { jp: "鉱", en: "mineral; ore" }, { jp: "涙", en: "tears; sympathy" }, { jp: "匹", en: "counter for small animals" }, { jp: "孫", en: "grandchild; descendants" }, { jp: "鋭", en: "pointed; sharpness; edge; weapon; sharp; violent" }, { jp: "枝", en: "bough; branch; twig; limb; counter for branches" }, { jp: "塗", en: "paint; smear; coating" }, { jp: "軒", en: "flats; counter for houses" }, { jp: "毒", en: "poison; germ; harm" }, { jp: "叫", en: "shout; exclaim; yell" }, { jp: "拝", en: "worship; adore; pray to" }, { jp: "氷", en: "ice; hail; freeze" }, { jp: "乾", en: "drought; dry; drink up; heaven" }, { jp: "棒", en: "rod; stick; cane; pole" }, { jp: "祈", en: "pray; wish" }, { jp: "拾", en: "pick up; gather; find" }, { jp: "粉", en: "flour; powder; dust" }, { jp: "糸", en: "thread" }, { jp: "綿", en: "cotton" }, { jp: "汗", en: "sweat; perspire" }, { jp: "銅", en: "copper" }, { jp: "湿", en: "damp; wet; moist" }, { jp: "瓶", en: "bottle; jar; jug; urn" }, { jp: "咲", en: "blossom; bloom" }, { jp: "召", en: "call; send for; wear; buy, to eat, to drink" }, { jp: "缶", en: "tin can; container" }, { jp: "隻", en: "vessels; counter for ships; fish; one of a pair" }, { jp: "脂", en: "fat; grease; lard" }, { jp: "蒸", en: "steam; heat; foment" }, { jp: "肌", en: "texture; skin; body; grain" }, { jp: "耕", en: "till; plow; cultivate" }, { jp: "鈍", en: "dull; slow; foolish; blunt" }, { jp: "泥", en: "mud; adhere to; be attached to" }, { jp: "隅", en: "corner; nook" }, { jp: "灯", en: "lamp; a light; counter for lights" }, { jp: "辛", en: "spicy; hot" }, { jp: "磨", en: "grind; polish; improve; brush (teeth)" }, { jp: "麦", en: "barley; wheat" }, { jp: "姓", en: "surname" }, { jp: "筒", en: "cylinder; pipe; tube" }, { jp: "鼻", en: "nose; snout" }, { jp: "粒", en: "grains; drop; counter for tiny particles" }, { jp: "詞", en: "part of speech; words" }, { jp: "胃", en: "stomach; crop" }, { jp: "畳", en: "tatami mat; fold" }, { jp: "机", en: "desk; table" }, { jp: "膚", en: "skin; body; texture" }, { jp: "濯", en: "laundry; wash; rinse" }, { jp: "塔", en: "pagoda; tower; steeple" }, { jp: "沸", en: "seethe; boil; ferment" }, { jp: "灰", en: "ashes; cremate" }, { jp: "菓", en: "candy; cakes; fruit" }, { jp: "帽", en: "cap; headgear" }, { jp: "枯", en: "wither; die; dry up; be seasoned" }, { jp: "涼", en: "refreshing; nice and cool" }, { jp: "舟", en: "boat; ship" }, { jp: "貝", en: "shellfish" }, { jp: "符", en: "token; sign; mark" }, { jp: "憎", en: "hate; detest" }, { jp: "皿", en: "dish; a helping; plate" }, { jp: "肯", en: "agreement; consent; comply with" }, { jp: "燥", en: "parch; dry up" }, { jp: "畜", en: "livestock; domestic fowl and animals" }, { jp: "坊", en: "boy, priest" }, { jp: "挟", en: "pinch; between" }, { jp: "曇", en: "cloudy weather" }, { jp: "滴", en: "drip; drop" }, { jp: "伺", en: "visit; ask; inquire; question" }], n1: [{ jp: "亜", en: "Asia, rank next" }, { jp: "阿", en: "Africa, flatter" }, { jp: "哀", en: "pathetic, grief" }, { jp: "葵", en: "hollyhock" }, { jp: "茜", en: "madder, red dye" }, { jp: "握", en: "grip, hold" }, { jp: "渥", en: "kindness, moisten" }, { jp: "旭", en: "rising sun, morning sun" }, { jp: "梓", en: "catalpa tree, woodblock printing" }, { jp: "扱", en: "handle, entertain" }, { jp: "絢", en: "brilliant fabric design" }, { jp: "綾", en: "design, figured cloth" }, { jp: "鮎", en: "freshwater trout, smelt" }, { jp: "案", en: "plan, suggestion" }, { jp: "杏", en: "apricot" }, { jp: "伊", en: "Italy, that one" }, { jp: "威", en: "intimidate, dignity" }, { jp: "尉", en: "military officer, jailer" }, { jp: "惟", en: "consider, reflect" }, { jp: "慰", en: "consolation, amusement" }, { jp: "為", en: "do, change" }, { jp: "異", en: "uncommon, different" }, { jp: "維", en: "fiber, tie" }, { jp: "緯", en: "horizontal, woof" }, { jp: "遺", en: "bequeath, leave behind" }, { jp: "井", en: "well, well crib" }, { jp: "亥", en: "sign of the hog, 9-11PM" }, { jp: "郁", en: "cultural progress, perfume" }, { jp: "磯", en: "seashore, beach" }, { jp: "壱", en: "one (in documents)" }, { jp: "逸", en: "deviate, idleness" }, { jp: "稲", en: "rice plant" }, { jp: "芋", en: "potato" }, { jp: "允", en: "license, sincerity" }, { jp: "姻", en: "matrimony, marry" }, { jp: "胤", en: "descendent, issue" }, { jp: "陰", en: "shade, yin" }, { jp: "隠", en: "conceal, hide" }, { jp: "韻", en: "rhyme, elegance" }, { jp: "卯", en: "sign of the hare or rabbit, fourth sign of Chinese zodiac" }, { jp: "丑", en: "sign of the ox or cow, 1-3AM" }, { jp: "渦", en: "whirlpool, eddy" }, { jp: "唄", en: "song, ballad" }, { jp: "浦", en: "bay, creek" }, { jp: "叡", en: "intelligence, imperial" }, { jp: "影", en: "shadow, silhouette" }, { jp: "瑛", en: "sparkle of jewelry, crystal" }, { jp: "衛", en: "defense, protection" }, { jp: "詠", en: "recitation, poem" }, { jp: "疫", en: "epidemic" }, { jp: "益", en: "benefit, gain" }, { jp: "悦", en: "ecstasy, joy" }, { jp: "謁", en: "audience, audience (with king)" }, { jp: "閲", en: "review, inspection" }, { jp: "宴", en: "banquet, feast" }, { jp: "援", en: "abet, help" }, { jp: "沿", en: "run alongside, follow along" }, { jp: "炎", en: "inflammation, flame" }, { jp: "猿", en: "monkey" }, { jp: "縁", en: "affinity, relation" }, { jp: "艶", en: "glossy, luster" }, { jp: "苑", en: "garden, farm" }, { jp: "鉛", en: "lead" }, { jp: "於", en: "at, in" }, { jp: "凹", en: "concave, hollow" }, { jp: "往", en: "journey, travel" }, { jp: "応", en: "apply, answer" }, { jp: "旺", en: "flourishing, successful" }, { jp: "殴", en: "assault, hit" }, { jp: "翁", en: "venerable old man" }, { jp: "沖", en: "open sea, offing" }, { jp: "憶", en: "recollection, think" }, { jp: "乙", en: "the latter, duplicate" }, { jp: "卸", en: "wholesale" }, { jp: "恩", en: "grace, kindness" }, { jp: "穏", en: "calm, quiet" }, { jp: "仮", en: "sham, temporary" }, { jp: "伽", en: "nursing, attending" }, { jp: "価", en: "value, price" }, { jp: "佳", en: "excellent, beautiful" }, { jp: "嘉", en: "applaud, praise" }, { jp: "嫁", en: "marry into, bride" }, { jp: "寡", en: "widow, minority" }, { jp: "暇", en: "spare time, rest" }, { jp: "架", en: "erect, frame" }, { jp: "禍", en: "calamity, misfortune" }, { jp: "稼", en: "earnings, work" }, { jp: "箇", en: "counter for articles" }, { jp: "茄", en: "eggplant" }, { jp: "華", en: "splendor, flower" }, { jp: "霞", en: "be hazy, grow dim" }, { jp: "蚊", en: "mosquito" }, { jp: "我", en: "ego, I" }, { jp: "芽", en: "bud, sprout" }, { jp: "賀", en: "congratulations, joy" }, { jp: "雅", en: "gracious, elegant" }, { jp: "餓", en: "starve, hungry" }, { jp: "塊", en: "clod, lump" }, { jp: "壊", en: "demolition, break" }, { jp: "怪", en: "suspicious, mystery" }, { jp: "悔", en: "repent, regret" }, { jp: "懐", en: "pocket, feelings" },
        { jp: "戒", en: "commandment" }, { jp: "拐", en: "kidnap, falsify" }, { jp: "魁", en: "charging ahead of others" }, { jp: "凱", en: "victory song" }, { jp: "劾", en: "censure, criminal investigation" }, { jp: "慨", en: "rue, be sad" }, { jp: "概", en: "outline, condition" }, { jp: "涯", en: "horizon, shore" }, { jp: "街", en: "boulevard, street" }, { jp: "該", en: "above-stated, the said" }, { jp: "馨", en: "fragrant, balmy" }, { jp: "垣", en: "hedge, fence" }, { jp: "嚇", en: "menacing, dignity" }, { jp: "拡", en: "broaden, extend" }, { jp: "核", en: "nucleus, core" }, { jp: "殻", en: "husk, nut shell" }, { jp: "獲", en: "seize, get" }, { jp: "穫", en: "harvest, reap" }, { jp: "較", en: "contrast, compare" }, { jp: "郭", en: "enclosure, quarters" }, { jp: "閣", en: "tower, tall building" }, { jp: "隔", en: "isolate, alternate" }, { jp: "岳", en: "point, peak" }, { jp: "潟", en: "lagoon" }, { jp: "喝", en: "hoarse, scold" }, { jp: "括", en: "fasten, tie up" }, { jp: "渇", en: "thirst, dry up" }, { jp: "滑", en: "slippery, slide" }, { jp: "褐", en: "brown, woollen kimono" }, { jp: "轄", en: "control, wedge" }, { jp: "且", en: "moreover, also" }, { jp: "叶", en: "grant, answer" }, { jp: "樺", en: "birch, dark red" }, { jp: "株", en: "stocks, stump" }, { jp: "鎌", en: "sickle, scythe" }, { jp: "茅", en: "miscanthus reed" }, { jp: "刈", en: "reap, cut" }, { jp: "侃", en: "strong, just" }, { jp: "冠", en: "crown, best" }, { jp: "勘", en: "intuition, perception" }, { jp: "勧", en: "persuade, recommend" }, { jp: "喚", en: "yell, cry" }, { jp: "堪", en: "withstand, endure" }, { jp: "寛", en: "tolerant, leniency" }, { jp: "幹", en: "tree trunk" }, { jp: "憾", en: "remorse, regret" }, { jp: "敢", en: "daring, brave" }, { jp: "棺", en: "coffin, casket" }, { jp: "款", en: "goodwill, article" }, { jp: "歓", en: "delight, joy" }, { jp: "環", en: "ring, circle" }, { jp: "監", en: "oversee, official" }, { jp: "看", en: "watch over, see" }, { jp: "緩", en: "slacken, loosen" }, { jp: "肝", en: "liver, pluck" }, { jp: "艦", en: "warship" }, { jp: "莞", en: "smiling, reed used to cover tatami" }, { jp: "貫", en: "pierce, 8 1/3lbs" }, { jp: "還", en: "send back, return" }, { jp: "鑑", en: "specimen, take warning from" }, { jp: "閑", en: "leisure" }, { jp: "陥", en: "collapse, fall into" }, { jp: "巌", en: "rock, crag" }, { jp: "眼", en: "eyeball" }, { jp: "頑", en: "stubborn, foolish" }, { jp: "企", en: "undertake, scheme" }, { jp: "伎", en: "deed, skill" }, { jp: "器", en: "utensil, vessel" }, { jp: "基", en: "fundamentals, radical (chem)" }, { jp: "奇", en: "strange, strangeness" }, { jp: "嬉", en: "glad, pleased" }, { jp: "岐", en: "branch off, fork in road" }, { jp: "忌", en: "mourning, abhor" }, { jp: "揮", en: "brandish, wave" }, { jp: "旗", en: "national flag, banner" }, { jp: "既", en: "previously, already" }, { jp: "棋", en: "chess piece, Japanese chess" }, { jp: "棄", en: "abandon, throw away" }, { jp: "毅", en: "strong" }, { jp: "汽", en: "vapor, steam" }, { jp: "稀", en: "rare, phenomenal" }, { jp: "紀", en: "chronicle, account" }, { jp: "貴", en: "precious, value" }, { jp: "軌", en: "rut, wheel" }, { jp: "輝", en: "radiance, shine" }, { jp: "飢", en: "hungry, starve" }, { jp: "騎", en: "equestrian, riding on horses" }, { jp: "鬼", en: "ghost, devil (radical 194)" }, { jp: "亀", en: "tortoise, turtle" }, { jp: "偽", en: "falsehood, lie" }, { jp: "儀", en: "ceremony, rule" }, { jp: "宜", en: "best regards, good" }, { jp: "戯", en: "frolic, play" }, { jp: "擬", en: "mimic, aim (a gun) at" }, { jp: "欺", en: "deceit, cheat" }, { jp: "犠", en: "sacrifice" }, { jp: "義", en: "righteousness, justice" }, { jp: "誼", en: "friendship, intimacy" }, { jp: "菊", en: "chrysanthemum" }, { jp: "鞠", en: "ball" }, { jp: "吉", en: "good luck, joy" }, { jp: "橘", en: "mandarin orange" }, { jp: "却", en: "instead, on the contrary" }, { jp: "脚", en: "skids, leg" }, { jp: "虐", en: "tyrannize, oppress" }, { jp: "丘", en: "hill, knoll" }, { jp: "及", en: "reach out, exert" }, { jp: "宮", en: "Shinto shrine, constellations" }, { jp: "弓", en: "bow, archery bow" }, { jp: "救", en: "salvation, save" }, { jp: "朽", en: "decay, rot" }, { jp: "泣", en: "cry, weep" }, { jp: "窮", en: "hard up, destitute" }, { jp: "級", en: "class, rank" }, { jp: "糾", en: "twist, ask" }, { jp: "拒", en: "repel, refuse" }, { jp: "拠", en: "foothold, based on" }, { jp: "挙", en: "raise, plan" }, { jp: "虚", en: "void, emptiness" }, { jp: "距", en: "long-distance, spur" }, { jp: "亨", en: "pass through, go smoothly" }, { jp: "享", en: "enjoy, receive" }, { jp: "凶", en: "villain, evil" }, { jp: "匡", en: "correct, save" }, { jp: "喬", en: "high, boasting" }, { jp: "峡", en: "gorge, ravine" }, { jp: "恭", en: "respect, reverent" }, { jp: "狂", en: "lunatic, insane" }, { jp: "狭", en: "cramped, narrow" }, { jp: "矯", en: "rectify, straighten" }, { jp: "脅", en: "threaten, coerce" }, { jp: "興", en: "entertain, revive" }, { jp: "郷", en: "home town, village" }, { jp: "鏡", en: "mirror, speculum" }, { jp: "響", en: "echo, sound" }, { jp: "驚", en: "wonder, be surprised" }, { jp: "仰", en: "face-up, look up" }, { jp: "凝", en: "congeal, freeze" }, { jp: "尭", en: "high, far" }, { jp: "暁", en: "daybreak, dawn" }, { jp: "桐", en: "paulownia" }, { jp: "錦", en: "brocade, fine dress" }, { jp: "斤", en: "axe, 1.32 lb" }, { jp: "欣", en: "take pleasure in, rejoice" }, { jp: "欽", en: "respect, revere" }, { jp: "琴", en: "harp, koto" }, { jp: "筋", en: "muscle, sinew" }, { jp: "緊", en: "tense, solid" }, { jp: "芹", en: "parsley" }, { jp: "菌", en: "germ, fungus" }, { jp: "衿", en: "neck, collar" }, { jp: "謹", en: "discreet, reverently" }, { jp: "吟", en: "versify, singing" }, { jp: "句", en: "phrase, clause" }, { jp: "玖", en: "beautiful black jewel, nine" }, { jp: "駆", en: "drive, run" }, { jp: "駒", en: "pony, horse" }, { jp: "愚", en: "foolish, folly" }, { jp: "虞", en: "fear, uneasiness" }, { jp: "遇", en: "meet, encounter" }, { jp: "屈", en: "yield, bend" }, { jp: "熊", en: "bear" }, { jp: "栗", en: "chestnut" }, { jp: "繰", en: "winding, reel" }, { jp: "桑", en: "mulberry" }, { jp: "勲", en: "meritorious deed, merit" }, { jp: "薫", en: "send forth fragrance, fragrant" }, { jp: "郡", en: "county, district" }, { jp: "袈", en: "a coarse camlet" }, { jp: "刑", en: "punish, penalty" }, { jp: "啓", en: "disclose, open" }, { jp: "圭", en: "square jewel, corner" }, { jp: "契", en: "pledge, promise" }, { jp: "径", en: "diameter, path" }, { jp: "恵", en: "favor, blessing" }, { jp: "慶", en: "jubilation, congratulate" }, { jp: "慧", en: "wise" }, { jp: "憩", en: "recess, rest" }, { jp: "掲", en: "put up (a notice), put up" }, { jp: "携", en: "portable, carry (in hand)" }, { jp: "桂", en: "Japanese Judas-tree, cinnamon tree" }, { jp: "渓", en: "mountain stream, valley" }, { jp: "系", en: "lineage, system" }, { jp: "継", en: "inherit, succeed" }, { jp: "茎", en: "stalk, stem" }, { jp: "蛍", en: "lightning-bug, firefly" }, { jp: "鶏", en: "chicken" }, { jp: "鯨", en: "whale" }, { jp: "撃", en: "beat, attack" }, { jp: "激", en: "violent, get excited" }, { jp: "傑", en: "greatness, excellence" }, { jp: "潔", en: "undefiled, pure" }, { jp: "穴", en: "hole, aperture" }, { jp: "結", en: "tie, bind" }, { jp: "倹", en: "frugal, economy" }, { jp: "健", en: "healthy, health" }, { jp: "兼", en: "concurrently, and" }, { jp: "剣", en: "sabre, sword" }, { jp: "圏", en: "sphere, circle" }, { jp: "堅", en: "strict, hard" }, { jp: "嫌", en: "dislike, detest" }, { jp: "憲", en: "constitution, law" }, { jp: "懸", en: "state of suspension, hang" }, { jp: "拳", en: "fist" }, { jp: "検", en: "examination, investigate" }, { jp: "献", en: "offering, counter for drinks" }, { jp: "絹", en: "silk" }, { jp: "謙", en: "self-effacing, humble oneself" }, { jp: "遣", en: "dispatch, despatch" }, { jp: "顕", en: "appear, existing" }, { jp: "厳", en: "stern, strictness" }, { jp: "幻", en: "phantasm, vision" }, { jp: "弦", en: "bowstring, chord" }, { jp: "源", en: "source, origin" }, { jp: "玄", en: "mysterious, occultness" }, { jp: "絃", en: "string, cord" }, { jp: "孤", en: "orphan, alone" }, { jp: "己", en: "self (radical 49)" }, { jp: "弧", en: "arc, arch" }, { jp: "故", en: "happenstance, especially" }, { jp: "胡", en: "barbarian, foreign" }, { jp: "虎", en: "tiger, drunkard" }, { jp: "誇", en: "boast, be proud" }, { jp: "顧", en: "look back, review" }, { jp: "鼓", en: "drum, beat" }, { jp: "伍", en: "five, five-man squad" }, { jp: "呉", en: "give, do something for" }, { jp: "娯", en: "recreation, pleasure" }, { jp: "悟", en: "enlightenment, perceive" }, { jp: "梧", en: "Chinese parasol tree, phoenix tree" }, { jp: "瑚", en: "ancestral offering receptacle, coral" }, { jp: "碁", en: "Go" }, { jp: "護", en: "safeguard, protect" }, { jp: "鯉", en: "carp" }, { jp: "侯", en: "marquis, lord" }, { jp: "倖", en: "happiness, luck" }, { jp: "功", en: "achievement, merits" }, { jp: "后", en: "empress, queen" }, { jp: "坑", en: "pit, hole" }, { jp: "孔", en: "cavity, hole" }, { jp: "宏", en: "wide, large" }, { jp: "巧", en: "adroit, skilled" }, { jp: "康", en: "ease, peace" }, { jp: "弘", en: "vast, broad" }, { jp: "恒", en: "constancy, always" }, { jp: "抗", en: "confront, resist" }, { jp: "拘", en: "arrest, seize" }, { jp: "控", en: "withdraw, draw in" }, { jp: "攻", en: "aggression, attack" }, { jp: "昂", en: "rise" }, { jp: "晃", en: "clear" }, { jp: "江", en: "creek, inlet" }, { jp: "洪", en: "deluge, flood" }, { jp: "浩", en: "wide expanse, abundance" }, { jp: "溝", en: "gutter, ditch" }, { jp: "甲", en: "armor, high (voice)" }, { jp: "皇", en: "emperor" }, { jp: "稿", en: "draft, copy" }, { jp: "紘", en: "large" }, { jp: "絞", en: "strangle, constrict" }, { jp: "綱", en: "hawser, class (genus)" }, { jp: "衡", en: "equilibrium, measuring rod" }, { jp: "貢", en: "tribute, support" }, { jp: "購", en: "subscription, buy" }, { jp: "酵", en: "fermentation" }, { jp: "鋼", en: "steel" }, { jp: "項", en: "paragraph, nape of neck" }, { jp: "鴻", en: "large bird, wild goose" }, { jp: "剛", en: "sturdy, strength" }, { jp: "拷", en: "torture, beat" }, { jp: "豪", en: "overpowering, great" }, { jp: "克", en: "overcome, kindly" }, { jp: "穀", en: "cereals, grain" }, { jp: "酷", en: "cruel, severe" }, { jp: "獄", en: "prison, jail" }, { jp: "墾", en: "ground-breaking, open up farmland" }, { jp: "恨", en: "regret, bear a grudge" }, { jp: "懇", en: "sociable, kind" }, { jp: "昆", en: "descendants, elder brother" }, { jp: "紺", en: "dark blue, navy" }, { jp: "魂", en: "soul, spirit" }, { jp: "佐", en: "assistant, help" }, { jp: "唆", en: "tempt, seduce" }, { jp: "嵯", en: "steep, craggy" }, { jp: "沙", en: "sand" }, { jp: "瑳", en: "polish, brilliant white luster of a gem" }, { jp: "詐", en: "lie, falsehood" }, { jp: "鎖", en: "chain, irons" }, { jp: "裟", en: "Buddhist surplice" }, { jp: "債", en: "bond, loan" }, { jp: "催", en: "sponsor, hold (a meeting)" }, { jp: "哉", en: "how, what" }, { jp: "宰", en: "superintend, manager" }, { jp: "彩", en: "coloring, paint" }, { jp: "栽", en: "plantation, planting" }, { jp: "災", en: "disaster, calamity" }, { jp: "采", en: "dice, form" }, { jp: "砕", en: "smash, break" }, { jp: "斎", en: "purification, Buddhist food" }, { jp: "裁", en: "tailor, judge" }, { jp: "載", en: "ride, board" }, { jp: "剤", en: "dose, medicine" }, { jp: "冴", en: "be clear, serene" }, { jp: "崎", en: "promontory, cape" }, { jp: "削", en: "plane, sharpen" }, { jp: "搾", en: "squeeze" }, { jp: "朔", en: "conjunction (astronomy), first day of month" }, { jp: "策", en: "scheme, plan" }, { jp: "索", en: "cord, rope" }, { jp: "錯", en: "confused, mix" }, { jp: "桜", en: "cherry" }, { jp: "笹", en: "bamboo grass, (kokuji)" }, { jp: "撮", en: "snapshot, take pictures" }, { jp: "擦", en: "grate, rub" }, { jp: "皐", en: "swamp, shore" }, { jp: "傘", en: "umbrella" }, { jp: "惨", en: "wretched, disaster" }, { jp: "桟", en: "scaffold, cleat" }, { jp: "燦", en: "brilliant" }, { jp: "蚕", en: "silkworm" }, { jp: "酸", en: "acid, bitterness" }, { jp: "暫", en: "temporarily, a while" }, { jp: "司", en: "director, official" }, { jp: "嗣", en: "heir, succeed" }, { jp: "士", en: "gentleman, samurai" }, { jp: "姿", en: "figure, form" },
        { jp: "志", en: "intention, plan" }, { jp: "施", en: "give, bestow" }, { jp: "旨", en: "delicious, relish" }, { jp: "氏", en: "family name, surname" }, { jp: "祉", en: "welfare, happiness" }, { jp: "紫", en: "purple, violet" }, { jp: "肢", en: "limb, arms &amp; legs" }, { jp: "至", en: "climax, result in" }, { jp: "視", en: "inspection, regard as" }, { jp: "詩", en: "poem, poetry" }, { jp: "諮", en: "consult with" }, { jp: "賜", en: "grant, gift" }, { jp: "雌", en: "feminine, female" }, { jp: "飼", en: "domesticate, raise" }, { jp: "侍", en: "waiter, samurai" }, { jp: "慈", en: "mercy" }, { jp: "滋", en: "nourishing, more &amp; more" }, { jp: "爾", en: "you, thou" }, { jp: "磁", en: "magnet, porcelain" }, { jp: "蒔", en: "sow (seeds)" }, { jp: "汐", en: "eventide, tide" }, { jp: "鹿", en: "deer (radical 198)" }, { jp: "軸", en: "axis, pivot" }, { jp: "執", en: "tenacious, take hold" }, { jp: "漆", en: "lacquer, varnish" }, { jp: "疾", en: "rapidly" }, { jp: "偲", en: "recollect, remember" }, { jp: "芝", en: "turf, lawn" }, { jp: "舎", en: "cottage, inn" }, { jp: "射", en: "shoot, shine into" }, { jp: "赦", en: "pardon, forgiveness" }, { jp: "斜", en: "diagonal, slanting" }, { jp: "煮", en: "boil, cook" }, { jp: "紗", en: "gauze, gossamer" }, { jp: "謝", en: "apologize, thank" }, { jp: "遮", en: "intercept, interrupt" }, { jp: "蛇", en: "snake, serpent" }, { jp: "邪", en: "wicked, injustice" }, { jp: "勺", en: "ladle, one tenth of a go" }, { jp: "尺", en: "shaku, Japanese foot" }, { jp: "爵", en: "baron, peerage" }, { jp: "酌", en: "bar-tending, serving sake" }, { jp: "釈", en: "explanation" }, { jp: "寂", en: "loneliness, quietly" }, { jp: "朱", en: "vermilion, cinnabar" }, { jp: "殊", en: "particularly, especially" }, { jp: "狩", en: "hunt, raid" }, { jp: "珠", en: "pearl, gem" }, { jp: "趣", en: "purport, gist" }, { jp: "儒", en: "Confucian" }, { jp: "授", en: "impart, instruct" }, { jp: "樹", en: "timber, trees" }, { jp: "需", en: "demand, request" }, { jp: "囚", en: "captured, criminal" }, { jp: "宗", en: "religion, sect" }, { jp: "就", en: "concerning, settle" }, { jp: "修", en: "discipline, conduct oneself well" }, { jp: "愁", en: "distress, grieve" }, { jp: "洲", en: "continent, sandbar" }, { jp: "秀", en: "excel, excellence" }, { jp: "臭", en: "stinking, ill-smelling" }, { jp: "衆", en: "masses, great numbers" }, { jp: "襲", en: "attack, advance on" }, { jp: "酬", en: "repay, reward" }, { jp: "醜", en: "ugly, unclean" }, { jp: "充", en: "allot, fill" }, { jp: "従", en: "accompany, obey" }, { jp: "汁", en: "soup, juice" }, { jp: "渋", en: "astringent, hesitate" }, { jp: "獣", en: "animal, beast" }, { jp: "縦", en: "vertical, length" }, { jp: "銃", en: "gun, arms" }, { jp: "叔", en: "uncle, youth" }, { jp: "淑", en: "graceful, gentle" }, { jp: "縮", en: "shrink, contract" }, { jp: "粛", en: "solemn, quietly" }, { jp: "塾", en: "cram school, private school" }, { jp: "熟", en: "mellow, ripen" }, { jp: "俊", en: "sagacious, genius" }, { jp: "峻", en: "high, steep" }, { jp: "瞬", en: "wink, blink" }, { jp: "竣", en: "end, finish" }, { jp: "舜", en: "type of morning glory, rose of Sharon" }, { jp: "駿", en: "a good horse, speed" }, { jp: "准", en: "quasi-, semi-" }, { jp: "循", en: "sequential, follow" }, { jp: "旬", en: "decameron, ten-day period" }, { jp: "殉", en: "martyrdom, follow by resigning" }, { jp: "淳", en: "pure" }, { jp: "潤", en: "wet, be watered" }, { jp: "盾", en: "shield, escutcheon" }, { jp: "巡", en: "patrol, go around" }, { jp: "遵", en: "abide by, follow" }, { jp: "暑", en: "sultry, hot" }, { jp: "曙", en: "dawn, daybreak" }, { jp: "渚", en: "strand, beach" }, { jp: "庶", en: "commoner, all" }, { jp: "叙", en: "confer, relate" }, { jp: "序", en: "preface, beginning" }, { jp: "徐", en: "gradually, slowly" }, { jp: "恕", en: "excuse, tolerate" }, { jp: "傷", en: "wound, hurt" }, { jp: "償", en: "reparation, make up for" }, { jp: "匠", en: "artisan, workman" }, { jp: "升", en: "measuring box, 1.8 liter" }, { jp: "唱", en: "chant, recite" }, { jp: "奨", en: "exhort, urge" }, { jp: "宵", en: "wee hours, evening" }, { jp: "尚", en: "esteem, furthermore" }, { jp: "庄", en: "level, in the country" }, { jp: "彰", en: "patent, clear" }, { jp: "抄", en: "extract, selection" }, { jp: "掌", en: "manipulate, rule" }, { jp: "捷", en: "victory, fast" }, { jp: "昌", en: "prosperous, bright" }, { jp: "昭", en: "shining, bright" }, { jp: "晶", en: "sparkle, clear" }, { jp: "松", en: "pine tree" }, { jp: "梢", en: "treetops, twig" }, { jp: "沼", en: "marsh, lake" }, { jp: "渉", en: "ford, go cross" }, { jp: "焦", en: "char, hurry" }, { jp: "症", en: "symptoms, illness" }, { jp: "硝", en: "nitrate, saltpeter" }, { jp: "礁", en: "reef, sunken rock" }, { jp: "祥", en: "auspicious, happiness" }, { jp: "称", en: "appellation, praise" }, { jp: "肖", en: "resemblance" }, { jp: "菖", en: "iris" }, { jp: "蕉", en: "banana, plantain" }, { jp: "衝", en: "collide, brunt" }, { jp: "訟", en: "sue, accuse" }, { jp: "証", en: "evidence, proof" }, { jp: "詔", en: "imperial edict" }, { jp: "詳", en: "detailed, full" }, { jp: "鐘", en: "bell, gong" }, { jp: "障", en: "hinder, hurt" }, { jp: "丞", en: "help" }, { jp: "冗", en: "superfluous, uselessness" }, { jp: "剰", en: "surplus, besides" }, { jp: "壌", en: "lot, earth" }, { jp: "嬢", en: "lass, girl" }, { jp: "条", en: "article, clause" }, { jp: "浄", en: "clean, purify" }, { jp: "穣", en: "good crops, prosperity" }, { jp: "譲", en: "defer, turnover" }, { jp: "醸", en: "brew, cause" }, { jp: "錠", en: "lock, fetters" }, { jp: "嘱", en: "entrust, request" }, { jp: "飾", en: "decorate, ornament" }, { jp: "殖", en: "augment, increase" }, { jp: "織", en: "weave, fabric" }, { jp: "辱", en: "embarrass, humiliate" }, { jp: "侵", en: "encroach, invade" }, { jp: "唇", en: "lips" }, { jp: "娠", en: "with child, pregnancy" }, { jp: "審", en: "hearing, judge" }, { jp: "慎", en: "humility, be careful" }, { jp: "振", en: "shake, wave" }, { jp: "晋", en: "advance" }, { jp: "榛", en: "hazelnut, filbert" }, { jp: "浸", en: "immersed, soak" }, { jp: "秦", en: "Manchu dynasty, name given to naturalized foreigners" }, { jp: "紳", en: "sire, good belt" }, { jp: "薪", en: "fuel, firewood" }, { jp: "診", en: "checkup, seeing" }, { jp: "仁", en: "humanity, virtue" }, { jp: "刃", en: "blade, sword" }, { jp: "尋", en: "inquire, fathom" }, { jp: "甚", en: "tremendously, very" }, { jp: "尽", en: "exhaust, use up" }, { jp: "迅", en: "swift, fast" }, { jp: "陣", en: "camp, battle array" }, { jp: "須", en: "ought, by all means" }, { jp: "酢", en: "vinegar, sour" }, { jp: "垂", en: "droop, suspend" }, { jp: "帥", en: "commander, leading troops" }, { jp: "推", en: "conjecture, infer" }, { jp: "炊", en: "cook, boil" }, { jp: "睡", en: "drowsy, sleep" }, { jp: "粋", en: "chic, style" }, { jp: "翠", en: "green, kingfisher" }, { jp: "衰", en: "decline, wane" }, { jp: "遂", en: "consummate, accomplish" }, { jp: "酔", en: "drunk, feel sick" }, { jp: "錘", en: "weight, plumb bob" }, { jp: "随", en: "follow, though" }, { jp: "瑞", en: "congratulations" }, { jp: "髄", en: "marrow, pith" }, { jp: "崇", en: "adore, respect" }, { jp: "嵩", en: "be aggravated, grow worse" }, { jp: "枢", en: "hinge, pivot" }, { jp: "雛", en: "chick, squab" }, { jp: "据", en: "set, lay a foundation" }, { jp: "杉", en: "cedar, cryptomeria" }, { jp: "澄", en: "lucidity, be clear" }, { jp: "寸", en: "measurement, tenth of a shaku" }, { jp: "瀬", en: "rapids, current" }, { jp: "畝", en: "furrow, thirty tsubo" }, { jp: "是", en: "just so, this" }, { jp: "征", en: "subjugate, attack the rebellious" }, { jp: "整", en: "organize, arranging" }, { jp: "牲", en: "animal sacrifice, offering" }, { jp: "盛", en: "boom, prosper" }, { jp: "聖", en: "holy, saint" }, { jp: "製", en: "made in..., manufacture" }, { jp: "誠", en: "sincerity, admonish" }, { jp: "誓", en: "vow, swear" }, { jp: "請", en: "solicit, invite" }, { jp: "逝", en: "departed, die" }, { jp: "斉", en: "adjusted, alike" }, { jp: "惜", en: "pity, be sparing of" }, { jp: "斥", en: "reject, retreat" }, { jp: "析", en: "chop, divide" }, { jp: "碩", en: "large, great" }, { jp: "拙", en: "bungling, clumsy" }, { jp: "摂", en: "vicarious, surrogate" }, { jp: "窃", en: "stealth, steal" }, { jp: "節", en: "node, season" }, { jp: "舌", en: "tongue (radical 135)" }, { jp: "仙", en: "hermit, wizard" }, { jp: "宣", en: "proclaim, say" }, { jp: "扇", en: "fan, folding fan" }, { jp: "栓", en: "plug, bolt" }, { jp: "染", en: "dye, color" }, { jp: "潜", en: "submerge, conceal" }, { jp: "旋", en: "rotation, go around" }, { jp: "繊", en: "slender, fine" }, { jp: "薦", en: "recommend, mat" }, { jp: "践", en: "tread, step on" }, { jp: "遷", en: "transition, move" }, { jp: "銭", en: "coin, .01 yen" }, { jp: "銑", en: "pig iron" }, { jp: "鮮", en: "fresh, vivid" }, { jp: "善", en: "virtuous, good" }, { jp: "漸", en: "steadily, gradually advancing" }, { jp: "禅", en: "Zen, silent meditation" }, { jp: "繕", en: "darning, repair" }, { jp: "塑", en: "model, molding" }, { jp: "措", en: "set aside, give up" }, { jp: "疎", en: "alienate, rough" }, { jp: "礎", en: "cornerstone, foundation stone" }, { jp: "租", en: "tariff, crop tax" }, { jp: "粗", en: "coarse, rough" }, { jp: "素", en: "elementary, principle" }, { jp: "訴", en: "accusation, sue" }, { jp: "阻", en: "thwart, separate from" }, { jp: "僧", en: "Buddhist priest, monk" }, { jp: "創", en: "genesis, wound" }, { jp: "倉", en: "godown, warehouse" }, { jp: "喪", en: "miss, mourning" }, { jp: "壮", en: "robust, manhood" }, { jp: "奏", en: "play music, speak to a ruler" }, { jp: "爽", en: "refreshing, bracing" }, { jp: "惣", en: "all" }, { jp: "挿", en: "insert, put in" }, { jp: "操", en: "maneuver, manipulate" }, { jp: "曹", en: "office, official" }, { jp: "巣", en: "nest, rookery" }, { jp: "槽", en: "vat, tub" }, { jp: "綜", en: "rule, synthesize" }, { jp: "聡", en: "wise, fast learner" }, { jp: "荘", en: "villa, inn" }, { jp: "葬", en: "interment, bury" }, { jp: "蒼", en: "blue, pale" }, { jp: "藻", en: "seaweed, duckweed" }, { jp: "遭", en: "encounter, meet" }, { jp: "霜", en: "frost" }, { jp: "騒", en: "boisterous, make noise" }, { jp: "促", en: "stimulate, urge" }, { jp: "即", en: "instant, namely" }, { jp: "俗", en: "vulgar, customs" }, { jp: "属", en: "belong, genus" }, { jp: "賊", en: "burglar, rebel" }, { jp: "汰", en: "washing, sieving" }, { jp: "堕", en: "degenerate, descend to" }, { jp: "妥", en: "gentle, peace" }, { jp: "惰", en: "lazy, laziness" }, { jp: "駄", en: "burdensome, pack horse" }, { jp: "耐", en: "-proof, enduring" }, { jp: "怠", en: "neglect, laziness" }, { jp: "態", en: "attitude, condition" }, { jp: "泰", en: "peaceful, calm" }, { jp: "滞", en: "stagnate, be delayed" }, { jp: "胎", en: "womb, uterus" }, { jp: "逮", en: "apprehend, chase" }, { jp: "隊", en: "regiment, party" }, { jp: "黛", en: "blackened eyebrows" }, { jp: "鯛", en: "sea bream, red snapper" }, { jp: "第", en: "No., residence" }, { jp: "鷹", en: "hawk" }, { jp: "滝", en: "waterfall, rapids" }, { jp: "卓", en: "eminent, table" }, { jp: "啄", en: "peck, pick up" }, { jp: "択", en: "choose, select" }, { jp: "拓", en: "clear (the land), open" }, { jp: "沢", en: "swamp, marsh" }, { jp: "琢", en: "polish" }, { jp: "託", en: "consign, requesting" }, { jp: "濁", en: "voiced, uncleanness" }, { jp: "諾", en: "consent, assent" }, { jp: "只", en: "only, free" }, { jp: "但", en: "however, but" }, { jp: "辰", en: "sign of the dragon, 7-9AM" }, { jp: "奪", en: "rob, take by force" }, { jp: "脱", en: "undress, removing" }, { jp: "巽", en: "southeast" }, { jp: "棚", en: "shelf, ledge" }, { jp: "丹", en: "rust-colored, red" }, { jp: "嘆", en: "sigh, lament" }, { jp: "旦", en: "daybreak, dawn" }, { jp: "淡", en: "thin, faint" }, { jp: "端", en: "edge, origin" }, { jp: "胆", en: "gall bladder, courage" }, { jp: "誕", en: "nativity, be born" }, { jp: "鍛", en: "forge, discipline" }, { jp: "壇", en: "podium, stage" }, { jp: "弾", en: "bullet, twang" }, { jp: "暖", en: "warmth" }, { jp: "檀", en: "cedar, sandlewood" }, { jp: "智", en: "wisdom, intellect" }, { jp: "痴", en: "stupid, foolish" }, { jp: "稚", en: "immature, young" }, { jp: "致", en: "doth, do" }, { jp: "蓄", en: "amass, raise" },
        { jp: "逐", en: "pursue, drive away" }, { jp: "秩", en: "regularity, salary" }, { jp: "窒", en: "plug up, obstruct" }, { jp: "嫡", en: "legitimate wife, direct descent (non-bastard)" }, { jp: "宙", en: "mid-air, air" }, { jp: "忠", en: "loyalty, fidelity" }, { jp: "抽", en: "pluck, pull" }, { jp: "衷", en: "inmost, heart" }, { jp: "鋳", en: "casting, mint" }, { jp: "猪", en: "boar" }, { jp: "丁", en: "street, ward" }, { jp: "帳", en: "notebook, account book" }, { jp: "弔", en: "condolences, mourning" }, { jp: "張", en: "lengthen, counter for bows &amp; stringed instruments" }, { jp: "彫", en: "carve, engrave" }, { jp: "徴", en: "indications, sign" }, { jp: "懲", en: "penal, chastise" }, { jp: "挑", en: "challenge, contend for" }, { jp: "暢", en: "stretch" }, { jp: "潮", en: "tide, salt water" }, { jp: "眺", en: "stare, watch" }, { jp: "聴", en: "listen, headstrong" }, { jp: "脹", en: "dilate, distend" }, { jp: "腸", en: "intestines, guts" }, { jp: "蝶", en: "butterfly" }, { jp: "跳", en: "hop, leap up" }, { jp: "勅", en: "imperial order" }, { jp: "朕", en: "majestic plural, imperial we" }, { jp: "賃", en: "fare, fee" }, { jp: "鎮", en: "tranquilize, ancient peace-preservation centers" }, { jp: "陳", en: "exhibit, state" }, { jp: "津", en: "haven, port" }, { jp: "墜", en: "crash, fall (down)" }, { jp: "椎", en: "chinquapin, mallet" }, { jp: "塚", en: "hillock, mound" }, { jp: "槻", en: "Zelkova tree" }, { jp: "漬", en: "pickling, soak" }, { jp: "蔦", en: "vine, ivy" }, { jp: "椿", en: "camellia" }, { jp: "坪", en: "two-mat area, approx. thirty-six sq ft" }, { jp: "紬", en: "pongee (a knotted silk cloth)" }, { jp: "釣", en: "angling, fish" }, { jp: "鶴", en: "crane, stork" }, { jp: "亭", en: "pavilion, restaurant" }, { jp: "偵", en: "spy" }, { jp: "貞", en: "upright, chastity" }, { jp: "呈", en: "display, offer" }, { jp: "堤", en: "dike, bank" }, { jp: "帝", en: "sovereign, the emperor" }, { jp: "廷", en: "courts, imperial court" }, { jp: "悌", en: "serving our elders" }, { jp: "抵", en: "resist, reach" }, { jp: "提", en: "propose, take along" }, { jp: "禎", en: "happiness, blessed" }, { jp: "締", en: "tighten, tie" }, { jp: "艇", en: "rowboat, small boat" }, { jp: "訂", en: "revise, correct" }, { jp: "逓", en: "relay, in turn" }, { jp: "邸", en: "residence, mansion" }, { jp: "摘", en: "pinch, pick" }, { jp: "敵", en: "enemy, foe" }, { jp: "笛", en: "flute, clarinet" }, { jp: "哲", en: "philosophy, clear" }, { jp: "徹", en: "penetrate, clear" }, { jp: "撤", en: "remove, withdraw" }, { jp: "迭", en: "transfer, alternation" }, { jp: "典", en: "code, ceremony" }, { jp: "展", en: "unfold, expand" }, { jp: "添", en: "annexed, accompany" }, { jp: "吐", en: "spit, vomit" }, { jp: "斗", en: "Big Dipper, ten sho (vol)" }, { jp: "杜", en: "woods, grove" }, { jp: "奴", en: "guy, slave" }, { jp: "刀", en: "sword, saber" }, { jp: "悼", en: "lament, grieve over" }, { jp: "搭", en: "board, load (a vehicle)" }, { jp: "桃", en: "peach" }, { jp: "棟", en: "ridgepole, ridge" }, { jp: "痘", en: "pox, smallpox" }, { jp: "糖", en: "sugar" }, { jp: "統", en: "overall, relationship" }, { jp: "藤", en: "wisteria" }, { jp: "討", en: "chastise, attack" }, { jp: "謄", en: "mimeograph, copy" }, { jp: "豆", en: "bean (radical 151)" }, { jp: "踏", en: "step, trample" }, { jp: "透", en: "transparent, permeate" }, { jp: "陶", en: "pottery, porcelain" }, { jp: "騰", en: "leaping up, jumping up" }, { jp: "闘", en: "fight, war" }, { jp: "憧", en: "yearn after, long for" }, { jp: "洞", en: "den, cave" }, { jp: "瞳", en: "pupil (of eye)" }, { jp: "胴", en: "trunk, torso" }, { jp: "峠", en: "mountain peak, mountain pass" }, { jp: "匿", en: "hide, shelter" }, { jp: "徳", en: "benevolence, virtue" }, { jp: "督", en: "coach, command" }, { jp: "篤", en: "fervent, kind" }, { jp: "独", en: "single, alone" }, { jp: "凸", en: "convex, beetle brow" }, { jp: "寅", en: "sign of the tiger, 3-5AM" }, { jp: "酉", en: "west, bird" }, { jp: "屯", en: "barracks, police station" }, { jp: "惇", en: "sincere, kind" }, { jp: "敦", en: "industry, kindliness" }, { jp: "豚", en: "pork, pig" }, { jp: "奈", en: "Nara, what?" }, { jp: "那", en: "what?" }, { jp: "凪", en: "lull, calm" }, { jp: "捺", en: "press, print" }, { jp: "縄", en: "straw rope, cord" }, { jp: "楠", en: "camphor tree" }, { jp: "尼", en: "nun" }, { jp: "弐", en: "II, two" }, { jp: "虹", en: "rainbow" }, { jp: "如", en: "likeness, like" }, { jp: "尿", en: "urine" }, { jp: "妊", en: "pregnancy" }, { jp: "忍", en: "endure, bear" }, { jp: "寧", en: "rather, preferably" }, { jp: "粘", en: "sticky, glutinous" }, { jp: "乃", en: "from, possessive particle" }, { jp: "之", en: "of, this" }, { jp: "納", en: "settlement, obtain" }, { jp: "巴", en: "comma-design" }, { jp: "把", en: "grasp, faggot" }, { jp: "覇", en: "hegemony, supremacy" }, { jp: "派", en: "faction, group" }, { jp: "婆", en: "old woman, grandma" }, { jp: "俳", en: "haiku, actor" }, { jp: "廃", en: "abolish, obsolete" }, { jp: "排", en: "repudiate, exclude" }, { jp: "肺", en: "lungs" }, { jp: "輩", en: "comrade, fellow" }, { jp: "培", en: "cultivate, foster" }, { jp: "媒", en: "mediator, go-between" }, { jp: "梅", en: "plum" }, { jp: "賠", en: "compensation, indemnify" }, { jp: "陪", en: "obeisance, follow" }, { jp: "萩", en: "bush clover" }, { jp: "伯", en: "chief, count" }, { jp: "博", en: "Dr., command" }, { jp: "拍", en: "clap, beat (music)" }, { jp: "舶", en: "liner, ship" }, { jp: "迫", en: "urge, force" }, { jp: "漠", en: "vague, obscure" }, { jp: "縛", en: "truss, arrest" }, { jp: "肇", en: "beginning" }, { jp: "鉢", en: "bowl, rice tub" }, { jp: "伐", en: "fell, strike" }, { jp: "罰", en: "penalty, punishment" }, { jp: "閥", en: "clique, lineage" }, { jp: "鳩", en: "pigeon, dove" }, { jp: "隼", en: "falcon" }, { jp: "伴", en: "consort, accompany" }, { jp: "帆", en: "sail" }, { jp: "搬", en: "conveyor, carry" }, { jp: "班", en: "squad, corps" }, { jp: "畔", en: "paddy ridge, levee" }, { jp: "繁", en: "luxuriant, thick" }, { jp: "藩", en: "clan, enclosure" }, { jp: "範", en: "pattern, example" }, { jp: "煩", en: "anxiety, trouble" }, { jp: "頒", en: "distribute, disseminate" }, { jp: "盤", en: "tray, shallow bowl" }, { jp: "蛮", en: "barbarian" }, { jp: "卑", en: "lowly, base" }, { jp: "妃", en: "queen, princess" }, { jp: "扉", en: "front door, title page" }, { jp: "批", en: "criticism, strike" }, { jp: "披", en: "expose, open" }, { jp: "斐", en: "beautiful, patterned" }, { jp: "泌", en: "ooze, flow" }, { jp: "碑", en: "tombstone, monument" }, { jp: "秘", en: "secret, conceal" }, { jp: "緋", en: "scarlet, cardinal" }, { jp: "罷", en: "quit, stop" }, { jp: "肥", en: "fertilizer, get fat" }, { jp: "避", en: "evade, avoid" }, { jp: "尾", en: "tail, end" }, { jp: "微", en: "delicate, minuteness" }, { jp: "眉", en: "eyebrow" }, { jp: "柊", en: "holly" }, { jp: "彦", en: "lad, boy (ancient)" }, { jp: "姫", en: "princess" }, { jp: "媛", en: "beautiful woman, princess" }, { jp: "俵", en: "bag, bale" }, { jp: "彪", en: "spotted, mottled" }, { jp: "標", en: "signpost, seal" }, { jp: "漂", en: "drift, float (on liquid)" }, { jp: "票", en: "ballot, label" }, { jp: "評", en: "evaluate, criticism" }, { jp: "描", en: "sketch, compose" }, { jp: "苗", en: "seedling, sapling" }, { jp: "彬", en: "refined, gentle" }, { jp: "浜", en: "seacoast, beach" }, { jp: "賓", en: "V.I.P., guest" }, { jp: "頻", en: "repeatedly, recur" }, { jp: "敏", en: "cleverness, agile" }, { jp: "扶", en: "aid, help" }, { jp: "敷", en: "spread, pave" }, { jp: "腐", en: "rot, decay" }, { jp: "芙", en: "lotus, Mt Fuji" }, { jp: "譜", en: "musical score, music" }, { jp: "賦", en: "levy, ode" }, { jp: "赴", en: "proceed, get" }, { jp: "附", en: "affixed, attach" }, { jp: "侮", en: "scorn, despise" }, { jp: "楓", en: "maple" }, { jp: "蕗", en: "butterbur, bog rhubarb" }, { jp: "伏", en: "prostrated, bend down" }, { jp: "覆", en: "capsize, cover" }, { jp: "噴", en: "erupt, spout" }, { jp: "墳", en: "tomb, mound" }, { jp: "憤", en: "aroused, resent" }, { jp: "奮", en: "stirred up, be invigorated" }, { jp: "紛", en: "distract, be mistaken for" }, { jp: "雰", en: "atmosphere, fog" }, { jp: "丙", en: "third class, 3rd" }, { jp: "併", en: "join, get together" }, { jp: "塀", en: "fence, wall" }, { jp: "幣", en: "cash, bad habit" }, { jp: "弊", en: "abuse, evil" }, { jp: "柄", en: "design, pattern" }, { jp: "陛", en: "highness, steps (of throne)" }, { jp: "壁", en: "wall, lining (stomach)" }, { jp: "癖", en: "mannerism, habit" }, { jp: "碧", en: "blue, green" }, { jp: "偏", en: "partial, side" }, { jp: "遍", en: "everywhere, times" }, { jp: "弁", en: "valve, petal" }, { jp: "保", en: "protect, guarantee" }, { jp: "舗", en: "shop, store" }, { jp: "甫", en: "for the first time, not until" }, { jp: "輔", en: "help" }, { jp: "穂", en: "ear, ear (grain)" }, { jp: "墓", en: "grave, tomb" }, { jp: "慕", en: "pining, yearn for" }, { jp: "簿", en: "register, record book" }, { jp: "倣", en: "emulate, imitate" }, { jp: "俸", en: "stipend, salary" }, { jp: "奉", en: "observance, offer" }, { jp: "峰", en: "summit, peak" }, { jp: "崩", en: "crumble, die" }, { jp: "朋", en: "companion, friend" }, { jp: "泡", en: "bubbles, foam" }, { jp: "砲", en: "cannon, gun" }, { jp: "縫", en: "sew, stitch" }, { jp: "胞", en: "placenta, sac" }, { jp: "芳", en: "perfume, balmy" }, { jp: "萌", en: "show symptoms of, sprout" }, { jp: "褒", en: "praise, extol" }, { jp: "邦", en: "home country, country" }, { jp: "飽", en: "sated, tired of" }, { jp: "鳳", en: "male mythical bird" }, { jp: "鵬", en: "phoenix" }, { jp: "乏", en: "destitution, scarce" }, { jp: "傍", en: "bystander, side" }, { jp: "剖", en: "divide" }, { jp: "妨", en: "disturb, prevent" }, { jp: "房", en: "tassel, tuft" }, { jp: "某", en: "so-and-so, one" }, { jp: "冒", en: "risk, face" }, { jp: "紡", en: "spinning" }, { jp: "肪", en: "obese, fat" }, { jp: "膨", en: "swell, get fat" }, { jp: "謀", en: "conspire, cheat" }, { jp: "僕", en: "me, I (male)" }, { jp: "墨", en: "black ink, India ink" }, { jp: "撲", en: "slap, strike" }, { jp: "朴", en: "crude, simple" }, { jp: "牧", en: "breed, care for" }, { jp: "睦", en: "intimate, friendly" }, { jp: "没", en: "drown, sink" }, { jp: "堀", en: "ditch, moat" }, { jp: "奔", en: "run, bustle" }, { jp: "翻", en: "flip, turn over" }, { jp: "凡", en: "commonplace, ordinary" }, { jp: "盆", en: "basin, lantern festival" }, { jp: "摩", en: "chafe, rub" }, { jp: "魔", en: "witch, demon" }, { jp: "麻", en: "hemp, flax (radical 200)" }, { jp: "槙", en: "twig, ornamental evergreen" }, { jp: "幕", en: "curtain, bunting" }, { jp: "膜", en: "membrane" }, { jp: "柾", en: "straight grain, spindle tree" }, { jp: "亦", en: "also, again" }, { jp: "又", en: "or again, furthermore" }, { jp: "抹", en: "rub, paint" }, { jp: "繭", en: "cocoon" }, { jp: "麿", en: "I, you" }, { jp: "慢", en: "ridicule, laziness" }, { jp: "漫", en: "cartoon, involuntarily" }, { jp: "魅", en: "fascination, charm" }, { jp: "巳", en: "sign of the snake or serpent, 9-11AM" }, { jp: "岬", en: "headland, cape" }, { jp: "密", en: "secrecy, density (pop)" }, { jp: "稔", en: "harvest, ripen" }, { jp: "脈", en: "vein, pulse" }, { jp: "妙", en: "exquisite, strange" }, { jp: "矛", en: "halberd, arms" }, { jp: "霧", en: "fog, mist" }, { jp: "椋", en: "type of deciduous tree, grey starling" }, { jp: "婿", en: "bridegroom, son-in-law" }, { jp: "盟", en: "alliance, oath" }, { jp: "銘", en: "inscription, signature (of artisan)" }, { jp: "滅", en: "destroy, ruin" }, { jp: "免", en: "excuse, dismissal" }, { jp: "模", en: "imitation, copy" }, { jp: "茂", en: "overgrown, grow thick" }, { jp: "妄", en: "delusion, unnecessarily" }, { jp: "孟", en: "chief, beginning" }, { jp: "猛", en: "fierce, rave" }, { jp: "盲", en: "blind, blind man" }, { jp: "網", en: "netting, network" }, { jp: "耗", en: "decrease" }, { jp: "黙", en: "silence, become silent" }, { jp: "紋", en: "family crest, figures" }, { jp: "匁", en: "monme, 3.75 grams" }, { jp: "也", en: "to be (classical)" }, { jp: "冶", en: "melting, smelting" }, { jp: "耶", en: "question mark" }, { jp: "弥", en: "all the more, increasingly" }, { jp: "矢", en: "arrow (radical 111)" }, { jp: "厄", en: "unlucky, misfortune" }, { jp: "訳", en: "translate, reason" },
        { jp: "躍", en: "leap, dance" }, { jp: "靖", en: "peaceful" }, { jp: "柳", en: "willow" }, { jp: "愉", en: "pleasure, happy" }, { jp: "癒", en: "healing, cure" }, { jp: "諭", en: "rebuke, admonish" }, { jp: "唯", en: "solely, only" }, { jp: "佑", en: "help, assist" }, { jp: "宥", en: "soothe, calm" }, { jp: "幽", en: "seclude, confine to a room" }, { jp: "悠", en: "permanence, distant" }, { jp: "憂", en: "melancholy, grieve" }, { jp: "柚", en: "citron" }, { jp: "湧", en: "boil, ferment" }, { jp: "猶", en: "furthermore, still" }, { jp: "祐", en: "help" }, { jp: "裕", en: "abundant, rich" }, { jp: "誘", en: "entice, lead" }, { jp: "邑", en: "village, rural community" }, { jp: "雄", en: "masculine, male" }, { jp: "融", en: "dissolve, melt" }, { jp: "誉", en: "reputation, praise" }, { jp: "庸", en: "commonplace, ordinary" }, { jp: "揚", en: "raise, elevate" }, { jp: "揺", en: "swing, shake" }, { jp: "擁", en: "hug, embrace" }, { jp: "楊", en: "willow" }, { jp: "窯", en: "kiln, oven" }, { jp: "羊", en: "sheep (radical 123)" }, { jp: "耀", en: "shine, sparkle" }, { jp: "蓉", en: "lotus" }, { jp: "謡", en: "song, sing" }, { jp: "遥", en: "far off, distant" }, { jp: "養", en: "foster, bring up" }, { jp: "抑", en: "repress, well" }, { jp: "翼", en: "wing, plane" }, { jp: "羅", en: "gauze, thin silk" }, { jp: "裸", en: "naked, nude" }, { jp: "雷", en: "thunder, lightning bolt" }, { jp: "酪", en: "dairy products, whey" }, { jp: "嵐", en: "storm, tempest" }, { jp: "欄", en: "column, handrail" }, { jp: "濫", en: "excessive, overflow" }, { jp: "藍", en: "indigo" }, { jp: "蘭", en: "orchid, Holland" }, { jp: "覧", en: "perusal, see" }, { jp: "吏", en: "officer, an official" }, { jp: "履", en: "perform, complete" }, { jp: "李", en: "plum" }, { jp: "梨", en: "pear tree" }, { jp: "璃", en: "glassy, lapis lazuli" }, { jp: "痢", en: "diarrhea" }, { jp: "離", en: "detach, separation" }, { jp: "率", en: "ratio, rate" }, { jp: "琉", en: "precious stone, gem" }, { jp: "硫", en: "sulphur" }, { jp: "隆", en: "hump, high" }, { jp: "竜", en: "dragon, imperial" }, { jp: "慮", en: "prudence, thought" }, { jp: "虜", en: "captive, barbarian" }, { jp: "亮", en: "clear, help" }, { jp: "僚", en: "colleague, official" }, { jp: "凌", en: "endure, keep (rain)out" }, { jp: "寮", en: "dormitory, hostel" }, { jp: "猟", en: "game-hunting, shooting" }, { jp: "瞭", en: "clear" }, { jp: "稜", en: "angle, edge" }, { jp: "糧", en: "provisions, food" }, { jp: "諒", en: "fact, reality" }, { jp: "遼", en: "distant" }, { jp: "陵", en: "mausoleum, imperial tomb" }, { jp: "倫", en: "ethics, companion" }, { jp: "厘", en: "rin, 1/10 sen" }, { jp: "琳", en: "jewel, tinkling of jewelry" }, { jp: "臨", en: "look to, face" }, { jp: "隣", en: "neighboring" }, { jp: "麟", en: "Chinese unicorn, genius" }, { jp: "瑠", en: "lapis lazuli" }, { jp: "塁", en: "bases, fort" }, { jp: "累", en: "accumulate, involvement" }, { jp: "伶", en: "actor" }, { jp: "励", en: "encourage, be diligent" }, { jp: "嶺", en: "peak, summit" }, { jp: "怜", en: "wise" }, { jp: "玲", en: "sound of jewels" }, { jp: "鈴", en: "small bell, buzzer" }, { jp: "隷", en: "slave, servant" }, { jp: "霊", en: "spirits, soul" }, { jp: "麗", en: "lovely, beautiful" }, { jp: "暦", en: "calendar, almanac" }, { jp: "劣", en: "inferiority, be inferior to" }, { jp: "烈", en: "ardent, violent" }, { jp: "裂", en: "split, rend" }, { jp: "廉", en: "bargain, reason" }, { jp: "蓮", en: "lotus" }, { jp: "錬", en: "tempering, refine" }, { jp: "呂", en: "spine, backbone" }, { jp: "炉", en: "hearth, furnace" }, { jp: "露", en: "dew, tears" }, { jp: "廊", en: "corridor, hall" }, { jp: "朗", en: "melodious, clear" }, { jp: "楼", en: "watchtower, lookout" }, { jp: "浪", en: "wandering, waves" }, { jp: "漏", en: "leak, escape" }, { jp: "郎", en: "son, counter for sons" }, { jp: "禄", en: "fief, allowance" }, { jp: "倭", en: "Yamato, ancient Japan" }, { jp: "賄", en: "bribe, board" }, { jp: "惑", en: "beguile, delusion" }, { jp: "枠", en: "frame, framework" }, { jp: "亘", en: "span, range" }, { jp: "侑", en: "urge to eat" }, { jp: "勁", en: "strong" }, { jp: "奎", en: "star, god of literature" }, { jp: "崚", en: "mountains towering in a row" }, { jp: "彗", en: "comet" }, { jp: "昴", en: "the Pleiades" }, { jp: "晏", en: "late, quiet" }, { jp: "晨", en: "morning, early" }, { jp: "晟", en: "clear" }, { jp: "暉", en: "shine, light" }, { jp: "栞", en: "bookmark, guidebook" }, { jp: "椰", en: "coconut tree" }, { jp: "毬", en: "burr, ball" }, { jp: "洸", en: "sparkling water" }, { jp: "洵", en: "alike, truth" }, { jp: "滉", en: "deep and broad" }, { jp: "漱", en: "gargle, rinse mouth" }, { jp: "澪", en: "water route, shipping channel" }, { jp: "燎", en: "burn, bonfire" }, { jp: "燿", en: "shine" }, { jp: "瑶", en: "beautiful as a jewel" }, { jp: "皓", en: "white, clear" }, { jp: "眸", en: "pupil of the eye" }, { jp: "笙", en: "a reed instrument" }, { jp: "綺", en: "figured cloth, beautiful" }, { jp: "綸", en: "thread, silk cloth" }, { jp: "翔", en: "soar, fly" }, { jp: "脩", en: "dried meat" }, { jp: "茉", en: "jasmine" }, { jp: "莉", en: "jasmine" }, { jp: "菫", en: "the violet" }, { jp: "詢", en: "consult with" }, { jp: "諄", en: "tedious" }, { jp: "赳", en: "strong and brave" }, { jp: "迪", en: "edify, way" }, { jp: "頌", en: "eulogy" }, { jp: "颯", en: "sudden, quick" }, { jp: "黎", en: "dark, black" }, { jp: "凜", en: "cold, strict" }, { jp: "熙", en: "bright, sunny" }, { jp: "欄", en: "railing, balustrade" }, { jp: "廊", en: "corridor, porch" }, { jp: "朗", en: "clear, bright" }, { jp: "虜", en: "capture, imprison" }, { jp: "隆", en: "prosperous, plentiful" }, { jp: "塚", en: "cemetery, tomb" }, { jp: "猪", en: "pig" }, { jp: "祥", en: "good luck" }]
    };
    const tCount = 3;
    const kCount = 4;
    const tQuestions = new Array(tCount);
    for (let t = 0; t < tCount; t++) tQuestions[t] = new Array(kCount);
    const tAnswers = new Array(tCount);
    let koroTimeout;

    const koroSetProblem = () => {
        // Only kororeps in the main channel
        if (CHANNEL.name.toLowerCase() != "hollowmatsuridos") {
            koroClear();
            return;
        }

        if (koroTimeout) clearTimeout(koroTimeout);
        if (ngmi) {
            const dataset = (
                jltpLevel === 5 ? kanjiData.n5 :
                jltpLevel === 4 ? [...kanjiData.n5, ...kanjiData.n4] :
                jltpLevel === 3 ? [...kanjiData.n5, ...kanjiData.n4, ...kanjiData.n3] :
                jltpLevel === 2 ? [...kanjiData.n5, ...kanjiData.n4, ...kanjiData.n3, ...kanjiData.n2] :
                jltpLevel === 1 ? [...kanjiData.n5, ...kanjiData.n4, ...kanjiData.n3, ...kanjiData.n2, ...kanjiData.n1] :
                kanjiData.n5
            ).sort(() => .5 - Math.random()).slice(0, tCount * kCount);
            for (let t = 0; t < tCount; t++) {
                tAnswers[t] = -1;
                const kIndex = Math.floor(Math.random() * kCount);
                for (let k = 0; k < kCount; k++) {
                    tQuestions[t][k] = {
                        jp: dataset[t * kCount + k].jp,
                        en: dataset[t * kCount + k].en,
                        ok: kIndex === k
                    }
                }
            }
            koroResetDOM();
            koroTimeout = setTimeout(() => koroSetProblem(), 15000);
        }
    }

    const koroClear = () => {
        if (document.getElementById('koroContainer')) document.getElementById('koroContainer').remove();
        ngmi = false;
    }

    const koroResetDOM = () => {
        let koroContainer = document.getElementById('koroContainer');
        if (!koroContainer) {
            koroContainer = document.createElement("div");
            koroContainer.id = 'koroContainer';
            document.body.appendChild(koroContainer);
        }

        let koroPopup = document.getElementById('koroPopup');
        if (!koroPopup) {
            koroPopup = document.createElement("div");
            koroPopup.id = 'koroPopup';
            koroContainer.appendChild(koroPopup);
        }

        for (let t = 0; t < tCount; t++) {
            let tCanvas = document.getElementById(`tCanvas${t}`);
            if (!tCanvas) {
                tCanvas = document.createElement("canvas");
                tCanvas.id = `tCanvas${t}`;
                tCanvas.classList = 'koro-question';
                tCanvas.width = 304;
                tCanvas.height = 32;
                koroPopup.appendChild(tCanvas);
            }

            const tCx = tCanvas.getContext('2d');
            tCx.save();
            tCx.clearRect(0, 0, 304, 32);
            tCx.fillStyle = '#fff';
            tCx.textAlign = "center";
            tCx.font = "15px Arial";
            tCx.fillText(tQuestions[t].find(q => q.ok).en, 152, 23);
            tCx.restore();

            let tContainer = document.getElementById(`tContainer${t}`);
            if (!tContainer) {
                tContainer = document.createElement("div");
                tContainer.id = `tContainer${t}`;
                koroPopup.appendChild(tContainer);
            }
            tContainer.classList = 'koro-kanji-container';

            tQuestions[t].forEach(({ jp, en, ok }, k) => {
                let kCanvas = document.getElementById(`kCanvas${t * kCount + k}`);
                if (!kCanvas) {
                    kCanvas = document.createElement("canvas");
                    kCanvas.id = `kCanvas${t * kCount + k}`;
                    kCanvas.width = 64;
                    kCanvas.height = 64;
                    kCanvas.onclick = () => {
                        if (tAnswers[t] === -1) {
                            tContainer.classList = 'koro-kanji-container answered';
                            tAnswers[t] = k;
                            for (let x = 0; x < kCount; x++) {
                                const cvs = document.getElementById(`kCanvas${t * kCount + x}`);
                                cvs.classList += ` koro-${tQuestions[t][x].ok ? 'ogey' : 'rrat'}`;
                            }
                            if (!tAnswers.find(a => a === -1)) {
                                if (tQuestions.some((q, t) => !q[tAnswers[t]].ok)) koroSetProblem();
                                else koroClear();
                            }
                        }
                    }
                    tContainer.appendChild(kCanvas);
                }
                kCanvas.classList = 'koro-kanji';

                const kCx = kCanvas.getContext('2d');
                kCx.save();
                kCx.clearRect(0, 0, 64, 64);
                kCx.scale(2, 2);
                kCx.textAlign = "center";
                kCx.fillStyle = '#fff';
                kCx.font = "19px Arial";
                kCx.fillText(jp, 16, 23);
                kCx.restore();
            });
        }

        let ngmiBtn = document.getElementById('ngmiBtn');
        if (!ngmiBtn) {
            ngmiBtn = document.createElement("p");
            ngmiBtn.id = 'ngmiBtn';
            ngmiBtn.innerHTML = 'Add <strong>ngmi</strong> in your profile to remove the captcha';
            koroContainer.appendChild(ngmiBtn);
        }
    }


    // --- Player refresh and delete video overrides ---
    const _deleteVideo = window.deleteVideo;
    window.deleteVideo = (ev, untilNext = false) => {
        _deleteVideo(ev, untilNext);
        vrData = null;
    };
    
    setTimeout(() => {
        // Replace the media refresh click event
        // Should fix vimeo making the player stuck
        $("#mediarefresh").unbind("click");
        $("#mediarefresh").bind("click", () => {
            if (vrData) {
                loadMediaPlayer(vrData);
                return;
            }
            
            window.PLAYER = false;
            socket.emit("playerReady");
        });
    }, 1000);


    // --- PM notification sound ---

    const notifSounds = [];

    // https://files.catbox.moe/0wzzdq.mp3
    const pmSound = new Audio('https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/pm.mp3');
    pmSound.volume = 0.75;
    notifSounds.push(pmSound);
    socket.on("pm", data => {
        const pmElem = document.getElementById(`pm-${data.username}`);
        if (pmElem) {
            if (window.getComputedStyle(pmElem).position === 'static') {
                pmElem.children[0].style.background = '#f00';
                pmSound.play();
            } else pmElem.children[0].style.background = 'none';
        }
    });


    // --- Poll notification sound ---

    // https://files.catbox.moe/m8md1e.mp3
    const defaultPollSound = 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/poll.mp3';
    const pollSound = new Audio(defaultPollSound);
    pollSound.volume = 0.75;
    notifSounds.push(pollSound);
    socket.on('newPoll', data => {
        if (pollAlert) pollSound.play();
    });


    // --- Playlist notification sound ---
    const defaultPlSound = 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/hihoney.mp3';
    const plSound = new Audio(defaultPlSound);
    plSound.volume = 0.75;
    notifSounds.push(plSound);
    socket.on("setCurrent", pluid => {
        var marked = $("#queue").data("marked");
        if (!marked) return;

        var isMarked = marked.includes(pluid);
        if (!isMarked) return;
        
        const item = $('.queue_active');
        item.find(".qbtn-mark").removeClass("btn-warning").addClass("btn-default disabled");
        marked.splice(marked.indexOf(pluid), 1)
        plSound.play();
        restoreVideo();
    });

    // --- Socket.io message listener ---


    let fpEffects = true;
    let potato = false;
    socket.on("chatMsg", ({ username, msg, meta, time }) => {
        if (IGNORED && IGNORED.find(user => user === username)) return;

        // --- Mentions ---
        if ((CLIENT.name || hilightWords.length) &&
            username != CLIENT.name &&
            !ignorePingUsers.includes(username.toLowerCase()) &&
            highlightsMe(msg)) {
            addMention(username, msg, meta, time);
        }

        // --- Add oshi mark to username (user locked) ---
        if (findUserlistItem(CLIENT.name) && findUserlistItem(CLIENT.name).data("profile").text.match(/oshi:\"(\w)*\"/)) {
            Array.from(document.getElementById('messagebuffer').lastChild.getElementsByClassName('username')).forEach(nameElem => {
                const u = findUserlistItem(username);
                if (!u || !u.data("profile"))
                    return;

                const oshiSearch = u.data("profile").text.match(/oshi:\"(\w)*\"/);
                const oshi = oshiSearch ? oshiSearch[0].substring(6, oshiSearch[0].length - 1) : null;
                if (oshi && holodata[oshi]) {
                    if (systemOshiMarks || !twemojiLoaded) {
                        nameElem.innerHTML = `${username} <span class="oshi-mark" style="font-weight:100 !important">${holodata[oshi]}</span>`;
                    }
                    else {
                        try {
                            const oshiSpan = document.createElement('span');
                            oshiSpan.style.fontWeight = "100 !important";
                            oshiSpan.innerText = holodata[oshi];
                            twemoji.parse(oshiSpan, {
                                base: 'https://archive.mogu.cafe/files/twemoji/',
                                folder: 'svg',
                                ext: '.svg',
                            });
                            nameElem.innerHTML = `${username} `;
                            nameElem.appendChild(oshiSpan);
                        } catch (e) {
                            nameElem.innerHTML = `${username} <span class="oshi-mark" style="font-weight:100 !important">${holodata[oshi]}</span>`;
                        }
                    }
                }
            });
        }

        // --- fp tag ---
        const flpSearch = msg.match(/\[fp\].*\[\/fp\]/);
        if (flpSearch && potato) {
            const text = flpSearch[0].replace('[fp]', '').replace('[/fp]', '').trim();
            document.getElementById('messagebuffer').lastElementChild.lastElementChild.innerHTML = text;
        } else if (flpSearch) {
            const text = flpSearch[0].replace('[fp]', '').replace('[/fp]', '').trim();
            const args = flpSearch.input.replace(flpSearch[0], '');

            // tag options
            const nnd = args.match(/nnd/i) && fpEffects;
            const gay = args.match(/gay/i) && fpEffects;
            const rotate = args.match(/rotate/i) && fpEffects;
            const flip = args.match(/flip/i) && fpEffects;
            const right = args.match(/right/);
            const bounce = args.match(/bounce/);

            const chatMsgElem = document.getElementById('messagebuffer').lastElementChild.lastElementChild;
            const textLength = chatMsgElem.innerText.length;
            chatMsgElem.innerHTML = "";

            const containerElem = document.createElement(nnd ? "marquee" : "div");
            // containerElem.style.display = 'flex';
            containerElem.style.alignItems = 'center';

            if (nnd) {
                if (right) containerElem.direction = 'right';
                if (bounce) containerElem.behavior = 'alternate';
                containerElem.scrollAmount = 5 + Math.floor(Math.random() * 10);
                containerElem.style.color = `hsl(${360 * Math.random()}, 100%, ${75 + 25 * Math.random()}%)`;
                containerElem.style.fontSize = `${70 + Math.floor(60 * Math.random()) + (document.getElementById('flarepeek_chat_video_only').checked ? 100 : 0)}%`;
            }

            if (gay) {
                let imgBuffer = false;
                let img = '';
                for (let i = 0; i < text.length; i++) {
                    if (text[i] === '<') imgBuffer = true;
                    if (!imgBuffer) {
                        const charElem = document.createElement("span");
                        charElem.style.color = "hsl(" + (360 * i / textLength) + ",80%,50%)";
                        charElem.innerHTML = text[i];
                        containerElem.appendChild(charElem);
                    } else {
                        img += text[i];
                        if (text[i] === '>') {
                            containerElem.insertAdjacentHTML('beforeend', img);
                            imgBuffer = false;
                            img = '';
                        }
                    }
                }
            }

            if (!containerElem.innerHTML.length) {
                containerElem.innerHTML = text.replace(String.fromCharCode(160), '').split(' ').join('').length ? text : `¯\\_(ツ)_/¯`;
            }

            if (rotate) {
                containerElem.querySelectorAll('img').forEach(image =>
                    image.style.transform = `rotate(180deg)`
                );
            }

            if (flip) {
                containerElem.querySelectorAll('img').forEach(image =>
                    image.style.transform = `${image.style.transform} rotateY(180deg)`
                );
            }

            chatMsgElem.appendChild(containerElem);
        }

        const messElem = document.getElementById('messagebuffer').lastElementChild;
        let messElemTxt = messElem.lastElementChild?.innerHTML;

        // /filters take precedence
        let filtered = Object.keys(filters).some(fkey => {
            const filter = filters[fkey];
            return filter.prefixes.some(prefix => {
                if (msg.startsWith(prefix)) {
                    messElem.classList.add(`filter${fkey}css`);
                    return true;
                }
                return false;
            });
        });

        if (!filtered) {
            // Check -filters if a front one was not set
            filtered = Object.keys(filters).some(fkey => {
                const filter = filters[fkey];
                return filter.postfixes.some(postfix => {
                    if (msg.endsWith(postfix)) {
                        messElem.classList.add(`filter${fkey}css`);
                        return true;
                    }
                    return false;
                });
            });
        }

        // No explicit filters, set filter1
        if (!filtered) 
            messElem.classList.add('filter1css');

        if (msg.startsWith('/groomers')) 
        {
            LASTCHAT.name = '[server]';
            setGroomers(msg, messElem);

            // Barebones Python script that stores the groomers message in memory
            // https://git.om3tcw.touhou.cafe/Yokugo/cytube-extras/src/branch/master/groomers.py
            if (CHANNEL.name.toLowerCase() != "hollowmatsuridos") return; // Only allow being set from the main channel
            if (!CLIENT.name || username != CLIENT.name) return; // only let the user that set groomers send the request

            fetch("https://om3tcw.touhou.cafe/groomersv2", {
                method: 'POST',
                headers: {'content-type': 'text/plain'},
                body: msg
            })
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(`Error setting groomers, status code: ${resp.status}`);
                }
            });
        }
        else if (msg.startsWith('/niji')) 
        {
            LASTCHAT.name = '[server]';
            setNiji(msg, messElem);

            if (CHANNEL.name.toLowerCase() != "hollowmatsuridos") return; // Only allow being set from the main channel
            if (!CLIENT.name || username != CLIENT.name) return; // only let the user that set groomers send the request

            fetch("https://om3tcw.touhou.cafe/groomersv2", {
                method: 'POST',
                headers: {'content-type': 'text/plain'},
                body: msg
            })
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(`Error setting groomers, status code: ${resp.status}`);
                }
            });
        }
        else if (msg.startsWith('/ungroom'))
        {
            LASTCHAT.name = '[server]';
            const groomLight = document.getElementById('groom');
            const groomersLink = document.getElementById("groomers-link");
            const nijiLink = document.getElementById("niji-link");
            messElem.classList.add('alwaysHideCSS');

            if (groomersLink) {
                groomersLink.classList.remove("active");
                groomersLink.innerHTML = "No streams on groomers";
            }
            if (groomLight && !nijiLink.classList.contains("active")) {
                groomLight.text = '⚫';
            }
            setGroomersTitles();

            if (CHANNEL.name.toLowerCase() != "hollowmatsuridos") return;
            if (!CLIENT.name || username != CLIENT.name) return;

            fetch("https://om3tcw.touhou.cafe/groomersv2", {
                method: 'POST',
                headers: {'content-type': 'text/plain'},
                body: msg
            })
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(`Error unsetting groomers, status code: ${resp.status}`);
                }
            });
        }
        else if (msg.startsWith('/unniji'))
        {
            LASTCHAT.name = '[server]';
            const groomLight = document.getElementById('groom');
            const groomersLink = document.getElementById("groomers-link");
            const nijiLink = document.getElementById("niji-link");
            messElem.classList.add('alwaysHideCSS');

            if (nijiLink) {
                nijiLink.classList.remove("active");
                nijiLink.innerHTML = "No streams on niji";
            }
            if (groomLight && !groomersLink.classList.contains("active")) {
                groomLight.text = '⚫';
            }
            setGroomersTitles();

            if (CHANNEL.name.toLowerCase() != "hollowmatsuridos") return;
            if (!CLIENT.name || username != CLIENT.name) return;

            fetch("https://om3tcw.touhou.cafe/groomersv2", {
                method: 'POST',
                headers: {'content-type': 'text/plain'},
                body: msg
            })
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(`Error unsetting groomers, status code: ${resp.status}`);
                }
            });
        }

        if (messElemTxt) {
            Object.keys(filters).forEach(fkey => {
                const filter = filters[fkey];
                filter.prefixes.forEach(prefix => {
                    if (!msg.startsWith(prefix))
                        return;
                    messElemTxt = messElemTxt.replace(prefix, "");
                });
                filter.postfixes.forEach(postfix => {
                    if (!msg.endsWith(postfix))
                        return;
                    const re = new RegExp(`${postfix}$`)
                    messElemTxt = messElemTxt.replace(re, "");
                });
            });

            if (msg.startsWith('/groomers'))
                messElemTxt = messElemTxt.replace('/groomers', "");
            else if (msg.startsWith('/niji'))
                messElemTxt = messElemTxt.replace('/niji', "");
            else if (msg.startsWith('/ungroom'))
                messElemTxt = messElemTxt.replace('/ungroom', "");
            else if (msg.startsWith('/unniji'))
                messElemTxt = messElemTxt.replace('/unniji', "");

            messElem.lastElementChild.innerHTML = messElemTxt;
            if(potato) {
                messElem.lastElementChild.querySelectorAll("img").forEach(img => { const title = img.title; img.outerHTML = title; });
            }
        }

        Array.from(document.getElementsByClassName("channel-emote")).filter(e => e.title === "mikocough").forEach(elem => elem.onclick = e => {
          if (Math.random() > .9) mikoCough.play();
        });
    });

    $.fn.bindFirst = function(name, fn) {
        this.on(name, fn);
        this.each(function() {
            var handlers = $._data(this, 'events')[name.split('.')[0]];
            var handler = handlers.pop();
            handlers.splice(0, 0, handler);
        });
    };

    $("#chatline").bindFirst("keydown",ev => {
        if (ev.keyCode == 13) {
            if (CHATTHROTTLE || !$("#chatline").val().trim()) return;
            if (filterValue !== 1) $("#chatline").val($("#chatline").val() + ` -f${filterValue}`);
        }
    });

    const changeFilter = (filval, back = false) => {
        const filterCount = Object.keys(filters).length;

        // Max filterCount rounds in case user has all filters hidden for some reason
        for (let i = 0; i < filterCount; i++) {
            if (back) filval--;
            filval = filval % filterCount;
            
            if (!back) filval++;
            else if(filval === 0) filval = filterCount;

            if (filters[filval].hiddenEle.disabled) {
                break;
            }
        }
        
        return filval;
    }

    $("#chatline").keydown(ev => {
        const removeFilterText = (val => {
            Object.keys(filters).forEach(fkey => {
                const filter = filters[fkey];
                filter.postfixes.forEach(postfix => {
                    const re = new RegExp(`${postfix}$`)
                    val = val.replace(re, "");
                });
            });

            return val.trimEnd();
        });

        const chatVal = $("#chatline").val();
        if (ev.keyCode == 38 || ev.keyCode == 40) {
            $("#chatline").val(removeFilterText(chatVal));
            ev.preventDefault();
            return false;
        } else if (ev.keyCode == 9 && chatVal === "") {
            if (ev.shiftKey) filterValue = changeFilter(filterValue, true);
            else filterValue = changeFilter(filterValue);

            document.getElementById("filterSelect").value = filterValue;
            document.getElementById("chatline").style.boxShadow = filters[filterValue].style;
        }
    });


    // --- fp tag shortcut ---


    keyHeld = false;
    window.onkeyup = event => keyHeld = false;
    const fpShortcut = event => {
        const inputBox = document.getElementById("chatline");
        const inputVal = inputBox.value;
        const keyVal = String.fromCharCode(event.which).toLowerCase();
        if (!keyHeld && event.ctrlKey && !event.shiftKey && (keyVal === 'q' || keyVal === 'e')) {
            keyHeld = true;
            event.preventDefault();
            const selSt = inputBox.selectionStart;
            const selEnd = inputBox.selectionEnd;
            if (inputBox === document.activeElement) {
                if (inputBox.selectionStart == inputBox.selectionEnd) {
                    inputBox.value = `${inputVal.substring(0, selSt)}[fp]${inputVal.substring(selSt, selEnd)}[/fp]${inputVal.substring(selEnd, inputVal.length)}`;
                    inputBox.setSelectionRange(selSt + 4, selSt + 4);
                } else if (inputBox.selectionStart < inputBox.selectionEnd) {
                    inputBox.value = `${inputVal.substring(0, selSt)}[fp]${inputVal.substring(selSt, selEnd)}[/fp]${inputVal.substring(selEnd, inputVal.length)}`;
                    inputBox.setSelectionRange(selEnd + 9, selEnd + 9);
                }
            }
        }
    }
    window.onkeydown = fpShortcut;


    // Snow pekobanzai

    const snowCanvas = document.createElement('canvas')
    snowCanvas.id = 'snow'
    snowCanvas.style.position = 'absolute';
    snowCanvas.style.top = 0;
    snowCanvas.style.left = 0;
    snowCanvas.style.display = 'none';
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
    document.body.insertAdjacentElement('afterbegin', snowCanvas);
    window.addEventListener('resize', () => {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
    });

    const snowCtx = snowCanvas.getContext("2d");
    const particles = [];
    const angles = [];
    let snowFPS = 30;
    let snowFrameTime = 0;
    let snowSpdMult = 0;
    let mp = 0; // max particles
    let lastFrameTime = 0;
    let frameReq = -1;

    function updateSnowParams(fps, flakes) {
        if (frameReq >= 0) {
            cancelAnimationFrame(frameReq);
            frameReq = -1;
        }

        if (mp != flakes) {
            mp = flakes;
            particles.splice(0, particles.length)
            for (let i = 0; i < mp; i++) {
                particles.push({
                    x: Math.random() * window.innerWidth, // x-coordinate
                    y: Math.random() * window.innerHeight, // y-coordinate
                    r: Math.random() * 4 + 1, // radius
                    d: Math.random() * mp // density
                });
            }

            // Angles will be ongoing incremental flags. Sin and Cos functions will be applied to them to create vertical and horizontal movement of the flakes
            angles.splice(0, angles.length);
            for (let i = 0 ; i < (mp / 25); i++) {
                angles.push(Math.random()*(i+1));
            }
        }

        if (fps === 0) {
            drawSnow(0);
            return;
        }

        snowFPS = fps;
        snowFrameTime = 1000 / snowFPS;
        frameReq = requestAnimationFrame(animateSnow);
    }

    /**
     * @param {DOMHighResTimeStamp} timestamp
     */
    function animateSnow(timestamp) {
        if (!snowEnabled) return;

        let frameDelta = timestamp - lastFrameTime;
        if (frameDelta < snowFrameTime) {
            frameReq = requestAnimationFrame(animateSnow);
            return;
        }

        if (frameDelta > 100) frameDelta = 100;
        lastFrameTime = timestamp
        drawSnow(frameDelta);
        frameReq = requestAnimationFrame(animateSnow);
    }

    function drawSnow(frameDelta) {
        snowCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        snowCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
        snowCtx.beginPath();
        particles.forEach(p => {
            snowCtx.moveTo(p.x, p.y);
            snowCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        });
        snowCtx.fill();

        if (frameDelta > 0)
            updateSnow(frameDelta);
    }

    // Function to move the snowflakes
    function updateSnow(frameDelta) {
        snowSpdMult = frameDelta / 33; // Current frame delay / 30FPS frame delay
        angles.forEach((angle, i, arr) => {
            arr[i] = angle + (0.01 * snowSpdMult);
        })

        particles.forEach( (p, i, arr) => {
            const angleIdx = i % angles.length;
            const angle = angles[angleIdx];
            // Updating X and Y coordinates
            // Add 1 to the cos function to prevent negative values which would cause flakes to move upwards
            p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) * snowSpdMult;
            p.x += (Math.sin(angle) * 2) * snowSpdMult;

            // Send flakes back to the top when they exit the bottom
            if (p.x > window.innerWidth + 5) {
                p.x = p.x = -5;
            } else if (p.x < - 5) {
                p.x = window.innerWidth + 5;
            } else if (p.y > window.innerHeight) {
                p.x = Math.random() * window.innerWidth;
                p.y = -5;
                p.r = Math.random() * 4 + 1;
                p.d = Math.random() * mp;
            }
        });
    }


    // --- Flare Button ---

    const button = document.createElement('button');
    button.id = 'flarepeek';
    button.classList = 'flareAnim';
    button.onclick = () => {
        document.getElementById('flarepeek').classList.toggle('flareAnim');
        const bubble = document.getElementById('flareBubble');
        bubble.style.display = bubble.style.display === 'none' ? 'flex' : 'none';
        const tail = document.getElementById('flareTail');
        tail.style.display = tail.style.display === 'none' ? 'block' : 'none';
    }
    document.body.append(button);

    const tail = document.createElement('div');
    tail.id = 'flareTail';
    tail.style.display = 'none';
    document.body.append(tail);

    const bubble = document.createElement('div');
    bubble.id = 'flareBubble';
    bubble.style.display = 'none';
    document.body.append(bubble);


    // --- User's guide ---

    const userGuide = document.createElement('a');
    userGuide.href = "https://git.om3tcw.touhou.cafe/Yokugo/cytube/src/branch/master/README.md";
    userGuide.target = "_blank";
    userGuide.innerHTML = "User's guide";
    userGuide.style.color = "#888";
    userGuide.style.fontSize = "small";
    userGuide.style.textAlign = "end";
    bubble.append(userGuide);


    // --- Checkbox Options ---

    const options = [{
        id: 'chat_video_only',
        desc: 'Chat & video only, no bullshit',
        setupFunc: self => {
            const aquaButton = document.createElement('button');
            aquaButton.id = 'aquaButton';
            aquaButton.onclick = () => {
                const chatwrap = document.getElementById('chatwrap');
                chatwrap.style.pointerEvents = chatwrap.style.pointerEvents === 'none' ? 'all' : 'none';
                chatwrap.style.opacity = chatwrap.style.pointerEvents === 'none' ? 0.25 : 1;
            }
            document.body.append(aquaButton);

            const css = `
            #aquaButton {width:46px;height:86px;transform:scale(-1, -1);background: url('https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/aquapeek.png');position:absolute;right:0;top:0;padding: 0;z-index: 4;border: none;outline: none;display:none;opacity:0;transition:.25s}
            #aquaButton:hover {opacity:1;transition:.25s}`;
            const style = document.createElement('style');
            if (style.styleSheet) style.styleSheet.cssText = css;
            else style.appendChild(document.createTextNode(css));
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            if (checkboxElem && checkboxElem.checked) {
                noBullshit = true;
                document.getElementById('chatwrap').style.width = `${noBsWidth}%`;
            } else {
                noBullshit = false;
                document.getElementById('chatwrap').style.width = '';
            }
        },
        css: `
        #mainpage { padding-top: 0 !important; background: #000 !important; }
        ::-webkit-scrollbar { width: 0 !important; } *{ scrollbar-width: none !important; }
        #chatheader, #userlist, #videowrap-header, #vidchatcontrols, #pollwrap, #MainTabContainer, .timestamp, nav.navbar {display:none !important;}
        #chatwrap {position:fixed;width:100%;box-shadow:none !important;}
        #videowrap {width: 100vw; height: 56.25vw;max-height: 100vh;max-width: 177.78vh;position: absolute;margin: 0 0 0 auto !important;padding: 0 !important;top:0;bottom:0;left:0;right:0;}
        #emotelistbtn {background-size: cover;background-position: initial;outline: none;}
        #chatinputrow button {background-position-y: -12px;height:20px;background-color: transarent;border: none;border-radius: 0 8px 0 0;}
        form input#chatline {padding: 8px; background: none;}
        #emotebtndiv + form {background: none;image-rendering: pixelated;}
        #chatinputrow {flex-direction: row;}
        #messagebuffer div.nick-hover .username { color: #84f !important; }
        #messagebuffer div.nick-highlight .username { color: #f8f !important; }
        #messagebuffer div.nick-highlight.nick-hover .username { color: #fff !important; }
        #messagebuffer div{background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-hover {background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-highlight {background-color: #0000 !important;box-shadow: none !important;}
        #messagebuffer div.nick-highlight.nick-hover {background-color: #0000 !important;box-shadow: none !important;}
        .linewrap {background-color: #0000 !important;box-shadow: none !important;text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        .username {text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        form { background:none !important; }
        #chatinputrow{height:20px;}
        #chatline {height:20px !important;background-size: 44px !important;background-position: 0 -8px !important;}
        input.form-control[type=text] { color: #fff; height:20px; text-shadow: 1px 0 #000, 0 1px #000, -1px 0 #000, 0 -1px #000, 2px 0 2px #000, 0 2px 2px #000, -2px 0 2px #000, 0 -2px 2px #000, 1px 1px #000, 1px -1px #000, -1px 1px #000, -1px -1px #000 !important;}
        #main { height: 100% !important;}
        input.form-control[type=text]::placeholder {color: #ccc !important;}
        :focus::-webkit-input-placeholder { color: #ccc !important;}
        .embed-responsive {max-height:100% !important}
        #aquaButton {display: block}
        `
    },
    {
        id: 'no_bs_width',
        desc: 'No Bullshit Chat Width',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const rangeElem = document.getElementById(`flarepeek_${self.id}_range`);
            if (checkboxElem && checkboxElem.checked && rangeElem) {
                noBsWidth = rangeElem.value;
                if (noBullshit) {
                    document.getElementById('chatwrap').style.width = `${noBsWidth}%`;
                }
            } else {
                document.getElementById('chatwrap').style.width = '';
            }
        },
        range: {
            default: 100,
            value: 100,
            min: 0,
            max: 100,
            step: 1,
            inputEvent: self => {
                self.range.value = document.getElementById(`flarepeek_${self.id}_range`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'player_volume',
        desc: 'Player Volume',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const rangeElem = document.getElementById(`flarepeek_${self.id}_range`);
            if (checkboxElem && checkboxElem.checked && rangeElem && PLAYER) {
                PLAYER.setVolume(rangeElem.value);
            }
        },
        range: {
            default: 0.25,
            value: 0.25,
            min: 0,
            max: 1,
            step: .01,
            inputEvent: self => {
                self.range.value = document.getElementById(`flarepeek_${self.id}_range`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'notif_volume',
        desc: 'Notifications Volume',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const rangeElem = document.getElementById(`flarepeek_${self.id}_range`);
            if (checkboxElem && checkboxElem.checked && rangeElem) {
                notifSounds.forEach(s => {
                    const vol = parseFloat(rangeElem.value);
                    if (vol) s.volume = vol;
                })
            }
        },
        range: {
            default: 0.75,
            value: 0.75,
            min: 0,
            max: 1,
            step: .01,
            inputEvent: self => {
                self.range.value = document.getElementById(`flarepeek_${self.id}_range`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'background',
        desc: 'Change Background',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && textElem) self.css = checkboxElem.checked && textElem.value && textElem.value !== '' ? `body { background-image: url(${textElem.value}); }` : null;
        },
        text: {
            default: '',
            value: '',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'playlist_sound',
        desc: 'Custom Playlist Notification Sound',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                plSound.src = textElem.value;
            } else {
                plSound.src = defaultPlSound;
            }
        },
        datalist: {
            default: '',
            value: '',
            suggestions: [
                { val: defaultPlSound, text: 'Hi Honey'},
                { val: 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/faqu.mp3', text: 'FAQ U'},
                { val: 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/suiscream.mp3', text: 'Suiscream'},
                { val: 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/ahoy.mp3', text: 'Ahoy'},
                { val: 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/watata.mp3', text: 'Watata~'},
                { val: 'https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/YATTAAAAAA.mp3', text: 'YATTAAAAAA'},
            ],
            inputEvent: self => {
                self.datalist.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'poll_alert',
        desc: 'Add a poll sound alert',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked) {
                pollAlert = true;
                if (textElem && textElem.value) {
                    try {
                        new URL(textElem.value)
                        pollSound.src = textElem.value;
                    } catch {
                        pollSound.src = defaultPollSound;
                    }
                } else {
                    pollSound.src = defaultPollSound;
                }
            } else {
                pollAlert = false;
            }
        },
        text: {
            default: '',
            value: '',
            placeholder: 'Custom sound URL (optional)',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'filter_1',
        desc: 'Hide the default chat',
        func: self => {
            filter1style.disabled = !filter1style.disabled;
            document.getElementById("messagebuffer").scrollTop = document.getElementById("messagebuffer").scrollHeight;
        }
    },
    {
        id: 'filter_2',
        desc: 'Hide the game chat',
        func: self => {
            filter2style.disabled = !filter2style.disabled;
            document.getElementById("messagebuffer").scrollTop = document.getElementById("messagebuffer").scrollHeight;
        }
    },
    {
        id: 'filter_3',
        desc: 'Hide the blog chat',
        func: self => {
            filter3style.disabled = !filter3style.disabled;
            document.getElementById("messagebuffer").scrollTop = document.getElementById("messagebuffer").scrollHeight;
        }
    },
    {
        id: 'filter_4',
        desc: 'Hide the >EN chat',
        func: self => {
            filter4style.disabled = !filter4style.disabled;
            document.getElementById("messagebuffer").scrollTop = document.getElementById("messagebuffer").scrollHeight;
        }
    },
    {
        id:'groomers_announce',
        desc: 'Enable groomers tab',
        func: self => {
            groomStyle.disabled = !groomStyle.disabled;
        }
    },
    {
        id: 'filter_2_color',
        desc: 'Custom game color',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                filters[2].color = textElem.value;
                filters[2].style = `inset 0 0 0 2px ${filters[2].color}`
                if (filterValue == 2) document.getElementById("chatline").style.boxShadow = filters[2].style;
            }
            self.css = `.filter2css {border-left:${filters[2].color} 3px solid !important}`;
        },
        text: {
            default: '#f44',
            value: '',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'filter_3_color',
        desc: 'Custom blog color',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                filters[3].color = textElem.value;
                filters[3].style = `inset 0 0 0 2px ${filters[3].color}`
                if (filterValue == 3) document.getElementById("chatline").style.boxShadow = filters[3].style;
            }
            self.css = `.filter3css {border-left:${filters[3].color} 3px solid !important}`;
        },
        text: {
            default: '#8f8',
            value: '',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'filter_4_color',
        desc: 'Custom >EN color',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                filters[4].color = textElem.value;
                filters[4].style = `inset 0 0 0 2px ${filters[4].color}`
                if (filterValue == 4) document.getElementById("chatline").style.boxShadow = filters[4].style;
            }
            self.css = `.filter4css {border-left:${filters[4].color} 3px solid !important}`;
        },
        text: {
            default: '#fff',
            value: '',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'chat_scrollback',
        desc: 'Chat history message count',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                const histSize = parseInt(textElem.value);
                if (!isNaN(histSize)) {
                    window.CHATMAXSIZE = histSize;
                }
            }
        },
        text: {
            default: window.CHATMAXSIZE,
            value: window.CHATMAXSIZE,
            inputEvent: self => {
                document.getElementById(`flarepeek_${self.id}`).checked = false;
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
            }
        }
    },
    {
        id: 'playlist_history',
        desc: 'Playlist history size (0 to disable history)',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value) {
                const histSize = parseInt(textElem.value);
                if (!isNaN(histSize)) {
                    maxPlaylistHistory = histSize;
                }
            }
        },
        text: {
            default: maxPlaylistHistory,
            value: maxPlaylistHistory,
            inputEvent: self => {
                document.getElementById(`flarepeek_${self.id}`).checked = false;
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
            }
        }
    },
    {
        id: 'reveal_spoilers',
        desc: 'Reveal spoilers',
        css: `.spoiler { color: #ff8; }`
    },
    {
        id: 'click_spoiler',
        desc: 'Click to reveal spoilers',
        css: `.spoiler:not(.reveal):hover { color: #000 !important; } .reveal {color: #ff8; }`,
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const mbuf = document.getElementById('messagebuffer');
            const pmbar = document.getElementById('pmbar');
            if (checkboxElem && checkboxElem.checked) {
                mbuf?.addEventListener('click', self.messageClicked);
                pmbar?.addEventListener('click', self.messageClicked);
            } else {
                mbuf?.removeEventListener('click', self.messageClicked);
                pmbar?.removeEventListener('click', self.messageClicked);
            }
        },
        messageClicked: (ev) => {
            if (!ev.target || !ev.target.classList) return;

            if (ev.target.classList.contains("reveal")) {
                ev.target.classList.remove("reveal")
            } else if (ev.target.classList.contains("spoiler")) {
                ev.target.classList.add("reveal")
            }
        }
    },
    {
        id: 'chat_video_ratio',
        desc: '>chat:video ratio',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const rangeElem = document.getElementById(`flarepeek_${self.id}_range`);
            if (checkboxElem && rangeElem) {
                self.css = checkboxElem.checked ? `
                #videowrap { width: ${(100 - rangeElem.value)}% !important; }
                #videowrap-header {display:none} #chatwrap { width: ${rangeElem.value}% !important; }` : null;
            }
        },
        range: {
            default: 50,
            value: 50,
            min: 0,
            max: 100,
            step: 1,
            inputEvent: self => {
                self.range.value = document.getElementById(`flarepeek_${self.id}_range`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'chat_transparency',
        desc: 'Chat Transparency',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const rangeElem = document.getElementById(`flarepeek_${self.id}_range`);
            if (checkboxElem && rangeElem) {
                self.css = checkboxElem.checked ? `
                #userlist { background-color: rgba(0, 0, 0, ${(1 - rangeElem.value)}) !important; }
                .linewrap { background-color: rgba(0,0,0,${(1 - rangeElem.value)}) }` : null;
            }
        },
        range: {
            default: 0.5,
            value: .5,
            min: 0,
            max: 1,
            step: .05,
            inputEvent: self => {
                self.range.value = document.getElementById(`flarepeek_${self.id}_range`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'system_oshi_marks',
        desc: 'Use system font for oshi marks',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            if (checkboxElem) {
                systemOshiMarks = checkboxElem.checked;
            }
        }
    },
    {
        id: 'remove_animations',
        desc: 'Remove animations (pen, chat luggage)',
        css: `* { animation: none !important; } #chatinputrow > form { animation: none !important; background-image: none !important; }`
    },
    {
        id: 'remove_effects',
        desc: 'Remove chat effects (nnd/gay)',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            if (checkboxElem) {
                fpEffects = !checkboxElem.checked;
            }
        }
    },
    {
        id: 'potato_mode',
        desc: 'Potato Mode (remove emotes/gifs/effects/animations)',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            if (checkboxElem && checkboxElem.checked) {
                fpEffects = false;
                potato = true;
                document.querySelectorAll('marquee').forEach(ele => ele.stop());
                document.getElementById("chatwrap").querySelectorAll("img").forEach(img => { const title = img.title; img.outerHTML = title; });
            } else {
                const fpEffectsCheckbox = document.getElementById(`flarepeek_remove_effects`);
                fpEffects = !fpEffectsCheckbox.checked;
                potato = false;
            }
        },
        css: `
            nav img { display: none !important; }
            .queue_active, #emotelistbtn, #chatline { background: none !important; }
            #chatinputrow > form { animation: none !important; background-image: none !important; }
            .channel-emote { display: none !important; }
        `
    },
    {
        id: 'invert_chat_position',
        desc: 'Invert chat position',
        css: `#main {flex-direction:row-reverse !important}`
    },
    {
        id: 'hide_playlist',
        desc: 'Hide playlist',
        css: `#MainTabContainer{display:none}`
    },
    {
        id: 'hide_navbar',
        desc: 'Hide navbar',
        css: `#mainpage { padding-top: 0 !important; } nav.navbar { display: none !important; }`
    },
    {
        id: 'hide_scrollbar',
        desc: 'Hide scrollbar',
        css: `::-webkit-scrollbar { width: 0 !important; } *{ scrollbar-width: none !important; }`
    },
    {
        id: 'popup_image',
        desc: 'Pop-up Image Preview',
        func: () => inlineImage = !inlineImage
    },
    {
        id: 'image_preview',
        desc: 'Disable image hover preview',
        func: () => imagePreviewEnabled = !imagePreviewEnabled
    },
    {
        id: 'local_calendar',
        desc: 'Calendar in Local Time',
        func: () => {
            calendarLocalTime = !calendarLocalTime;
            setCalendar();
        }
    },
    {
        id: 'calendar_view',
        desc: 'Set Calendar to Agenda View',
        func: () => {
            calendarAgendaView = !calendarAgendaView;
            setCalendar();
        }
    },
    {
        id: 'poll_location',
        desc: 'Put new polls in poll tab',
        func: () => {
            pollAboveTabs = !pollAboveTabs;
            redoPollwrap();
        }
    },
    {
        id: 'custom_CSS',
        desc: 'Custom CSS',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textAreaElem = document.getElementById(`flarepeek_${self.id}_textarea`);
            if (checkboxElem && textAreaElem) self.css = checkboxElem.checked ? (textAreaElem.value || '') : null;
        },
        textarea: {
            value: '',
            default: `.userlist_item {height:14px}
#videowrap-header,.profile-box hr{display:none}
#messagebuffer>div>span>div{background-color:#0000}
#queue,#queue + div,.queue_entry,#pollwrap>div{box-shadow: none !important;border-radius: 0;}
.queue_entry:hover:not(.queue_active),.userlist_item:hover{background-color: #84f8 !important;}
.navbar{min-height:32px;}
.navbar-brand{height:32px;padding:0;display: flex;align-items: center;cursor: pointer;}
.navbar-brand img{padding:0;margin:0;width:32px;height:32px}
.nav-tabs {background: #0008;}
.nav>li, .nav>li:focus{margin-bottom: 0;background: none !important;}
.nav>li>a, #nav-collapsible>form{color: #ccc;margin:0;border:none !important; padding:6px 16px !important;border-radius: 0;}
.nav>li>a:hover, .nav>li.activ, .nav>li.open>a.dropdown-toggle{background: none !important;text-shadow: #0ff 0 0 4px}
#MainTabContainer>ul>li.active>a, #MainTabContainer>ul>li:hover>a{color: #fff;background: none;text-shadow: #0ff 0 0 4px;cursor: pointer !important;}
.container-fluid{padding:0}
#videowrap{padding:0 0 0 350px}
.row {margin: 0;}
#chatheader{box-shadow:none;background-color: #000a;}
#mainpage {padding-top:32px}
.navbar {border:none; box-shadow:none !important; background-color:#000a !important}
.profile-box {min-height: 0;background-color: #000c;border: none;padding: 8px 8px 0px 8px;}
.profile-box p {margin: 4px 0 8px 0;}
.profile-image {border: none;margin: 0 8px 4px 0;}
.linewrap {z-index: 10;}
#emotelistbtn {outline: none;padding:0 16px;background-size: cover;background-position: initial;}
#chatinputrow button {border: none;border-radius: 0;width:32px;height:32px;background-color:#0000}
#chatinputrow,#chatinputrow form {height:32px}
form input#chatline {padding: 0 0 0 64px;height:32px}
#emotebtndiv + form {background-color: #000a;image-rendering: pixelated;}
form input#chatline {background-position: -32px -16px;background-size: 88px;}
#messagebuffer{background: none;}
#messagebuffer .username {margin-top:0;}
#main {height: 100% !important;}
.timestamp {background: none !important;box-shadow: none !important;text-shadow: 0 0 8px #000, 0 0 4px #000 !important;border-radius: 0 !important;font-style: normal !important;}
#messagebuffer div{background-color: #0008;}
#messagebuffer div.nick-hover {background-color: #4288 !important;box-shadow: none !important;}
#messagebuffer div.nick-highlight {background-color: #84f8 !important;box-shadow: none !important;}
#messagebuffer div.nick-highlight.nick-hover {background-color: #f8f8 !important;}
#messagebuffer div.nick-highlight .username {color: #f8f;}
#messagebuffer {box-shadow: none;}
#userlist {box-shadow: none;background: #0008;}
#main.flex>#chatwrap {box-shadow: none;}
.embed-responsive {box-shadow: none;margin: 0;background-color: #000;}
#pollwrap>div {margin: 0;}
.queue_active.queue_temp {border-radius: 0;}
#rightcontrols, #rightpane {box-shadow: none;background: #0008;border-radius: 0;}
#pollwrap {min-height:0px}
#pin-dropdown>.dropdown-menu {max-height: calc(100vh - 32px) !important}`,
            inputEvent: self => {
                document.getElementById(`flarepeek_${self.id}`).checked = false;
                self.textarea.value = document.getElementById(`flarepeek_${self.id}_textarea`).value;
            }
        },
    },
    {
        id: 'vertical_layout',
        desc: 'Vertical layout',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const chatWrap = document.getElementById('chatwrap');
            if (checkboxElem && checkboxElem.checked) {
                setTimeout(self.resizeChat, 50);
                window.addEventListener('resize', self.resizeChat);
            } else {
                window.removeEventListener('resize', self.resizeChat);
                chatWrap.style.height = '';
            }
        },
        resizeChat: () => {
            const chatWrap = document.getElementById('chatwrap');
            const mainEleHeight = document.getElementById('main').getBoundingClientRect().height;
            const chatWrapHeight = Math.floor(window.innerHeight - (mainEleHeight - chatWrap.getBoundingClientRect().height));
            chatWrap.style.height = `${chatWrapHeight}px`;
        },
        css: `.navbar, #videowrap-header {display:none}
        #mainpage {padding:0;height:auto !important}
        #main{flex-direction:column-reverse !important}
        #videowrap, #chatwrap{width:100%;margin:0; padding:0}`
    },
    {
        id: 'jltp_level',
        desc: 'Kororeps level',
        setupFunc: self => {
            document.getElementById(`flarepeek_${self.id}_label`).innerHTML = `Kororeps level: N${6 - parseInt(self.range.value)}`;
            jltpLevel = 6 - parseInt(self.range.value);
            if (findUserlistItem(CLIENT.name) && findUserlistItem(CLIENT.name).data("profile").text.match(/ngmi/)) {
                koroClear();
            } else koroSetProblem();
        },
        range: {
            default: 1,
            value: 1,
            min: 1,
            max: 5,
            step: 1,
            inputEvent: self => {
                self.range.value = parseInt(document.getElementById(`flarepeek_${self.id}_range`).value);
                document.getElementById(`flarepeek_${self.id}_label`).innerHTML = `Kororeps level: N${6 - parseInt(self.range.value)}`;
                jltpLevel = 6 - parseInt(self.range.value);
            }
        }
    },
    {
        id: 'aoi',
        desc: 'AOI LOVE',
        func: self => {
            const navbrand = document.getElementsByClassName("navbar-brand")[0];
            navbrand.innerHTML = navbrand.innerHTML.replace('ホロライブ', 'にじさんじ');
            const img = navbrand.children[0];
            img.style.backgroundImage = "url('https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/sakuboat.gif')";
            img.style.transform = 'none';
        },
        // https://files.catbox.moe/pt754u.png
        css: `#chatwrap { background-image: url('https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/aoi_love.png'); background-repeat: no-repeat; background-size: cover; }`
    },
    {
        id: 'snow',
        desc: 'Snow: FPS, Flakes',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                const params = textElem.value.split(',');
                let fps = parseInt(params[0]);
                let flakes = 200;

                if (isNaN(fps)) fps = 30;
                if (fps < 0) fps = 0;

                if (params.length > 1) {
                    flakes = parseInt(params[1]);
                    if (isNaN(flakes)) flakes = 200;
                    if (flakes < 1) flakes = 1;
                }

                snowEnabled = true;
                snowCanvas.style.display = '';
                updateSnowParams(fps, flakes);
            } else {
                frameReq = -1;
                snowEnabled = false;
                snowCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                snowCanvas.style.display = 'none';
            }
        },
        text: {
            default: '30, 200',
            value: '30, 200',
            placeholder: '<fps>, <flakes> (default 30, 200)',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'chat_clock',
        desc: 'Local and JP time clock above chat',
        func: () => {
            chatClockEnabled = !chatClockEnabled;
            if (chatClockEnabled)
                initChatClock();
            else
                unloadChatClock();
        }
    },
    {
        id: 'pins',
        desc: 'Hide pins',
        func: () => {
            const pins = document.getElementById('pins');
            if (pins.style.display)
                pins.style.display = '';
            else
                pins.style.display = 'none';
        }
    },
    {
        id: 'tickets',
        desc: 'Hide tickets',
        func: () => {
            const tickets = document.getElementById('tickets');
            if (tickets.style.display)
                tickets.style.display = '';
            else
                tickets.style.display = 'none';
        }
    },
    {
        id: 'etiquette',
        desc: 'Hide etiquette',
        func: () => {
            const etiquette = document.getElementById('etiquette');
            if (etiquette.style.display)
                etiquette.style.display = '';
            else
                etiquette.style.display = 'none';
        }
    },
    {
        id: 'hilights',
        desc: 'Extra Hilight Words',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            hilightWords.splice(0, hilightWords.length);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                hilightWords.push(...(textElem.value.split(',').map(hl => hl.trim())));
                hilightWords.push(CLIENT.name);
            } else {
                hilightWords.push(CLIENT.name);
            }
        },
        text: {
            default: '',
            value: '',
            placeholder: 'Comma separated list of words that hilight you',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'hlignore',
        desc: 'Ignore Pings From Users',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            ignorePingUsers.splice(0, ignorePingUsers.length);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                ignorePingUsers.push(...(textElem.value.split(',').map(uname => uname.toLowerCase().trim())));
            }
        },
        text: {
            default: '',
            value: '',
            placeholder: 'Comma separated list of usernames',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'imgignore',
        desc: 'Disable Image Hover for Select Users',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            const textElem = document.getElementById(`flarepeek_${self.id}_text`);
            ignoreImgUsers.splice(0, ignoreImgUsers.length);
            if (checkboxElem && checkboxElem.checked && textElem && textElem.value && textElem.value !== '') {
                ignoreImgUsers.push(...(textElem.value.split(',').map(uname => uname.toLowerCase().trim())));
            }
        },
        text: {
            default: '',
            value: '',
            placeholder: 'Comma separated list of usernames',
            inputEvent: self => {
                self.text.value = document.getElementById(`flarepeek_${self.id}_text`).value;
                if (self.applyChanges) self.applyChanges();
            }
        }
    },
    {
        id: 'unloadwarn',
        desc: 'Confirmation before closing the tab',
        func: self => {
            const checkboxElem = document.getElementById(`flarepeek_${self.id}`);
            if (checkboxElem && checkboxElem.checked) {
                window.addEventListener('beforeunload', self.onUnload);
            } else {
                window.removeEventListener('beforeunload', self.onUnload);
            }
        },
        onUnload: (ev) => {
            ev.returnValue = "Chrome is a piece of shit";
            ev.preventDefault();
            socket.disconnect();
            socket.connect();
        }
    }];

    const fplegend = document.createElement('p');
    fplegend.innerHTML = 'Options';
    fplegend.style.textAlign = 'center';
    bubble.appendChild(fplegend);

    const fpOptContainer = document.createElement('div');
    fpOptContainer.id = 'fpOptContainer';
    bubble.append(fpOptContainer);

    options.forEach(opt => {
        const div = document.createElement('div');
        fpOptContainer.append(div);

        const optId = `flarepeek_${opt.id}`;
        const checkboxElem = document.createElement('input');
        checkboxElem.id = optId;
        checkboxElem.type = 'checkbox';

        const optFunc = () => {
            if (opt.func) opt.func(opt);
            if (document.getElementById(`${optId}_style`)) document.getElementById(`${optId}_style`).remove();
            if (opt.css && checkboxElem.checked) {
                const style = document.createElement('style');
                style.id = `${optId}_style`;
                if (style.styleSheet) style.styleSheet.cssText = opt.css;
                else style.appendChild(document.createTextNode(opt.css));
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }
        opt.applyChanges = optFunc;
        checkboxElem.onclick = () => optFunc();
        div.append(checkboxElem);

        // Load cookie option
        const parts = `; ${document.cookie}`.split(`; ${opt.id}=`);
        const cookie = (parts.length === 2) ? parts.pop().split(';').shift() : null;
        if (cookie !== null) {
            const value = decodeURIComponent(escape(window.atob(cookie)));
            const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : opt.datalist ? 'datalist' : null;
            
            if (valueElem) opt[valueElem].value = value;
            document.getElementById(`flarepeek_${opt.id}`).checked = true;

            const interval = setInterval(() => {
                if (document.getElementsByClassName("userlist_item").length) {
                    clearInterval(interval);
                    optFunc();
                }
            }, 100);
        }

        const label = document.createElement('label');
        label.id = `${optId}_label`;
        label.innerHTML = opt.desc;
        label.title = opt.id;
        label.htmlFor = optId;
        div.append(label);

        if (opt.textarea) {
            const textareaElem = document.createElement('textarea');
            textareaElem.id = `${optId}_textarea`;
            textareaElem.value = opt.textarea.value ? opt.textarea.value : opt.textarea.default;
            if (opt.textarea.inputEvent) textareaElem.oninput = () => opt.textarea.inputEvent(opt);
            fpOptContainer.append(textareaElem);
        }

        if (opt.range) {
            const rangeElem = document.createElement('input');
            rangeElem.id = `${optId}_range`;
            rangeElem.type = 'range';
            rangeElem.style.display = 'inlineBlock !important';
            if (opt.range.min) rangeElem.min = opt.range.min;
            if (opt.range.max) rangeElem.max = opt.range.max;
            if (opt.range.step) rangeElem.step = opt.range.step;
            if (opt.range.value) rangeElem.defaultValue = opt.range.value;
            if (opt.range.inputEvent) rangeElem.oninput = () => opt.range.inputEvent(opt);
            fpOptContainer.append(rangeElem);
        }

        if (opt.text) {
            const textElem = document.createElement('input');
            textElem.id = `${optId}_text`;
            textElem.type = 'text';
            textElem.value = opt.text.value ? opt.text.value : opt.text.default;
            if (opt.text.placeholder) textElem.placeholder = opt.text.placeholder;
            if (opt.text.inputEvent) textElem.oninput = () => opt.text.inputEvent(opt);
            fpOptContainer.append(textElem);
        }

        if (opt.datalist) {
            const dlDiv = document.createElement('div');
            const textElem = document.createElement('input');
            const optList = document.createElement('datalist');

            textElem.id = `${optId}_text`;
            textElem.type = 'text';
            textElem.setAttribute('list', `${optId}_list`);
            textElem.style.width = "100%";
            textElem.placeholder = "double-click for presets"
            textElem.value = opt.datalist.value ? opt.datalist.value : opt.datalist.default;
            if (opt.datalist.inputEvent) textElem.oninput = () => opt.datalist.inputEvent(opt);

            optList.id = `${optId}_list`;
            if (opt.datalist.suggestions) {
                opt.datalist.suggestions.forEach(item => {
                    const listOpt = document.createElement('option');
                    listOpt.value = item.val;
                    listOpt.innerText = item.text;
                    optList.append(listOpt);
                });
            }

            dlDiv.append(textElem);
            dlDiv.append(optList);
            fpOptContainer.append(dlDiv);
        }

        if (opt.setupFunc) opt.setupFunc(opt);
    });


    // --- Cookie buttons ---


    const cookieDiv = document.createElement('div');
    cookieDiv.id = 'cookieDiv';
    bubble.append(cookieDiv);

    const saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.innerHTML = 'Save<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbUlEQVQ4y2NgGLTAk+Exw38csB6bhkc4lePQAhLGDsIZfmPTAtGAaTZOLfg0gLRguAC/BgaqacANqKuBjaGd4RkQtgNZRGnogPuggzgNT+EantJIA8lOItnTRAUr/uQNgo+Iz0Ag+JjBY9BmfgAjpbf/V5agRgAAAABJRU5ErkJggg==">';
    saveButton.onclick = () => options.forEach(opt => {
        const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : opt.datalist ? 'datalist' : null;
        const value = valueElem ? opt[valueElem].value : document.getElementById(`flarepeek_${opt.id}`).checked ? 1 : 0;
        document.cookie = document.getElementById(`flarepeek_${opt.id}`).checked
            ? `${opt.id}=${window.btoa(unescape(encodeURIComponent(value)))};path=/;expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toGMTString()};`
            : `${opt.id}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });
    cookieDiv.append(saveButton);

    const resetButton = document.createElement('button');
    resetButton.id = 'resetButton';
    resetButton.innerHTML = 'Reset<img width="24" height="24" alt="save" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPElEQVQ4y2NgGAJAgeE+w38ovA/k4QH/8UDqaCADkGw+WRqIERvVMNQ1PMKaMB7h1uDB8BhD+WOg6OAGADZZd6fzGEl6AAAAAElFTkSuQmCC">';;
    resetButton.onclick = () => options.forEach(opt => {
        const valueElem = opt.textarea ? 'textarea' : opt.range ? 'range' : opt.text ? 'text' : null;
        if (valueElem) {
            const inputElem = document.getElementById(`flarepeek_${opt.id}_${valueElem}`);
            opt[valueElem].value = opt[valueElem].default;
            inputElem.value = opt[valueElem].value;
        }
        document.getElementById(`flarepeek_${opt.id}`).checked = false;
    });
    cookieDiv.append(resetButton);


    // --- Flarepeek username css ---
    let coolColor = '#DAA520';
    if (CLIENT && CLIENT.name) {
        const addHexColor = (c1, c2) => {
            var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
            while (hexStr.length < 6) { hexStr = '0' + hexStr; }
            return hexStr;
        }
        const toCoolColor = code => (code.replace(/[0-9]/g, "a").toLowerCase().charCodeAt(0) - 97).toString(16);
        const char1 = ('0' + toCoolColor(CLIENT.name[0])).slice(-2);
        const char2 = CLIENT.name.length > 1 ? ('0' + toCoolColor(CLIENT.name[1])).slice(-2) : char1;
        if (char1.length === 2 && char2.length === 2) coolColor = '#' + addHexColor('DAA520', `00${char1}${char2}`);
    }


    // --- Flarepeek css ---
    const fpcss = `#flarepeek {width: 56px;height: 38px;z-index: 2147483647;position: fixed;padding: 0;bottom: 0;right: 42px;border: none;outline: none;background: none;
        background-image: url('https://raw.githubusercontent.com/Yokugo495/matsudos/master/emotes/flarepeek.png');background-repeat: no-repeat;image-rendering: crisp-edges;}
        .flareAnim {animation: peek-out ease-in .2s both !important;}
        .flareAnim:hover {animation: peek-in ease-out .2s both !important;}
        @keyframes peek-in {from {background-position: 0px 38px;} to {background-position: 0px 0;}}
        @keyframes peek-out {from {background-position: 0px 0;} to {background-position: 0px 38px;}}
        #flareBubble {flex-grow: 0; flex-direction: column; padding: 12px 16px; z-index: 2147483647; position: fixed; bottom: 48px; right: 90px; background: #fff; border-radius: 8px; max-height:90%; min-width: 30%;}
        #flareBubble button {color: #000;}
        #flareBubble textarea {width: 100%;min-height: 128px;margin-bottom: 5px;resize: both;}
        #flareBubble label {color: #888;}
        #flareBubble input[type=checkbox] {margin-right: 8px;}
        #flareBubble input[type=range] {display: inline-block;margin-bottom: 5px;}
        #flareTail {width: 50px;height: 25px;z-index: 2147483647;position: fixed;bottom: 42px;right: 122px;background: #fff;transform: skew(15deg, 15deg);}
        #cookieDiv {margin-top: 12px;display:flex;}
        #cookieDiv button {width: 100%;display: flex;justify-content: center;align-items: center;}
        #cookieDiv button img {margin-left:4px}
        #fpOptContainer {overflow-y: scroll;display:flex;flex-direction:column}
        #resetButton {margin-left:16px}

        /* https://files.catbox.moe/193xa0.png */
        #koroContainer {position:fixed;top:0;left:0;width:100%;height:100%;background:url('https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/kororeps.png'), #0008;background-position: bottom right calc(50% - 256px);background-repeat: no-repeat;z-index: 2147483647;display:flex;}
        #koroPopup {display:flex;flex-direction:column;margin:auto}
        .koro-kanji-container {height:80px;}
        .koro-kanji-container.answered {opacity: .5;pointer-events: none;}
        #koroPopop canvas {background:#fff;}
        .koro-ogey {background:#8f8 !important;}
        .koro-rrat {background:#f88 !important;}
        .koro-kanji {cursor:pointer}
        .koro-kanji:hover {transform: scale(1.05) rotate(3deg);background-color: #95453E;}
        .koro-question, .koro-kanji {margin:8px;background:#602421;box-shadow:inset 0 0 0 2px #B89543;border-radius:4px}
        #ngmiBtn {position:absolute;top:4px;left:4px;color:#fff;background:#000;border-radius: 4px;padding: 2px 4px;}
        #koropop, #koroscore, #korokanji {border:none;outline:none;width:56px;height:56px;background:none;padding:0;border-radius:28px;}
        #koropop img:hover, #koroscore img:hover, #korokanji img:hover {box-shadow: 0 0 0 3px #08f}
        #koropop img, #koroscore img, #korokanji img {border-radius:28px;}

        #mentionContainer, #pinContainer {display:flex;flex-direction:column-reverse;margin-top:26px;}
        #mention-dropdown-toggle>.dropdown-menu, #pin-dropdown>.dropdown-menu {width: 384px;max-height: calc(100vh - 50px);overflow-y:scroll;padding:0;margin:0;border:none;}
        #mentionContainer>li, #pinContainer>li {display:flex;flex-direction:row;align-items: center;margin:8px 0}
        .pin-message {width: calc(100% - 32px);overflow-wrap: break-word;padding: 0 4px;}
        .pin-close {width:24px;height:24px;border-radius:12px;margin: auto 4px;color:#fff;background:#888;border:none;outline:none;transition:.2s}
        .pin-close:hover {background:#ccc;color:#333}
        #rmAllMentions {float:right;margin:4px 4px 0px 0px;color:#fff;background:#888;border:none;outline:none;border-radius:3px;}
        .navbar {background:#0008 !important;}
        .username{color:${coolColor} !important}

        #chatheader {display: flex}
        #filterSelect {margin-left: auto; background: #0008;border: none;color: #fff;outline: none;}
        #filterSelect:hover {text-shadow: #0ff 0 0 4px}
        .filter2css {border-left:${filters[2].color} 3px solid !important}
        .filter3css {border-left:${filters[3].color} 3px solid !important}
        .filter4css {border-left:${filters[4].color} 3px solid !important}

        #motdwrap {animation: rgb 0.5s linear 0s infinite !important;}
        @keyframes rgb {from {filter: hue-rotate(0deg);} to {filter: hue-rotate(360deg);}}

        #queue li:hover .qe_time { width: 180px; }

        #newmessages-indicator { margin-top: unset !important; }

        /* for twemoji oshi marks */
        img.emoji {
            height: 1em;
            width: 1em;
            margin: 0 .05em 0 .1em;
            vertical-align: -0.1em;
        }
    `;

    const style = document.createElement('style');
    if (style.styleSheet) style.styleSheet.cssText = fpcss;
    else style.appendChild(document.createTextNode(fpcss));
    document.getElementsByTagName('head')[0].appendChild(style);



    // Filter select
    const filterSelect = document.createElement("select");
    filterSelect.id = 'filterSelect';
    const filter1option = document.createElement("option");
    const filter2option = document.createElement("option");
    const filter3option = document.createElement("option");
    const filter4option = document.createElement("option");

    filter1option.value = "1";
    filter1option.text = "Default";
    filter1option.selected = "selected";
    filter2option.value = "2";
    filter2option.text = "Games";
    filter3option.value = "3";
    filter3option.text = "Blog";
    filter4option.value = "4";
    filter4option.text = ">EN";

    filterSelect.add(filter1option, null);
    filterSelect.add(filter2option, null);
    filterSelect.add(filter3option, null);
    filterSelect.add(filter4option, null);
    filterSelect.onchange = e => {
        filterValue = parseInt(document.getElementById("filterSelect").value);
        document.getElementById("chatline").style.boxShadow = filters[filterValue].style;
    }
    document.getElementById("chatheader").appendChild(filterSelect);

    Array.from(document.getElementById("messagebuffer").children).forEach(e => {
        // Messages are fresh, last child should be a span with the actual text
        const msg = e.lastElementChild;
        if (!msg) return;

        const groomMsgs = ["/groomers", "/niji", "/ungroom", "/unniji"];
        if (groomMsgs.some(groomMsg => msg.innerText.startsWith(groomMsg))) {
            e.classList.add("alwaysHideCSS");
            return;
        }

        let filtered = false;
        Object.keys(filters).forEach(fkey => {
            const filter = filters[fkey];
            filter.prefixes.forEach(prefix => {
                if (msg.innerText.startsWith(prefix)) {
                    if (!filtered) {
                        e.classList.add(`filter${fkey}css`);
                        filtered = true;
                    }
                    msg.innerHTML = msg.innerHTML.replace(prefix, "");
                }
            });

            filter.postfixes.forEach(postfix => {
                if (msg.innerText.endsWith(postfix)) {
                    if (!filtered) {
                        e.classList.add(`filter${fkey}css`);
                        filtered = true;
                    }
                    const re = new RegExp(`${postfix}$`)
                    msg.innerHTML = msg.innerHTML.replace(re, "");
                }
            });
        });

        if (!filtered)
            e.classList.add('filter1css');
    });

    // --- mikoboat ---
    // https://files.catbox.moe/5xuhxr.mp3
    const mikoDing = new Audio('https://raw.githubusercontent.com/Yokugo495/matsudos/master/resources/mikoding.mp3');
    mikoDing.loop = true;
    mikoDing.volume = 0.5;
    document.getElementsByClassName("navbar-brand")[0].onmouseenter = () => mikoDing.play();
    document.getElementsByClassName("navbar-brand")[0].onmouseleave = () => mikoDing.pause();

    // Modify links in history
    document.querySelectorAll("#chatwrap a[href]").forEach(a => {
        modifyLinks(a);
    });

    const tryFixNav = () => {
        if (window.innerWidth < 768)
            return;

        let logInOutForm = document.getElementById('logoutform');
        if (!logInOutForm) {
            logInOutForm = document.getElementById('loginform');
        }
        if (logInOutForm.clientWidth == 0)
            return;

        const ssheet = document.getElementById("usertheme").sheet;
        const navhead = document.querySelector('.navbar-header');
        const navlist = document.querySelectorAll('#nav-collapsible > ul > li');
        const formStyles = getComputedStyle(logInOutForm);
        let navMinWidth = navhead.clientWidth + logInOutForm.clientWidth + parseInt(formStyles.marginLeft) + parseInt(formStyles.marginRight) + 10;
        navlist.forEach(li => {
            navMinWidth += li.clientWidth;
        });

        if (navMinWidth > 768) {
            Array.from(ssheet.rules).forEach(rule => {
                if (rule.conditionText && rule.conditionText == '(min-width: 768px)') {
                    rule.media.mediaText = `(min-width: ${navMinWidth}px)`;
                }
            });
            window.removeEventListener('resize', tryFixNav);
        }
    }

    // Change collapse width for navbar.
    setTimeout(tryFixNav, 1000);
    window.addEventListener('resize', tryFixNav);

    socket.on('disconnect', (reason) => {
        console.log(`SocketIO Disconnected: ${reason}`);
    });

    return {
        hilightWords,
        ignorePingUsers
    };
})();




// --- Other stuff ---

// ====================== Cytube Function Overrides ============================
// Use this section for overriding cytube functions that are a fuck.

/*
Figure out a good way to override this some other time
function sendVideoUpdate() {
    return;
}
*/

/**
 * 
 * @param {string} message 
 * @returns 
 */
function highlightsMe(message) {
    const hilights = customObjects.hilightWords.filter(hl => hl && hl.length > 0);
    if (hilights.length == 0) {
        if (CLIENT.name) hilights.push(CLIENT.name);
        else return;
    }
    const regexStr = hilights.map(hl => hl.match(/^\w/) ? `\\b${hl}\\b` : `(?:^|\\s)${hl}\\b`).join('|');
    return message.match(new RegExp(regexStr, "gi"));
}

// Removes the code that tries to be clever and keep the chat in place when scrolled up
// Except it actually does that on its own and said code instead causes chat to move around
function addChatMessage(data) {
    if(IGNORED.indexOf(data.username) !== -1) {
        return;
    }
    if (data.meta.shadow && !USEROPTS.show_shadowchat) {
        return;
    }
    // This is so we discard repeated messages
    // which become annoying when the user is experiencing repeated socketio reconnects
    if (data.time < LASTCHAT.time) {
        return;
    } else {
        LASTCHAT.time = data.time;
    }

    var msgBuf = $("#messagebuffer");
    var div = formatChatMessage(data, LASTCHAT);
    // Incoming: a bunch of crap for the feature where if you hover over
    // a message, it highlights messages from that user
    var safeUsername = data.username.replace(/[^\w-]/g, '\\$');
    div.addClass("chat-msg-" + safeUsername);
    div.appendTo(msgBuf);
    div.on('mouseover', function() {
        $(".chat-msg-" + safeUsername).addClass("nick-hover");
    });
    div.on('mouseleave', function() {
        $(".nick-hover").removeClass("nick-hover");
    });

    /* OVERRIDE
    var oldHeight = msgBuf.prop("scrollHeight");
    var numRemoved = trimChatBuffer();
    */
    trimChatBuffer();
    if (SCROLLCHAT) {
        scrollChat();
    } else {
        var newMessageDiv = $("#newmessages-indicator");
        if (!newMessageDiv.length) {
            newMessageDiv = $("<div/>").attr("id", "newmessages-indicator")
                    .insertBefore($("#chatline"));
            var bgHack = $("<span/>").attr("id", "newmessages-indicator-bghack")
                    .appendTo(newMessageDiv);

            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            $("<span/>").text("New Messages Below").appendTo(bgHack);
            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            newMessageDiv.on('click', function () {
                SCROLLCHAT = true;
                scrollChat();
            });
        }

        /* OVERRIDE
        if (numRemoved > 0) {
            IGNORE_SCROLL_EVENT = true;
            var diff = oldHeight - msgBuf.prop("scrollHeight");
            scrollAndIgnoreEvent(msgBuf.scrollTop() - diff);
        }
        */
    }

    div.find("img").load(function () {
        if (SCROLLCHAT) {
            scrollChat();
        } /* OVERRIDE
        else if ($(this).position().top < 0) {
            scrollAndIgnoreEvent(msgBuf.scrollTop() + $(this).height());
        }*/
    });

    var isHighlight = false;
    if ((CLIENT.name || customObjects.hilightWords.length) && data.username !== CLIENT.name && !customObjects.ignorePingUsers.includes(data.username.toLowerCase())) {
        if (highlightsMe(data.msg)) {
            div.addClass("nick-highlight");
            isHighlight = true;
        }
    }

    pingMessage(isHighlight, data.username, $(div.children()[2]).text());
}
