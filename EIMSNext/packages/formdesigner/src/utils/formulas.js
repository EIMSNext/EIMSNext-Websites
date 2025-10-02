import { is,hasProperty } from "@eimsnext/form-render-core";

const computed = {
    Add: (num1, num2) => {
        let r1, r2, m;
        try {
            r1 = num1.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = num2.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return (num1 * m + num2 * m) / m;
    },
    Sub: (num1, num2) => {
        let r1, r2, m;
        try {
            r1 = num1.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = num2.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        // 动态控制精度长度
        let n = (r1 >= r2) ? r1 : r2;
        return Number(((num1 * m - num2 * m) / m).toFixed(n));
    },
    Mul: (num1, num2) => {
        let m = 0;
        let s1 = num1.toString();
        let s2 = num2.toString();
        try {
            m += s1.split('.')[1].length;
        } catch (e) {
        }
        try {
            m += s2.split('.')[1].length;
        } catch (e) {
        }
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    },
    Div: (num1, num2) => {
        let t1 = 0;
        let t2 = 0;
        try {
            t1 = num1.toString().split('.')[1].length;
        } catch (e) {
        }
        try {
            t2 = num2.toString().split('.')[1].length;
        } catch (e) {
        }
        let r1 = Number(num1.toString().replace('.', ''));
        let r2 = Number(num2.toString().replace('.', ''));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }
}


const formulas = {
    ADD: function (n1, n2) {
        return computed.Add(n1, n2);
    },
    SUB: function (n1, n2) {
        return computed.Sub(n1, n2);
    },
    MUL: function (n1, n2) {
        return computed.Mul(n1, n2);
    },
    DIV: function (n1, n2) {
        return computed.Div(n1, n2);
    },
    SUM: function (...args) {
        return (args || []).reduce((previousValue, currentValue) => {
            return computed.Add(previousValue, Array.isArray(currentValue) ? formulas.SUM(...currentValue) : (currentValue || 0));
        }, 0);
    },
    MAX: function (...args) {
        const arr = Array.isArray(args[0]) ? args[0] : args;
        return Math.max(...arr.map(v => {
            return parseFloat(v);
        }).filter(v => !isNaN(v)));
    },
    MIN: function (...args) {
        const arr = Array.isArray(args[0]) ? args[0] : args;
        return Math.min(...arr.map(v => {
            return parseFloat(v);
        }).filter(v => !isNaN(v)));
    },
    ABS: function (val) {
        return parseFloat(Math.abs(val)) || 0;
    },
    AVG: function (...args) {
        const arr = Array.isArray(args[0]) ? args[0] : args;
        if (arr.length) {
            return computed.Div(formulas.SUM(arr), arr.length);
        }
        return 0;
    },
    POWER: function (num1, num2) {
        return Math.pow(parseFloat(num1), parseFloat(num2));
    },
    RAND: function () {
        return Math.random()
    },
    CEIL: function (num) {
        return Math.ceil(parseFloat(num)) || 0;
    },
    FLOOR: function (val) {
        return Math.floor(parseFloat(val) || 0);
    },
    FIXED: function (num, decimals) {
        const factor = Math.pow(10, decimals || 0);
        const truncatedNumber = Math.floor(parseFloat(num) * factor) / factor;
        return truncatedNumber.toFixed(decimals || 0);
    },
    ISNUMBER: function (val) {
        if (val === '' || val === null) {
            return false;
        }
        return !isNaN(Number(val));
    },
    PI: function () {
        return Number(Math.PI)
    },
    ROUND: function (val, num) {
        val = parseFloat(val);
        if (isNaN(val)) {
            return 0;
        }
        return parseFloat(val.toFixed(parseFloat(num) || 0));
    },
    SQRT: function (val) {
        return Math.sqrt(parseFloat(val)) || 0;
    },
    TONUMBER: function (num) {
        return parseFloat(num) || 0;
    },
    NOW: function () {
        const date = new Date;
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hour = ('0' + date.getHours()).slice(-2);
        const minute = ('0' + date.getMinutes()).slice(-2);
        const second = ('0' + date.getSeconds()).slice(-2);
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    },
    TODAY: function () {
        const date = new Date;
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    },
    YEAR: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getFullYear();
    },
    MONTH: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getMonth() + 1;
    },
    DAY: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getDate();
    },
    HOUR: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getHours();
    },
    MINUTE: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getMinutes();
    },
    SECOND: function (day) {
        if (!day) {
            return null;
        }
        return new Date(day).getSeconds();
    },
    DIFFDAYS: function (start, end) {
        const date1 = new Date(start);
        const date2 = new Date(end);
        return parseInt(Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)));
    },
    DIFFHOURS: function (start, end) {
        const date1 = new Date(start);
        const date2 = new Date(end);
        return parseFloat(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60)).toFixed(2);
    },
    DIFFMINUTES: function (start, end) {
        const date1 = new Date(start);
        const date2 = new Date(end);
        return parseInt(Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60)));
    },
    TIMESTAMP: function (date) {
        return Date.parse(date);
    },
    STARTSWITH: function (str, find) {
        return ('' + str).substring(0, ('' + (find)).length) === find;
    },
    EMPTY: function (val) {
        return is.empty(val);
    },
    NOTEMPTY: function (val) {
        return !is.empty(val);
    },
    LEN: function (arr) {
        return Array.isArray(arr) ? arr.length : 0;
    },
    MOD: function (num1, num2) {
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        if (!num1 || !num2 || isNaN(num1) || isNaN(num2)) {
            return 0;
        }
        return num1 % num2;
    },
    SLICELEFT: function (str, len) {
        return ('' + str).slice(0, Number(len) || 0);
    },
    SLICERIGHT: function (str, len) {
        return ('' + str).slice(Number(len) * -1);
    },
    TOLOWER: function (str) {
        return ('' + str).toLowerCase();
    },
    TOUPPER: function (str) {
        return ('' + str).toUpperCase();
    },
    INCLUDES: function (str, find) {
        return (str || '').indexOf(find || '');
    },
    REPLACE: function (str, search, replace) {
        return (str || '').replace(search || '', replace || '');
    },
    REPLACEALL: function (str, search, replace) {
        return (str || '').replaceAll(search || '', replace || '');
    },
    TRIM: function (str) {
        return (str || '').trim();
    },
    TOCHINSESAMOUNT: function (amount) {
        let chnNumChar = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        let chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
        let chnUnitChar = ['', '拾', '佰', '仟'];
        let chnDecimalUnit = ['角', '分'];

        function sectionToChinese(section) {
            let strIns = '',
                chnStr = '';
            let unitPos = 0;
            let zero = true;
            while (section > 0) {
                let v = section % 10;
                if (v === 0) {
                    if (!zero) {
                        zero = true;
                        chnStr = chnNumChar[v] + chnStr;
                    }
                } else {
                    zero = false;
                    strIns = chnNumChar[v];
                    strIns += chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                section = Math.floor(section / 10);
            }
            return chnStr;
        }

        let unitPos = 0;
        let strIns = '',
            chnStr = '';
        let needZero = false;

        if (amount === 0) {
            return chnNumChar[0];
        }

        let integerPart = Math.floor(amount);
        let decimalPart = Math.round((amount - integerPart) * 100);

        while (integerPart > 0) {
            let section = integerPart % 10000;
            if (needZero) {
                chnStr = chnNumChar[0] + chnStr;
            }
            strIns = sectionToChinese(section);
            strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
            chnStr = strIns + chnStr;
            needZero = (section < 1000) && (section > 0);
            integerPart = Math.floor(integerPart / 10000);
            unitPos++;
        }

        if (chnStr) {
            chnStr += '元';
        }

        if (decimalPart > 0) {
            chnStr += chnNumChar[Math.floor(decimalPart / 10)] + chnDecimalUnit[0];
            if (decimalPart % 10 !== 0) {
                chnStr += chnNumChar[decimalPart % 10] + chnDecimalUnit[1];
            }
        } else if (chnStr) {
            chnStr += '整';
        }

        return chnStr;
    },
    UNION: function (...args) {
        const arr = Array.isArray(args[0]) ? args[0] : args;
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    },
    AND: function (...args) {
        return !!args.reduce((previousValue, currentValue) => {
            return previousValue && currentValue;
        }, true);
    },
    OR: function (...args) {
        return !!args.reduce((previousValue, currentValue) => {
            return previousValue || currentValue;
        }, false);
    },
    IF: function (bool, valid = true, invalid = false) {
        return bool ? valid : invalid;
    },
    DEFAULT: function (value, def) {
        return is.Undef(value) ? def : value;
    },
    CASE: function (...args) {
        for (let i = 0; i < args.length - 1; i += 2) {
            if (args[i]) {
                return args[i + 1];
            }
        }
        return null;
    },
    COLUMN: function (arr, key) {
        const value = [];
        if (Array.isArray(arr)) {
            arr.forEach(function (v) {
                if (Array.isArray(v)) {
                    value.push(...formulas.COLUMN(v, key));
                } else if (v) {
                    value.push(v[key]);
                }
            });
        }
        return value;
    },
    VALUE: function (obj, key, def) {
        const lst = ('' + key).split('.');
        let val = obj;

        for (let i = 0; i < lst.length; i++) {
            if (hasProperty(val, lst[i])) {
                val = val[lst[i]];
            } else {
                return def;
            }
        }
        return val;
    },
    CONCAT: function (...args) {
        return ''.concat(...args);
    },
    INTERSECTIONSET: function (array1, array2) {
        const intersectionArray = [];

        for (let i = 0; i < array1.length; i++) {
            const element = array1[i];
            if (array2.indexOf(element) !== -1 && intersectionArray.indexOf(element) === -1) {
                intersectionArray.push(element);
            }
        }
        return intersectionArray;
    },
    LIST: function (...args) {
        return args;
    },
    IN: function (lst, find) {
        return (lst || []).indexOf(find) > -1;
    },
    FALSE: function () {
        return false;
    },
    TRUE: function () {
        return true;
    },
    NOT: function (val) {
        return !val;
    },
    EQ: function (val1, val2) {
        return val1 === val2;
    },
    GE: function (val1, val2) {
        return val1 >= val2;
    },
    GT: function (val1, val2) {
        return val1 > val2;
    },
    LE: function (val1, val2) {
        return val1 <= val2;
    },
    LT: function (val1, val2) {
        return val1 < val2;
    },
    NE: function (val1, val2) {
        return val1 !== val2;
    },
}

const formulaInfo = {
    ADD: 'ADD(1, 2) = 3',
    SUB: 'SUB(10, 1) = 9',
    MUL: 'MUL(2, 2) = 4',
    DIV: 'DIV(10, 2) = 5',
    SUM: 'SUM(1,2,3) = 6, SUM([5, 6, 7]) = 18',
    MAX: 'MAX(1, 5, 10) = 10',
    MIN: 'MIN(1, 5, 10) = 1',
    ABS: 'ABS(-10) = 10, ABS(10) = 10',
    AVG: 'AVG(2, 4, 6, 8) = 5',
    POWER: 'POWER(2, 4) = 16',
    RAND: 'RAND() = 0.75348173001531',
    PI: 'PI() = 3.141592653589793',
    ROUND: 'ROUND(3.149, 2) = 3.15, ROUND(3.149) = 3',
    SQRT: 'SQRT(9) = 3',
    NOW: 'NOW() = "2024-03-15 12:08:31"',
    TODAY: 'TODAY() = "2024-03-15"',
    YEAR: 'YEAR("2024-03-15 12:08:31") = 2024',
    MONTH: 'MONTH("2024-03-15 12:08:31") = 3',
    DAY: 'DAY("2024-03-15 12:08:31") = 15',
    HOUR: 'HOUR("2024-03-15 12:08:31") = 12',
    MINUTE: 'MINUTE("2024-03-15 12:08:31") = 8',
    SECOND: 'SECOND("2024-03-15 12:08:31") = 31',
    TIMESTAMP: 'TIMESTAMP("2024-03-15 12:08:31") = 1710475711000',
    DIFFDAYS: 'DIFFDAYS("2024-01-15","2024-03-15") = 60',
    DIFFHOURS: 'DIFFHOURS("2024-01-15 12:00:00", "2024-01-16 15:00:00") = 27, DIFFHOURS("2024-01-15 12:00:00", "2024-01-15 12:30:00") = 0.5',
    DIFFMINUTES: 'DIFFMINUTES("2024-01-15 12:00:00", "2024-01-15 12:30:00") = 30',
    STARTSWITH: 'STARTSWITH("ABCDEF","ABC") = true, STARTSWITH("ABCDEF","AD") = false',
    EMPTY: 'EMPTY("") = true, EMPTY([]) = true, EMPTY("0") = false',
    NOTEMPTY: 'NOTEMPTY("") = false, NOTEMPTY([]) = false, NOTEMPTY("0") = true',
    LEN: 'LEN(["a", "b", "c"]) = 3',
    MOD: 'MOD(10, 3) = 1',
    FLOOR: 'FLOOR(1.93) = 1',
    CEIL: 'CEIL(1.93) = 2',
    FIXED: 'FIXED(1.93, 1) = 1.9',
    ISNUMBER: 'ISNUMBER("2.34") = true, ISNUMBER("2.4e") = false',
    TONUMBER: 'TONUMBER("1.5") = 1.5, TONUMBER("2.4e") = 2.4, TONUMBER("ABC") = 0',
    SLICELEFT: 'SLICELEFT("ABCDE", 3) = "ABC"',
    SLICERIGHT: 'SLICERIGHT("ABCDE", 3) = "CDE"',
    TOLOWER: 'TOUPPER("ABCD") = "abcd"',
    TOUPPER: 'TOUPPER("abcd") = "ABCD"',
    INCLUDES: 'INCLUDES("ABCD", "BC") = 1, INCLUDES("ABCD", "E") = -1',
    REPLACE: 'REPLACE("AbAc","A","1") = "1bAc"',
    REPLACEALL: 'REPLACEALL("AbAc","A","1") = "1b1c"',
    TRIM: 'TRIM("\\t\\n A BC \\t\\n") = "A BC"',
    TOCHINSESAMOUNT: 'TOCHINSESAMOUNT(32.14) = "叁拾贰元壹角肆分"',
    UNION: 'UNION(1, 3, 5, 1, 4, 3) = [1, 3, 5, 4], UNION([1, 2, 3, 1, 2, 3]) = [1, 2, 3]',
    INTERSECTIONSET: 'INTERSECTIONSET([1, 3, 5], [1, 4, 3]) = [1, 3]',
    LIST: 'LIST([1, 3, 5], [1, 4, 3]) = [[1, 3, 5], [1, 4, 3]]',
    AND: 'AND(true, true) = true, AND(true, false) = false',
    OR: 'OR(false, false) = false, OR(false, true) = true',
    IF: 'IF(false, 1, 0) = 0, IF(true, 1, 0) = 1',
    IN: 'IN([1,2,3,4], 4) = true, IN([1,2,3,4], 5) = false',
    DEFAULT: 'DEFAULT("#FF7271", "#000") = "#FF7271", DEFAULT("", "#000") = "", DEFAULT(null, "#000") = "#000"',
    CASE: 'CASE(IN([1,2,3,4], 5), 1, IN([1,2,3,4], 2), 2) = 2',
    COLUMN: 'COLUMN([{key: 1}, {key: 2}, {key: 3}],"key") = [1, 2, 3], COLUMN([[{key: 1}, {key: 2}], [{key: 3}, {key: 4}]], "key") = [1, 2, 3, 4]',
    VALUE: 'VALUE({key: 1}, "key", 2) = 1, VALUE({key: 1}, "value", 2) = 2, VALUE({list: {key: 1}}, "list.key") = 1',
    CONCAT: 'CONCAT("ABC", "DEF") = "ABCDEF"',
    FALSE: 'FALSE() = false',
    TRUE: 'TRUE() = true',
    NOT: 'NOT(true) = false, NOT(false) = true',
    EQ: 'EQ(100, 100) = true, EQ(100, 90) = false, EQ(100, "100") = false',
    GE: 'GE(100, 90) = true, GE(100, 100) = true, GE(100, 110) = false',
    GT: 'GT(100, 90) = true, GT(100, 100) = false, GT(100, 110) = false',
    LE: 'LE(100, 90) = false, LE(100, 100) = true, LE(100, 110) = true',
    LT: 'LT(100, 90) = false, LT(100, 100) = false, LT(100, 110) = true',
    NE: 'NE(100, 90) = true, NE(100, 100) = false, NE(100, "100") = true',
}

const formulaTree = [
    {
        key: 'math',
        children: ['TONUMBER', 'ADD', 'SUB', 'MUL', 'DIV', 'SUM', 'MAX', 'MIN', 'ABS', 'AVG', 'MOD', 'SQRT', 'POWER', 'RAND', 'PI', 'ROUND', 'FLOOR', 'CEIL', 'FIXED', 'TOCHINSESAMOUNT'],
    },
    {
        key: 'string',
        children: ['STARTSWITH', 'SLICELEFT', 'SLICERIGHT', 'TOLOWER', 'TOUPPER', 'INCLUDES', 'CONCAT', 'REPLACE', 'REPLACEALL', 'TRIM'],
    },
    {
        key: 'date',
        children: ['NOW', 'TODAY', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'DIFFDAYS', 'DIFFHOURS', 'DIFFMINUTES', 'TIMESTAMP'],
    },
    {
        key: 'collection',
        children: ['IN', 'LEN', 'UNION', 'COLUMN', 'VALUE', 'INTERSECTIONSET', 'LIST'],
    },
    {
        key: 'condition',
        children: ['IF', 'AND', 'OR', 'CASE', 'NOT', 'EQ', 'NE', 'GE', 'GT', 'LE', 'LT', 'TRUE', 'FALSE', 'DEFAULT', 'EMPTY', 'NOTEMPTY', 'ISNUMBER'],
    },
]

export default formulas;
export {formulaInfo, computed, formulaTree};