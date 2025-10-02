// let class2type = {};

// //Object.getPrototypeOf() 方法返回指定对象的原型（内部[[Prototype]]属性的值）。
// let getProto = Object.getPrototypeOf;

// //相当于  Object.prototype.toString
// let tostring = class2type.toString;

// //hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性
// //相当于 Object.prototype.hasOwnProperty
// let hasOwn = class2type.hasOwnProperty;

// //因为 hasOwn 是一个函数，所以这里调用的是内置对象 Function 的toString() 方法
// //相当于  Function.prototype.toString
// let fnToString = hasOwn.toString;

// //相当于  Function.prototype.toString.call(Object)
// //就是Object 构造函数 转字符串的结果
// // ObjectFunctionString 其实就是 "function Object() { [native code] }" 这样的一个字符串
// let ObjectFunctionString = fnToString.call(Object);

// export function isObject (obj: any)  {
//     let proto, Ctor;

//     //先去掉类型不是 Object 的
//     //也就是用 Object.prototype.toString.call(obj) 这种方式，返回值不是 "[object Object]" 的，比如 数组 window history
//     if (!obj || tostring.call(obj) !== "[object Object]") {
//         return false;
//     }

//     //获取对象原型，赋值给 proto
//     proto = getProto(obj);

//     //如果对象没有原型，那也算纯粹的对象，比如用 Object.create(null) 这种方式创建的对象
//     if (!proto) {
//         return true;
//     }

//     //最后判断是不是通过 "{}" 或 "new Object" 方式创建的对象
//     //如果 proto 有 constructor属性，Ctor 的值就为 proto.constructor，
//     //原型的 constructor 属性指向关联的构造函数
//     Ctor = hasOwn.call(proto, "constructor") && proto.constructor;

//     //如果 Ctor 类型是  "function" ，并且调用Function.prototype.toString 方法后得到的字符串 与 "function Object() { [native code] }" 这样的字符串相等就返回true
//     //用来区分 自定义构造函数和 Object 构造函数
//     return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
// }

import { cloneDeep } from "lodash";

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, "Object");
}

export function isString(val: unknown): val is string {
  return is(val, "String");
}

// 深度合并
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  const res: any = cloneDeep(src);
  for (key in target) {
    res[key] = isObject(res[key])
      ? deepMerge(res[key], target[key])
      : (res[key] = target[key]);
  }
  return res;
}

import { Dictionary } from "./dictionary";
import { uniqueId, uniqueId36 } from "./unique";

export { Dictionary, uniqueId, uniqueId36 };
