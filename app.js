// ==========================================================================
// 중년기사 김봉식 룬 계산기 - 종합 로직 엔진 (인게임 데이터 완벽 지원)
// ==========================================================================

// 1. 등급 및 이름 상수
const RUNE_NAMES = ["암드", "바르", "코올라", "도토루", "엘메스", "팔콘", "제라드", "헬", "인테엘", "지아코"];
const GRADES = ["일반", "고급", "희귀", "유물", "영웅", "전설", "신화", "불멸"];

// 한국어 번역 딕셔너리 (인게임 코드 매핑용)
let optionTranslations = {};
let OPTION_TRANSLATIONS = {};

const OPTION_TRANSLATIONS_FALLBACK = {
    "t_ui_maches_option_01": "공격력  {#ffc929:%s} 증가",
    "t_ui_maches_option_02": "공격력 {#ffc929:%s} %% 증가",
    "t_ui_maches_option_03": "치명타 {#ffc929:%s}  %% 피해",
    "t_ui_maches_option_04": "퀘스트 골드 획득량 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_05": "환생시 열쇠 획득량 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_06": "서리감옥 공격력 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_07": "지하감옥 공격력 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_08": "뱃지 공격력 보너스 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_09": "크르르 공격력 {#ffc929:%s}  %% 증가",
    "t_ui_maches_option_10": "크르르 낙뢰 데미지 {#ffc929:%s}  %%증가",
    "t_ui_maches_option_11": "펫장비 보너스 공격력 {#ffc929:%s}  %%증가",
    "t_ui_maches_option_12": "보물 저금통 갯수당 공격력 {#ffc929:%s}  %%증가",
    "t_ui_maches_option_13": "힘의 반지 차수당 공격력 {#ffc929:%s} %%증가",
    "t_ui_maches_option_14": "보스 처치시 열쇠 획득량 {#ffc929:%s} %%증가",
    "t_ui_maches_option_15": "황금 수정 차수당 적처치 골드 {#ffc929:%s} %%증가",
    "t_ui_maches_option_16": "독수리상 차수당 퀘스트 골드 {#ffc929:%s} %%증가",
    "t_ui_maches_option_17": "획득한 정령 종류당 공격력 {#ffc929:%s} %%증가",
    "t_ui_maches_option_18": "획득한 정령 종류당 골드 획득량 {#ffc929:%s} %%증가",
    "t_ui_maches_option_19": "누리봉 위성 갯수당 공격력 {#ffc929:%s} %%증가",
    "t_ui_maches_option_20": "누리봉 위성 갯수당  골드 획득량 {#ffc929:%s} %%증가",
    "t_ui_maches_option_21": "일일 미션 클리어 갯수당  공격력 {#ffc929:%s} %%증가",
    "t_ui_maches_option_22": "일일 미션 클리어 갯수당 골드 획득량 {#ffc929:%s} %%증가",
    "t_ui_maches_option_23": "스킨 보유 갯수당 공격력 {#ffc929:%s} %%증가",
    "t_ui_maches_option_24": "스킨 보유 갯수당 골드 획득량 {#ffc929:%s} %%증가",
    "t_ui_maches_option_25": "스킨 보유 {#ffc929:%s}개 증가(최대 %s)",
    "t_ui_maches_option_26": "강화석 저장소 {#ffc929:%s}개 확장(최대 %s)",
    "t_ui_maches_option_27": "무기Lv + {#ffc929:%s} 증가 (최대 %s)",
    "t_ui_maches_option_28": "마하 돌파 사용 횟수 {#ffc929:%s}증가(최대 %s)",
    "t_ui_maches_option_29": "뚜더지 부대원 레벨 {#ffc929:%s}증가 (최대 %s)",
    "t_ui_maches_option_30": "마몬의 권능 스킬 {#ffc929:%s} 레벨 추가(최대 %s)"
};

const OPTION_EVALUATION = {
    "t_ui_maches_option_01": { status: "disrecommended", reason: "공격력 고정치 증가 옵션은 무기에 합산되며, 수치가 낮아 도움이 거의 되지 않습니다." },
    "t_ui_maches_option_06": { status: "disrecommended", reason: "서리감옥 공격력은 오직 서리감옥 내에서만 적용되고, 수치도 다른 공격력과 크게 차이 나지 않습니다." },
    "t_ui_maches_option_07": { status: "disrecommended", reason: "지하감옥 공격력은 오직 지하감옥 내에서만 적용되고, 수치도 다른 공격력과 크게 차이 나지 않습니다." },
    "t_ui_maches_option_14": { status: "disrecommended", reason: "보스 처치시 열쇠 획득량은 5/5 몬스터 처치시 고정 획득 열쇠(2/5/20개)만 늘려주고 뿌리링 열쇠는 늘려주지 않습니다." },
    "t_ui_maches_option_26": { status: "disrecommended", reason: "강화석 저장소 확장은 보석으로 충당하라고 있는 겁니다. 자리 없습니다." },
    "t_ui_maches_option_27": { status: "disrecommended", reason: "무기Lv 증가는 보통 코스튬의 훈장으로 커버치며, 레벨당 20% 합적용이기 때문에 효율이 너무 낮습니다." },
    "t_ui_maches_option_28": { status: "disrecommended", reason: "마하 돌파 사용 횟수는 스펙에는 도움이 안 됩니다. 잠깐 갈아 껴서 성냥 파밍 용도로는 괜찮습니다." },
    "t_ui_maches_option_29": { status: "disrecommended", reason: "뚜더지 부대원 레벨 증가는 수비대에 적용되긴 하나, 무기 레벨이 영향력이 더 높습니다. 룬에서 까지 쓸 옵션은 아닙니다." },

    "t_ui_maches_option_09": { status: "warning", reason: "크르르 공격력 증가는 크르르 위주 메타일 때만 쓸만합니다. 마몬 스킬 때문에 크르르 딜이 쓸모있을 확률이 매우 낮습니다. 전설 불꽃이 있으면 쓸모 없습니다." },
    "t_ui_maches_option_10": { status: "warning", reason: "크르르 낙뢰 공격력 증가는 크르르 위주 메타일 때만 쓸만합나다. 마몬 스킬 때문에 크르르 딜이 쓸모있을 확률이 매우 낮습니다. 전설 불꽃이 있으면 쓸모 없습니다." },
    "t_ui_maches_option_30": { status: "warning", reason: "마몬의 권능 스킬 레벨은 사실 매우 좋으나, 스킬이 있어야 쓸모 있습니다. 현재는 공격력이 1스킬로 레벨당 1.1배, 2스킬 보유시 레벨당 1.1배, 4스킬 보유시 레벨당 1.2배 적용됩니다." }
};

const SPEC_MAPPING = {
    "t_ui_maches_option_12": { key: "piggybanks", label: "보물 저금통", suffix: "개" },
    "t_ui_maches_option_13": { key: "ring", label: "힘의 반지", suffix: "차" },
    "t_ui_maches_option_15": { key: "crystal", label: "황금 수정", suffix: "차" },
    "t_ui_maches_option_16": { key: "eagle", label: "독수리상", suffix: "차" },
    "t_ui_maches_option_17": { key: "spirits", label: "정령 종류", suffix: "개" },
    "t_ui_maches_option_18": { key: "spirits", label: "정령 종류", suffix: "개" },
    "t_ui_maches_option_19": { key: "satellites", label: "누리봉 위성", suffix: "개" },
    "t_ui_maches_option_20": { key: "satellites", label: "누리봉 위성", suffix: "개" },
    "t_ui_maches_option_21": { key: "missions", label: "일일 미션", suffix: "개" },
    "t_ui_maches_option_22": { key: "missions", label: "일일 미션", suffix: "개" }
};

function initOptionTranslations(data) {
    optionTranslations = data;
    OPTION_TRANSLATIONS = {};
    for (let key in data) {
        OPTION_TRANSLATIONS[key] = getCleanOptionLabel(data[key]);
    }
}

function getCleanOptionLabel(template) {
    let clean = template.replace(/\{#[0-9a-fA-F]{6}:([^}]+)\}/g, '$1');
    clean = clean.replace(/%s/g, '');
    clean = clean.replace(/%%/g, '%');
    clean = clean.replace(/\s+/g, ' ').trim();
    clean = clean.replace(/\(최대\s*\)/g, '');
    return clean;
}

function renderOptionTextHtml(key, value, optMaxVal = null) {
    let template = optionTranslations[key] || OPTION_TRANSLATIONS_FALLBACK[key] || (key + " {#ffc929:%s}");
    let html = template.replace(/\{#([0-9a-fA-F]{6}):([^}]+)\}/g, '<span style="color:#$1">$2</span>');
    html = html.replace(/%%/g, '%');

    let formattedVal;
    if (typeof value === 'number') {
        formattedVal = formatGameNumber(value);
    } else {
        formattedVal = value;
    }

    let count = 0;
    html = html.replace(/%s/g, (match) => {
        count++;
        if (count === 1) {
            return formattedVal;
        } else if (count === 2 && optMaxVal !== null) {
            return formatGameNumber(optMaxVal);
        }
        return match;
    });

    return html;
}

// 초기 로딩
initOptionTranslations(OPTION_TRANSLATIONS_FALLBACK);

// 알파벳 숫자 표기법 유틸리티 (1000 = 1A, 1000000 = 1B ... 1000Z를 초과할 경우 AA, AB ... AZ, BA 순환 적용)
function getGameSuffix(tier) {
    if (tier <= 0) return "";
    let suffix = "";
    let temp = tier;
    while (temp > 0) {
        let modulo = (temp - 1) % 26;
        suffix = String.fromCharCode(65 + modulo) + suffix;
        temp = Math.floor((temp - 1) / 26);
    }
    return suffix;
}

function getTierFromSuffix(suffix) {
    if (!suffix) return 0;
    let tier = 0;
    for (let i = 0; i < suffix.length; i++) {
        let charCode = suffix.charCodeAt(i);
        if (charCode < 65 || charCode > 90) return 0;
        tier = tier * 26 + (charCode - 64);
    }
    return tier;
}

function formatGameNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    if (num === 0) return "0";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";

    const absNum = Math.abs(num);
    if (absNum < 1000) {
        return parseFloat(num.toFixed(2)).toString();
    }

    const tier = Math.floor(Math.log10(absNum) / 3);
    const scale = Math.pow(10, tier * 3);
    if (isFinite(scale) && scale > 0) {
        const unit = getGameSuffix(tier);
        const scaled = num / scale;
        return parseFloat(scaled.toFixed(2)) + unit;
    }

    return num.toExponential(2);
}

function formatRatio(ratio) {
    if (ratio === null || ratio === undefined || isNaN(ratio)) return "1";
    return formatGameNumber(ratio);
}

function parseGameNumber(str) {
    if (str === null || str === undefined) return 0;
    if (typeof str !== 'string') str = String(str);
    str = str.replace(/,/g, '').trim().toUpperCase();
    if (!str) return 0;

    if (str.endsWith("배")) {
        const numPartStr = str.slice(0, -1).trim();
        const multiplier = parseGameNumber(numPartStr);
        return (multiplier - 1) * 100;
    }

    if (str.endsWith("%")) {
        str = str.slice(0, -1).trim();
    }

    const match = str.match(/^([+-]?\d+(?:\.\d+)?)\s*([A-Z]*)$/);
    if (match) {
        const numPart = parseFloat(match[1]);
        const suffix = match[2];
        if (isNaN(numPart)) return 0;
        if (!suffix) return numPart;
        const tier = getTierFromSuffix(suffix);
        return numPart * Math.pow(10, tier * 3);
    }

    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
}



function isPercentOption(idx) {
    return idx >= 2 && idx <= 24;
}

function getFloorRangeText(level) {
    if (level <= 0) return "대응 등반 층수: 0 ~ 200층";
    const start = 200 * level + 1;
    const end = 200 * (level + 1);
    return `대응 등반 층수: ${start.toLocaleString()} ~ ${end.toLocaleString()}층`;
}

function getEffectiveValue(optKey, value, specValues) {
    const mapping = SPEC_MAPPING[optKey];
    if (mapping) {
        const factor = specValues[mapping.key] || 0;
        return value * factor;
    }
    return value;
}

function getUserSpecValues() {
    return {
        spirits: parseInt(document.getElementById('spec-spirits')?.value) || 0,
        satellites: parseInt(document.getElementById('spec-satellites')?.value) || 0,
        missions: parseInt(document.getElementById('spec-missions')?.value) || 0,
        skins: parseInt(document.getElementById('spec-skins')?.value) || 0,
        piggybanks: parseInt(document.getElementById('spec-piggybanks')?.value) || 0,
        ring: parseInt(document.getElementById('spec-ring')?.value) || 0,
        crystal: parseInt(document.getElementById('spec-crystal')?.value) || 0,
        eagle: parseInt(document.getElementById('spec-eagle')?.value) || 0
    };
}

function bindSpecEvents() {
    const specIds = [
        'spec-spirits', 'spec-satellites', 'spec-missions', 'spec-skins',
        'spec-piggybanks', 'spec-ring', 'spec-crystal', 'spec-eagle'
    ];
    specIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        // Load from localStorage
        const saved = localStorage.getItem(id);
        if (saved !== null) {
            el.value = saved;
        }
        // Save on input and recalculate
        el.addEventListener('input', () => {
            localStorage.setItem(id, el.value);
            triggerCalculation();
            updateBoardSummary();
        });
    });
}

function bindSpecHelpEvents() {
    const buttons = document.querySelectorAll('.btn-spec-help');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const helpId = btn.getAttribute('data-help');
            const descEl = document.getElementById(`help-${helpId}`);
            if (descEl) {
                const isHidden = descEl.style.display === 'none';
                descEl.style.display = isHidden ? 'block' : 'none';
                btn.classList.toggle('active', isHidden);
            }
            e.stopPropagation();
        });
    });
}

const SET_TRANSLATIONS = {
    "t_ui_maches_set_01": "교만",
    "t_ui_maches_set_02": "인색",
    "t_ui_maches_set_03": "질투",
    "t_ui_maches_set_04": "분노",
    "t_ui_maches_set_05": "음욕",
    "t_ui_maches_set_06": "탐욕",
    "t_ui_maches_set_07": "나태"
};

// 2. 가상 폴백 데이터 (인게임 파일이 없을 경우 작동 대비)
const FALLBACK_PROBS = `lv,slot_count,grade_rate_1,grade_rate_2,grade_rate_3,grade_rate_4,grade_rate_5,grade_rate_6,grade_rate_7,grade_rate_8,upgrade_cost,upgrade_cost_total,upgrade_time,version
1,2,92900,5000,2000,100,0,0,0,0,"{""idx"": 146, ""count"": 50}",0,10,1.0.0
2,2,85800,10000,4000,200,0,0,0,0,"{""idx"": 146, ""count"": 280}",50,60,1.0.0
3,2,78700,15000,6000,300,0,0,0,0,"{""idx"": 146, ""count"": 920}",330,180,1.0.0
4,3,71600,20000,8000,400,0,0,0,0,"{""idx"": 146, ""count"": 3310}",1250,600,1.0.0
5,3,64500,25000,10000,500,0,0,0,0,"{""idx"": 146, ""count"": 10700}",4560,1800,1.0.0
6,3,56900,30000,12500,600,0,0,0,0,"{""idx"": 146, ""count"": 23180}",15260,3600,1.0.0
7,4,49300,35000,15000,700,0,0,0,0,"{""idx"": 146, ""count"": 49930}",38440,7200,1.0.0
8,4,41700,40000,17500,800,0,0,0,0,"{""idx"": 146, ""count"": 80240}",88370,10800,1.0.0
9,4,34100,45000,20000,900,0,0,0,0,"{""idx"": 146, ""count"": 114110}",168610,14400,1.0.0
10,5,26480,50000,22500,1000,20,0,0,0,"{""idx"": 146, ""count"": 151800}",282720,18000,1.0.0
11,5,22960,50000,25000,2000,40,0,0,0,"{""idx"": 146, ""count"": 194210}",434520,21600,1.0.0
12,5,19440,50000,27500,3000,60,0,0,0,"{""idx"": 146, ""count"": 240700}",628730,25200,1.0.0
13,6,15920,50000,30000,4000,80,0,0,0,"{""idx"": 146, ""count"": 291100}",869430,28800,1.0.0
14,6,12400,50000,32500,5000,100,0,0,0,"{""idx"": 146, ""count"": 384000}",1160530,36000,1.0.0
15,6,8880,50000,35000,6000,120,0,0,0,"{""idx"": 146, ""count"": 484900}",1544530,43200,1.0.0
16,7,0,55360,37500,7000,140,0,0,0,"{""idx"": 146, ""count"": 517700}",2029430,43200,1.0.0
17,7,0,54340,37500,8000,160,0,0,0,"{""idx"": 146, ""count"": 528000}",2547130,43200,1.0.0
18,7,0,53300,37500,9000,200,0,0,0,"{""idx"": 146, ""count"": 808300}",3075130,64800,1.0.0
19,8,0,49700,40000,10000,300,0,0,0,"{""idx"": 146, ""count"": 839400}",3883430,64800,1.0.0
20,8,0,48600,40000,11000,400,0,0,0,"{""idx"": 146, ""count"": 858300}",4722830,64800,1.0.0
21,8,0,47500,40000,12000,500,0,0,0,"{""idx"": 146, ""count"": 1169700}",5581130,86400,1.0.0
22,9,0,47400,38000,14000,600,0,0,0,"{""idx"": 146, ""count"": 1201400}",6750830,86400,1.0.0
23,9,0,45300,38000,16000,700,0,0,0,"{""idx"": 146, ""count"": 1246200}",7952230,86400,1.0.0
24,9,0,43200,38000,18000,800,0,0,0,"{""idx"": 146, ""count"": 1290900}",9198430,86400,1.0.0
25,9,0,39100,40000,20000,900,0,0,0,"{""idx"": 2697000}",10489330,172800,1.0.0
26,10,0,34990,42000,22000,1000,10,0,0,"{""idx"": 146, ""count"": 1407100}",13186330,345600,1.0.0
27,10,0,29980,44000,24000,2000,20,0,0,"{""idx"": 146, ""count"": 9108900}",14593430,518400,1.0.0
28,10,0,24970,46000,26000,3000,30,0,0,"{""idx"": 146, ""count"": 13033700}",23702330,691200,1.0.0
29,10,0,19960,48000,28000,4000,40,0,0,"{""idx"": 146, ""count"": 17402700}",36736030,864000,1.0.0
30,10,0,14950,50000,30000,5000,50,0,0,"{""idx"": 146, ""count"": 22216100}",54138730,1036800,1.0.0
31,10,0,0,61890,32000,6000,100,10,0,"{""idx"": 146, ""count"": 24384000}",76354830,1036800,1.0.0
32,10,0,0,58860,34000,7000,120,20,0,"{""idx"": 146, ""count"": 29585700}",100738830,1209600,1.0.0
33,10,0,0,55830,36000,8000,140,30,0,"{""idx"": 146, ""count"": 35112300}",130324530,1382400,1.0.0
34,10,0,0,52800,38000,9000,160,40,0,"{""idx"": 146, ""count"": 40964000}",165436830,1555200,1.0.0
35,10,0,0,49770,40000,10000,180,50,0,"{""idx"": 146, ""count"": 47140800}",206400830,1728000,1.0.0
36,10,0,0,41645,46000,12000,250,100,5,"{""idx"": 146, ""count"": 61358900}",253541630,2073600,1.0.0
37,10,0,0,38470,47000,14000,400,120,10,"{""idx"": 146, ""count"": 75395600}",314900530,2419200,1.0.0
38,10,0,0,35295,48000,16000,550,140,15,"{""idx"": 146, ""count"": 90521000}",390296130,2764800,1.0.0
39,10,0,0,32120,49000,18000,700,160,20,"{""idx"": 146, ""count"": 106735000}",480817130,3110400,1.0.0
40,10,0,0,28945,50000,20000,850,180,25,"{""idx"": 146, ""count"": 0}",587552130,0,1.0.0`;

const FALLBACK_OPTIONS = `idx,name_key,min,max,grade_value_1,grade_value_2,grade_value_3,grade_value_4,grade_value_5,grade_value_6,grade_value_7,grade_value_8,floor_value,accumulate_max,rate,version
1,t_ui_maches_option_01,100,10000,1000.0,3500.0,14000.0,63000.0,315000.0,2520000.0,25200000.0,252000000.0,0.1,0,5000,1.0.0
2,t_ui_maches_option_02,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
3,t_ui_maches_option_03,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
4,t_ui_maches_option_04,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,5000,1.0.0
5,t_ui_maches_option_05,100,1000,0.001,0.01,0.04,0.18,0.9,3.6,21.6,129.6,0.0002,0,3000,1.0.0
6,t_ui_maches_option_06,100,1000,0.4,1.4,5.6,25.2,126.0,1008.0,10080.0,100800.0,0.005,0,3000,1.0.0
7,t_ui_maches_option_07,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
8,t_ui_maches_option_08,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
9,t_ui_maches_option_09,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
10,t_ui_maches_option_10,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
11,t_ui_maches_option_11,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.005,0,3000,1.0.0
12,t_ui_maches_option_12,100,1000,0.01,0.04,0.16,0.72,3.6,28.8,288.0,2880.0,0.001,0,3000,1.0.0
13,t_ui_maches_option_13,100,1000,0.01,0.04,0.16,0.72,3.6,28.8,288.0,2880.0,0.001,0,3000,1.0.0
14,t_ui_maches_option_14,100,1000,0.001,0.01,0.04,0.18,0.9,3.6,21.6,129.6,0.0002,0,3000,1.0.0
15,t_ui_maches_option_15,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.001,0,3000,1.0.0
16,t_ui_maches_option_16,100,1000,0.1,0.35,1.4,6.3,31.5,252.0,2520.0,25200.0,0.001,0,3000,1.0.0
17,t_ui_maches_option_17,100,1000,0.01,0.04,0.16,0.72,3.6,28.8,288.0,2880.0,0.001,0,3000,1.0.0
18,t_ui_maches_option_18,100,1000,0.01,0.04,0.16,0.72,3.6,28.8,288.0,2880.0,0.001,0,3000,1.0.0
19,t_ui_maches_option_19,100,1000,0.05,0.18,0.72,3.24,16.2,129.6,1296.0,12960.0,0.001,0,3000,1.0.0
20,t_ui_maches_option_20,100,1000,0.05,0.18,0.72,3.24,16.2,129.6,1296.0,12960.0,0.001,0,3000,1.0.0
21,t_ui_maches_option_21,100,1000,0.05,0.18,0.72,3.24,16.2,129.6,1296.0,12960.0,0.001,0,3000,1.0.0
22,t_ui_maches_option_22,100,1000,0.05,0.18,0.72,3.24,16.2,129.6,1296.0,12960.0,0.001,0,3000,1.0.0
23,t_ui_maches_option_23,100,1000,0.002,0.01,0.04,0.18,0.9,7.2,72.0,720.0,0.001,0,3000,1.0.0
24,t_ui_maches_option_24,100,1000,0.002,0.01,0.04,0.18,0.9,7.2,72.0,720.0,0.001,0,3000,1.0.0
25,t_ui_maches_option_25,1,1,1.0,1.0,1.0,1.0,2.0,3.0,4.0,5.0,0.0,30,3000,1.0.0
26,t_ui_maches_option_26,10,100,0.01,0.02,0.05,0.1,0.2,0.3,0.5,1.0,0.0,10000,5000,1.0.0
27,t_ui_maches_option_27,1,2,1.0,2.0,4.0,8.0,16.0,32.0,64.0,128.0,0.0,1000,5000,1.0.0
28,t_ui_maches_option_28,1,1,1.0,1.0,1.0,1.0,2.0,3.0,4.0,5.0,0.0,10,5000,1.0.0
29,t_ui_maches_option_29,1,1,1.0,2.0,3.0,4.0,5.0,6.0,8.0,10.0,0.0,100,3000,1.0.0
30,t_ui_maches_option_30,1,5,1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,0.0,100,3000,1.0.0`;

const FALLBACK_SETS = `idx,name_key,option_active_count_1,option_number_1,option_value_1,option_active_count_2,option_number_2,option_value_2,option_active_count_3,option_number_3,option_value_3
1,t_ui_maches_set_01,3,2,666,7,3,660000,10,2,999999999
2,t_ui_maches_set_02,3,4,666,7,20,660000,10,22,99999999
3,t_ui_maches_set_03,3,9,666,7,10,660000,10,11,999999999
4,t_ui_maches_set_04,3,25,3,7,21,66000,10,3,999999999
5,t_ui_maches_set_05,3,3,666,7,17,25000,10,23,9999999
6,t_ui_maches_set_06,3,8,666,7,19,77000,10,12,99999999
7,t_ui_maches_set_07,3,5,666,7,5,666666,10,5,66666666666`;

// 파싱 데이터 저장소
let summonProbs = [];
let optionsData = [];
let setEffects = [];

// 10슬롯 보드 상태 (인덱스 0~9, 10개 포지션에 대응)
let boardSockets = [];

// 3. 내장 CSV 파서 (정확하게 셀 내용 파싱)
function parseCSV(text) {
    let lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        let next = text[i + 1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') i++;
            lines.push(row);
            row = [""];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') {
        lines.push(row);
    }
    // 공백 행 및 ORIGINAL_FILENAME 등 메타데이터 헤더 행 제거
    return lines.filter(line => line.length > 0 && line[0].trim() !== "" && !line[0].startsWith("ORIGINAL_FILENAME:"));
}

// 4. 데이터 로드 및 파싱 가공
function processSummonProbs(text) {
    const parsed = parseCSV(text);
    const headers = parsed[0].map(h => h.trim().toLowerCase());

    summonProbs = parsed.slice(1).map(row => {
        let obj = {};
        row.forEach((val, idx) => {
            let key = headers[idx];
            if (!key) return;
            if (key === "lv" || key === "소환레벨") {
                obj.level = parseInt(val) || 1;
            } else if (key === "slot_count" || key === "슬롯수") {
                obj.slot_count = parseInt(val) || 2;
            } else if (key === "upgrade_cost" || key === "강화비용") {
                obj.upgrade_cost = val;
            } else if (key === "upgrade_time" || key === "강화시간") {
                obj.upgrade_time = parseInt(val) || 0;
            } else if (key.startsWith("grade_rate_") || key === "일반" || key === "고급" || key === "희귀" || key === "유물" || key === "영웅" || key === "전설" || key === "신화" || key === "불멸") {
                // 등급 비율 매핑
                obj[key] = parseFloat(val) || 0;
            }
        });
        return obj;
    });

    // 만약 등장가능룬 배열이 없으면 포지션 슬롯 수에 비례해 자동 계산하도록 조치
    summonProbs.forEach(s => {
        if (!s.slot_count) {
            // 구 커스텀 포맷 대조
            const rowMatch = parsed.find(r => (parseInt(r[0]) || 1) === s.level);
            if (rowMatch && rowMatch[1]) {
                s.runes = rowMatch[1].replace(/"/g, '').split(',').map(r => r.trim());
                s.slot_count = s.runes.length;
            }
        }
        if (!s.runes) {
            s.runes = RUNE_NAMES.slice(0, s.slot_count || 10);
        }
    });
}

function processOptions(text) {
    const parsed = parseCSV(text);
    const headers = parsed[0].map(h => h.trim().toLowerCase());

    optionsData = parsed.slice(1).map(row => {
        let obj = {};
        row.forEach((val, idx) => {
            let key = headers[idx];
            if (!key) return;
            if (key === "idx" || key === "옵션idx") {
                obj.idx = parseInt(val);
            } else if (key === "name_key" || key === "옵션명") {
                obj.name_key = val.trim();
            } else if (key === "min" || key === "기본최소값") {
                obj.min = parseFloat(val) || 0;
            } else if (key === "max" || key === "기본최대값") {
                obj.max = parseFloat(val) || 0;
            } else if (key === "floor_value" || key === "레벨당최소값" || key === "레벨당최대값") {
                obj.floor_value = parseFloat(val) || 0;
            } else if (key === "accumulate_max" || key === "최대누적값") {
                obj.accumulate_max = parseFloat(val) || 0;
            } else if (key === "rate" || key === "출현확률") {
                obj.rate = parseFloat(val) || 0;
            } else if (key.startsWith("grade_value_") || key === "등급") {
                obj[key] = parseFloat(val) || 0;
            }
        });
        return obj;
    });

    // 구 커스텀 포맷인 경우 호환성 바인딩
    optionsData.forEach(opt => {
        if (!opt.name_key && opt.옵션명) opt.name_key = opt.옵션명;
        // 구 포맷은 grade에 직접 수치 범위를 매핑했으므로 grade_value 매핑
        if (!opt.idx) {
            opt.idx = getOptionIdxByName(opt.name_key);
        }
    });
}

function processSets(text) {
    const parsed = parseCSV(text);
    const headers = parsed[0].map(h => h.trim().toLowerCase());

    setEffects = parsed.slice(1).map(row => {
        let obj = {};
        row.forEach((val, idx) => {
            let key = headers[idx];
            if (!key) return;
            if (key === "idx") {
                obj.idx = parseInt(val) || 1;
            } else if (key === "name_key" || key === "세트명") {
                obj.name_key = val.trim();
            } else if (key.startsWith("option_active_count_") || key === "필요수량") {
                obj[key] = parseInt(val) || 0;
            } else if (key.startsWith("option_number_") || key === "효과옵션") {
                obj[key] = isNaN(val) ? val.trim() : parseInt(val);
            } else if (key.startsWith("option_value_") || key === "효과값") {
                obj[key] = parseFloat(val) || 0;
            }
        });
        return obj;
    });
}

function getOptionIdxByName(name) {
    for (let key in OPTION_TRANSLATIONS) {
        if (OPTION_TRANSLATIONS[key] === name) {
            const num = parseInt(key.replace("t_ui_maches_option_", ""));
            return num;
        }
    }
    return 1;
}

// 5. 초기 데이터 로드 (인게임 데이터 우선 확인)
async function initData() {
    // 0) 옵션 번역 테이블 로드
    try {
        let res = await fetch('option_translations.json');
        if (res.ok) {
            let data = await res.json();
            initOptionTranslations(data);
        }
    } catch (e) {
        console.warn("option_translations.json 로드 실패, 폴백 사용", e);
    }

    // 1) 소환 테이블 로드
    try {
        let res = await fetch('info_matches_gatcha_lv.csv');
        if (!res.ok) throw new Error();
        let text = await res.text();
        processSummonProbs(text);
    } catch {
        try {
            let res = await fetch('summon_probs.csv');
            if (!res.ok) throw new Error();
            let text = await res.text();
            processSummonProbs(text);
        } catch {
            processSummonProbs(FALLBACK_PROBS);
        }
    }

    // 2) 옵션 테이블 로드
    try {
        let res = await fetch('info_matches_gatcha_option.csv');
        if (!res.ok) throw new Error();
        let text = await res.text();
        processOptions(text);
    } catch {
        try {
            let res = await fetch('options.csv');
            if (!res.ok) throw new Error();
            let text = await res.text();
            processOptions(text);
        } catch {
            processOptions(FALLBACK_OPTIONS);
        }
    }

    // 3) 세트 테이블 로드
    try {
        let res = await fetch('info_matches_gatcha_set.csv');
        if (!res.ok) throw new Error();
        let text = await res.text();
        processSets(text);
    } catch {
        try {
            let res = await fetch('set_effects.csv');
            if (!res.ok) throw new Error();
            let text = await res.text();
            processSets(text);
        } catch {
            processSets(FALLBACK_SETS);
        }
    }

    // 보드 상태 초기화 (10개 비어있는 룬 슬롯 생성)
    initBoardState();

    // UI 빌드
    setupUI();
}

function initBoardState() {
    const saved = localStorage.getItem('maf_rune_board_sockets');
    if (saved) {
        try {
            boardSockets = JSON.parse(saved);
            return;
        } catch (e) {
            console.error("Failed to parse saved board sockets", e);
        }
    }
    boardSockets = [];
    for (let i = 0; i < 10; i++) {
        boardSockets.push({
            equipped: false,
            runeName: RUNE_NAMES[i],
            grade: "전설",
            level: 10,
            setName: "",
            options: [],
            optionValues: []
        });
    }
}

function saveCompareState() {
    const getCompareState = (prefix) => {
        const grade = document.getElementById(`rune-${prefix}-grade`)?.value || "일반";
        const level = document.getElementById(`rune-${prefix}-level`)?.value || "0";
        const setName = document.getElementById(`rune-${prefix}-set`)?.value || "";

        const optionSelectors = document.querySelectorAll(`#rune-${prefix}-options-list .option-selector`);
        const options = Array.from(optionSelectors).map(s => s.value);

        const valInputs = document.querySelectorAll(`#rune-${prefix}-options-list .option-value-input`);
        const optionValues = Array.from(valInputs).map(input => input.value);

        return { grade, level, setName, options, optionValues };
    };
    localStorage.setItem('maf_rune_compare_a', JSON.stringify(getCompareState('a')));
    localStorage.setItem('maf_rune_compare_b', JSON.stringify(getCompareState('b')));
}

function updateSummonAppliedLevelLabel() {
    const highestFloor = parseInt(document.getElementById('summon-opt-level')?.value) || 2001;
    const optLevel = Math.max(0, Math.floor((highestFloor - 1) / 200));
    const label = document.getElementById('summon-applied-level-label');
    if (label) {
        label.innerText = `(적용: ${optLevel} Lv)`;
    }
}

// 6. UI 설정 및 바인딩
function setupUI() {
    // 세트 선택기 채우기
    populateSetSelects();

    // 소환 레벨 채우기 (1~40)
    const levelSelect = document.getElementById('summon-level-select');
    if (levelSelect) {
        levelSelect.innerHTML = '';
        for (let lv = 1; lv <= 40; lv++) {
            const opt = document.createElement('option');
            opt.value = lv;
            opt.innerText = `Lv. ${lv}`;
            levelSelect.appendChild(opt);
        }
    }

    // 룬 비교 이벤트 바인딩
    bindCompareEvents('a');
    bindCompareEvents('b');

    // 룬 보드 이벤트 바인딩
    renderBoardSockets();
    bindBoardEvents();

    // 소환 시뮬레이터 이벤트 바인딩
    const runSummonBtn = document.getElementById('run-summon-btn');
    if (runSummonBtn) runSummonBtn.addEventListener('click', runSummonSimulation);

    const summonLvlSelect = document.getElementById('summon-level-select');
    if (summonLvlSelect) summonLvlSelect.addEventListener('change', updateSummonLevelInfo);

    const summonCntSelect = document.getElementById('summon-count-select');
    if (summonCntSelect) {
        summonCntSelect.addEventListener('change', () => {
            const savedSummon = localStorage.getItem('maf_rune_summon_state');
            let parsed = {};
            if (savedSummon) {
                try { parsed = JSON.parse(savedSummon); } catch (e) { }
            }
            parsed.count = parseInt(summonCntSelect.value);
            localStorage.setItem('maf_rune_summon_state', JSON.stringify(parsed));
        });
    }
    if (summonLvlSelect) {
        summonLvlSelect.addEventListener('change', () => {
            const savedSummon = localStorage.getItem('maf_rune_summon_state');
            let parsed = {};
            if (savedSummon) {
                try { parsed = JSON.parse(savedSummon); } catch (e) { }
            }
            parsed.level = parseInt(summonLvlSelect.value);
            localStorage.setItem('maf_rune_summon_state', JSON.stringify(parsed));
        });
    }

    // 탭 전환 바인딩
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'board-tab') {
                updateBoardSummary();
            }
        });
    });

    // 유저 스펙 설정 이벤트 바인딩
    bindSpecEvents();
    bindSpecHelpEvents();

    // 로컬 스토리지 데이터 로드 및 적용
    const savedA = localStorage.getItem('maf_rune_compare_a');
    const savedB = localStorage.getItem('maf_rune_compare_b');
    let parsedA = null;
    let parsedB = null;
    if (savedA) {
        try { parsedA = JSON.parse(savedA); } catch (e) { }
    }
    if (savedB) {
        try { parsedB = JSON.parse(savedB); } catch (e) { }
    }

    if (parsedA) {
        const gradeEl = document.getElementById('rune-a-grade');
        if (gradeEl) gradeEl.value = parsedA.grade;
        const levelEl = document.getElementById('rune-a-level');
        if (levelEl) levelEl.value = parsedA.level;
        updateFloorLevelDisplay('a');
    }
    if (parsedB) {
        const gradeEl = document.getElementById('rune-b-grade');
        if (gradeEl) gradeEl.value = parsedB.grade;
        const levelEl = document.getElementById('rune-b-level');
        if (levelEl) levelEl.value = parsedB.level;
        updateFloorLevelDisplay('b');
    }

    // 초기 상태 렌더링
    updateRuneOptionsForm('a', parsedA);
    updateRuneOptionsForm('b', parsedB);
    triggerCalculation();

    // 소환 필터 상태 복원 및 이벤트 바인딩 (savedSummon 복원 전에 처리하여 오버라이트 방지)
    const incKeysEl = document.getElementById('summon-include-keys');
    const onlySetsEl = document.getElementById('summon-only-sets');
    const optLevelEl = document.getElementById('summon-opt-level');

    if (incKeysEl) {
        const saved = localStorage.getItem('maf_rune_summon_include_keys');
        if (saved !== null) incKeysEl.checked = saved === 'true';
        incKeysEl.addEventListener('change', filterAndRenderSummonResults);
    }
    if (onlySetsEl) {
        const saved = localStorage.getItem('maf_rune_summon_only_sets');
        if (saved !== null) onlySetsEl.checked = saved === 'true';
        onlySetsEl.addEventListener('change', filterAndRenderSummonResults);
    }
    if (optLevelEl) {
        const saved = localStorage.getItem('maf_rune_summon_opt_level');
        if (saved !== null) {
            let num = parseInt(saved) || 2001;
            if (num <= 100) {
                num = num * 200 + 1; // convert old level to equivalent floor
            }
            optLevelEl.value = num;
        }
        optLevelEl.addEventListener('input', () => {
            localStorage.setItem('maf_rune_summon_opt_level', optLevelEl.value);
            updateSummonAppliedLevelLabel();
            filterAndRenderSummonResults();
        });
        updateSummonAppliedLevelLabel();
    }

    // 소환 시뮬레이터 상태 복원 (소환 레벨 및 횟수 설정 값만 복원하여 처음 진입 시에는 빈 결과창을 유지하도록 함)
    const savedSummon = localStorage.getItem('maf_rune_summon_state');
    if (savedSummon) {
        try {
            const parsed = JSON.parse(savedSummon);
            if (parsed) {
                if (parsed.level) document.getElementById('summon-level-select').value = parsed.level;
                if (parsed.count) document.getElementById('summon-count-select').value = parsed.count;
            }
        } catch (e) {
            console.error("Failed to parse saved summon state", e);
        }
    }

    updateSummonLevelInfo();

    // 룬 보드 정보 최초 업데이트
    updateBoardSummary();
}

function populateRuneSelects() {
    ['rune-a-name', 'rune-b-name'].forEach((id, defaultIdx) => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '';
        RUNE_NAMES.forEach((name, index) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.innerText = `${index + 1}번 룬: ${name}`;
            if (index === defaultIdx) opt.selected = true;
            select.appendChild(opt);
        });
    });
}

function populateSetSelects() {
    ['rune-a-set', 'rune-b-set', 'editor-set'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">없음</option>';
        setEffects.forEach(set => {
            // 중복 방지 체크하면서 추가
            const exists = Array.from(select.options).some(o => o.value === set.name_key);
            if (!exists && set.name_key) {
                const opt = document.createElement('option');
                opt.value = set.name_key;
                opt.innerText = SET_TRANSLATIONS[set.name_key] || set.name_key;
                select.appendChild(opt);
            }
        });
    });
}



// 7. 룬 비교기 조작 바인딩
function bindCompareEvents(prefix) {
    const ids = [`rune-${prefix}-grade`, `rune-${prefix}-level`, `rune-${prefix}-set`];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            if (id.includes('grade')) {
                const optionSelectors = document.querySelectorAll(`#rune-${prefix}-options-list .option-selector`);
                const options = Array.from(optionSelectors).map(s => s.value);
                const valInputs = document.querySelectorAll(`#rune-${prefix}-options-list .option-value-input`);
                const optionValues = Array.from(valInputs).map(input => input.value);
                const setName = document.getElementById(`rune-${prefix}-set`)?.value || "";

                const savedState = { options, optionValues, setName };
                updateRuneOptionsForm(prefix, savedState);
            }
            if (id.includes('level')) {
                updateFloorLevelDisplay(prefix);
                updateRuneOptionsRangeDisplay(prefix);
            }
            triggerCalculation();
        });
    });

    // 레벨 타이핑 즉시 계산
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    if (levelEl) {
        levelEl.addEventListener('input', () => {
            updateFloorLevelDisplay(prefix);
            updateRuneOptionsRangeDisplay(prefix);
            triggerCalculation();
        });
    }
}

function updateFloorLevelDisplay(prefix) {
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    const level = levelEl ? (parseInt(levelEl.value) || 0) : 0;
    const calcEl = document.getElementById(`rune-${prefix}-floor-calc`);
    if (calcEl) calcEl.innerText = getFloorRangeText(level);
}

// 각 옵션의 범위(Min~Max) 표시 업데이트
function updateRuneOptionsRangeDisplay(prefix) {
    const gradeEl = document.getElementById(`rune-${prefix}-grade`);
    const grade = gradeEl ? gradeEl.value : "일반";
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    const level = levelEl ? (parseInt(levelEl.value) || 0) : 0;

    const optionSelectors = document.querySelectorAll(`#rune-${prefix}-options-list .option-selector`);
    optionSelectors.forEach((sel, idx) => {
        const optName = sel.value;
        const rangeTextEl = document.getElementById(`rune-${prefix}-opt-range-${idx + 1}`);
        if (!optName) {
            if (rangeTextEl) rangeTextEl.innerText = "";
            return;
        }
        const range = calculateOptionValueRange(grade, level, optName);
        if (rangeTextEl) {
            rangeTextEl.innerText = `범위: ${formatStatValue(range.idx, range.min)} ~ ${formatStatValue(range.idx, range.max)}`;
        }
    });
}

// 등급별 룬 옵션 셀렉터 동적 조절
function updateRuneOptionsForm(prefix, savedState = null) {
    const gradeEl = document.getElementById(`rune-${prefix}-grade`);
    const grade = gradeEl ? gradeEl.value : "일반";
    const container = document.getElementById(`rune-${prefix}-options-list`);
    const setGroup = document.getElementById(`rune-${prefix}-set-group`);
    if (!container) return;

    if (savedState && savedState.setName !== undefined) {
        const setSelect = document.getElementById(`rune-${prefix}-set`);
        if (setSelect) setSelect.value = savedState.setName;
    }

    // 세트 표기 여부 (간편 비교에서는 사용 안 함)
    if (setGroup) setGroup.style.display = 'none';
    const selectSet = document.getElementById(`rune-${prefix}-set`);
    if (selectSet) selectSet.value = "";

    // 옵션 개수 (비교기에서는 항상 3줄의 옵션을 제공하며, 사용자가 '옵션 없음'을 선택할 수 있도록 함)
    let optionCount = 3;

    container.innerHTML = '';
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    const level = levelEl ? (parseInt(levelEl.value) || 0) : 0;

    for (let i = 1; i <= optionCount; i++) {
        const row = document.createElement('div');
        row.className = 'option-row';

        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justify = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.width = '100%';
        headerDiv.innerHTML = `
            <span>옵션 ${i}</span>
            <span class="option-range-display" id="rune-${prefix}-opt-range-${i}" style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 600; display: none;">범위: 계산 중...</span>
        `;

        const ctrlRow = document.createElement('div');
        ctrlRow.style.display = 'flex';
        ctrlRow.style.flexDirection = 'column';
        ctrlRow.style.gap = '0.35rem';
        ctrlRow.style.width = '100%';
        ctrlRow.style.marginTop = '0.25rem';

        const select = document.createElement('select');
        select.id = `rune-${prefix}-opt-${i}`;
        select.className = 'select-control option-selector';

        // '옵션 없음' 추가
        const noneOpt = document.createElement('option');
        noneOpt.value = "";
        noneOpt.innerText = "옵션 없음";
        select.appendChild(noneOpt);

        optionsData.forEach((opt, idx) => {
            const exists = Array.from(select.options).some(o => o.value === opt.name_key);
            if (!exists && opt.name_key) {
                const o = document.createElement('option');
                o.value = opt.name_key;
                o.innerText = OPTION_TRANSLATIONS[opt.name_key] || opt.name_key;
                select.appendChild(o);
            }
        });

        if (savedState && savedState.options && savedState.options[i - 1] !== undefined) {
            select.value = savedState.options[i - 1];
        } else {
            select.selectedIndex = i % select.options.length;
        }

        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.id = `rune-${prefix}-opt-val-${i}`;
        valInput.className = 'number-control option-value-input';
        valInput.placeholder = '수치 (예: 15A)';

        const updateInputState = () => {
            if (select.value === "") {
                valInput.value = "0";
                valInput.disabled = true;
                valInput.style.opacity = "0.5";
            } else {
                valInput.disabled = false;
                valInput.style.opacity = "1";
            }
        };

        if (savedState && savedState.optionValues && savedState.optionValues[i - 1] !== undefined) {
            valInput.value = savedState.optionValues[i - 1];
        } else {
            valInput.value = "0";
        }

        updateInputState();

        ctrlRow.appendChild(select);
        ctrlRow.appendChild(valInput);

        row.appendChild(headerDiv);
        row.appendChild(ctrlRow);
        container.appendChild(row);

        select.addEventListener('change', () => {
            updateRuneOptionsRangeDisplay(prefix);
            updateInputState();
            triggerCalculation();
        });

        valInput.addEventListener('input', triggerCalculation);
    }

    updateRuneOptionsRangeDisplay(prefix);
}

// 8. 룬 기대치 수학 공식 연산 엔진
function getRuneConfig(prefix) {
    const name = "";
    const gradeEl = document.getElementById(`rune-${prefix}-grade`);
    const grade = gradeEl ? gradeEl.value : "일반";
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    const level = levelEl ? (parseInt(levelEl.value) || 0) : 0;
    const setEl = document.getElementById(`rune-${prefix}-set`);
    const setName = setEl ? setEl.value : "";

    const optionSelectors = document.querySelectorAll(`#rune-${prefix}-options-list .option-selector`);
    const options = Array.from(optionSelectors).map(s => s.value);

    const valInputs = document.querySelectorAll(`#rune-${prefix}-options-list .option-value-input`);
    const optionValues = Array.from(valInputs).map(input => parseGameNumber(input.value));

    return { name, grade, level, setName, options, optionValues };
}

// 룬 수치 Min-Max 계산 수식 실행
function calculateOptionValueRange(grade, level, nameKey) {
    const match = optionsData.find(o => o.name_key === nameKey);
    if (!match) return { min: 0, max: 0, idx: 0 };

    const gradeIdx = GRADES.indexOf(grade) + 1; // 1~8
    const baseValue = match[`grade_value_${gradeIdx}`] || 0;

    // 층수 보정 (옵션레벨) 스케일 팩터
    const scaleFactor = 1 + (level * (match.floor_value || 0));

    // 공식: 수치 = 랜덤값(min~max) * grade_value * (1 + level * floor_value)
    const finalMin = match.min * baseValue * scaleFactor;
    const finalMax = match.max * baseValue * scaleFactor;

    return {
        min: finalMin,
        max: finalMax,
        idx: match.idx
    };
}

// 단일 룬 스탯 맵 누적 산출 (입력값 포함)
function getRuneInputStats(rune) {
    const stats = {}; // { optionKey: { value, min, max, idx } }
    rune.options.forEach((optName, idx) => {
        if (!optName) return;
        const range = calculateOptionValueRange(rune.grade, rune.level, optName);

        let inputVal = rune.optionValues[idx];
        if (isNaN(inputVal) || inputVal === null || inputVal === undefined) {
            inputVal = (range.min + range.max) / 2;
        }

        if (!stats[optName]) {
            stats[optName] = { value: 0, min: 0, max: 0, idx: range.idx };
        }
        stats[optName].value += inputVal;
        stats[optName].min += range.min;
        stats[optName].max += range.max;
    });

    // Clamp flat options 25-30 to their accumulate_max
    for (let optName in stats) {
        const matchOpt = optionsData.find(o => o.name_key === optName);
        if (matchOpt && matchOpt.accumulate_max > 0) {
            stats[optName].value = Math.min(stats[optName].value, matchOpt.accumulate_max);
            stats[optName].min = Math.min(stats[optName].min, matchOpt.accumulate_max);
            stats[optName].max = Math.min(stats[optName].max, matchOpt.accumulate_max);
        }
    }

    return stats;
}

// 실시간 수치 시각적 비교 갱신
function triggerCalculation() {
    const runeA = getRuneConfig('a');
    const runeB = getRuneConfig('b');

    const statsA = getRuneInputStats(runeA);
    const statsB = getRuneInputStats(runeB);

    renderComparisonUI(statsA, statsB, runeA, runeB);
    saveCompareState();
}

const ATTACK_OPTIONS = [
    "t_ui_maches_option_02", "t_ui_maches_option_03", "t_ui_maches_option_08",
    "t_ui_maches_option_09", "t_ui_maches_option_10", "t_ui_maches_option_11",
    "t_ui_maches_option_12", "t_ui_maches_option_13", "t_ui_maches_option_17",
    "t_ui_maches_option_19", "t_ui_maches_option_21", "t_ui_maches_option_23",
    "t_ui_maches_option_30"
];

const GOLD_OPTIONS = [
    "t_ui_maches_option_04", "t_ui_maches_option_15", "t_ui_maches_option_16",
    "t_ui_maches_option_18", "t_ui_maches_option_20", "t_ui_maches_option_22",
    "t_ui_maches_option_24"
];

const KEY_OPTIONS = [
    "t_ui_maches_option_05"
];

function calculateCategoryMultiplierForSockets(sockets, spec, keys) {
    let multiplier = 1.0;

    // 1) Calculate per-rune aggregated options (additive within a single rune)
    const runeAggregated = sockets.map(socket => {
        if (!socket.equipped) return null;
        const stats = {};
        socket.options.forEach((optName, idx) => {
            if (!optName) return;
            const range = calculateOptionValueRange(socket.grade, socket.level, optName);
            let val = socket.optionValues[idx];
            if (val === undefined || isNaN(val) || val === null) {
                val = (range.min + range.max) / 2;
            }
            if (!stats[optName]) {
                stats[optName] = 0;
            }
            stats[optName] += val;
        });
        return stats;
    }).filter(s => s !== null);

    // Calculate set counts first to find Option 25/30 set effects
    const setCounts = {};
    sockets.forEach(socket => {
        if (socket.equipped && (socket.grade === "전설" || socket.grade === "신화" || socket.grade === "불멸") && socket.setName) {
            setCounts[socket.setName] = (setCounts[socket.setName] || 0) + 1;
        }
    });

    // Calculate total added skins from runes and sets (Option 25)
    let totalAddedSkins = 0;
    runeAggregated.forEach(stats => {
        if (stats["t_ui_maches_option_25"]) {
            totalAddedSkins += stats["t_ui_maches_option_25"];
        }
    });

    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);
        effectsForSet.forEach(set => {
            const checkSetSkinBuff = (buffOpt, buffVal) => {
                if (!buffOpt || !buffVal) return;
                if (typeof buffOpt === 'number') {
                    buffOpt = `t_ui_maches_option_${String(buffOpt).padStart(2, '0')}`;
                }
                if (buffOpt === "t_ui_maches_option_25") {
                    totalAddedSkins += buffVal;
                }
            };
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                checkSetSkinBuff(set.option_number_1, set.option_value_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                checkSetSkinBuff(set.option_number_2, set.option_value_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                checkSetSkinBuff(set.option_number_3, set.option_value_3);
            }
        });
    }

    // Capping Option 25 (Skin count increase) to its accumulate_max (30)
    const totalAddedSkinsClamped = Math.min(totalAddedSkins, 30);
    const totalSkins = (spec.skins || 0) + totalAddedSkinsClamped;
    const modifiedSpec = { ...spec, skins: totalSkins };

    // 2) Multiply same options between different runes (using modifiedSpec)
    keys.forEach(key => {
        if (key === "t_ui_maches_option_30") {
            // Option 30 is summed up first and clamped to 100 (accumulate_max)
            let totalOpt30 = 0;
            runeAggregated.forEach(stats => {
                if (stats[key] && stats[key] > 0) {
                    totalOpt30 += stats[key];
                }
            });

            // Also check set effects for Option 30
            for (let setName in setCounts) {
                const count = setCounts[setName];
                const effectsForSet = setEffects.filter(s => s.name_key === setName);
                effectsForSet.forEach(set => {
                    const checkSetOpt30 = (buffOpt, buffVal) => {
                        if (!buffOpt || !buffVal) return;
                        if (typeof buffOpt === 'number') {
                            buffOpt = `t_ui_maches_option_${String(buffOpt).padStart(2, '0')}`;
                        }
                        if (buffOpt === "t_ui_maches_option_30") {
                            totalOpt30 += buffVal;
                        }
                    };
                    if (set.option_active_count_1 && count >= set.option_active_count_1) {
                        checkSetOpt30(set.option_number_1, set.option_value_1);
                    }
                    if (set.option_active_count_2 && count >= set.option_active_count_2) {
                        checkSetOpt30(set.option_number_2, set.option_value_2);
                    }
                    if (set.option_active_count_3 && count >= set.option_active_count_3) {
                        checkSetOpt30(set.option_number_3, set.option_value_3);
                    }
                });
            }

            const totalOpt30Clamped = Math.min(totalOpt30, 100);
            if (totalOpt30Clamped > 0) {
                let val_eff = getEffectiveValue(key, totalOpt30Clamped, modifiedSpec);
                multiplier *= Math.pow(1.452, val_eff);
            }
        } else {
            runeAggregated.forEach(stats => {
                if (stats[key] && stats[key] > 0) {
                    let val_eff = getEffectiveValue(key, stats[key], modifiedSpec);
                    if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                        val_eff = stats[key] * totalSkins;
                    }
                    let optMult = 1 + (val_eff / 100);
                    multiplier *= optMult;
                }
            });
        }
    });

    // 3) Apply set effects (multiplicative, using modifiedSpec)
    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);

        effectsForSet.forEach(set => {
            const applySetBuffMult = (buffOpt, buffVal) => {
                if (!buffOpt || !buffVal) return;
                if (typeof buffOpt === 'number') {
                    buffOpt = `t_ui_maches_option_${String(buffOpt).padStart(2, '0')}`;
                }

                // Skip Option 30 since it was already handled in step 2 (clamped totalOpt30)
                if (buffOpt === "t_ui_maches_option_30") return;

                if (keys.includes(buffOpt)) {
                    let S_eff = getEffectiveValue(buffOpt, buffVal, modifiedSpec);
                    if (buffOpt === "t_ui_maches_option_23" || buffOpt === "t_ui_maches_option_24") {
                        S_eff = buffVal * totalSkins;
                    }
                    let setMult = 1 + (S_eff / 100);
                    multiplier *= setMult;
                }
            };

            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                applySetBuffMult(set.option_number_1, set.option_value_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                applySetBuffMult(set.option_number_2, set.option_value_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                applySetBuffMult(set.option_number_3, set.option_value_3);
            }
        });
    }

    // 4) Special handling for skin count (separate 2.5x multiplier based on net skin increase)
    if (keys === ATTACK_OPTIONS) {
        const netSkinsAdded = totalSkins - (spec.skins || 0);
        multiplier *= Math.pow(2.5, netSkinsAdded);
    }

    return multiplier;
}

function renderComparisonUI(statsA, statsB, runeA = null, runeB = null) {
    const container = document.getElementById('comparison-bars');
    const warningContainer = document.getElementById('warning-options-container');
    const warningList = document.getElementById('warning-options-list');
    const excludedContainer = document.getElementById('excluded-options-container');
    const excludedList = document.getElementById('excluded-options-list');
    const finalSummaryContainer = document.getElementById('final-summary-comparison');
    const finalDetailsContainer = document.getElementById('final-multiplier-details');

    if (!container) return;

    const allKeys = new Set([...Object.keys(statsA), ...Object.keys(statsB)]);

    if (allKeys.size === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⚖️</span>
                <p>좌/우측 카드에서 옵션을 설정하면 수치 비교가 시작됩니다.</p>
            </div>`;
        if (warningContainer) warningContainer.style.display = 'none';
        if (excludedContainer) excludedContainer.style.display = 'none';
        if (finalSummaryContainer) finalSummaryContainer.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    if (warningList) warningList.innerHTML = '';
    if (excludedList) excludedList.innerHTML = '';

    const spec = getUserSpecValues();
    const activeWarnings = [];
    const activeExcluded = [];
    const normalCompareKeys = [];

    allKeys.forEach(key => {
        const evalInfo = OPTION_EVALUATION[key];
        if (evalInfo && evalInfo.status === "disrecommended") {
            activeExcluded.push(key);
        } else {
            normalCompareKeys.push(key);
            if (evalInfo && evalInfo.status === "warning") {
                activeWarnings.push(key);
            }
        }
    });

    // Convert rune config to socket format to use the multiplicative calculator
    const socketA = runeA ? {
        equipped: true,
        grade: runeA.grade,
        level: runeA.level,
        setName: runeA.setName,
        options: runeA.options,
        optionValues: runeA.optionValues
    } : null;
    const socketB = runeB ? {
        equipped: true,
        grade: runeB.grade,
        level: runeB.level,
        setName: runeB.setName,
        options: runeB.options,
        optionValues: runeB.optionValues
    } : null;

    // Calculate final multipliers using multiplicative logic
    const multA_atk = calculateCategoryMultiplierForSockets(socketA ? [socketA] : [], spec, ATTACK_OPTIONS);
    const multB_atk = calculateCategoryMultiplierForSockets(socketB ? [socketB] : [], spec, ATTACK_OPTIONS);

    const multA_gld = calculateCategoryMultiplierForSockets(socketA ? [socketA] : [], spec, GOLD_OPTIONS);
    const multB_gld = calculateCategoryMultiplierForSockets(socketB ? [socketB] : [], spec, GOLD_OPTIONS);

    const multA_key = calculateCategoryMultiplierForSockets(socketA ? [socketA] : [], spec, KEY_OPTIONS);
    const multB_key = calculateCategoryMultiplierForSockets(socketB ? [socketB] : [], spec, KEY_OPTIONS);

    // 공격력 환산 계산: 공격력 1.05배당 1층, 1층당 열쇠 1.004배
    const floorA_atk = multA_atk > 0 ? Math.log(multA_atk) / Math.log(1.05) : 0;
    const floorB_atk = multB_atk > 0 ? Math.log(multB_atk) / Math.log(1.05) : 0;

    const multA_key_combined = multA_key * Math.pow(1.004, floorA_atk);
    const multB_key_combined = multB_key * Math.pow(1.004, floorB_atk);

    if (finalSummaryContainer && finalDetailsContainer) {
        finalSummaryContainer.style.display = 'block';

        const renderCategoryRow = (label, emoji, valA, valB, floorType = null) => {
            let ratioText = "";
            let winClass = "";
            let ratio = 1.0;
            if (valA > valB) {
                ratio = valA / valB;
                ratioText = `A가 ${formatRatio(ratio)}배 우세`;
                winClass = "win-a";
            } else if (valB > valA) {
                ratio = valB / valA;
                ratioText = `B가 ${formatRatio(ratio)}배 우세`;
                winClass = "win-b";
            } else {
                ratioText = "동일 수치";
                winClass = "draw";
            }

            if (floorType && ratio > 1.0) {
                let floorDiff = 0;
                if (floorType === "atk") {
                    floorDiff = Math.log(ratio) / Math.log(1.05);
                } else if (floorType === "key") {
                    floorDiff = Math.log(ratio) / Math.log(1.004);
                }
                ratioText += ` (약 +${floorDiff.toFixed(2)}층)`;
            }

            return `
                <div class="final-comp-row" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.04);">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
                        ${emoji} ${label}
                    </span>
                    <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: var(--accent-blue); font-weight: 700; white-space: nowrap;">A: ${formatGameNumber(valA)}배</span>
                        <span style="font-size: 0.8rem; color: var(--accent-orange); font-weight: 700; white-space: nowrap;">B: ${formatGameNumber(valB)}배</span>
                        <span class="comp-comparison-text ${winClass}" style="font-size: 0.75rem; font-weight: 700; min-width: 90px; text-align: center; white-space: nowrap;">${ratioText}</span>
                    </div>
                </div>
            `;
        };

        finalDetailsContainer.innerHTML = `
            ${renderCategoryRow("공격력 관련 최종 배율", "⚔️", multA_atk, multB_atk, "atk")}
            ${renderCategoryRow("골드 관련 최종 배율", "💰", multA_gld, multB_gld)}
            ${renderCategoryRow("열쇠 관련 최종 배율 (순수)", "🔑", multA_key, multB_key, "key")}
            ${renderCategoryRow("열쇠 관련 최종 배율 (공격력 반영)", "🗝️", multA_key_combined, multB_key_combined, "key")}
        `;
    }

    // 1) Render Normal Comparison Rows
    if (normalCompareKeys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⚖️</span>
                <p>비교 가능한 추천 옵션이 없습니다.</p>
            </div>`;
    } else {
        normalCompareKeys.forEach(key => {
            const dataA = statsA[key] || { value: 0, min: 0, max: 0, idx: parseInt(key.replace("t_ui_maches_option_", "")) };
            const dataB = statsB[key] || { value: 0, min: 0, max: 0, idx: parseInt(key.replace("t_ui_maches_option_", "")) };

            // Base values
            let valA = dataA.value || 0;
            let valB = dataB.value || 0;

            // Calculate Effective Values (효용성)
            const valA_eff = getEffectiveValue(key, valA, spec);
            const valB_eff = getEffectiveValue(key, valB, spec);

            // Calculate multipliers for this option
            let multA = 1.0;
            let multB = 1.0;
            if (key === "t_ui_maches_option_30") {
                multA = Math.pow(1.1, valA_eff);
                multB = Math.pow(1.1, valB_eff);
            } else if (isPercentOption(dataA.idx)) {
                let actualValA = valA_eff;
                let actualValB = valB_eff;
                if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                    const skinsA = (spec.skins || 0) + (statsA["t_ui_maches_option_25"]?.value || 0);
                    const skinsB = (spec.skins || 0) + (statsB["t_ui_maches_option_25"]?.value || 0);
                    actualValA = valA * skinsA;
                    actualValB = valB * skinsB;
                }
                multA = 1 + (actualValA / 100);
                multB = 1 + (actualValB / 100);
            } else {
                multA = valA_eff;
                multB = valB_eff;
            }

            let ratioText = "";
            let winClass = "draw";

            if (multA > multB) {
                if (multB <= 0) {
                    ratioText = "A가 더 높음";
                } else {
                    const ratio = multA / multB;
                    ratioText = `A가 ${formatRatio(ratio)}배 높음`;
                }
                winClass = "win-a";
            } else if (multB > multA) {
                if (multA <= 0) {
                    ratioText = "B가 더 높음";
                } else {
                    const ratio = multB / multA;
                    ratioText = `B가 ${formatRatio(ratio)}배 높음`;
                }
                winClass = "win-b";
            } else {
                ratioText = "동일 수치";
                winClass = "draw";
            }

            const optName = OPTION_TRANSLATIONS[key] || key;
            const evalInfo = OPTION_EVALUATION[key];
            const warningBadge = (evalInfo && evalInfo.status === "warning")
                ? `<span style="background: var(--accent-orange); color: white; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.35rem; border-radius: 4px; margin-left: 0.4rem; vertical-align: middle; white-space: nowrap;">주의 필요</span>`
                : '';

            // Conditional detail formatting
            const mapping = SPEC_MAPPING[key];
            let detailA = "";
            let detailB = "";
            if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                const skinsA = (spec.skins || 0) + (statsA["t_ui_maches_option_25"]?.value || 0);
                const skinsB = (spec.skins || 0) + (statsB["t_ui_maches_option_25"]?.value || 0);
                detailA = `<div style="font-size: 0.65rem; color: var(--text-muted); text-align: right;">(기본 ${formatStatValue(dataA.idx, valA)} × 스킨 ${skinsA}개 = 최종 +${formatStatValue(dataA.idx, valA * skinsA)} 적용)</div>`;
                detailB = `<div style="font-size: 0.65rem; color: var(--text-muted); text-align: right;">(기본 ${formatStatValue(dataB.idx, valB)} × 스킨 ${skinsB}개 = 최종 +${formatStatValue(dataB.idx, valB * skinsB)} 적용)</div>`;
            } else if (mapping) {
                const factor = spec[mapping.key] || 0;
                detailA = `<div style="font-size: 0.65rem; color: var(--text-muted); text-align: right;">(기본 ${formatStatValue(dataA.idx, valA)} × ${factor}${mapping.suffix})</div>`;
                detailB = `<div style="font-size: 0.65rem; color: var(--text-muted); text-align: right;">(기본 ${formatStatValue(dataB.idx, valB)} × ${factor}${mapping.suffix})</div>`;
            }

            const row = document.createElement('div');
            row.className = 'comparison-row';
            row.innerHTML = `
                <div class="comp-header" style="align-items: center; display: flex; justify-content: space-between; width: 100%;">
                    <span class="comp-title" style="flex: 1.2; min-width: 120px; text-align: left;">
                        ${optName}${warningBadge}
                    </span>
                    <div style="display: flex; align-items: center; gap: 1rem; flex: 1.8; justify-content: flex-end; flex-wrap: wrap;">
                        <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 80px;">
                            <span class="comp-value-a" style="font-weight: 700;">A: ${formatStatValue(dataA.idx, valA_eff)}</span>
                            ${detailA}
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 80px;">
                            <span class="comp-value-b" style="font-weight: 700;">B: ${formatStatValue(dataB.idx, valB_eff)}</span>
                            ${detailB}
                        </div>
                        <span class="comp-comparison-text ${winClass}" style="font-size: 0.75rem; font-weight: 700; min-width: 90px; text-align: center; white-space: nowrap;">${ratioText}</span>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // 2) Render Warnings List
    if (warningContainer && warningList) {
        if (activeWarnings.length > 0) {
            warningContainer.style.display = 'block';
            activeWarnings.forEach(key => {
                const optName = OPTION_TRANSLATIONS[key] || key;
                const evalInfo = OPTION_EVALUATION[key];

                const item = document.createElement('div');
                item.style.background = 'rgba(249, 115, 22, 0.05)';
                item.style.border = '1px solid rgba(249, 115, 22, 0.15)';
                item.style.borderRadius = '12px';
                item.style.padding = '0.65rem 0.85rem';
                item.style.marginBottom = '0.5rem';
                item.innerHTML = `
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-orange);">${optName}</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem; line-height: 1.4;">${evalInfo.reason}</p>
                `;
                warningList.appendChild(item);
            });
        } else {
            warningContainer.style.display = 'none';
        }
    }

    // 3) Render Disrecommended/Excluded List
    if (excludedContainer && excludedList) {
        if (activeExcluded.length > 0) {
            excludedContainer.style.display = 'block';
            activeExcluded.forEach(key => {
                const optName = OPTION_TRANSLATIONS[key] || key;
                const evalInfo = OPTION_EVALUATION[key];
                const dataA = statsA[key] || { value: 0, idx: parseInt(key.replace("t_ui_maches_option_", "")) };
                const dataB = statsB[key] || { value: 0, idx: parseInt(key.replace("t_ui_maches_option_", "")) };

                const valA = dataA.value || 0;
                const valB = dataB.value || 0;

                const item = document.createElement('div');
                item.style.background = 'rgba(239, 68, 68, 0.03)';
                item.style.border = '1px solid rgba(239, 68, 68, 0.12)';
                item.style.borderRadius = '12px';
                item.style.padding = '0.65rem 0.85rem';
                item.style.marginBottom = '0.5rem';
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="color: var(--text-primary); font-size: 0.85rem;">${optName}</span>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            A: <span style="color: var(--accent-red); font-weight: bold;">${formatStatValue(dataA.idx, valA)}</span> | 
                            B: <span style="color: var(--accent-red); font-weight: bold;">${formatStatValue(dataB.idx, valB)}</span>
                        </div>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.4;">비추천 사유: ${evalInfo.reason}</p>
                `;
                excludedList.appendChild(item);
            });
        } else {
            excludedContainer.style.display = 'none';
        }
    }
}

// 9. 가상 수치 롤 시뮬레이션 (입력창에 주사위 수치 직접 입력)
function rollRuneStats(prefix) {
    const gradeEl = document.getElementById(`rune-${prefix}-grade`);
    const grade = gradeEl ? gradeEl.value : "일반";
    const levelEl = document.getElementById(`rune-${prefix}-level`);
    const level = levelEl ? (parseInt(levelEl.value) || 0) : 0;
    const optionSelectors = document.querySelectorAll(`#rune-${prefix}-options-list .option-selector`);

    optionSelectors.forEach((sel, idx) => {
        const optName = sel.value;
        if (!optName) return;

        const match = optionsData.find(o => o.name_key === optName);
        if (!match) return;

        // 주사위 롤링은 기본 범위 내 정수 랜덤값
        const minVal = Math.round(match.min);
        const maxVal = Math.round(match.max);
        const rollInt = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

        // 등급 배율 적용
        const gradeIdx = GRADES.indexOf(grade) + 1; // 1~8
        const baseValue = match[`grade_value_${gradeIdx}`] || 0;

        // 옵션 레벨 보정 스케일 적용
        const scaleFactor = 1 + (level * (match.floor_value || 0));

        // 최종 수치 계산 공식: 정수랜덤값 * 등급배율 * (1 + 옵션레벨 * floor_value)
        const roll = rollInt * baseValue * scaleFactor;

        const inputEl = document.getElementById(`rune-${prefix}-opt-val-${idx + 1}`);
        if (inputEl) {
            inputEl.value = formatGameNumber(roll);
        }
    });

    triggerCalculation();
}

// 10. 10슬롯 보드 시뮬레이터 로직
function renderBoardSockets() {
    const grid = document.getElementById('board-sockets-grid');
    if (!grid) return;
    grid.innerHTML = '';

    boardSockets.forEach((socket, index) => {
        const item = document.createElement('div');
        item.className = `socket-item ${socket.equipped ? 'equipped grade-' + socket.grade : ''}`;
        item.setAttribute('data-index', index);

        let metaHtml = '';
        if (socket.equipped) {
            const setLabel = socket.setName ? `<span class="socket-set-badge">${SET_TRANSLATIONS[socket.setName] || socket.setName}</span>` : '';
            const prefText = getPreferredOptionsText(socket);
            metaHtml = `
                <div class="socket-meta">
                    <span class="socket-badge">${socket.grade}</span>
                    ${setLabel}
                    <span style="font-size:0.65rem; color:var(--text-muted);">Lv. ${socket.level}</span>
                </div>
                ${prefText}
            `;
        } else {
            metaHtml = `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">비어 있음 (터치하여 장착)</span>`;
        }

        item.innerHTML = `
            <div class="socket-index">${index + 1}</div>
            <div class="socket-content">
                <span class="socket-rune-title">${socket.runeName} 룬</span>
                ${metaHtml}
            </div>
        `;

        item.addEventListener('click', () => {
            openSocketEditor(index);
        });

        grid.appendChild(item);
    });
}

function getBoardStatsAndSets(sockets) {
    const boardStats = {}; // { optKey: { value, min, max, idx } }
    const setCounts = {};  // { setName: count }
    const activeSets = []; // array of { setName, reqCount, buffOpt, buffVal }

    sockets.forEach(socket => {
        if (!socket.equipped) return;

        // 1) 룬 자체 옵션 합산
        socket.options.forEach((optName, idx) => {
            if (!optName) return;
            const range = calculateOptionValueRange(socket.grade, socket.level, optName);

            let inputVal = socket.optionValues ? socket.optionValues[idx] : undefined;
            if (inputVal === undefined || isNaN(inputVal) || inputVal === null) {
                inputVal = (range.min + range.max) / 2;
            }

            if (!boardStats[optName]) {
                boardStats[optName] = { value: 0, min: 0, max: 0, idx: range.idx };
            }
            boardStats[optName].value += inputVal;
            boardStats[optName].min += range.min;
            boardStats[optName].max += range.max;
        });

        // 2) 세트 소유 카운트
        if ((socket.grade === "전설" || socket.grade === "신화" || socket.grade === "불멸") && socket.setName) {
            setCounts[socket.setName] = (setCounts[socket.setName] || 0) + 1;
        }
    });

    // 3) 세트 효과 판정 및 스탯 반영
    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);

        effectsForSet.forEach(set => {
            const applySetBuff = (buffOpt, buffVal, reqCount) => {
                if (!buffOpt || !buffVal) return;

                if (typeof buffOpt === 'number') {
                    buffOpt = `t_ui_maches_option_${String(buffOpt).padStart(2, '0')}`;
                }

                const matchOpt = optionsData.find(o => o.name_key === buffOpt);
                const optIdx = matchOpt ? matchOpt.idx : 2;

                if (!boardStats[buffOpt]) {
                    boardStats[buffOpt] = { value: 0, min: 0, max: 0, idx: optIdx };
                }
                boardStats[buffOpt].value += buffVal;
                boardStats[buffOpt].min += buffVal;
                boardStats[buffOpt].max += buffVal;

                activeSets.push({
                    setName,
                    reqCount,
                    buffOpt,
                    buffVal
                });
            };

            // 3개 이상
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                applySetBuff(set.option_number_1, set.option_value_1, set.option_active_count_1);
            }
            // 7개 이상
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                applySetBuff(set.option_number_2, set.option_value_2, set.option_active_count_2);
            }
            // 10개 이상
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                applySetBuff(set.option_number_3, set.option_value_3, set.option_active_count_3);
            }
        });
    }

    // Clamp flat options 25-30 to their accumulate_max
    for (let optName in boardStats) {
        const matchOpt = optionsData.find(o => o.name_key === optName);
        if (matchOpt && matchOpt.accumulate_max > 0) {
            boardStats[optName].value = Math.min(boardStats[optName].value, matchOpt.accumulate_max);
            boardStats[optName].min = Math.min(boardStats[optName].min, matchOpt.accumulate_max);
            boardStats[optName].max = Math.min(boardStats[optName].max, matchOpt.accumulate_max);
        }
    }

    return { boardStats, activeSets };
}

function getPreferredOptionsText(socket) {
    if (!socket.equipped || !socket.options) return "";
    let keysCount = 0;
    let attackCount = 0;
    let goldCount = 0;

    socket.options.forEach(opt => {
        if (!opt) return;
        if (opt === "t_ui_maches_option_05") {
            keysCount++;
        } else if (ATTACK_OPTIONS.includes(opt)) {
            attackCount++;
        } else if (GOLD_OPTIONS.includes(opt)) {
            goldCount++;
        }
    });

    const parts = [];
    if (keysCount > 0) parts.push(`열쇠 ${keysCount}줄`);
    if (attackCount > 0) parts.push(`공 ${attackCount}줄`);
    if (goldCount > 0) parts.push(`골 ${goldCount}줄`);

    if (parts.length === 0) return "";
    return `<div class="socket-pref-tags" style="font-size: 0.7rem; color: #a78bfa; margin-top: 0.25rem; font-weight: bold; text-shadow: 0 0 5px rgba(167, 139, 250, 0.4);">✨ ${parts.join(' + ')}</div>`;
}

function getCombinedBoardStats(sockets, spec) {
    const combinedStats = {}; // { optKey: { value, min, max, idx } }

    // First find totalAddedSkins from the sockets and set effects
    let totalAddedSkins = 0;

    // 1) Find all option keys present in equipped sockets
    const allKeys = new Set();
    sockets.forEach(socket => {
        if (!socket.equipped) return;
        socket.options.forEach((opt, idx) => {
            if (!opt) return;
            allKeys.add(opt);
            if (opt === "t_ui_maches_option_25") {
                let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                if (val === undefined || isNaN(val) || val === null) {
                    const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                    val = (range.min + range.max) / 2;
                }
                totalAddedSkins += val;
            }
        });
    });

    // Also get set effects
    const setCounts = {};
    sockets.forEach(socket => {
        if (socket.equipped && (socket.grade === "전설" || socket.grade === "신화" || socket.grade === "불멸") && socket.setName) {
            setCounts[socket.setName] = (setCounts[socket.setName] || 0) + 1;
        }
    });

    // Find set effect option keys and add to allKeys
    const activeSets = [];
    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);
        effectsForSet.forEach(set => {
            const addSetOpt = (buffOpt, buffVal, reqCount) => {
                if (!buffOpt || !buffVal) return;
                let optKey = buffOpt;
                if (typeof optKey === 'number') {
                    optKey = `t_ui_maches_option_${String(optKey).padStart(2, '0')}`;
                }
                allKeys.add(optKey);
                activeSets.push({ setName, reqCount, buffOpt: optKey, buffVal });
                if (optKey === "t_ui_maches_option_25") {
                    totalAddedSkins += buffVal;
                }
            };
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                addSetOpt(set.option_number_1, set.option_value_1, set.option_active_count_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                addSetOpt(set.option_number_2, set.option_value_2, set.option_active_count_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                addSetOpt(set.option_number_3, set.option_value_3, set.option_active_count_3);
            }
        });
    }

    const totalAddedSkinsClamped = Math.min(totalAddedSkins, 30);
    const totalSkins = (spec.skins || 0) + totalAddedSkinsClamped;
    const modifiedSpec = { ...spec, skins: totalSkins };

    // 2) Compute combined values for each option key
    allKeys.forEach(key => {
        const matchOpt = optionsData.find(o => o.name_key === key);
        const optIdx = matchOpt ? matchOpt.idx : 1;

        if (isPercentOption(optIdx)) {
            // Multiplicative combination for percent options
            let productRunes = 1.0;
            let productRunesMin = 1.0;
            let productRunesMax = 1.0;
            let sumVal = 0;

            sockets.forEach(socket => {
                if (!socket.equipped) return;
                // Sum values of the same option within this single rune
                let sumRune = 0;
                let sumRuneMin = 0;
                let sumRuneMax = 0;
                let hasOpt = false;

                socket.options.forEach((opt, idx) => {
                    if (opt === key) {
                        hasOpt = true;
                        const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                        let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                        if (val === undefined || isNaN(val) || val === null) {
                            val = (range.min + range.max) / 2;
                        }
                        sumRune += val;
                        sumRuneMin += range.min;
                        sumRuneMax += range.max;
                    }
                });

                if (hasOpt) {
                    let val_eff = getEffectiveValue(key, sumRune, modifiedSpec);
                    let val_eff_min = getEffectiveValue(key, sumRuneMin, modifiedSpec);
                    let val_eff_max = getEffectiveValue(key, sumRuneMax, modifiedSpec);
                    if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                        val_eff = sumRune * totalSkins;
                        val_eff_min = sumRuneMin * totalSkins;
                        val_eff_max = sumRuneMax * totalSkins;
                    }
                    productRunes *= (1 + val_eff / 100);
                    productRunesMin *= (1 + val_eff_min / 100);
                    productRunesMax *= (1 + val_eff_max / 100);
                    sumVal += sumRune;
                }
            });

            // Multiply active sets
            let productSets = 1.0;
            activeSets.forEach(set => {
                if (set.buffOpt === key) {
                    let val_eff = getEffectiveValue(key, set.buffVal, modifiedSpec);
                    if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                        val_eff = set.buffVal * totalSkins;
                    }
                    productSets *= (1 + val_eff / 100);
                    sumVal += set.buffVal;
                }
            });

            const combinedVal = (productRunes * productSets - 1) * 100;
            const combinedMin = (productRunesMin * productSets - 1) * 100;
            const combinedMax = (productRunesMax * productSets - 1) * 100;

            combinedStats[key] = {
                value: combinedVal,
                min: combinedMin,
                max: combinedMax,
                idx: optIdx,
                rawValue: sumVal
            };
        } else {
            // Additive combination for flat options (like Option 1, 25-30)
            let sumVal = 0;
            let sumMin = 0;
            let sumMax = 0;

            sockets.forEach(socket => {
                if (!socket.equipped) return;
                socket.options.forEach((opt, idx) => {
                    if (opt === key) {
                        const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                        let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                        if (val === undefined || isNaN(val) || val === null) {
                            val = (range.min + range.max) / 2;
                        }
                        sumVal += val;
                        sumMin += range.min;
                        sumMax += range.max;
                    }
                });
            });

            // Add sets
            activeSets.forEach(set => {
                if (set.buffOpt === key) {
                    sumVal += set.buffVal;
                    sumMin += set.buffVal;
                    sumMax += set.buffVal;
                }
            });

            // Clamp to accumulate_max if key is option 25-30
            const matchOpt = optionsData.find(o => o.name_key === key);
            if (matchOpt && matchOpt.accumulate_max > 0) {
                sumVal = Math.min(sumVal, matchOpt.accumulate_max);
                sumMin = Math.min(sumMin, matchOpt.accumulate_max);
                sumMax = Math.min(sumMax, matchOpt.accumulate_max);
            }

            // Apply spec factor to the final sum
            const val_eff = getEffectiveValue(key, sumVal, modifiedSpec);
            const min_eff = getEffectiveValue(key, sumMin, modifiedSpec);
            const max_eff = getEffectiveValue(key, sumMax, modifiedSpec);

            combinedStats[key] = {
                value: val_eff,
                min: min_eff,
                max: max_eff,
                idx: optIdx,
                rawValue: sumVal // keep raw value if needed
            };
        }
    });

    return { combinedStats, activeSets };
}


function bindBoardEvents() {
    document.getElementById('editor-close-btn').addEventListener('click', closeSocketEditor);

    document.getElementById('editor-grade').addEventListener('change', () => {
        toggleEditorEquippedFields();

        const optionSelectors = document.querySelectorAll('.editor-option-selector');
        const options = Array.from(optionSelectors).map(s => s.value);
        const valInputs = document.querySelectorAll('.editor-option-value-input');
        const optionValues = Array.from(valInputs).map(input => input.value);

        updateEditorOptionsForm({ options, optionValues });
        updateEditorComparison();
    });

    document.getElementById('editor-set').addEventListener('change', updateEditorComparison);

    document.getElementById('editor-level').addEventListener('input', () => {
        const level = parseInt(document.getElementById('editor-level').value) || 0;
        document.getElementById('editor-floor-calc').innerText = getFloorRangeText(level);

        // Also update range display of each option in the editor form dynamically
        const selectors = document.querySelectorAll('.editor-option-selector');
        selectors.forEach((select, i) => {
            const grade = document.getElementById('editor-grade').value;
            const range = calculateOptionValueRange(grade, level, select.value);
            const rangeTextEl = document.getElementById(`editor-opt-range-${i + 1}`);
            if (rangeTextEl) {
                rangeTextEl.innerText = `범위: ${formatStatValue(range.idx, range.min)} ~ ${formatStatValue(range.idx, range.max)}`;
            }
        });
        updateEditorComparison();
    });

    document.getElementById('editor-level').addEventListener('change', updateEditorComparison);

    document.getElementById('editor-save-btn').addEventListener('click', saveSocketData);
}

function openSocketEditor(index) {
    const socket = boardSockets[index];
    document.getElementById('editor-slot-index').value = index;
    document.getElementById('editor-slot-title').innerText = `${index + 1}번 슬롯 (${socket.runeName}의 룬) 변경`;
    document.getElementById('editor-equipped').value = socket.equipped.toString();
    document.getElementById('editor-grade').value = socket.equipped ? socket.grade : "없음";
    document.getElementById('editor-level').value = socket.level;
    document.getElementById('editor-set').value = socket.setName;

    document.getElementById('editor-floor-calc').innerText = getFloorRangeText(socket.level);

    // 액티브 클래스 부여
    document.querySelectorAll('.socket-item').forEach(el => el.classList.remove('active-edit'));
    document.querySelector(`.socket-item[data-index="${index}"]`).classList.add('active-edit');

    // 옵션 세팅 폼 생성
    updateEditorOptionsForm();
    toggleEditorEquippedFields();

    // 에디터 열기
    document.getElementById('board-editor-panel').style.display = 'block';

    // 실시간 비교 로드
    updateEditorComparison();

    // 이펙트 포커스 스크롤
    document.getElementById('board-editor-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeSocketEditor() {
    document.getElementById('board-editor-panel').style.display = 'none';
    document.querySelectorAll('.socket-item').forEach(el => el.classList.remove('active-edit'));
}


function toggleEditorEquippedFields() {
    const grade = document.getElementById('editor-grade').value;
    const equipped = grade !== "없음";
    document.querySelectorAll('.editor-fields').forEach(el => {
        el.style.display = equipped ? 'block' : 'none';
    });
    // 컨테이너 레이아웃 재조정
    const setGrp = document.getElementById('editor-set-group');
    const setSelect = document.getElementById('editor-set');
    if (equipped) {
        setGrp.style.display = 'block';
        if (grade === "전설" || grade === "신화" || grade === "불멸") {
            if (setSelect) setSelect.disabled = false;
        } else {
            if (setSelect) {
                setSelect.value = "";
                setSelect.disabled = true;
            }
        }
    } else {
        setGrp.style.display = 'none';
        if (setSelect) {
            setSelect.value = "";
            setSelect.disabled = true;
        }
    }
}

function updateEditorOptionsForm(savedState = null) {
    const grade = document.getElementById('editor-grade').value;
    const level = parseInt(document.getElementById('editor-level').value) || 0;
    const container = document.getElementById('editor-options-list');
    const setGrp = document.getElementById('editor-set-group');
    const setSelect = document.getElementById('editor-set');
    if (!container) return;

    if (grade === "전설" || grade === "신화" || grade === "불멸") {
        setGrp.style.display = 'block';
        if (setSelect) setSelect.disabled = false;
    } else {
        if (grade !== "없음") {
            setGrp.style.display = 'block';
        } else {
            setGrp.style.display = 'none';
        }
        if (setSelect) {
            setSelect.value = "";
            setSelect.disabled = true;
        }
    }

    let optionCount = 1;
    if (grade === "일반" || grade === "고급") {
        optionCount = 1;
    } else if (grade === "희귀" || grade === "유물" || grade === "영웅") {
        optionCount = 2;
    } else {
        optionCount = 3;
    }

    container.innerHTML = '';
    const index = parseInt(document.getElementById('editor-slot-index').value);
    const socket = boardSockets[index];

    const stateToLoad = savedState || socket;

    for (let i = 1; i <= optionCount; i++) {
        const row = document.createElement('div');
        row.className = 'option-row';

        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justify = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.width = '100%';
        headerDiv.innerHTML = `
            <span>옵션 ${i}</span>
            <span class="option-range-display" id="editor-opt-range-${i}" style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 600;">범위: 계산 중...</span>
        `;

        const ctrlRow = document.createElement('div');
        ctrlRow.style.display = 'flex';
        ctrlRow.style.flexDirection = 'column';
        ctrlRow.style.gap = '0.35rem';
        ctrlRow.style.width = '100%';
        ctrlRow.style.marginTop = '0.25rem';

        const select = document.createElement('select');
        select.className = 'select-control editor-option-selector';

        optionsData.forEach((opt, idx) => {
            const exists = Array.from(select.options).some(o => o.value === opt.name_key);
            if (!exists && opt.name_key) {
                const o = document.createElement('option');
                o.value = opt.name_key;
                o.innerText = OPTION_TRANSLATIONS[opt.name_key] || opt.name_key;
                select.appendChild(o);
            }
        });

        // 기존 장착 상태 또는 편집 중이던 옵션을 불러옴
        if (stateToLoad && stateToLoad.options && stateToLoad.options[i - 1]) {
            select.value = stateToLoad.options[i - 1];
        } else {
            select.selectedIndex = (i - 1) % select.options.length;
        }

        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.className = 'number-control editor-option-value-input';
        valInput.placeholder = '수치 (예: 15A)';

        // 기존 장착 상태 또는 편집 중이던 수치를 불러옴
        if (stateToLoad && stateToLoad.optionValues && stateToLoad.optionValues[i - 1] !== undefined) {
            if (savedState) {
                valInput.value = stateToLoad.optionValues[i - 1];
            } else {
                valInput.value = formatGameNumber(stateToLoad.optionValues[i - 1]);
            }
        } else {
            valInput.value = "0";
        }

        ctrlRow.appendChild(select);
        ctrlRow.appendChild(valInput);

        row.appendChild(headerDiv);
        row.appendChild(ctrlRow);
        container.appendChild(row);

        const updateRangeDisplay = () => {
            const currentLevel = parseInt(document.getElementById('editor-level').value) || 0;
            const currentGrade = document.getElementById('editor-grade').value;
            const range = calculateOptionValueRange(currentGrade, currentLevel, select.value);
            const rangeTextEl = document.getElementById(`editor-opt-range-${i}`);
            if (rangeTextEl) {
                rangeTextEl.innerText = `범위: ${formatStatValue(range.idx, range.min)} ~ ${formatStatValue(range.idx, range.max)}`;
            }
        };

        select.addEventListener('change', () => {
            updateRangeDisplay();
            valInput.value = "0";
            updateEditorComparison();
        });

        valInput.addEventListener('input', updateEditorComparison);

        updateRangeDisplay();
    }
}

function saveSocketData() {
    const index = parseInt(document.getElementById('editor-slot-index').value);
    const grade = document.getElementById('editor-grade').value;
    const equipped = grade !== "없음";
    const level = parseInt(document.getElementById('editor-level').value) || 0;
    const setName = document.getElementById('editor-set').value;

    const selectors = document.querySelectorAll('.editor-option-selector');
    const options = Array.from(selectors).map(s => s.value);

    const valInputs = document.querySelectorAll('.editor-option-value-input');
    const optionValues = Array.from(valInputs).map(input => parseGameNumber(input.value));

    boardSockets[index] = {
        equipped,
        runeName: RUNE_NAMES[index],
        grade,
        level,
        setName: equipped ? setName : "",
        options: equipped ? options : [],
        optionValues: equipped ? optionValues : []
    };

    localStorage.setItem('maf_rune_board_sockets', JSON.stringify(boardSockets));

    renderBoardSockets();
    updateBoardSummary();
    closeSocketEditor();
}

function updateBoardSummary() {
    const spec = getUserSpecValues();
    const { combinedStats, activeSets } = getCombinedBoardStats(boardSockets, spec);

    // Calculate total added skins from board stats to get totalSkins
    let totalAddedSkins = 0;
    if (combinedStats["t_ui_maches_option_25"]) {
        totalAddedSkins = combinedStats["t_ui_maches_option_25"].value;
    }
    const totalSkins = (spec.skins || 0) + totalAddedSkins;

    // 4) 세트 목록 UI 그리기
    const setsContainer = document.getElementById('board-sets-list');
    if (setsContainer) {
        if (activeSets.length === 0) {
            setsContainer.innerHTML = `<p class="no-sets">보드에 장착된 세트 보너스가 없습니다 (전설 이상 등급의 동일한 세트 3개 이상 장착 필요).</p>`;
        } else {
            const activeSetsHtml = activeSets.map(set => {
                const setNameKo = SET_TRANSLATIONS[set.setName] || set.setName;
                return `
                    <div class="board-set-row" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                        <span class="board-set-name">👑 ${setNameKo} (${set.reqCount}셋 활성)</span>
                        <span class="board-set-desc" style="color: var(--text-primary);">
                            ${renderOptionTextHtml(set.buffOpt, set.buffVal)}
                        </span>
                    </div>
                `;
            });
            setsContainer.innerHTML = activeSetsHtml.join('');
        }
    }

    // 4-2) 종합 최종 배율 UI 그리기
    const mult_atk = calculateCategoryMultiplierForSockets(boardSockets, spec, ATTACK_OPTIONS);
    const mult_gld = calculateCategoryMultiplierForSockets(boardSockets, spec, GOLD_OPTIONS);
    const mult_key = calculateCategoryMultiplierForSockets(boardSockets, spec, KEY_OPTIONS);

    const floor_atk = mult_atk > 0 ? Math.log(mult_atk) / Math.log(1.05) : 0;
    const mult_key_combined = mult_key * Math.pow(1.004, floor_atk);

    const renderBoardMultRow = (label, emoji, val, floorType = null) => {
        let suffixText = "";
        if (floorType === "atk") {
            suffixText = ` (약 +${floor_atk.toFixed(2)}층)`;
        } else if (floorType === "key") {
            const keyFloor = Math.log(val) / Math.log(1.004);
            suffixText = ` (약 +${keyFloor.toFixed(2)}층)`;
        }
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.04);">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
                    ${emoji} ${label}
                </span>
                <span style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 700; white-space: nowrap;">
                    ${formatGameNumber(val)}배${suffixText}
                </span>
            </div>
        `;
    };

    const multDetailsContainer = document.getElementById('board-multipliers-details');
    if (multDetailsContainer) {
        multDetailsContainer.innerHTML = `
            ${renderBoardMultRow("공격력 관련 최종 배율", "⚔️", mult_atk, "atk")}
            ${renderBoardMultRow("골드 관련 최종 배율", "💰", mult_gld)}
            ${renderBoardMultRow("열쇠 관련 최종 배율 (순수)", "🔑", mult_key, "key")}
            ${renderBoardMultRow("열쇠 관련 최종 배율 (공격력 반영)", "🗝️", mult_key_combined, "key")}
        `;
    }

    // 5) 스탯 요약 UI 그리기
    const statsContainer = document.getElementById('board-stats-list');
    if (statsContainer) {
        const keys = Object.keys(combinedStats);
        if (keys.length === 0) {
            statsContainer.innerHTML = `<p class="no-sets">장착된 룬이 없거나 옵션이 활성화되지 않았습니다.</p>`;
        } else {
            statsContainer.innerHTML = '';
            keys.forEach(k => {
                const stat = combinedStats[k];
                const matchOpt = optionsData.find(o => o.name_key === k);
                const maxLimit = matchOpt ? matchOpt.accumulate_max : null;

                const row = document.createElement('div');
                row.className = 'board-stat-row';

                const mapping = SPEC_MAPPING[k];
                let detailLabel = "";
                let renderVal = stat.value;

                if (k === "t_ui_maches_option_23" || k === "t_ui_maches_option_24") {
                    const rawVal = stat.rawValue !== undefined ? stat.rawValue : stat.value;
                    renderVal = rawVal;
                    const finalVal = rawVal * totalSkins;
                    detailLabel = ` <span style="font-size: 0.7rem; color: var(--text-muted);">(기본 ${formatStatValue(stat.idx, rawVal)} × 스킨 ${totalSkins}개 = 최종 +${formatStatValue(stat.idx, finalVal)} 적용)</span>`;
                } else if (mapping) {
                    const factor = spec[mapping.key] || 0;
                    const rawVal = stat.rawValue !== undefined ? stat.rawValue : stat.value;
                    detailLabel = ` <span style="font-size: 0.7rem; color: var(--text-muted);">(기본 ${formatStatValue(stat.idx, rawVal)} × ${factor}${mapping.suffix})</span>`;
                }

                row.innerHTML = `
                    <div style="width: 100%; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 1rem; flex-wrap: wrap;">
                            <span>${renderOptionTextHtml(k, renderVal, maxLimit)}${detailLabel}</span>
                        </div>
                    </div>
                `;
                statsContainer.appendChild(row);
            });
        }
    }
}

function updateEditorComparison() {
    const indexInput = document.getElementById('editor-slot-index');
    if (!indexInput) return;
    const index = parseInt(indexInput.value);
    if (isNaN(index)) return;

    // Get original socket state (Before)
    const originalSocket = boardSockets[index];

    // Get edited socket state (After)
    const grade = document.getElementById('editor-grade').value;
    const equipped = grade !== "없음";
    const level = parseInt(document.getElementById('editor-level').value) || 0;
    const setName = document.getElementById('editor-set').value;

    const selectors = document.querySelectorAll('.editor-option-selector');
    const options = Array.from(selectors).map(s => s.value);

    const valInputs = document.querySelectorAll('.editor-option-value-input');
    const optionValues = Array.from(valInputs).map(input => parseGameNumber(input.value));

    const tempSocket = {
        equipped,
        runeName: RUNE_NAMES[index],
        grade,
        level: equipped ? level : 10,
        setName: equipped ? setName : "",
        options: equipped ? options : [],
        optionValues: equipped ? optionValues : []
    };

    // Calculate Before Board Stats
    const { boardStats: beforeStats, activeSets: beforeSets } = getBoardStatsAndSets(boardSockets);

    // Calculate After Board Stats
    const tempBoardSockets = [...boardSockets];
    tempBoardSockets[index] = tempSocket;
    const { boardStats: afterStats, activeSets: afterSets } = getBoardStatsAndSets(tempBoardSockets);

    // Render comparison details
    const container = document.getElementById('editor-comparison-details');
    if (!container) return;

    const spec = getUserSpecValues();

    // 1) Compare final multipliers
    const beforeMult_atk = calculateCategoryMultiplierForSockets(boardSockets, spec, ATTACK_OPTIONS);
    const afterMult_atk = calculateCategoryMultiplierForSockets(tempBoardSockets, spec, ATTACK_OPTIONS);

    const beforeMult_gld = calculateCategoryMultiplierForSockets(boardSockets, spec, GOLD_OPTIONS);
    const afterMult_gld = calculateCategoryMultiplierForSockets(tempBoardSockets, spec, GOLD_OPTIONS);

    const beforeMult_key = calculateCategoryMultiplierForSockets(boardSockets, spec, KEY_OPTIONS);
    const afterMult_key = calculateCategoryMultiplierForSockets(tempBoardSockets, spec, KEY_OPTIONS);

    const beforeFloor_atk = beforeMult_atk > 0 ? Math.log(beforeMult_atk) / Math.log(1.05) : 0;
    const afterFloor_atk = afterMult_atk > 0 ? Math.log(afterMult_atk) / Math.log(1.05) : 0;

    const beforeMult_key_combined = beforeMult_key * Math.pow(1.004, beforeFloor_atk);
    const afterMult_key_combined = afterMult_key * Math.pow(1.004, afterFloor_atk);

    // Function to render multiplier row
    const renderMultiplierRow = (label, emoji, valA, valB, floorType = null) => {
        let diffText = "";
        let colorClass = "";
        let ratio = 1.0;

        if (valB > valA) {
            ratio = valB / valA;
            diffText = `▲ ${formatRatio(ratio)}배 증가`;
            colorClass = "color: var(--accent-green); font-weight: bold;";
            if (floorType === "atk") {
                const floorDiff = Math.log(ratio) / Math.log(1.05);
                diffText += ` (약 +${floorDiff.toFixed(2)}층)`;
            } else if (floorType === "key") {
                const floorDiff = Math.log(ratio) / Math.log(1.004);
                diffText += ` (약 +${floorDiff.toFixed(2)}층)`;
            }
        } else if (valA > valB) {
            ratio = valA / valB;
            diffText = `▼ ${formatRatio(ratio)}배 감소`;
            colorClass = "color: var(--accent-red); font-weight: bold;";
            if (floorType === "atk") {
                const floorDiff = Math.log(ratio) / Math.log(1.05);
                diffText += ` (약 -${floorDiff.toFixed(2)}층)`;
            } else if (floorType === "key") {
                const floorDiff = Math.log(ratio) / Math.log(1.004);
                diffText += ` (약 -${floorDiff.toFixed(2)}층)`;
            }
        } else {
            diffText = "변동 없음";
            colorClass = "color: var(--text-muted);";
        }

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; background: rgba(255,255,255,0.01); padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.02);">
                <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                    ${emoji} ${label}
                </span>
                <div style="text-align: right;">
                    <span style="color: var(--text-muted); font-size: 0.75rem;">${formatGameNumber(valA)}배 → </span>
                    <span style="color: #fff; font-weight: 600; font-size: 0.78rem;">${formatGameNumber(valB)}배</span>
                    <span style="margin-left: 0.5rem; font-size: 0.75rem; ${colorClass}">${diffText}</span>
                </div>
            </div>
        `;
    };

    // 2) Compare active sets (detect added/removed)
    const setChanges = [];
    const getSetKey = (set) => `${set.setName}_${set.reqCount}`;
    const beforeSetKeys = beforeSets.map(getSetKey);
    const afterSetKeys = afterSets.map(getSetKey);

    // Added sets
    afterSets.forEach(set => {
        if (!beforeSetKeys.includes(getSetKey(set))) {
            const setNameKo = SET_TRANSLATIONS[set.setName] || set.setName;
            setChanges.push(`
                <div style="font-size: 0.75rem; color: var(--accent-green); background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.15); padding: 0.4rem 0.6rem; border-radius: 6px; display: flex; align-items: center; gap: 0.35rem;">
                    <span>✨ <strong>${setNameKo} ${set.reqCount}셋</strong> 활성화:</span>
                    <span>${renderOptionTextHtml(set.buffOpt, set.buffVal)}</span>
                </div>
            `);
        }
    });

    // Removed sets
    beforeSets.forEach(set => {
        if (!afterSetKeys.includes(getSetKey(set))) {
            const setNameKo = SET_TRANSLATIONS[set.setName] || set.setName;
            setChanges.push(`
                <div style="font-size: 0.75rem; color: var(--accent-red); background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); padding: 0.4rem 0.6rem; border-radius: 6px; display: flex; align-items: center; gap: 0.35rem;">
                    <span>❌ <strong>${setNameKo} ${set.reqCount}셋</strong> 활성 해제:</span>
                    <span>${renderOptionTextHtml(set.buffOpt, set.buffVal)}</span>
                </div>
            `);
        }
    });

    let setChangesHtml = "";
    if (setChanges.length > 0) {
        setChangesHtml = `
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-purple);">⚜️ 세트 효과 변동</div>
                ${setChanges.join('')}
            </div>
        `;
    }

    // 3) Display individual rune changes (Before vs After)
    const formatRuneInfo = (s) => {
        if (!s.equipped) return '<span style="color: var(--text-muted); font-style: italic;">비어 있음</span>';
        const setNameKo = s.setName ? ` (${SET_TRANSLATIONS[s.setName] || s.setName})` : '';
        const optsList = s.options.map((opt, i) => {
            const cleanLabel = OPTION_TRANSLATIONS[opt] || opt;
            const formattedVal = formatStatValue(optionsData.find(o => o.name_key === opt)?.idx || 1, s.optionValues[i]);
            return `<li style="font-size: 0.72rem; color: var(--text-secondary); margin-left: 0.5rem; list-style: square;">${cleanLabel.replace('%s', '')}: <strong>${formattedVal}</strong></li>`;
        }).join('');

        return `
            <div style="font-size: 0.78rem;">
                <span class="tag" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.1rem 0.3rem;">${s.grade}</span> 
                <strong>Lv. ${s.level}</strong>${setNameKo}
                <ul style="margin-top: 0.25rem; padding-left: 0.5rem;">${optsList}</ul>
            </div>
        `;
    };

    const runeComparisonHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem; background: rgba(0,0,0,0.1); padding: 0.65rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02);">
            <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold; margin-bottom: 0.25rem;">[이전 룬]</div>
                ${formatRuneInfo(originalSocket)}
            </div>
            <div>
                <div style="font-size: 0.75rem; color: var(--accent-blue); font-weight: bold; margin-bottom: 0.25rem;">[변경 후 룬]</div>
                ${formatRuneInfo(tempSocket)}
            </div>
        </div>
    `;

    container.innerHTML = `
        ${runeComparisonHtml}
        ${setChangesHtml}
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-blue);">⚡ 종합 곱연산 배율 변동</div>
            ${renderMultiplierRow("공격력 관련 최종 배율", "⚔️", beforeMult_atk, afterMult_atk, "atk")}
            ${renderMultiplierRow("골드 관련 최종 배율", "💰", beforeMult_gld, afterMult_gld)}
            ${renderMultiplierRow("열쇠 관련 최종 배율 (공격력 반영)", "🗝️", beforeMult_key_combined, afterMult_key_combined, "key")}
        </div>
    `;
}

// 11. 소환 확률 시뮬레이터 관련 로직
let latestSummonedRunes = [];

function getSummonProbData(level) {
    if (summonProbs.length === 0) return null;
    let match = summonProbs.find(s => s.level === level);
    if (match) return match;

    // Find closest level
    let closest = summonProbs[0];
    let minDiff = Math.abs(summonProbs[0].level - level);
    for (let i = 1; i < summonProbs.length; i++) {
        let diff = Math.abs(summonProbs[i].level - level);
        if (diff < minDiff) {
            minDiff = diff;
            closest = summonProbs[i];
        }
    }
    return closest;
}

function getUpgradePowderCost(costStr) {
    if (!costStr) return 0;
    try {
        let cleanStr = costStr.replace(/"{2,}/g, '"').replace(/^"/, '').replace(/"$/, '');
        const parsed = JSON.parse(cleanStr);
        return parseInt(parsed.count) || 0;
    } catch (e) {
        const match = costStr.match(/"count":\s*"?(\d+)"?/);
        if (match) {
            return parseInt(match[1]) || 0;
        }
    }
    return 0;
}

function formatUpgradeTime(seconds) {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const remSec = seconds % 60;
        return remSec > 0 ? `${minutes}분 ${remSec}초` : `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remMin = minutes % 60;
    if (hours < 24) {
        return remMin > 0 ? `${hours}시간 ${remMin}분` : `${hours}시간`;
    }
    const days = Math.floor(hours / 24);
    const remHour = hours % 24;
    return remHour > 0 ? `${days}일 ${remHour}시간` : `${days}일`;
}

function updateSummonLevelInfo() {
    const select = document.getElementById('summon-level-select');
    const display = document.getElementById('level-info-display');
    if (!select || !display) return;

    const level = parseInt(select.value);
    const match = getSummonProbData(level);
    if (!match) {
        display.innerHTML = '<p class="no-sets">해당 소환 레벨 테이블 정보가 없습니다.</p>';
        return;
    }

    // 확률 텍스트 빌드
    const probTexts = [];
    GRADES.forEach((g, idx) => {
        const rateKey = `grade_rate_${idx + 1}`;
        const rateVal = match[rateKey] || 0;
        if (rateVal > 0) {
            probTexts.push(`<div class="level-prob-item">${g}: ${(rateVal / 1000).toFixed(3)}%</div>`);
        }
    });

    // 룬가루 및 시간 정보 파싱
    const powderCost = getUpgradePowderCost(match.upgrade_cost);
    const upgradeTimeText = match.upgrade_time !== undefined ? formatUpgradeTime(match.upgrade_time) : "정보 없음";

    // 룬가루 기댓값 계산
    const POWDER_BY_GRADE = [5, 10, 20, 40, 100, 150, 300, 1000];
    let expectedPowderPerSummon = 0;
    GRADES.forEach((g, idx) => {
        const rateKey = `grade_rate_${idx + 1}`;
        const rateVal = match[rateKey] || 0;
        expectedPowderPerSummon += (rateVal / 100000) * POWDER_BY_GRADE[idx];
    });

    const expectedRunesNeeded = expectedPowderPerSummon > 0 ? (powderCost / expectedPowderPerSummon) : 0;

    display.innerHTML = `
        <div class="level-info-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-blue);">🚀 소환 레벨 ${level} 정보</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(다음 레벨 강화 비용 기준)</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-primary);">
                <strong>등장 가능 룬 (${match.slot_count}종)</strong>: 
                <span style="color: var(--accent-orange); font-weight: bold;">${match.runes.join(', ')}</span>
            </p>
            
            <div class="level-upgrade-details" style="display: flex; flex-direction: column; gap: 0.4rem; background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                    <span>✨ 필요 룬가루:</span>
                    <strong style="color: #fbbf24; font-size: 0.85rem;">${powderCost.toLocaleString()}개</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                    <span>⏱️ 필요 강화 시간:</span>
                    <strong style="color: var(--accent-blue); font-size: 0.85rem;">${upgradeTimeText}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); border-top: 1px solid rgba(255,255,255,0.04); padding-top: 0.4rem; margin-top: 0.2rem;">
                    <span>🎲 1회 소환당 획득 룬가루 기댓값:</span>
                    <strong style="color: var(--accent-green);">${expectedPowderPerSummon.toFixed(2)}개</strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.8rem; color: var(--text-secondary);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>📊 레벨업 필요 소환 룬 개수 기댓값:</span>
                        <strong style="color: var(--accent-purple); font-size: 0.9rem;">${expectedRunesNeeded > 0 ? Math.ceil(expectedRunesNeeded).toLocaleString() + '개' : '0개'}</strong>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 0.25rem;">
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.35rem;">등급별 소환 확률:</div>
                <div class="level-info-body" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.4rem;">
                    ${probTexts.join('')}
                </div>
            </div>
        </div>
    `;
}

function getRandomSetKeyForGrade(grade) {
    const uniqueSetKeys = Array.from(new Set(setEffects.map(s => s.name_key).filter(k => k)));
    if (uniqueSetKeys.length === 0) return "";

    const roll = Math.random() * 100; // 0 to 100%
    let noSetRate = 100;
    let ratePerSet = 0;

    if (grade === "전설") {
        noSetRate = 87.54;
        ratePerSet = 1.78;
    } else if (grade === "신화") {
        noSetRate = 75.01;
        ratePerSet = 3.57;
    } else if (grade === "불멸") {
        noSetRate = 49.95;
        ratePerSet = 7.15;
    } else {
        return "";
    }

    if (roll <= noSetRate) {
        return "";
    }

    const setIndex = Math.floor((roll - noSetRate) / ratePerSet);
    if (setIndex >= 0 && setIndex < uniqueSetKeys.length) {
        return uniqueSetKeys[setIndex];
    }
    return "";
}

function getRandomSetForGrade(grade) {
    const key = getRandomSetKeyForGrade(grade);
    if (!key) return "없음";
    return SET_TRANSLATIONS[key] || key;
}

function rollRandomOptionsForRune(grade) {
    let optionCount = 1;
    if (grade === "일반" || grade === "고급") {
        optionCount = 1;
    } else if (grade === "희귀" || grade === "유물" || grade === "영웅") {
        optionCount = 2;
    } else {
        optionCount = 3;
    }

    const validOptions = optionsData.filter(o => o.name_key && o.rate > 0);
    const totalRate = validOptions.reduce((sum, o) => sum + o.rate, 0);

    const options = [];
    const baseValues = [];

    for (let i = 0; i < optionCount; i++) {
        let selectedOpt = null;
        let roll = Math.random() * totalRate;
        let runningSum = 0;

        for (let attempt = 0; attempt < 5; attempt++) {
            roll = Math.random() * totalRate;
            runningSum = 0;
            for (let o of validOptions) {
                runningSum += o.rate;
                if (roll <= runningSum) {
                    selectedOpt = o;
                    break;
                }
            }
            if (selectedOpt && !options.includes(selectedOpt.name_key)) {
                break;
            }
        }

        if (!selectedOpt) {
            selectedOpt = validOptions[Math.floor(Math.random() * validOptions.length)];
        }

        options.push(selectedOpt.name_key);

        const minVal = Math.round(selectedOpt.min);
        const maxVal = Math.round(selectedOpt.max);
        const rollInt = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

        baseValues.push(rollInt);
    }

    return { options, baseValues };
}

function getFinalOptionValue(grade, optName, baseValue, level) {
    const match = optionsData.find(o => o.name_key === optName);
    if (!match) return 0;

    const gradeIdx = GRADES.indexOf(grade) + 1; // 1~8
    const baseValueMultiplier = match[`grade_value_${gradeIdx}`] || 0;
    const scaleFactor = 1 + (level * (match.floor_value || 0));

    return baseValue * baseValueMultiplier * scaleFactor;
}

function calculateRuneFloorContribution(rune, spec, level, includeKeys) {
    let addedSkins = 0;
    let opt30Val = 0;
    let multAtk = 1.0;
    let multKey = 1.0;

    const values = rune.options.map((opt, idx) => {
        return getFinalOptionValue(rune.grade, opt, rune.baseValues[idx], level);
    });

    for (let i = 0; i < rune.options.length; i++) {
        const opt = rune.options[i];
        if (!opt) continue;
        const val = values[i];

        if (opt === "t_ui_maches_option_25") {
            addedSkins += val;
        } else if (opt === "t_ui_maches_option_30") {
            opt30Val += val;
        }
    }

    const addedSkinsClamped = Math.min(addedSkins, 30);
    const totalSkins = (spec.skins || 0) + addedSkinsClamped;

    for (let i = 0; i < rune.options.length; i++) {
        const opt = rune.options[i];
        if (!opt) continue;
        const val = values[i];

        if (opt === "t_ui_maches_option_25" || opt === "t_ui_maches_option_26" || opt === "t_ui_maches_option_27" || opt === "t_ui_maches_option_28" || opt === "t_ui_maches_option_29") {
            continue;
        }
        if (opt === "t_ui_maches_option_30") {
            continue;
        }

        if (ATTACK_OPTIONS.includes(opt)) {
            let val_eff = getEffectiveValue(opt, val, spec);
            if (opt === "t_ui_maches_option_23") {
                val_eff = val * totalSkins;
            }
            multAtk *= (1 + val_eff / 100);
        }

        if (KEY_OPTIONS.includes(opt)) {
            let val_eff = getEffectiveValue(opt, val, spec);
            multKey *= (1 + val_eff / 100);
        }
    }

    if (opt30Val > 0) {
        const opt30Clamped = Math.min(opt30Val, 100);
        const val_eff = getEffectiveValue("t_ui_maches_option_30", opt30Clamped, spec);
        multAtk *= Math.pow(1.452, val_eff);
    }

    multAtk *= Math.pow(2.5, addedSkinsClamped);

    const floor_atk = multAtk > 0 ? Math.log(multAtk) / Math.log(1.05) : 0;

    if (includeKeys) {
        const mult_key_combined = multKey * Math.pow(1.004, floor_atk);
        return mult_key_combined > 0 ? Math.log(mult_key_combined) / Math.log(1.004) : 0;
    } else {
        return floor_atk;
    }
}

function filterAndRenderSummonResults() {
    const includeKeys = document.getElementById('summon-include-keys')?.checked || false;
    const onlySets = document.getElementById('summon-only-sets')?.checked || false;
    const highestFloor = parseInt(document.getElementById('summon-opt-level')?.value) || 2001;
    const optLevel = Math.max(0, Math.floor((highestFloor - 1) / 200));
    const spec = getUserSpecValues();

    // Save filter settings to localStorage
    localStorage.setItem('maf_rune_summon_include_keys', includeKeys);
    localStorage.setItem('maf_rune_summon_only_sets', onlySets);
    localStorage.setItem('maf_rune_summon_opt_level', highestFloor);

    const tbody = document.getElementById('summon-legendary-list');
    if (!tbody) return;

    // Filter and compute contributions
    let processedRunes = latestSummonedRunes.map(rune => {
        const floorContrib = calculateRuneFloorContribution(rune, spec, optLevel, includeKeys);
        return {
            ...rune,
            floorContrib
        };
    });

    if (onlySets) {
        processedRunes = processedRunes.filter(r => r.setName !== "");
    }

    // Sort by contribution descending
    processedRunes.sort((a, b) => b.floorContrib - a.floorContrib);

    // Limit to top 100
    const topRunes = processedRunes.slice(0, 100);

    tbody.innerHTML = '';
    if (topRunes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">조건에 만족하는 획득 룬이 없습니다.</td></tr>`;
    } else {
        topRunes.forEach(item => {
            const tr = document.createElement('tr');
            let gradeStyle = "";
            if (item.grade === "전설") gradeStyle = "color:#a78bfa; font-weight:bold;";
            if (item.grade === "신화") gradeStyle = "color:#f472b6; font-weight:bold;";
            if (item.grade === "불멸") gradeStyle = "color:#f87171; font-weight:bold;";

            const setStyle = item.setName ? "color:#fbbf24; font-weight:bold;" : "color:var(--text-muted);";
            const setKo = item.setName ? (SET_TRANSLATIONS[item.setName] || item.setName) : "없음";

            // Format option values using current optLevel
            const optionValues = item.options.map((opt, idx) => {
                return getFinalOptionValue(item.grade, opt, item.baseValues[idx], optLevel);
            });

            // Socket object for preferred options display
            const socket = {
                equipped: true,
                grade: item.grade,
                level: optLevel,
                setName: item.setName,
                options: item.options,
                optionValues: optionValues
            };

            const optLinesHtml = item.options.map((opt, idx) => {
                const cleanLabel = OPTION_TRANSLATIONS[opt] || opt;
                const optIdx = optionsData.find(o => o.name_key === opt)?.idx || 1;
                const formattedVal = formatStatValue(optIdx, optionValues[idx]);
                return `<div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; text-align: left;">${cleanLabel.replace('%s', '')}: <strong>${formattedVal}</strong></div>`;
            }).join('');

            const prefText = getPreferredOptionsText(socket);
            const prefHtml = prefText ? `<div style="margin-top: 0.15rem; text-align: left;">${prefText}</div>` : '';

            tr.innerHTML = `
                <td><strong>${item.rune}의 룬</strong></td>
                <td><span style="${gradeStyle}">${item.grade}</span></td>
                <td><span style="${setStyle}">${setKo}</span></td>
                <td>
                    <div class="summon-opt-list">${optLinesHtml}</div>
                    ${prefHtml}
                </td>
                <td><span style="color: var(--accent-blue); font-weight: bold;">+${item.floorContrib.toFixed(2)}층</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function renderSummonResults(count, gradeCounts) {
    const resultBox = document.getElementById('summon-results');
    if (!resultBox) return;
    resultBox.style.display = 'flex';
    document.getElementById('summary-total-count').innerText = `총 ${count.toLocaleString()}회 소환`;

    const gridContainer = document.getElementById('summon-grades-grid');
    if (gridContainer) {
        gridContainer.innerHTML = '';
        GRADES.forEach(grade => {
            const c = gradeCounts[grade] || 0;
            const pct = (c / count) * 100;

            const card = document.createElement('div');
            card.className = `grade-result-card grade-${grade}`;
            card.innerHTML = `
                <div class="grade-result-header">
                    <span class="grade-result-name">${grade}</span>
                    <span class="grade-result-percent">${pct.toFixed(3)}%</span>
                </div>
                <div class="grade-result-value">${c.toLocaleString()}</div>
                <div class="grade-result-bar-bg">
                    <div class="grade-result-bar" style="width: ${pct}%"></div>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    filterAndRenderSummonResults();
}

function runSummonSimulation() {
    const levelSelect = document.getElementById('summon-level-select');
    const countSelect = document.getElementById('summon-count-select');
    const resultBox = document.getElementById('summon-results');

    if (!levelSelect || !countSelect || !resultBox) return;

    const level = parseInt(levelSelect.value);
    const count = parseInt(countSelect.value);

    const probData = getSummonProbData(level);
    if (!probData) {
        alert("소환 레벨 데이터를 찾을 수 없습니다.");
        return;
    }

    // 누적 가중치 계산
    const cumulativeProbs = [];
    let cumulative = 0;
    GRADES.forEach((grade, idx) => {
        const rateKey = `grade_rate_${idx + 1}`;
        const rateVal = probData[rateKey] || 0;
        if (rateVal > 0) {
            cumulative += rateVal;
            cumulativeProbs.push({ grade, limit: cumulative });
        }
    });

    // 0회 초기화
    const gradeCounts = {};
    GRADES.forEach(g => gradeCounts[g] = 0);
    const allSummoned = [];

    // 대량 난수 연산
    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100000; // rate_parameters = 100000 분율 모수
        let selectedGrade = "일반";

        for (let j = 0; j < cumulativeProbs.length; j++) {
            if (roll <= cumulativeProbs[j].limit) {
                selectedGrade = cumulativeProbs[j].grade;
                break;
            }
        }

        gradeCounts[selectedGrade]++;

        const runeIdx = Math.floor(Math.random() * probData.runes.length);
        const runeName = probData.runes[runeIdx];

        // 가상 세트 부여 여부 (전설 등급 이상만 가능)
        let setKey = "";
        if (selectedGrade === "전설" || selectedGrade === "신화" || selectedGrade === "불멸") {
            setKey = getRandomSetKeyForGrade(selectedGrade);
        }

        // Roll random options and base values
        const { options, baseValues } = rollRandomOptionsForRune(selectedGrade);

        allSummoned.push({
            rune: runeName,
            grade: selectedGrade,
            setName: setKey,
            options: options,
            baseValues: baseValues
        });
    }

    // Sort allSummoned by contribution to keep only the top 1000
    const includeKeys = document.getElementById('summon-include-keys')?.checked || false;
    const highestFloor = parseInt(document.getElementById('summon-opt-level')?.value) || 2001;
    const optLevel = Math.max(0, Math.floor((highestFloor - 1) / 200));
    const spec = getUserSpecValues();

    const withContrib = allSummoned.map(r => {
        const floorContrib = calculateRuneFloorContribution(r, spec, optLevel, includeKeys);
        return { ...r, tempContrib: floorContrib };
    });

    withContrib.sort((a, b) => b.tempContrib - a.tempContrib);

    // Keep top 1000 to prevent local storage quota exceeded
    latestSummonedRunes = withContrib.slice(0, 1000).map(r => {
        const { tempContrib, ...rest } = r;
        return rest;
    });

    // 로컬 스토리지 저장
    localStorage.setItem('maf_rune_summon_state', JSON.stringify({
        level,
        count,
        gradeCounts,
        summonedRunesList: latestSummonedRunes
    }));

    // UI 그리기
    renderSummonResults(count, gradeCounts);
}

// 12. 공통 스탯 수치 포맷팅 함수
function formatStatValue(optionIdx, value) {
    if (isPercentOption(optionIdx)) {
        return formatGameNumber(value) + "%";
    }
    if (optionIdx === 25) {
        return Math.floor(value).toLocaleString() + "개";
    }
    return formatGameNumber(value);
}

// DOM 로드 완료 트리거
window.addEventListener('DOMContentLoaded', initData);
