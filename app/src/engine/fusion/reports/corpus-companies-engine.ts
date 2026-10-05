/* The companies of the research bundle as audit clients — the primary statements of 47 of its 49 reports
   (global_financial_and_audit_research_bundle_extended_verified.pdf, 12,506 pages), transcribed line by line from the
   bundle pages cited for each (income statement «is», balance sheet «bs»), current year and comparative.
   McDonald's (letter and highlights) and L'Oréal (overview) carry no statements in the bundle.
   Every company becomes a balanced two-year trial balance the engagement file can open, so the whole audit
   (materiality, risks, key audit matters, the council rounds, the reports) runs on a real published company and
   can be compared with what its auditor actually reported (audit/corpus-replay-engine.ts).
   Units: millions of the reporting currency as published (Indian groups: crore, ₹10 million). The statement lines
   the bundle does not break out are carried in «other» accounts so both years balance; banks put loans in
   receivables and customer deposits in payables, insurers their claims reserves in provisions. */
import { reviewedPublishedSource } from './published-source-engine';
import { REPORTS, SECTOR_AR, type Report } from '../audit/global-benchmarks-engine';

export type Pair = readonly [current: number, prior: number];
export type Figures = {
  kind: 'corporate' | 'bank' | 'insurer'; holding?: boolean; condensed?: boolean; currency: string; unit: 'm' | 'crore'; pages: { is: number; bs: number };
  rev?: Pair; cogs?: Pair; op?: Pair; pbt: Pair; tax: Pair; net: Pair; ecl?: Pair;
  cash?: Pair; recv?: Pair; allow?: Pair; inv?: Pair; invst?: Pair; ppe?: Pair; intang?: Pair; ca?: Pair; assets: Pair;
  pay?: Pair; contract?: Pair; taxp?: Pair; prov?: Pair; reserves?: Pair; cl?: Pair; debt?: Pair; pens?: Pair; equity: Pair;
};

/* ---------- the statements, as published (current, prior) ---------- */
export const FIGURES: Record<string, Figures> = {
  'amazon-2023': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 51, bs: 53 },
    rev: [574785, 513983], cogs: [304739, 288831], op: [36852, 12248], pbt: [37557, -5936], tax: [7120, -3217], net: [30425, -2722], cash: [73387, 53888], recv: [52253, 42360], inv: [33318, 34405], invst: [13393, 16138], ppe: [276690, 252838], intang: [22789, 20288], ca: [172351, 146791], assets: [527854, 462675], pay: [84981, 79600], cl: [164917, 155393], debt: [58314, 67150], equity: [201875, 146043] },
  'apple-2024': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 125, bs: 127 },
    rev: [391035, 383285], cogs: [210352, 214137], op: [123216, 114301], pbt: [123485, 113736], tax: [29749, 16741], net: [93736, 96995], cash: [29943, 29965], recv: [33410, 29508], inv: [7286, 6331], invst: [126707, 132134], ppe: [45680, 43715], intang: [0, 0], ca: [152987, 143566], assets: [364980, 352583], pay: [68960, 62611], cl: [176392, 145308], debt: [106629, 111088], equity: [56950, 62146] },
  'cisco-2024': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 293, bs: 292 },
    rev: [53803, 56998], cogs: [18975, 21245], op: [12181, 15031], pbt: [12234, 15318], tax: [1914, 2705], net: [10320, 12613], cash: [7508, 10123], recv: [6685, 5854], inv: [3373, 3644], invst: [10346, 16023], ppe: [2090, 2085], intang: [69879, 40353], ca: [36862, 43348], assets: [124413, 101852], pay: [2304, 2313], taxp: [5424, 9991], cl: [40584, 31309], debt: [30962, 8391], equity: [45457, 44353] },
  'walmart-2023': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 402, bs: 404 },
    rev: [611289, 572754], cogs: [463721, 429000], op: [20428, 25942], pbt: [17016, 18696], tax: [5724, 4756], net: [11292, 13940], cash: [8625, 14760], recv: [7933, 8280], inv: [56576, 56511], invst: [0, 0], ppe: [119234, 112624], intang: [28174, 29014], ca: [75655, 81070], assets: [243197, 244860], pay: [53742, 55261], taxp: [727, 851], cl: [92198, 87379], debt: [39212, 38077], equity: [83754, 91891] },
  'adobe-2024': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 501, bs: 500 },
    rev: [21505, 19409], cogs: [2358, 2354], op: [6741, 6650], pbt: [6931, 6799], tax: [1371, 1371], net: [5560, 5428], cash: [7613, 7141], recv: [2072, 2224], inv: [0, 0], invst: [273, 701], ppe: [2217, 2388], intang: [13570, 13893], ca: [11232, 11084], assets: [30230, 29779], pay: [361, 314], taxp: [667, 599], cl: [10521, 8251], debt: [5628, 3634], equity: [14105, 16518] },
  'jpmorgan-2023': { kind: 'bank', currency: 'USD', unit: 'm', pages: { is: 751, bs: 753 },
    rev: [158104, 128695], pbt: [61612, 46166], tax: [12060, 8490], net: [49552, 37676], ecl: [9320, 6389], cash: [624151, 567234], recv: [1301286, 1115921], allow: [22420, 19726], invst: [571552, 631162], ppe: [30157, 27734], intang: [64381, 60859], assets: [3875393, 3665743], pay: [2400688, 2340179], debt: [391825, 295865], equity: [327878, 292332] },
  'apple-2020': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 945, bs: 947 },
    rev: [274515, 260174], cogs: [169559, 161782], op: [66288, 63930], pbt: [67091, 65737], tax: [9680, 10481], net: [57411, 55256], cash: [38016, 48844], recv: [16120, 22926], inv: [4061, 4106], invst: [153814, 157054], ppe: [36766, 37378], intang: [0, 0], ca: [143713, 162819], assets: [323888, 338516], pay: [42296, 46236], cl: [105392, 105718], debt: [112436, 108047], equity: [65339, 90488] },
  'amazon-2024': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 1065, bs: 1067 },
    rev: [637959, 574785], cogs: [326288, 304739], op: [68593, 36852], pbt: [68614, 37557], tax: [9265, 7120], net: [59248, 30425], cash: [78779, 73387], recv: [55451, 52253], inv: [34214, 33318], invst: [22423, 13393], ppe: [328806, 276690], intang: [23074, 22789], ca: [190867, 172351], assets: [624894, 527854], pay: [94363, 84981], cl: [179431, 164917], debt: [52623, 58314], equity: [285970, 201875] },
  'apple-2023': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 1138, bs: 1140 },
    rev: [383285, 394328], cogs: [214137, 223546], op: [114301, 119437], pbt: [113736, 119103], tax: [16741, 19300], net: [96995, 99803], cash: [29965, 23646], recv: [29508, 28184], inv: [6331, 4946], invst: [132134, 145463], ppe: [43715, 42117], intang: [0, 0], ca: [143566, 135405], assets: [352583, 352755], pay: [62611, 64115], cl: [145308, 153982], debt: [111088, 120069], equity: [62146, 50672] },
  'berkshire-2025': { kind: 'insurer', currency: 'USD', unit: 'm', pages: { is: 1281, bs: 1279 },
    rev: [371444, 371433], cogs: [167747, 170711], pbt: [82459, 110376], tax: [15199, 20815], net: [67260, 89561], cash: [51877, 47729], recv: [78554, 76188], inv: [24424, 24008], invst: [657006, 604558], ppe: [235160, 222929], intang: [116876, 118518], assets: [1222176, 1153881], pay: [57269, 55715], taxp: [86955, 85870], reserves: [151761, 147594], debt: [129081, 124762], equity: [719703, 651655] },
  'jpmorgan-2025': { kind: 'bank', currency: 'USD', unit: 'm', pages: { is: 1538, bs: 1540 },
    rev: [182447, 177556], pbt: [72595, 75081], tax: [15547, 16610], net: [57048, 58471], ecl: [14212, 10678], cash: [343338, 469317], recv: [1467664, 1323643], allow: [25765, 24345], invst: [777332, 681320], ppe: [36244, 32223], intang: [64458, 64560], assets: [4424900, 4002814], pay: [2559320, 2406032], debt: [435206, 401418], equity: [362438, 344758] },
  'bofa-2025': { kind: 'bank', currency: 'USD', unit: 'm', pages: { is: 1772, bs: 1772 },
    rev: [113097, 105856], pbt: [37695, 33223], tax: [7186, 6250], net: [30509, 26973], ecl: [5675, 5821], cash: [231845, 290114], recv: [1172497, 1082595], allow: [13203, 13240], invst: [925635, 917284], ppe: [12516, 12168], intang: [69021, 69021], assets: [3411738, 3261299], pay: [2018729, 1965467], debt: [317816, 283279], equity: [303243, 293963] },
  'pepsico-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 1884, bs: 1888 },
    rev: [93925, 91854], cogs: [43066, 41744], op: [11498, 12887], pbt: [10244, 11946], tax: [1949, 2320], net: [8295, 9626], cash: [9159, 8505], recv: [11506, 10333], inv: [5845, 5306], invst: [2409, 2746], ppe: [29905, 28008], intang: [33982, 32335], ca: [27949, 25826], assets: [107399, 99467], pay: [25903, 24454], cl: [32764, 31536], debt: [49182, 44306], equity: [20547, 18171] },
  'pg-2026': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 2004, bs: 2005 },
    rev: [87032, 84284], cogs: [43362, 41164], op: [19748, 20451], pbt: [20377, 20167], tax: [4233, 4102], net: [16144, 16065], cash: [9942, 9556], recv: [6056, 6185], inv: [8170, 7551], invst: [0, 0], ppe: [25360, 23897], intang: [62720, 63560], ca: [26208, 25392], assets: [126521, 125231], pay: [16306, 15227], cl: [38694, 36058], debt: [34138, 34508], equity: [54311, 52284] },
  'homedepot-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 2087, bs: 2086 },
    rev: [164683, 159514], cogs: [109818, 106206], op: [20890, 21526], pbt: [18602, 19406], tax: [4446, 4600], net: [14156, 14806], cash: [1389, 1659], recv: [5597, 4903], inv: [25817, 23451], invst: [0, 0], ppe: [37225, 35294], intang: [32673, 28458], ca: [34391, 31683], assets: [105095, 96119], pay: [11491, 11938], taxp: [114, 832], cl: [32424, 28661], debt: [55772, 53383], equity: [12813, 6640] },
  'nestle-2025': { kind: 'corporate', currency: 'CHF', unit: 'm', pages: { is: 2210, bs: 2212 },
    rev: [89490, 91354], cogs: [48694, 48670], op: [12277, 14724], pbt: [10751, 13239], tax: [2640, 3314], net: [9254, 11174], cash: [4579, 5556], recv: [10561, 11251], inv: [12813, 13260], invst: [17388, 20291], ppe: [32549, 33706], intang: [44309, 49840], ca: [31969, 35188], assets: [127151, 139264], pay: [20023, 21807], taxp: [2338, 2435], prov: [1830, 1951], cl: [40694, 42863], debt: [57852, 63560], pens: [2299, 2629], equity: [33058, 36693] },
  'roche-2025': { kind: 'corporate', currency: 'CHF', unit: 'm', pages: { is: 2392, bs: 2395 },
    rev: [63356, 62395], cogs: [16645, 16283], op: [18476, 13417], pbt: [16973, 11793], tax: [3174, 2606], net: [13799, 9187], cash: [5582, 6975], recv: [11506, 11297], inv: [7479, 7606], invst: [9894, 10342], ppe: [22934, 23740], intang: [26813, 25179], ca: [38729, 40036], assets: [100703, 101801], pay: [5779, 4894], taxp: [2867, 2923], prov: [2798, 2805], cl: [28001, 27023], debt: [31636, 34654], pens: [3950, 4381], equity: [37880, 36161] },
  'novartis-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 2713, bs: 2715 },
    rev: [56674, 51722], cogs: [13699, 12827], op: [17644, 14544], pbt: [16352, 13640], tax: [2385, 1701], net: [13967, 11939], cash: [11435, 11459], recv: [8937, 7423], inv: [6269, 5723], invst: [2601, 4132], ppe: [12352, 10873], intang: [54978, 51671], ca: [30460, 29704], assets: [110949, 102246], pay: [4456, 4572], taxp: [1969, 1599], cl: [27278, 28692], debt: [33537, 29598], equity: [46549, 44126] },
  'ubs-2025': { kind: 'bank', currency: 'USD', unit: 'm', pages: { is: 3055, bs: 3057 },
    rev: [49573, 48611], pbt: [8853, 6821], tax: [1056, 1675], net: [7797, 5146], ecl: [524, 551], cash: [209858, 223329], recv: [653846, 579967], ppe: [16057, 15498], intang: [6948, 6887], assets: [1617427, 1565028], pay: [788367, 745777], debt: [328500, 322128], equity: [90484, 85574] },
  'allianz-2025': { kind: 'insurer', holding: true, currency: 'EUR', unit: 'm', pages: { is: 3203, bs: 3199 },
    rev: [16657, 17302], pbt: [9388, 7857], tax: [35, -744], net: [9352, 8601], cash: [235, 846], recv: [5952, 6369], inv: [0, 0], invst: [130425, 129183], ppe: [13, 14], intang: [5, 6], assets: [137319, 137156], prov: [11512, 10509], reserves: [27554, 26086], debt: [17894, 18678], equity: [44619, 43167] },
  'mercedes-2025': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 3492, bs: 3494 },
    rev: [132214, 145594], cogs: [109881, 117018], op: [5820, 13599], pbt: [6284, 14147], tax: [953, 3738], net: [5331, 10409], cash: [12254, 14511], recv: [82140, 94840], inv: [23933, 26234], invst: [17603, 20516], ppe: [66812, 71757], intang: [20547, 19436], ca: [102132, 101767], assets: [255466, 265010], pay: [10665, 11312], taxp: [1666, 2047], prov: [15458, 15020], cl: [73768, 74826], debt: [100006, 112798], pens: [807, 952], equity: [94240, 93630] },
  'volkswagen-2025': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 4112, bs: 4115 },
    rev: [321913, 324656], cogs: [270671, 265184], op: [8868, 19060], pbt: [9307, 16806], tax: [2403, 4411], net: [6904, 12394], cash: [38801, 40296], recv: [192016, 191072], inv: [56042, 56720], invst: [47493, 43948], ppe: [155562, 144645], intang: [91474, 93333], ca: [247865, 245231], assets: [644467, 632905], pay: [30490, 29772], taxp: [5850, 6506], prov: [51669, 51064], cl: [226525, 217039], debt: [264703, 254081], pens: [22826, 27602], equity: [203054, 196731] },
  'telekom-2025': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 4552, bs: 4551 },
    rev: [119081, 115769], cogs: [48747, 47374], op: [24822, 26277], pbt: [19499, 22958], tax: [4573, 5301], net: [14926, 17657], cash: [7818, 8472], recv: [16842, 16411], inv: [2866, 2451], invst: [11087, 7343], ppe: [93370, 98826], intang: [133650, 149115], ca: [41177, 37161], assets: [289769, 304934], pay: [9581, 9489], taxp: [563, 736], prov: [7919, 7869], cl: [36848, 35182], debt: [110339, 112191], pens: [1883, 3209], equity: [92231, 98640] },
  'bp-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 4861, bs: 4864 },
    rev: [189335, 189185], cogs: [110640, 113941], op: [12642, 11297], pbt: [7746, 6782], tax: [6451, 5553], net: [1295, 1229], cash: [36556, 39204], recv: [26014, 27127], inv: [22499, 23232], invst: [21740, 21489], ppe: [98633, 100238], intang: [18497, 24534], ca: [101786, 102834], assets: [278526, 282228], pay: [56843, 58411], taxp: [1262, 1573], prov: [20379, 18288], cl: [80581, 82241], debt: [57958, 59547], pens: [4816, 4873], equity: [74000, 78318] },
  'unilever-2025': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 5231, bs: 5234 },
    rev: [50503, 52479], op: [9037, 8829], pbt: [8693, 8371], tax: [2481, 2332], net: [10011, 6369], cash: [3941, 6136], recv: [7346, 6011], inv: [4043, 5177], invst: [4186, 2901], ppe: [8992, 11669], intang: [34764, 40901], ca: [17066, 19194], assets: [70471, 79750], pay: [16939, 16690], taxp: [1742, 1263], prov: [1128, 1402], cl: [21662, 25234], debt: [28278, 32053], pens: [944, 1194], equity: [17587, 22555] },
  'astrazeneca-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 5512, bs: 5513 },
    rev: [58739, 54073], cogs: [10633, 10207], op: [13743, 10003], pbt: [12402, 8691], tax: [2169, 1650], net: [10233, 7041], cash: [5711, 5488], recv: [15177, 12972], inv: [6557, 5288], invst: [2555, 2066], ppe: [14703, 11647], intang: [59088, 58202], ca: [28723, 25827], assets: [114074, 104035], pay: [25280, 22465], taxp: [1784, 1644], prov: [1604, 2190], cl: [30617, 27866], debt: [27819, 28843], pens: [1105, 1330], equity: [48719, 40871] },
  'gsk-2025': { kind: 'corporate', currency: 'GBP', unit: 'm', pages: { is: 5805, bs: 5806 },
    rev: [32667, 31376], cogs: [9017, 9048], op: [7932, 4021], pbt: [7401, 3477], tax: [1112, 526], net: [6289, 2951], cash: [3397, 3870], recv: [7471, 6836], inv: [5924, 5669], invst: [1135, 1217], ppe: [10048, 10073], intang: [23766, 22497], ca: [17510, 16997], assets: [61118, 59463], pay: [15381, 15335], taxp: [498, 703], prov: [1548, 2535], cl: [21391, 21697], debt: [17720, 16986], pens: [1687, 1864], equity: [15956, 13086] },
  'hsbc-2025': { kind: 'bank', currency: 'USD', unit: 'm', pages: { is: 6212, bs: 6214 },
    rev: [68274, 65854], pbt: [29907, 32309], tax: [6776, 7310], net: [23131, 24999], ecl: [3850, 3414], cash: [242859, 267674], recv: [988399, 930658], invst: [567211, 493166], intang: [13107, 12384], assets: [3233034, 3017048], pay: [1786828, 1654955], debt: [128081, 131743], equity: [205666, 192273] },
  'totalenergies-2024': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 6373, bs: 6375 },
    rev: [195610, 218945], cogs: [127664, 143041], pbt: [26806, 34811], tax: [10775, 13301], net: [16031, 21510], cash: [25844, 27263], recv: [19281, 23442], inv: [18868, 19317], invst: [42984, 38585], ppe: [109095, 108916], intang: [34238, 33083], ca: [96571, 99529], assets: [285487, 283654], pay: [39932, 41335], prov: [19872, 21257], cl: [87960, 88785], debt: [53557, 50068], pens: [1753, 1993], equity: [120255, 119453] },
  'airbus-2023': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 7283, bs: 7285 },
    rev: [65446, 58763], cogs: [55402, 48192], op: [4603, 5325], pbt: [4769, 5075], tax: [1156, 939], net: [3613, 4136], cash: [16469, 15823], recv: [4725, 4953], inv: [33741, 32202], invst: [16551, 14697], ppe: [17236, 16542], intang: [16929, 16768], ca: [63948, 63002], assets: [118871, 115944], pay: [14323, 13261], contract: [48498, 45913], taxp: [740, 817], prov: [9828, 11023], cl: [53676, 52595], debt: [13591, 12773], equity: [17730, 12982] },
  'sanofi-2025': { kind: 'corporate', currency: 'EUR', unit: 'm', pages: { is: 7644, bs: 7642 },
    rev: [46716, 44286], cogs: [13049, 13205], op: [6344, 7252], pbt: [6175, 6698], tax: [1043, 1204], net: [7851, 5618], cash: [7657, 7441], recv: [8410, 7677], inv: [10214, 9431], invst: [3259, 316], ppe: [11511, 11601], intang: [67561, 66013], ca: [30952, 42588], assets: [126805, 132798], pay: [7361, 7551], taxp: [2832, 2209], prov: [6703, 8096], cl: [28345, 29162], debt: [18590, 16000], equity: [71710, 77857] },
  'toyota-2026': { kind: 'corporate', currency: 'JPY', unit: 'm', pages: { is: 7910, bs: 7908 },
    rev: [50684952, 48036704], cogs: [42221212, 38458666], op: [3766216, 4795586], pbt: [5152996, 6414590], tax: [1167234, 1624835], net: [3985761, 4789755], cash: [12659622, 8982404], recv: [42762642, 37304757], inv: [5134996, 4598232], invst: [20460792, 22616651], ppe: [17968597, 15916761], intang: [1392755, 1363266], ca: [42824081, 37078676], assets: [105522331, 93601350], pay: [5856945, 5527347], taxp: [711675, 505500], prov: [3027597, 2680203], cl: [33605019, 29434220], debt: [43205469, 38792879], pens: [1022483, 1019568], equity: [41020068, 36878913] },
  'honda-2023': { kind: 'corporate', currency: 'JPY', unit: 'm', pages: { is: 8143, bs: 8142 },
    rev: [16907725, 14552696], cogs: [13576133, 11567923], op: [780769, 871232], pbt: [879565, 1070190], tax: [162256, 309489], net: [717309, 760701], cash: [3803014, 3674931], recv: [6955023, 6331264], inv: [2167184, 1918548], invst: [2034908, 2004801], ppe: [7894401, 8238536], intang: [870900, 849507], ca: [9578348, 8841425], assets: [24670067, 23973153], pay: [1426333, 1236233], taxp: [86252, 96116], prov: [632870, 522013], cl: [6652124, 6004399], debt: [7665168, 8102556], pens: [255852, 282054], equity: [11502291, 10772546] },
  'softbank-2026': { kind: 'corporate', condensed: true, currency: 'JPY', unit: 'm', pages: { is: 8334, bs: 8350 },
    rev: [7798650, 7243752], cogs: [3782511, 3489549], pbt: [6134905, 1704721], tax: [502929, 101613], net: [5631976, 1603108], cash: [5362150, 3713028], recv: [3302622, 3008144], inv: [240179, 198291], invst: [24234980, 11913917], ppe: [4368171, 3688146], intang: [9784375, 8196493], ca: [11815601, 9432918], assets: [60749547, 45013756], equity: [20468432, 13953026] },
  'mufg-2026': { kind: 'bank', currency: 'JPY', unit: 'm', pages: { is: 8620, bs: 8618 },
    rev: [6937653, 5658732], pbt: [2509495, 1795576], tax: [625591, 527938], net: [1883904, 1267638], ecl: [226112, 121790], cash: [90369985, 109298114], recv: [143584884, 130195440], allow: [1234340, 1243075], invst: [53819507, 58318547], ppe: [1084857, 919854], intang: [2041554, 1960679], assets: [425581652, 405940211], pay: [260755340, 249415006], debt: [21884349, 21022407], equity: [20840057, 19249738] },
  'smfg-2026': { kind: 'bank', currency: 'JPY', unit: 'm', pages: { is: 8799, bs: 8797 },
    rev: [10790853, 10174894], pbt: [2251725, 1699943], tax: [666910, 513065], net: [1584815, 1186877], ecl: [192226, 167639], cash: [73696930, 75590583], recv: [117629215, 111136239], allow: [1007469, 925931], invst: [39974120, 40760968], ppe: [1074673, 1006556], intang: [1151037, 1017322], assets: [328511145, 306282015], pay: [185674241, 171498651], debt: [25513660, 25435801], equity: [15933144, 14841509] },
  'samsung-2025': { kind: 'corporate', currency: 'KRW', unit: 'm', pages: { is: 8923, bs: 8920 },
    rev: [333605938, 300870903], cogs: [202235513, 186562268], op: [43601051, 32725961], pbt: [49481471, 37529734], tax: [4274666, 3078383], net: [45206805, 34451351], cash: [57856378, 53705579], recv: [51127642, 43623073], inv: [52636828, 51754865], invst: [99338363, 83295009], ppe: [215304784, 205945209], intang: [29480565, 23738566], ca: [247684612, 227062266], assets: [566942110, 514531948], pay: [13039380, 12370177], taxp: [7037174, 4340171], prov: [10590970, 11336513], cl: [106411348, 93326299], debt: [25239139, 19330184], pens: [558520, 521410], equity: [436320337, 402192070] },
  'honhai-2025': { kind: 'corporate', condensed: true, currency: 'TWD', unit: 'm', pages: { is: 9173, bs: 9172 },
    rev: [8103105, 6859615], cogs: [7604944, 6430670], op: [259223, 200607], pbt: [293445, 211875], tax: [78410, 40196], net: [215034, 171679], invst: [197613, 200117], ppe: [543393, 468838], ca: [3961827, 3375765], assets: [5104672, 4394500], cl: [2710849, 2174818], equity: [1970763, 1851588] },
  'tencent-2025': { kind: 'corporate', currency: 'RMB', unit: 'm', pages: { is: 9315, bs: 9317 },
    rev: [751766, 660257], cogs: [329173, 311011], op: [241562, 208099], pbt: [277249, 241485], tax: [47448, 45018], net: [229801, 196467], cash: [141041, 132519], recv: [49930, 48203], inv: [530, 440], invst: [957219, 817687], ppe: [200231, 134084], intang: [205999, 196127], ca: [595460, 496180], assets: [2038986, 1780995], pay: [121127, 118712], contract: [112519, 106333], taxp: [18558, 16586], cl: [412751, 396909], debt: [387733, 338615], equity: [1241065, 1053896] },
  'reliance-2026': { kind: 'corporate', currency: 'INR', unit: 'crore', pages: { is: 9568, bs: 9567 },
    rev: [1075675, 980136], cogs: [688663, 629689], pbt: [123162, 106017], tax: [27552, 25230], net: [95754, 81309], cash: [145977, 106502], recv: [58491, 42121], inv: [166941, 146062], invst: [248332, 242381], ppe: [1140105, 1054110], intang: [222376, 207641], ca: [594249, 499270], assets: [2178140, 1950121], pay: [158842, 186789], prov: [26991, 32451], cl: [541254, 453737], debt: [374421, 347530], equity: [1085866, 1009626] },
  'infosys-2026': { kind: 'corporate', currency: 'INR', unit: 'crore', pages: { is: 9901, bs: 9899 },
    rev: [178650, 162990], pbt: [39995, 37608], tax: [10521, 10858], net: [29474, 26750], cash: [22201, 24455], recv: [35234, 31158], inv: [0, 0], invst: [21880, 23541], ppe: [19354, 18903], intang: [14942, 12872], ca: [103489, 97099], assets: [155967, 148903], pay: [4744, 4164], taxp: [5644, 4853], prov: [1512, 1475], cl: [52322, 42850], debt: [0, 0], equity: [93297, 96203] },
  'aramco-2025': { kind: 'corporate', currency: 'SAR', unit: 'm', pages: { is: 10171, bs: 10173 },
    rev: [1559342, 1637299], op: [706822, 774625], pbt: [702860, 782010], tax: [352650, 383588], net: [350210, 398422], cash: [243099, 216642], recv: [165444, 167884], inv: [70542, 83728], invst: [154321, 119311], ppe: [1590748, 1494318], intang: [164825, 164581], ca: [596277, 565396], assets: [2551964, 2423630], pay: [157708, 157467], taxp: [68412, 71951], prov: [36790, 31044], cl: [298349, 299263], debt: [363617, 319290], pens: [25951, 26866], equity: [1721744, 1651355] },
  'emiratesnbd-2025': { kind: 'bank', currency: 'AED', unit: 'm', pages: { is: 10340, bs: 10340 },
    rev: [49319, 44134], pbt: [29838, 27141], tax: [5831, 4133], net: [24007, 23008], ecl: [1468, 106], cash: [260794, 237431], recv: [632847, 501627], invst: [206608, 199223], ppe: [8742, 7941], intang: [5620, 5626], assets: [1164442, 996582], pay: [786024, 666777], debt: [90287, 79903], equity: [144819, 126214] },
  'eand-2025': { kind: 'corporate', currency: 'AED', unit: 'm', pages: { is: 10556, bs: 10558 },
    rev: [72858, 59203], op: [23241, 20061], pbt: [26783, 17582], tax: [10627, 6999], net: [16156, 10583], cash: [34308, 33628], recv: [19164, 17052], inv: [1302, 1200], invst: [33233, 32099], ppe: [54283, 47324], intang: [54299, 43728], ca: [60893, 58768], assets: [205059, 183327], pay: [38371, 31382], taxp: [1995, 1263], prov: [5042, 4487], cl: [88432, 76904], debt: [67639, 69195], pens: [1613, 1484], equity: [61763, 53920] },
  'rbc-2025': { kind: 'bank', currency: 'CAD', unit: 'm', pages: { is: 10751, bs: 10750 },
    rev: [66605, 57344], pbt: [25651, 19862], tax: [5282, 3622], net: [20369, 16240], ecl: [4362, 3232], cash: [87388, 122743], recv: [1042422, 981380], allow: [7093, 6037], invst: [342721, 256618], ppe: [6819, 6852], intang: [26807, 27084], assets: [2325006, 2171582], pay: [1515616, 1409531], equity: [139151, 127192] },
  'bhp-2025': { kind: 'corporate', currency: 'USD', unit: 'm', pages: { is: 11130, bs: 11132 },
    rev: [51262, 55658], op: [19464, 17537], pbt: [18353, 16048], tax: [7210, 6447], net: [11143, 9601], cash: [11894, 12501], recv: [4253, 5339], inv: [6978, 7039], invst: [5790, 3272], ppe: [76457, 71629], intang: [1924, 1718], ca: [22830, 24338], assets: [108790, 102362], pay: [6670, 6764], taxp: [903, 924], prov: [19321, 19095], cl: [15639, 14296], debt: [24496, 20718], equity: [52218, 49120] },
  'cba-2025': { kind: 'bank', currency: 'AUD', unit: 'm', pages: { is: 12394, bs: 12395 },
    rev: [30153, 28290], pbt: [15580, 14549], tax: [4669, 4416], net: [10866, 10116], ecl: [788, 726], cash: [72443, 83819], recv: [1079452, 1007756], ppe: [3606, 3563], intang: [8515, 8082], assets: [1452456, 1353799], pay: [1012557, 937857], equity: [78704, 78776] },
};

export const NO_STATEMENTS: Record<string, string> = {
  'mcdonalds-2025': 'the bundle carries the letter and highlights only (pp. 2132–2204)',
  'loreal-2024': 'the bundle carries the overview only (pp. 7429–7448)',
};

/* year ends that are not 31 December */
const YEAR_END: Record<string, string> = {
  'apple-2024': '2024-09-28', 'apple-2023': '2023-09-30', 'apple-2020': '2020-09-26', 'cisco-2024': '2024-07-27', 'walmart-2023': '2023-01-31',
  'adobe-2024': '2024-11-29', 'pepsico-2025': '2025-12-27', 'pg-2026': '2026-06-30', 'homedepot-2025': '2026-02-01', 'toyota-2026': '2026-03-31',
  'honda-2023': '2023-03-31', 'softbank-2026': '2026-03-31', 'mufg-2026': '2026-03-31', 'smfg-2026': '2026-03-31', 'reliance-2026': '2026-03-31',
  'infosys-2026': '2026-03-31', 'rbc-2025': '2025-10-31', 'bhp-2025': '2025-06-30', 'cba-2025': '2025-06-30',
};
const CURRENCY_AR: Record<string, string> = { USD: 'دولار أمريكي', EUR: 'يورو', CHF: 'فرنك سويسري', GBP: 'جنيه إسترليني', JPY: 'ين ياباني', KRW: 'وون كوري',
  RMB: 'يوان صيني', INR: 'روبية هندية', TWD: 'دولار تايواني', SAR: 'ريال سعودي', AED: 'درهم إماراتي', AUD: 'دولار أسترالي', CAD: 'دولار كندي' };
const COUNTRY_AR: Record<string, string> = { US: 'الولايات المتحدة', CH: 'سويسرا', DE: 'ألمانيا', UK: 'المملكة المتحدة', FR: 'فرنسا', NL: 'هولندا', JP: 'اليابان',
  KR: 'كوريا الجنوبية', TW: 'تايوان', CN: 'الصين', IN: 'الهند', SA: 'المملكة العربية السعودية', AE: 'الإمارات العربية المتحدة', CA: 'كندا', AU: 'أستراليا' };

export type CorpusCompany = Report & { figures: Figures; yearEnd: string; unitAr: string; currencyAr: string };
const SECTOR_EN: Record<string, string> = { tech: 'tech', retail: 'retail', fmcg: 'food & consumer', banking: 'banking', insurance: 'insurance', pharma: 'pharma',
  energy: 'energy', auto: 'auto', telecom: 'telecom', mining: 'mining', industrial: 'industrial', conglomerate: 'conglomerate' };
/* the unit as the figures carry it on screen — short, so a tile's figure stays on one line */
const UNIT_SHORT: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', KRW: '₩', RMB: 'RMB', TWD: 'TWD', SAR: 'ريال', AED: 'درهم', AUD: 'A$', CAD: 'C$', INR: 'روبية' };
const unitAr = (f: Figures) => (f.unit === 'crore' ? 'كرور ' : 'مليون ') + (UNIT_SHORT[f.currency] ?? f.currency);
/** Every company with statements, in bundle order. */
export function corpusCompanies(): CorpusCompany[] {
  return REPORTS.filter((r) => FIGURES[r.id]).map((r) => {
    const f = FIGURES[r.id];
    return { ...r, figures: f, yearEnd: YEAR_END[r.id] ?? (r.fy.match(/\d{4}/)?.[0] ?? '2025') + '-12-31', unitAr: unitAr(f), currencyAr: CURRENCY_AR[f.currency] ?? f.currency };
  });
}
export const corpusCompany = (id: string) => corpusCompanies().find((c) => c.id === id) ?? null;

/* ---------- the trial balance ---------- */
type Acc = { code: string; name: string; line: string; side: 'dr' | 'cr'; v: Pair };
const pick = (p: Pair | undefined, i: 0 | 1) => (p ? p[i] : 0);
function accounts(c: CorpusCompany): Acc[] {
  const f = c.figures, bank = f.kind === 'bank', ins = f.kind === 'insurer';
  const Y = (fn: (i: 0 | 1) => number): Pair => [fn(0), fn(1)];
  /* assets: the known lines, the rest as other current / non-current so the total is the published total */
  const cash = Y((i) => pick(f.cash, i)), gross = Y((i) => pick(f.recv, i) + pick(f.allow, i)), allow = Y((i) => pick(f.allow, i)), inv = Y((i) => pick(f.inv, i));
  const ppe = Y((i) => pick(f.ppe, i)), intang = Y((i) => pick(f.intang, i));
  const parts = Y((i) => {
    const known = pick(f.cash, i) + pick(f.recv, i) + pick(f.inv, i) + pick(f.invst, i) + pick(f.ppe, i) + pick(f.intang, i), rest = f.assets[i] - known;
    return rest;
  });
  const invst0 = Y((i) => pick(f.invst, i) + Math.min(0, parts[i])); /* overlap: a current security counted twice in the published lines */
  const caNeed = Y((i) => (f.ca ? Math.max(0, f.ca[i] - pick(f.cash, i) - pick(f.recv, i) - pick(f.inv, i)) : 0));
  const otherCa0 = Y((i) => Math.min(Math.max(0, parts[i]), caNeed[i]));
  /* what current assets still lack is the current part of the investments (marketable securities, deposits) */
  const invCur = Y((i) => Math.min(invst0[i], caNeed[i] - otherCa0[i]));
  const invst = Y((i) => invst0[i] - invCur[i]), otherCa = Y((i) => otherCa0[i] + invCur[i]);
  const otherNca = Y((i) => Math.max(0, parts[i]) - otherCa0[i]);
  /* liabilities: the same, against total liabilities (assets − equity) */
  const L = Y((i) => f.assets[i] - f.equity[i]);
  const pay = Y((i) => pick(f.pay, i)), contract = Y((i) => pick(f.contract, i)), taxp = Y((i) => pick(f.taxp, i)), prov = Y((i) => pick(f.prov, i)), reserves = Y((i) => pick(f.reserves, i));
  const debt = Y((i) => pick(f.debt, i)), pens = Y((i) => pick(f.pens, i));
  const lrest = Y((i) => L[i] - pay[i] - contract[i] - taxp[i] - prov[i] - reserves[i] - debt[i] - pens[i]);
  const clNeed = Y((i) => (f.cl ? Math.max(0, f.cl[i] - pay[i] - contract[i] - taxp[i] - prov[i] - reserves[i]) : 0));
  const otherCl = Y((i) => { const rest = Math.max(0, lrest[i]); if (!f.cl) return f.kind === 'corporate' ? 0 : rest; return Math.min(rest, clNeed[i]); });
  const otherNcl = Y((i) => Math.max(0, lrest[i]) - otherCl[i]);
  const debtAdj = Y((i) => debt[i] + Math.min(0, lrest[i])); /* overlap on the liability side is taken out of borrowings */
  /* what current liabilities still lack is the current part of the borrowings */
  const debtCur = Y((i) => Math.max(0, Math.min(debtAdj[i], clNeed[i] - otherCl[i])));
  const debtNc = Y((i) => debtAdj[i] - debtCur[i]);
  /* profit or loss: revenue, cost of sales, operating costs to the published operating profit, the rest to profit before tax, tax, and what follows tax */
  const rev = Y((i) => pick(f.rev, i)), cogs = Y((i) => pick(f.cogs, i)), ecl = Y((i) => pick(f.ecl, i));
  /* without a published operating result, operating costs stop at zero: the rest of profit before tax is non-operating (SoftBank's investment gains) */
  const op = Y((i) => (f.op ? f.op[i] : Math.min(f.pbt[i], rev[i] - cogs[i] - ecl[i])));
  const opex = Y((i) => rev[i] - cogs[i] - ecl[i] - op[i]);
  const nonop = Y((i) => f.pbt[i] - op[i]);
  const after = Y((i) => f.net[i] - (f.pbt[i] - f.tax[i]));
  const eqOpen = Y((i) => f.equity[i] - f.net[i]);
  const A = (code: string, name: string, line: string, side: 'dr' | 'cr', v: Pair): Acc => ({ code, name, line, side, v });
  const pos = (code: string, name: string, line: string, drWhenPositive: boolean, v: Pair) => A(code, name, line, drWhenPositive ? 'dr' : 'cr', v);
  const list: Acc[] = [
    A('1101', bank ? 'النقد والأرصدة لدى البنوك المركزية والبنوك' : 'النقد وما في حكمه', 'cash', 'dr', cash),
    A('1121', bank ? 'قروض وسلف العملاء (إجمالي)' : f.allow ? 'الذمم المدينة (إجمالي)' : 'الذمم المدينة التجارية (بالصافي بعد مخصص الخسائر الائتمانية)', 'receivables', 'dr', gross),
    A('1129', 'مخصص خسائر ائتمانية متوقعة', 'receivables', 'cr', allow),
    A('1141', 'المخزون', 'inventory', 'dr', inv),
    A('1161', 'استثمارات قصيرة الأجل وموجودات متداولة أخرى', 'otherCa', 'dr', otherCa),
    A('1501', 'ممتلكات وآلات ومعدات وحق استخدام', 'ppe', 'dr', ppe),
    A('1801', 'الشهرة والموجودات غير الملموسة', 'intangibles', 'dr', intang),
    A('1901', f.holding ? 'استثمارات في شركات تابعة وزميلة واستثمارات أخرى' : 'استثمارات وأوراق مالية', 'investments', 'dr', invst),
    A('1951', 'موجودات غير متداولة أخرى', 'otherNca', 'dr', otherNca),
    A('2101', bank ? 'ودائع العملاء' : 'الذمم الدائنة التجارية', 'payables', 'cr', pay),
    A('2111', 'مطلوبات عقود (إيرادات مؤجلة)', 'contractLiab', 'cr', contract),
    A('2141', 'ضرائب دخل مستحقة', 'zakatPayable', 'cr', taxp),
    A('2161', 'المخصصات', 'provisions', 'cr', prov),
    A('2162', 'احتياطيات مطالبات التأمين', 'provisions', 'cr', reserves),
    A('2171', 'مطلوبات متداولة أخرى', 'otherCl', 'cr', otherCl),
    A('2151', 'الجزء المتداول من القروض والتمويل', 'loansCl', 'cr', debtCur),
    A('2201', bank ? 'الديون المصدرة والقروض طويلة الأجل' : 'القروض والتمويل طويلة الأجل', 'loansNcl', 'cr', debtNc),
    A('2301', 'التزامات منافع الموظفين والتقاعد', 'eosb', 'cr', pens),
    A('2401', 'مطلوبات غير متداولة أخرى', 'otherNcl', 'cr', otherNcl),
    A('3101', 'حقوق الملكية في بداية السنة بعد التوزيعات والحركات الأخرى', 'retained', 'cr', eqOpen),
    A('4101', bank ? 'إجمالي دخل العمليات' : ins ? 'الإيرادات (الأقساط والمبيعات ودخل الاستثمار)' : 'الإيرادات', 'revenue', 'cr', rev),
    A('5101', 'تكلفة الإيرادات', 'cogs', 'dr', cogs),
    A('5401', 'مصروف الخسائر الائتمانية المتوقعة', 'impairment', 'dr', ecl),
    /* a statement by nature (no cost of sales published) with inventory: its operating costs carry the cost of goods */
    !f.cogs && pick(f.inv, 0) > 0
      ? pos('5101', 'تكاليف التشغيل (تشمل تكلفة البضاعة والاستهلاك والإطفاء — القائمة معروضة بطبيعة المصروف)', 'cogs', true, opex)
      : pos('5301', f.op ? 'المصروفات التشغيلية (تشمل الاستهلاك والإطفاء)' : 'المصروفات التشغيلية (تشمل الاستهلاك والإطفاء وتكاليف التمويل)', 'admin', true, opex),
    pos(nonop[0] >= 0 ? '4201' : '7101', 'صافي تكاليف التمويل والإيرادات غير التشغيلية', nonop[0] >= 0 ? 'investIncome' : 'financeCost', false, nonop),
    pos('8101', 'ضريبة الدخل', 'zakatExpense', true, f.tax),
    pos(after[0] >= 0 ? '4701' : '7201', 'حصة نتائج الشركات الزميلة والعمليات غير المستمرة بعد الضريبة', 'investIncome', false, after),
  ];
  return list.filter((a) => a.v[0] !== 0 || a.v[1] !== 0);
}
/** The trial balance as the engagement file imports it (CSV with the prior year), the line of each account, and the engagement context. */
export function companyTrialBalance(id: string) {
  const c = corpusCompany(id);
  if (!c) return null;
  const reviewed = reviewedPublishedSource(id);
  const accs = accounts(c), f = c.figures;
  const signed = (a: Acc, v: number) => (a.side === 'dr' ? v : -v);
  const rows = accs.map((a) => {
    const cur = signed(a, a.v[0]), pr = signed(a, a.v[1]);
    return [a.code, a.name, cur > 0 ? cur : '', cur < 0 ? -cur : '', pr].join(',');
  });
  const csv = ['رقم الحساب,اسم الحساب,مدين,دائن,السنة السابقة', ...rows].join('\n');
  const overrides = Object.fromEntries(accs.map((a) => [a.code, a.line]));
  const year = c.yearEnd.slice(0, 4);
  const ctx = {
    company: c.company, activity: SECTOR_AR[c.sector] + ' (' + SECTOR_EN[c.sector] + ')' + (f.kind === 'bank' ? ' — بنك' : f.kind === 'insurer' ? ' — تأمين واستثمار' : ''), sector: c.sector,
    period: 'السنة المالية المنتهية في ' + c.yearEnd + ' (' + c.fy + ')', periodStart: '', periodEnd: c.yearEnd,
    legalForm: 'شركة مدرجة', registeredOffice: COUNTRY_AR[c.country] ?? c.country, principalPlace: COUNTRY_AR[c.country] ?? c.country,
    country: c.country === 'SA' ? 'SA' : 'INTL', framework: 'IFRS' as const, unclassified: f.kind !== 'corporate', currency: c.currencyAr, curSym: c.unitAr, taxKind: c.country === 'SA' ? 'zakat' : 'income',
    auditFirm: c.auditor || 'مراجع المجموعة', auditCity: COUNTRY_AR[c.country] ?? '', corpusId: c.id, reportingFramework: c.framework, auditStandard: c.standard,
  };
  const balanced = [0, 1].every((i) => Math.abs(accs.reduce((s, a) => s + signed(a, a.v[i]), 0)) < 0.5);
  if (reviewed) {
    const sourceModel = reviewed.sourceModel;
    return { company:c, csv:reviewed.csv, overrides:reviewed.overrides, ctx:{...ctx,
      company:sourceModel.issuer, issuerCountry:sourceModel.issuerCountry, periodEnd:sourceModel.periodEnd,
      priorPeriodEnd:sourceModel.priorPeriodEnd, reportingFramework:sourceModel.accountingBasis,
      currency:'USD', curSym:'USD million', taxKind:'income', consolidated:true, auditFirm:'', auditCity:'',
      sourceKind:'published-statements', sourceModel}, year, balanced:true, source:'Published statement source: pp. 125, 127; not ledger or audit evidence' };
  }
  return { company: c, csv, overrides, ctx, year, balanced, source: 'ص ' + f.pages.is + ' (قائمة الدخل) · ص ' + f.pages.bs + ' (المركز المالي)' };
}
